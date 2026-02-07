-- Real Auction System Database Functions
-- These functions provide transactional integrity for auction operations

-- Function to place a bid with proper validation and escrow management
CREATE OR REPLACE FUNCTION place_bid(
    p_auction_id UUID,
    p_user_id UUID,
    p_amount DECIMAL(12,2),
    p_type TEXT DEFAULT 'manual',
    p_required_deposit_cents INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_auction RECORD;
    v_user RECORD;
    v_highest_bid DECIMAL(12,2) DEFAULT 0;
    v_min_increment DECIMAL(12,2) DEFAULT 0;
    v_new_available_cents INTEGER;
    v_new_escrow_cents INTEGER;
    v_bid_id UUID;
    v_requires_approval BOOLEAN DEFAULT FALSE;
    v_result JSON;
BEGIN
    -- Get auction with lock
    SELECT * INTO v_auction 
    FROM auctions 
    WHERE id = p_auction_id AND status = 'live'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'AUCTION_NOT_LIVE');
    END IF;
    
    -- Check if auction has ended
    IF v_auction.end_time <= NOW() THEN
        RETURN json_build_object('success', false, 'error', 'AUCTION_ENDED');
    END IF;
    
    -- Get user with lock
    SELECT * INTO v_user 
    FROM user_profiles 
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'USER_NOT_FOUND');
    END IF;
    
    -- Check KYC status
    IF v_user.kyc_status != 'verified' THEN
        RETURN json_build_object('success', false, 'error', 'KYC_NOT_VERIFIED');
    END IF;
    
    -- Check if user is seller
    IF v_auction.seller_id = p_user_id THEN
        RETURN json_build_object('success', false, 'error', 'CANNOT_BID_ON_OWN_AUCTION');
    END IF;
    
    -- Get highest current bid
    SELECT COALESCE(MAX(amount), 0) INTO v_highest_bid
    FROM bids 
    WHERE auction_id = p_auction_id AND status = 'accepted';
    
    -- Calculate minimum bid
    v_min_increment := COALESCE(v_auction.min_increment, 0);
    IF v_highest_bid > 0 THEN
        v_highest_bid := v_highest_bid + v_min_increment;
    ELSE
        v_highest_bid := COALESCE(v_auction.current_price, v_auction.start_price);
    END IF;
    
    -- Validate bid amount
    IF p_amount < v_highest_bid THEN
        RETURN json_build_object('success', false, 'error', 'BELOW_MINIMUM_BID', 'minimum_required', v_highest_bid);
    END IF;
    
    -- Check wallet balance
    IF v_user.wallet_available_cents < p_required_deposit_cents THEN
        RETURN json_build_object('success', false, 'error', 'INSUFFICIENT_WALLET');
    END IF;
    
    -- Lock escrow funds
    v_new_available_cents := v_user.wallet_available_cents - p_required_deposit_cents;
    v_new_escrow_cents := v_user.wallet_escrow_cents + p_required_deposit_cents;
    
    UPDATE user_profiles 
    SET wallet_available_cents = v_new_available_cents,
        wallet_escrow_cents = v_new_escrow_cents
    WHERE id = p_user_id;
    
    -- Check if admin approval is required
    v_requires_approval := COALESCE(v_auction.admin_approval_required, FALSE);
    
    -- Insert bid
    INSERT INTO bids (
        auction_id, 
        user_id, 
        amount, 
        type, 
        status, 
        created_at,
        meta
    ) VALUES (
        p_auction_id,
        p_user_id,
        p_amount,
        p_type,
        CASE WHEN v_requires_approval THEN 'pending' ELSE 'accepted' END,
        NOW(),
        json_build_object(
            'depositSnapshot', json_build_object(
                'minRequiredEscrowCents', p_required_deposit_cents,
                'walletAvailableCents', v_new_available_cents,
                'walletEscrowCents', v_new_escrow_cents
            )
        )
    ) RETURNING id INTO v_bid_id;
    
    -- Update auction current price and bid count
    UPDATE auctions 
    SET current_price = p_amount,
        bids_count = COALESCE(bids_count, 0) + 1,
        updated_at = NOW()
    WHERE id = p_auction_id;
    
    -- Log wallet event
    INSERT INTO wallet_audit_logs (
        user_id,
        auction_id,
        bid_id,
        event_type,
        status,
        amount_delta_cents,
        wallet_before_cents,
        wallet_after_cents,
        escrow_before_cents,
        escrow_after_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        p_user_id,
        p_auction_id,
        v_bid_id,
        'ESCROW_LOCKED_FOR_BID',
        'completed',
        0,
        v_user.wallet_available_cents,
        v_new_available_cents,
        v_user.wallet_escrow_cents,
        v_new_escrow_cents,
        'auction_settlement',
        'auction_bid',
        'Escrow locked for bid placement',
        NOW()
    );
    
    -- Return success result
    v_result := json_build_object(
        'success', true,
        'bid_id', v_bid_id,
        'requires_approval', v_requires_approval,
        'amount', p_amount,
        'message', CASE 
            WHEN v_requires_approval THEN 'Bid placed and pending approval'
            ELSE 'Bid placed successfully'
        END
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to release escrow funds
CREATE OR REPLACE FUNCTION release_escrow(
    p_user_id UUID,
    p_amount_cents INTEGER,
    p_reason TEXT DEFAULT 'Escrow release'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_new_available_cents INTEGER;
    v_new_escrow_cents INTEGER;
BEGIN
    -- Get user with lock
    SELECT * INTO v_user 
    FROM user_profiles 
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if sufficient escrow balance
    IF v_user.wallet_escrow_cents < p_amount_cents THEN
        RETURN FALSE;
    END IF;
    
    -- Release escrow
    v_new_available_cents := v_user.wallet_available_cents + p_amount_cents;
    v_new_escrow_cents := v_user.wallet_escrow_cents - p_amount_cents;
    
    UPDATE user_profiles 
    SET wallet_available_cents = v_new_available_cents,
        wallet_escrow_cents = v_new_escrow_cents
    WHERE id = p_user_id;
    
    -- Log wallet event
    INSERT INTO wallet_audit_logs (
        user_id,
        event_type,
        status,
        amount_delta_cents,
        wallet_before_cents,
        wallet_after_cents,
        escrow_before_cents,
        escrow_after_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        p_user_id,
        'ESCROW_RELEASED',
        'completed',
        0,
        v_user.wallet_available_cents,
        v_new_available_cents,
        v_user.wallet_escrow_cents,
        v_new_escrow_cents,
        'auction_settlement',
        'escrow_release',
        p_reason,
        NOW()
    );
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN FALSE;
END;
$$;

-- Function to finalize auction winner
CREATE OR REPLACE FUNCTION finalize_auction_winner(
    p_auction_id UUID,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_auction RECORD;
    v_winning_bid RECORD;
    v_result JSON;
BEGIN
    -- Get auction with lock
    SELECT * INTO v_auction 
    FROM auctions 
    WHERE id = p_auction_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'AUCTION_NOT_FOUND');
    END IF;
    
    -- Check if already ended
    IF v_auction.status = 'ended' THEN
        RETURN json_build_object('success', true, 'message', 'Auction already ended');
    END IF;
    
    -- Get winning bid
    SELECT * INTO v_winning_bid
    FROM bids 
    WHERE auction_id = p_auction_id AND status = 'accepted'
    ORDER BY amount DESC, created_at DESC
    LIMIT 1;
    
    -- Update auction status
    UPDATE auctions 
    SET status = 'ended',
        winner_id = COALESCE(v_winning_bid.user_id, NULL),
        updated_at = NOW()
    WHERE id = p_auction_id;
    
    -- Release escrow for losers (handled by trigger)
    
    -- Build result
    v_result := json_build_object(
        'success', true,
        'auction_id', p_auction_id,
        'winner_id', COALESCE(v_winning_bid.user_id, NULL),
        'winning_amount', COALESCE(v_winning_bid.amount, 0),
        'total_bids', (SELECT COUNT(*) FROM bids WHERE auction_id = p_auction_id AND status = 'accepted'),
        'message', CASE 
            WHEN v_winning_bid IS NOT NULL THEN 'Auction finalized with winner'
            ELSE 'Auction ended with no bids'
        END
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Trigger to automatically release escrow for losing bids when auction ends
CREATE OR REPLACE FUNCTION auto_release_losing_escrow()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_losing_bid RECORD;
BEGIN
    -- Only trigger when auction status changes to 'ended'
    IF OLD.status != 'ended' AND NEW.status = 'ended' THEN
        -- Release escrow for all losing bids
        FOR v_losing_bid IN 
            SELECT b.id, b.user_id, b.meta
            FROM bids b
            WHERE b.auction_id = NEW.id 
              AND b.status = 'accepted'
              AND b.user_id != COALESCE(NEW.winner_id, '00000000-0000-0000-0000-000000000000')
        LOOP
            -- Get deposit amount from bid metadata
            DECLARE
                v_deposit_cents INTEGER;
            BEGIN
                v_deposit_cents := COALESCE(
                    (v_losing_bid.meta->'depositSnapshot'->>'minRequiredEscrowCents')::INTEGER,
                    0
                );
                
                -- Release escrow
                IF v_deposit_cents > 0 THEN
                    PERFORM release_escrow(v_losing_bid.user_id, v_deposit_cents, 'Auction loss refund');
                END IF;
            END;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_release_losing_escrow ON auctions;
CREATE TRIGGER trigger_auto_release_losing_escrow
    AFTER UPDATE ON auctions
    FOR EACH ROW
    EXECUTE FUNCTION auto_release_losing_escrow();

-- Function to validate auction before starting
CREATE OR REPLACE FUNCTION validate_auction_start(
    p_auction_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_auction RECORD;
    v_product RECORD;
    v_seller RECORD;
    v_result JSON;
BEGIN
    -- Get auction details
    SELECT a.*, p.title as product_title, p.seller_id as product_seller_id
    INTO v_auction
    FROM auctions a
    JOIN products p ON a.product_id = p.id
    WHERE a.id = p_auction_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Auction not found');
    END IF;
    
    -- Check if auction already started
    IF v_auction.status = 'live' THEN
        RETURN json_build_object('valid', false, 'error', 'Auction already started');
    END IF;
    
    -- Get seller details
    SELECT * INTO v_seller
    FROM user_profiles
    WHERE id = v_auction.seller_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Seller not found');
    END IF;
    
    -- Validate seller status
    IF v_seller.kyc_status != 'verified' THEN
        RETURN json_build_object('valid', false, 'error', 'Seller KYC not verified');
    END IF;
    
    -- Validate auction parameters
    IF v_auction.start_price <= 0 THEN
        RETURN json_build_object('valid', false, 'error', 'Invalid start price');
    END IF;
    
    IF v_auction.end_time <= NOW() THEN
        RETURN json_build_object('valid', false, 'error', 'End time must be in the future');
    END IF;
    
    -- Validate reserve price if set
    IF v_auction.reserve_price IS NOT NULL AND v_auction.reserve_price <= v_auction.start_price THEN
        RETURN json_build_object('valid', false, 'error', 'Reserve price must be higher than start price');
    END IF;
    
    -- All validations passed
    v_result := json_build_object(
        'valid', true,
        'message', 'Auction validated successfully',
        'auction', json_build_object(
            'id', v_auction.id,
            'title', v_auction.product_title,
            'start_price', v_auction.start_price,
            'end_time', v_auction.end_time
        )
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('valid', false, 'error', SQLERRM);
END;
$$;

-- Function to start auction
CREATE OR REPLACE FUNCTION start_auction(
    p_auction_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_validation JSON;
    v_result JSON;
BEGIN
    -- Validate auction first
    v_validation := validate_auction_start(p_auction_id);
    
    IF (v_validation->>'valid')::BOOLEAN = FALSE THEN
        RETURN v_validation;
    END IF;
    
    -- Update auction status to live
    UPDATE auctions 
    SET status = 'live',
        updated_at = NOW()
    WHERE id = p_auction_id;
    
    v_result := json_build_object(
        'success', true,
        'message', 'Auction started successfully',
        'auction_id', p_auction_id
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

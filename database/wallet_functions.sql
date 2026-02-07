-- Real Payment System Database Functions
-- These functions handle wallet operations and payment processing

-- Function to add wallet balance
CREATE OR REPLACE FUNCTION add_wallet_balance(
    p_user_id UUID,
    p_amount_cents INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_new_balance_cents INTEGER;
BEGIN
    -- Get user with lock
    SELECT * INTO v_user 
    FROM user_profiles 
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Add balance
    v_new_balance_cents := v_user.wallet_available_cents + p_amount_cents;
    
    -- Update user wallet
    UPDATE user_profiles 
    SET wallet_available_cents = v_new_balance_cents,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log wallet event
    INSERT INTO wallet_audit_logs (
        user_id,
        event_type,
        status,
        amount_delta_cents,
        wallet_before_cents,
        wallet_after_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        p_user_id,
        'WALLET_TOPUP',
        'completed',
        p_amount_cents,
        v_user.wallet_available_cents,
        v_new_balance_cents,
        'payment_gateway',
        'wallet_topup',
        'Wallet balance added via payment',
        NOW()
    );
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN FALSE;
END;
$$;

-- Function to process auction payment
CREATE OR REPLACE FUNCTION process_auction_payment(
    p_buyer_id UUID,
    p_auction_id UUID,
    p_amount_cents INTEGER,
    p_commission_cents INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_buyer RECORD;
    v_auction RECORD;
    v_seller RECORD;
    v_new_buyer_balance INTEGER;
    v_new_seller_balance INTEGER;
BEGIN
    -- Get buyer with lock
    SELECT * INTO v_buyer 
    FROM user_profiles 
    WHERE id = p_buyer_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get auction details
    SELECT * INTO v_auction
    FROM auctions
    WHERE id = p_auction_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get seller with lock
    SELECT * INTO v_seller 
    FROM user_profiles 
    WHERE id = v_auction.seller_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check buyer balance
    IF v_buyer.wallet_available_cents < p_amount_cents THEN
        RETURN FALSE;
    END IF;
    
    -- Deduct from buyer wallet
    v_new_buyer_balance := v_buyer.wallet_available_cents - p_amount_cents;
    
    UPDATE user_profiles 
    SET wallet_available_cents = v_new_buyer_balance,
        updated_at = NOW()
    WHERE id = p_buyer_id;
    
    -- Add to seller wallet (after commission)
    v_new_seller_balance := v_seller.wallet_available_cents + (p_amount_cents - p_commission_cents);
    
    UPDATE user_profiles 
    SET wallet_available_cents = v_new_seller_balance,
        updated_at = NOW()
    WHERE id = v_auction.seller_id;
    
    -- Log buyer wallet event
    INSERT INTO wallet_audit_logs (
        user_id,
        auction_id,
        event_type,
        status,
        amount_delta_cents,
        wallet_before_cents,
        wallet_after_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        p_buyer_id,
        p_auction_id,
        'AUCTION_PAYMENT',
        'completed',
        -p_amount_cents,
        v_buyer.wallet_available_cents,
        v_new_buyer_balance,
        'auction_settlement',
        'auction_payment',
        'Payment for won auction',
        NOW()
    );
    
    -- Log seller wallet event
    INSERT INTO wallet_audit_logs (
        user_id,
        auction_id,
        event_type,
        status,
        amount_delta_cents,
        wallet_before_cents,
        wallet_after_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        v_auction.seller_id,
        p_auction_id,
        'AUCTION_SALE',
        'completed',
        p_amount_cents - p_commission_cents,
        v_seller.wallet_available_cents,
        v_new_seller_balance,
        'auction_settlement',
        'auction_sale',
        'Sale proceeds from auction',
        NOW()
    );
    
    -- Log platform commission
    INSERT INTO wallet_audit_logs (
        user_id,
        auction_id,
        event_type,
        status,
        amount_delta_cents,
        source_type,
        reason_code,
        reason_text,
        created_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Platform user ID
        p_auction_id,
        'PLATFORM_COMMISSION',
        'completed',
        p_commission_cents,
        'auction_settlement',
        'platform_commission',
        'Platform commission from auction',
        NOW()
    );
    
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RETURN FALSE;
END;
$$;

-- Function to get wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(
    p_user_id UUID
)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_balance_cents INTEGER;
BEGIN
    SELECT COALESCE(wallet_available_cents, 0) INTO v_balance_cents
    FROM user_profiles
    WHERE id = p_user_id;
    
    RETURN v_balance_cents / 100.0; -- Convert cents to rupees
END;
$$;

-- Function to create wallet transaction
CREATE OR REPLACE FUNCTION create_wallet_transaction(
    p_user_id UUID,
    p_amount DECIMAL(12,2),
    p_transaction_type TEXT,
    p_status TEXT DEFAULT 'pending',
    p_payment_method TEXT DEFAULT 'razorpay',
    p_gateway_transaction_id TEXT DEFAULT NULL,
    p_auction_id UUID DEFAULT NULL,
    p_bid_id UUID DEFAULT NULL,
    p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    INSERT INTO wallet_transactions (
        user_id,
        amount,
        transaction_type,
        status,
        payment_method,
        gateway_transaction_id,
        auction_id,
        bid_id,
        description,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_amount,
        p_transaction_type,
        p_status,
        p_payment_method,
        p_gateway_transaction_id,
        p_auction_id,
        p_bid_id,
        p_description,
        NOW(),
        NOW()
    ) RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$;

-- Function to update transaction status
CREATE OR REPLACE FUNCTION update_transaction_status(
    p_transaction_id UUID,
    p_status TEXT,
    p_gateway_transaction_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE wallet_transactions 
    SET status = p_status,
        gateway_transaction_id = COALESCE(p_gateway_transaction_id, gateway_transaction_id),
        updated_at = NOW()
    WHERE id = p_transaction_id;
    
    RETURN FOUND;
END;
$$;

-- Function to get user wallet summary
CREATE OR REPLACE FUNCTION get_wallet_summary(
    p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_summary JSON;
BEGIN
    -- Get user wallet details
    SELECT * INTO v_user
    FROM user_profiles
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'User not found');
    END IF;
    
    -- Get transaction counts
    DECLARE
        v_total_transactions INTEGER;
        v_completed_transactions INTEGER;
        v_pending_transactions INTEGER;
        v_failed_transactions INTEGER;
    BEGIN
        SELECT COUNT(*) INTO v_total_transactions
        FROM wallet_transactions
        WHERE user_id = p_user_id;
        
        SELECT COUNT(*) INTO v_completed_transactions
        FROM wallet_transactions
        WHERE user_id = p_user_id AND status = 'completed';
        
        SELECT COUNT(*) INTO v_pending_transactions
        FROM wallet_transactions
        WHERE user_id = p_user_id AND status = 'pending';
        
        SELECT COUNT(*) INTO v_failed_transactions
        FROM wallet_transactions
        WHERE user_id = p_user_id AND status = 'failed';
    END;
    
    -- Build summary
    v_summary := json_build_object(
        'user_id', p_user_id,
        'available_balance', (v_user.wallet_available_cents / 100.0),
        'escrow_balance', (v_user.wallet_escrow_cents / 100.0),
        'total_balance', ((v_user.wallet_available_cents + v_user.wallet_escrow_cents) / 100.0),
        'transaction_summary', json_build_object(
            'total', v_total_transactions,
            'completed', v_completed_transactions,
            'pending', v_pending_transactions,
            'failed', v_failed_transactions
        ),
        'last_updated', v_user.updated_at
    );
    
    RETURN v_summary;
END;
$$;

-- Function to validate wallet balance for bid
CREATE OR REPLACE FUNCTION validate_wallet_for_bid(
    p_user_id UUID,
    p_required_amount_cents INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user RECORD;
    v_result JSON;
BEGIN
    -- Get user with lock
    SELECT * INTO v_user
    FROM user_profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'User not found');
    END IF;
    
    -- Check KYC status
    IF v_user.kyc_status != 'verified' THEN
        RETURN json_build_object('valid', false, 'error', 'KYC not verified');
    END IF;
    
    -- Check wallet balance
    IF v_user.wallet_available_cents < p_required_amount_cents THEN
        RETURN json_build_object(
            'valid', false, 
            'error', 'Insufficient balance',
            'available', (v_user.wallet_available_cents / 100.0),
            'required', (p_required_amount_cents / 100.0)
        );
    END IF;
    
    -- All validations passed
    v_result := json_build_object(
        'valid', true,
        'available_balance', (v_user.wallet_available_cents / 100.0),
        'escrow_balance', (v_user.wallet_escrow_cents / 100.0),
        'message', 'Wallet validated successfully'
    );
    
    RETURN v_result;
END;
$$;

-- Trigger to automatically log wallet changes
CREATE OR REPLACE FUNCTION log_wallet_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log wallet balance changes
    IF TG_OP = 'UPDATE' THEN
        IF OLD.wallet_available_cents != NEW.wallet_available_cents OR 
           OLD.wallet_escrow_cents != NEW.wallet_escrow_cents THEN
            
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
                NEW.id,
                'WALLET_BALANCE_CHANGE',
                'completed',
                (NEW.wallet_available_cents - OLD.wallet_available_cents),
                OLD.wallet_available_cents,
                NEW.wallet_available_cents,
                OLD.wallet_escrow_cents,
                NEW.wallet_escrow_cents,
                'system_update',
                'balance_change',
                'Wallet balance updated',
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_log_wallet_changes ON user_profiles;
CREATE TRIGGER trigger_log_wallet_changes
    AFTER UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_wallet_changes();

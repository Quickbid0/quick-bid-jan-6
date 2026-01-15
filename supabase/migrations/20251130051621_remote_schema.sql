


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."auction_type" AS ENUM (
    'live',
    'timed',
    'flash',
    'tender'
);


ALTER TYPE "public"."auction_type" OWNER TO "postgres";


CREATE TYPE "public"."delivery_status" AS ENUM (
    'pending',
    'scheduled',
    'in_transit',
    'delivered',
    'picked_up'
);


ALTER TYPE "public"."delivery_status" OWNER TO "postgres";


CREATE TYPE "public"."document_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."document_status" OWNER TO "postgres";


CREATE TYPE "public"."insurance_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);


ALTER TYPE "public"."insurance_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."refund_reason" AS ENUM (
    'requested_by_customer',
    'duplicate',
    'fraudulent',
    'expired_uncaptured_charge'
);


ALTER TYPE "public"."refund_reason" OWNER TO "postgres";


CREATE TYPE "public"."refund_status" AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'requires_action'
);


ALTER TYPE "public"."refund_status" OWNER TO "postgres";


CREATE TYPE "public"."settlement_status" AS ENUM (
    'pending_escrow',
    'escrow_funded',
    'awaiting_payout',
    'paid',
    'failed',
    'cancelled',
    'in_dispute'
);


ALTER TYPE "public"."settlement_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin',
    'moderator'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."bids_set_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if tg_op = 'INSERT' then
    new.created_at := coalesce(new.created_at, now());
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."bids_set_timestamps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_fee"("p_amount" numeric, "p_category" "text") RETURNS numeric
    LANGUAGE "sql"
    AS $$
  SELECT COALESCE(commission_percent, 0) * p_amount / 100
  FROM fee_rules
  WHERE category = p_category AND active = true
  ORDER BY start_at DESC
  LIMIT 1;
$$;


ALTER FUNCTION "public"."calculate_fee"("p_amount" numeric, "p_category" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_payment_fees"("p_amount" numeric, "p_currency" character varying DEFAULT 'INR'::character varying, "p_payment_method_type" "text" DEFAULT 'card'::"text", "p_is_international" boolean DEFAULT false, "p_merchant_category_code" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    v_fixed_fee DECIMAL(12, 2) := 0;
    v_percentage_fee NUMERIC(5, 2) := 0;
    v_total_fee DECIMAL(12, 2);
    v_net_amount DECIMAL(12, 2);
BEGIN
    -- Determine fees based on payment method and other factors
    -- These are example values - adjust based on your actual fee structure
    CASE p_payment_method_type
        WHEN 'card' THEN
            IF p_is_international THEN
                v_percentage_fee := 3.5; -- 3.5% for international cards
                v_fixed_fee := 20.00;    -- Additional fixed fee for international
            ELSE
                v_percentage_fee := 1.75; -- 1.75% for domestic cards
                v_fixed_fee := 2.00;     -- Fixed fee per transaction
            END IF;
            
            -- Additional fees for specific card types could be added here
            
        WHEN 'upi' THEN
            v_percentage_fee := 0.5;     -- 0.5% for UPI
            v_fixed_fee := 0.00;
            
        WHEN 'netbanking' THEN
            v_percentage_fee := 1.0;     -- 1% for netbanking
            v_fixed_fee := 5.00;
            
        WHEN 'wallet' THEN
            v_percentage_fee := 0.0;     -- No percentage for wallets
            v_fixed_fee := 0.00;
            
        ELSE
            -- Default fees for other methods
            v_percentage_fee := 2.0;
            v_fixed_fee := 5.00;
    END CASE;

    -- Apply merchant category code discounts if applicable
    IF p_merchant_category_code IS NOT NULL THEN
        -- Example: Lower fees for non-profits, education, etc.
        CASE p_merchant_category_code
            WHEN '8398' THEN -- Charitable and Social Service Organizations
                v_percentage_fee := v_percentage_fee * 0.5; -- 50% discount
            WHEN '8211' THEN -- Schools and Educational Services
                v_percentage_fee := v_percentage_fee * 0.7; -- 30% discount
            -- Add more categories as needed
            ELSE
                NULL;
        END CASE;
    END IF;

    -- Calculate total fee
    v_total_fee := (p_amount * v_percentage_fee / 100) + v_fixed_fee;
    
    -- Ensure minimum fee if applicable
    IF v_total_fee < 0 THEN
        v_total_fee := 0;
    END IF;
    
    -- Calculate net amount
    v_net_amount := p_amount - v_total_fee;

    RETURN jsonb_build_object(
        'success', true,
        'amount', p_amount,
        'currency', p_currency,
        'fees', jsonb_build_object(
            'percentage', v_percentage_fee,
            'fixed', v_fixed_fee,
            'total', v_total_fee
        ),
        'net_amount', v_net_amount,
        'payment_method_type', p_payment_method_type,
        'is_international', p_is_international,
        'merchant_category_code', p_merchant_category_code
    );
END;
$$;


ALTER FUNCTION "public"."calculate_payment_fees"("p_amount" numeric, "p_currency" character varying, "p_payment_method_type" "text", "p_is_international" boolean, "p_merchant_category_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_risk_score"("user_json" "jsonb") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  score numeric := 0;
  age integer;
  balance numeric;
BEGIN
  age := (user_json ->> 'age')::integer;
  balance := (user_json ->> 'balance')::numeric;

  IF age IS NOT NULL THEN
    IF age < 25 THEN
      score := score + 10;
    ELSIF age < 40 THEN
      score := score + 5;
    END IF;
  END IF;

  IF balance IS NOT NULL THEN
    IF balance < 1000 THEN
      score := score + 20;
    END IF;
  END IF;

  RETURN score;
END;
$$;


ALTER FUNCTION "public"."calculate_risk_score"("user_json" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_risk_score_for_user"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
declare
  score integer := 0;
  v_is_verified boolean;
  v_verification_status text;
  v_account_age_days integer;
  v_total_no_shows integer;
begin
  select
    is_verified,
    verification_status,
    extract(day from (now() - created_at))::int
  into
    v_is_verified,
    v_verification_status,
    v_account_age_days
  from profiles
  where id = p_user_id;

  -- Example rules
  if not coalesce(v_is_verified, false) and v_verification_status <> 'approved' then
    score := score + 30;
  end if;

  if v_account_age_days < 7 then
    score := score + 20;
  elsif v_account_age_days < 30 then
    score := score + 10;
  end if;

  -- TODO: add no-shows/failed deliveries when you have that data

  return least(score, 100);
end;
$$;


ALTER FUNCTION "public"."calculate_risk_score_for_user"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_perform_action"("_user_id" "uuid", "_action" "text", "_resource_data" "jsonb" DEFAULT NULL::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _user_role TEXT;
  _is_admin BOOLEAN;
  _resource_owner_id UUID;
  _result BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO _user_role
  FROM auth.users
  WHERE id = _user_id;
  
  -- Check if user is admin
  _is_admin := _user_role = 'admin' OR _user_role = 'service_role';
  
  -- Default to false
  _result := false;
  
  -- Check permissions based on action
  CASE _action
    WHEN 'view_order' THEN
      -- Users can view their own orders, admins can view any
      IF _is_admin THEN
        _result := true;
      ELSE
        SELECT EXISTS (
          SELECT 1 
          FROM orders 
          WHERE id = (_resource_data->>'order_id')::UUID 
          AND user_id = _user_id
        ) INTO _result;
      END IF;
      
    WHEN 'update_order' THEN
      -- Only admins can update orders
      _result := _is_admin;
      
    WHEN 'delete_payment_method' THEN
      -- Users can delete their own payment methods, admins can delete any
      IF _is_admin THEN
        _result := true;
      ELSE
        SELECT EXISTS (
          SELECT 1 
          FROM payment_methods 
          WHERE id = (_resource_data->>'payment_method_id')::UUID 
          AND user_id = _user_id
          AND deleted_at IS NULL
        ) INTO _result;
      END IF;
      
    WHEN 'set_default_payment_method' THEN
      -- Users can set their own default payment method
      IF _is_admin THEN
        _result := true;
      ELSE
        SELECT EXISTS (
          SELECT 1 
          FROM payment_methods 
          WHERE id = (_resource_data->>'payment_method_id')::UUID 
          AND user_id = _user_id
          AND deleted_at IS NULL
        ) INTO _result;
      END IF;
      
    WHEN 'view_payment_methods' THEN
      -- Users can view their own payment methods, admins can view any
      IF _is_admin THEN
        _result := true;
      ELSE
        _result := _user_id IS NOT NULL;
      END IF;
      
    ELSE
      -- Default deny
      _result := false;
  END CASE;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."can_perform_action"("_user_id" "uuid", "_action" "text", "_resource_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancel_order"("p_order_id" "uuid", "p_reason" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_order_status TEXT;
  v_result JSONB;
BEGIN
  -- Get current order status
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = p_order_id;

  -- Check if order can be cancelled
  IF v_order_status NOT IN ('pending', 'processing') THEN
    RAISE EXCEPTION 'Order cannot be cancelled in its current state';
  END IF;

  -- Update order status
  UPDATE orders
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = p_reason
  WHERE id = p_order_id
  RETURNING 
    jsonb_build_object(
      'order_id', id,
      'status', status,
      'cancelled_at', cancelled_at
    ) INTO v_result;

  -- Add status history
  INSERT INTO order_status_history (order_id, old_status, new_status, notes)
  VALUES (p_order_id, v_order_status, 'cancelled', p_reason);

  -- Return updated order
  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."cancel_order"("p_order_id" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_budget_violations"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  budget_record RECORD;
  current_value NUMERIC;
  violation_message TEXT;
BEGIN
  -- Only process performance metrics
  IF NEW.event_type != 'performance_metrics' THEN
    RETURN NEW;
  END IF;
  
  -- Get relevant budgets
  FOR budget_record IN 
    SELECT * FROM performance_budgets 
    WHERE 
      (metric = 'page_load' AND NEW.event_data->>'metric_name' = 'page_load') OR
      (metric = 'first_input_delay' AND NEW.event_data->>'metric_name' = 'first_input_delay') OR
      (metric = 'long_task_duration' AND NEW.event_data->>'metric_name' = 'long_task') OR
      (metric = 'long_task_count' AND NEW.event_data->>'metric_name' = 'long_task')
  LOOP
    -- Get the current value based on metric type
    IF budget_record.metric = 'page_load' THEN
      current_value := (NEW.event_data->>'value')::NUMERIC;
      violation_message := format('Page load time (%s ms) exceeds budget (%s ms)', 
        ROUND(current_value), budget_record.threshold);
    ELSIF budget_record.metric = 'first_input_delay' THEN
      current_value := (NEW.event_data->>'delay')::NUMERIC;
      violation_message := format('First input delay (%s ms) exceeds budget (%s ms)', 
        ROUND(current_value), budget_record.threshold);
    ELSIF budget_record.metric = 'long_task_duration' THEN
      current_value := (NEW.event_data->>'duration')::NUMERIC;
      violation_message := format('Long task duration (%s ms) exceeds budget (%s ms)', 
        ROUND(current_value), budget_record.threshold);
    ELSIF budget_record.metric = 'long_task_count' THEN
      -- For count, we'd need to check the count in a time window
      -- This is a simplified example
      current_value := 1; -- Each event is one count
      violation_message := 'Long task count exceeds budget';
    END IF;
    
    -- Check if budget is violated
    IF (budget_record.metric != 'long_task_count' AND current_value > budget_record.threshold) OR
       (budget_record.metric = 'long_task_count' AND current_value > budget_record.threshold) THEN
      
      -- Insert into performance_alerts
      INSERT INTO performance_alerts (
        type,
        message,
        metric,
        value,
        threshold,
        metadata,
        created_at,
        resolved
      ) VALUES (
        'warning',
        violation_message,
        budget_record.name,
        current_value,
        budget_record.threshold,
        jsonb_build_object(
          'budget_id', budget_record.id,
          'event_id', NEW.id,
          'url', NEW.page_url
        ),
        NOW(),
        false
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_budget_violations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_page_load_threshold"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF (NEW.event_data->>'metric_name' = 'page_load' AND 
      (NEW.event_data->>'value')::NUMERIC > 3000) THEN
    -- Insert into alerts table or send notification
    INSERT INTO alerts (type, message, metadata, severity)
    VALUES (
      'performance_alert',
      'High page load time detected',
      jsonb_build_object(
        'value', NEW.event_data->>'value',
        'session_id', NEW.session_id,
        'timestamp', NEW.created_at
      ),
      'warning'
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_page_load_threshold"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_performance_issues"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  alert_message TEXT;
  alert_type TEXT;
  metric_value NUMERIC;
  threshold NUMERIC;
BEGIN
  -- Check for slow page loads
  IF NEW.event_type = 'performance_metrics' AND 
     NEW.event_data->>'metric_name' = 'page_load' THEN
     
    metric_value := (NEW.event_data->>'value')::NUMERIC;
    threshold := 2000; -- 2 seconds
    
    IF metric_value > threshold THEN
      alert_message := 'Slow page load detected';
      alert_type := 'warning';
      IF metric_value > 4000 THEN
        alert_type := 'error';
      END IF;
      
      INSERT INTO performance_alerts (
        type,
        message,
        metric,
        value,
        threshold,
        created_at,
        resolved
      ) VALUES (
        alert_type,
        alert_message,
        'Page Load',
        metric_value,
        threshold,
        NOW(),
        false
      );
    END IF;
  END IF;

  -- Check for slow first input delay
  IF NEW.event_type = 'performance_metrics' AND 
     NEW.event_data->>'metric_name' = 'first_input_delay' THEN
     
    metric_value := (NEW.event_data->>'delay')::NUMERIC;
    threshold := 100; -- 100ms
    
    IF metric_value > threshold THEN
      alert_message := 'High input delay detected';
      alert_type := 'warning';
      IF metric_value > 300 THEN
        alert_type := 'error';
      END IF;
      
      INSERT INTO performance_alerts (
        type,
        message,
        metric,
        value,
        threshold,
        created_at,
        resolved
      ) VALUES (
        alert_type,
        alert_message,
        'First Input Delay',
        metric_value,
        threshold,
        NOW(),
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_performance_issues"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_transaction_balanced"("p_transaction_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
declare
  v_debits bigint;
  v_credits bigint;
begin
  select coalesce(sum(debit), 0), coalesce(sum(credit), 0)
  into v_debits, v_credits
  from public.ledger_entries
  where transaction_id = p_transaction_id;

  return v_debits = v_credits;
end;
$$;


ALTER FUNCTION "public"."check_transaction_balanced"("p_transaction_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."commission_settings_enforce_single_active"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if NEW.active then
    update public.commission_settings
      set active = false,
          updated_at = timezone('utc', now())
      where active = true
        and id <> NEW.id;
  end if;
  return NEW;
end;
$$;


ALTER FUNCTION "public"."commission_settings_enforce_single_active"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_bid"("p_auction_id" "uuid", "p_user_id" "uuid", "p_amount" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  remaining_balance numeric;
BEGIN
  PERFORM 1 FROM auctions WHERE id = p_auction_id AND status = 'active' FOR UPDATE;
  SELECT balance INTO remaining_balance FROM wallet_balances WHERE user_id = p_user_id FOR UPDATE;
  IF remaining_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  INSERT INTO bids (auction_id,user_id,amount,status,created_at) VALUES (p_auction_id,p_user_id,p_amount,'active',now());
  UPDATE wallet_balances SET balance = balance - p_amount WHERE user_id = p_user_id;
END;
$$;


ALTER FUNCTION "public"."create_bid"("p_auction_id" "uuid", "p_user_id" "uuid", "p_amount" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order"("_user_id" "uuid", "_status" "text", "_total" integer, "_payment_method_id" "uuid") RETURNS TABLE("order_id" "uuid", "order_status" "text", "amount" numeric, "order_date" timestamp with time zone, "payment_status" "text", "payment_intent_id" "text", "card_brand" "text", "card_last4" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _order_id UUID;
  _payment_id UUID;
  _payment_intent_id TEXT;
  _card_brand TEXT;
  _card_last4 TEXT;
  _exp_month INTEGER;
  _exp_year INTEGER;
  _order_created_at TIMESTAMPTZ;
  _payment_status TEXT;
  _order_status TEXT;  -- Added local variable for order status
BEGIN
  -- Generate payment intent ID
  _payment_intent_id := 'pi_' || substr(md5(random()::text), 1, 20);
  
  -- Get card details
  SELECT brand, last4, exp_month, exp_year 
  INTO _card_brand, _card_last4, _exp_month, _exp_year
  FROM payment_methods
  WHERE id = _payment_method_id 
    AND user_id = _user_id 
    AND deleted_at IS NULL;
  
  -- Check if payment method exists and belongs to user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment method not found or does not belong to user';
  END IF;
  
  -- Start transaction
  BEGIN
    -- Create order
    INSERT INTO orders (
      user_id,
      status,
      total,
      payment_method_id
    ) VALUES (
      _user_id,
      _status,
      _total,
      _payment_method_id
    )
    RETURNING 
      id, 
      status,
      created_at 
    INTO 
      _order_id,
      _order_status,
      _order_created_at;
    
    -- Create payment
    INSERT INTO payments (
      user_id,
      order_id,
      payment_intent_id,
      amount,
      currency,
      status
    ) VALUES (
      _user_id,
      _order_id,
      _payment_intent_id,
      _total,
      'USD',
      'pending'
    )
    RETURNING 
      status 
    INTO 
      _payment_status;
    
    -- Set the output values
    order_id := _order_id;
    order_status := _order_status;  -- Using the local variable
    amount := _total/100.0;
    order_date := _order_created_at;
    payment_status := _payment_status;
    payment_intent_id := _payment_intent_id;
    card_brand := _card_brand;
    card_last4 := _card_last4;
    
    -- Return the row
    RETURN NEXT;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating order: %', SQLERRM;
  END;
  
  RETURN;
END;
$$;


ALTER FUNCTION "public"."create_order"("_user_id" "uuid", "_status" "text", "_total" integer, "_payment_method_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_default BOOLEAN;
    v_other_methods_exist BOOLEAN;
BEGIN
    -- Check if this is the default payment method
    SELECT is_default INTO v_is_default
    FROM payment_methods
    WHERE 
        user_id = p_user_id
        AND payment_method_id = p_payment_method_id
        AND deleted_at IS NULL;

    -- Soft delete the payment method
    UPDATE payment_methods
    SET 
        deleted_at = NOW(),
        is_default = false,
        updated_at = NOW()
    WHERE 
        user_id = p_user_id
        AND payment_method_id = p_payment_method_id
        AND deleted_at IS NULL
    RETURNING 1 INTO v_other_methods_exist;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Payment method not found or already deleted'
        );
    END IF;

    -- If this was the default payment method, set another one as default
    IF v_is_default THEN
        -- Check if there are other payment methods
        SELECT EXISTS (
            SELECT 1 
            FROM payment_methods 
            WHERE 
                user_id = p_user_id 
                AND payment_method_id != p_payment_method_id
                AND deleted_at IS NULL
        ) INTO v_other_methods_exist;

        -- If other methods exist, set the most recent one as default
        IF v_other_methods_exist THEN
            UPDATE payment_methods
            SET 
                is_default = true,
                updated_at = NOW()
            WHERE id = (
                SELECT id
                FROM payment_methods
                WHERE 
                    user_id = p_user_id
                    AND payment_method_id != p_payment_method_id
                    AND deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT 1
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment method deleted successfully'
    );
END;
$$;


ALTER FUNCTION "public"."delete_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _is_default BOOLEAN;
  _payment_methods_count INTEGER;
BEGIN
  -- Check if payment method exists and belongs to user
  SELECT is_default INTO _is_default
  FROM payment_methods
  WHERE id = _payment_method_id 
    AND user_id = _user_id
    AND deleted_at IS NULL
  FOR UPDATE;
  
  -- If not found, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If it's the default, we need to set another one as default
  IF _is_default THEN
    -- Count remaining payment methods
    SELECT COUNT(*) INTO _payment_methods_count
    FROM payment_methods
    WHERE user_id = _user_id 
      AND id != _payment_method_id
      AND deleted_at IS NULL;
    
    -- If there are other payment methods, set the most recent one as default
    IF _payment_methods_count > 0 THEN
      UPDATE payment_methods
      SET 
        is_default = true,
        updated_at = NOW()
      WHERE id = (
        SELECT id
        FROM payment_methods
        WHERE 
          user_id = _user_id 
          AND id != _payment_method_id
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      );
    END IF;
  END IF;
  
  -- Soft delete the payment method
  UPDATE payment_methods
  SET 
    is_default = false,
    deleted_at = NOW(),
    updated_at = NOW()
  WHERE 
    id = _payment_method_id
    AND user_id = _user_id;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."delete_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."ensure_daily_metrics_view"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'daily_performance_metrics'
  ) THEN
    CREATE OR REPLACE VIEW daily_performance_metrics AS
    SELECT
      DATE(created_at) AS date,
      AVG((event_data->>'value')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'page_load') AS avg_page_load,
      AVG((event_data->>'delay')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'first_input_delay') AS avg_first_input_delay,
      COUNT(*) FILTER (WHERE event_data->>'metric_name' = 'long_task') AS long_tasks_count,
      AVG((event_data->>'duration')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'long_task') AS avg_long_task_duration
    FROM public.analytics_events
    WHERE event_type = 'performance_metrics'
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
    
    -- Grant permissions
    GRANT SELECT ON daily_performance_metrics TO authenticated;
  END IF;
END;
$$;


ALTER FUNCTION "public"."ensure_daily_metrics_view"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_payment_report"("p_report_type" "text", "p_start_date" timestamp with time zone DEFAULT ("now"() - '30 days'::interval), "p_end_date" timestamp with time zone DEFAULT "now"(), "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_status" "text" DEFAULT NULL::"text", "p_currency" character varying DEFAULT NULL::character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $_$
DECLARE
    v_report JSONB;
    v_sql TEXT;
    v_where_conditions TEXT[] := ARRAY[];
    v_param_count INT := 0;
    v_params TEXT[] := '{}';
BEGIN
    -- Common WHERE conditions
    IF p_user_id IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_where_conditions := array_append(v_where_conditions, 'p.user_id = $' || v_param_count);
        v_params := array_append(v_params, p_user_id::TEXT);
    END IF;

    IF p_status IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_where_conditions := array_append(v_where_conditions, 'p.status = $' || v_param_count);
        v_params := array_append(v_params, p_status);
    END IF;

    IF p_currency IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_where_conditions := array_append(v_where_conditions, 'p.currency = $' || v_param_count);
        v_params := array_append(v_params, p_currency);
    END IF;

    -- Add date range
    v_param_count := v_param_count + 1;
    v_where_conditions := array_append(v_where_conditions, 'p.created_at >= $' || v_param_count);
    v_params := array_append(v_params, p_start_date::TEXT);

    v_param_count := v_param_count + 1;
    v_where_conditions := array_append(v_where_conditions, 'p.created_at <= $' || v_param_count);
    v_params := array_append(v_params, p_end_date::TEXT);

    -- Build the WHERE clause
    v_sql := ' WHERE ' || array_to_string(v_where_conditions, ' AND ');

    -- Generate different report types
    CASE p_report_type
        WHEN 'summary' THEN
            EXECUTE '
                SELECT 
                    jsonb_build_object(
                        ''report_type'', ''summary'',
                        ''start_date'', $1,
                        ''end_date'', $2,
                        ''total_amount'', COALESCE(SUM(p.amount), 0),
                        ''total_transactions'', COUNT(p.id),
                        ''average_transaction'', COALESCE(AVG(p.amount), 0),
                        ''currency'', COALESCE(MAX(p.currency), ''INR''),
                        ''status_summary'', (
                            SELECT jsonb_object_agg(status, count)
                            FROM (
                                SELECT status, COUNT(*) as count
                                FROM payments
                                WHERE created_at BETWEEN $1 AND $2
                                ' || CASE WHEN p_user_id IS NOT NULL THEN 'AND user_id = $3' ELSE '' END || '
                                GROUP BY status
                            ) t
                        ),
                        ''payment_methods'', (
                            SELECT jsonb_agg(jsonb_build_object(
                                ''method'', COALESCE(pm.brand, ''unknown''),
                                ''count'', COUNT(*),
                                ''total_amount'', COALESCE(SUM(p2.amount), 0)
                            ))
                            FROM payments p2
                            LEFT JOIN payment_methods pm ON p2.payment_method_id = pm.payment_method_id
                            WHERE p2.created_at BETWEEN $1 AND $2
                            ' || CASE WHEN p_user_id IS NOT NULL THEN 'AND p2.user_id = $3' ELSE '' END || '
                            GROUP BY pm.brand
                        )
                    )
                FROM 
                    payments p
                ' || v_sql
            INTO v_report
            USING p_start_date, p_end_date, p_user_id;

        WHEN 'detailed' THEN
            EXECUTE '
                SELECT 
                    jsonb_build_object(
                        ''report_type'', ''detailed'',
                        ''start_date'', $1,
                        ''end_date'', $2,
                        ''transactions'', (
                            SELECT COALESCE(jsonb_agg(
                                jsonb_build_object(
                                    ''id'', p.id,
                                    ''user_id'', p.user_id,
                                    ''order_id'', p.order_id,
                                    ''amount'', p.amount,
                                    ''currency'', p.currency,
                                    ''status'', p.status,
                                    ''payment_method'', jsonb_build_object(
                                        ''brand'', pm.brand,
                                        ''last4'', pm.last4,
                                        ''exp_month'', pm.exp_month,
                                        ''exp_year'', pm.exp_year
                                    ),
                                    ''created_at'', p.created_at,
                                    ''refunds'', (
                                        SELECT COALESCE(jsonb_agg(
                                            jsonb_build_object(
                                                ''id'', r.id,
                                                ''amount'', r.amount,
                                                ''status'', r.status,
                                                ''reason'', r.reason,
                                                ''created_at'', r.created_at,
                                                ''processed_at'', r.processed_at
                                            )
                                            ORDER BY r.created_at DESC
                                        ), ''[]''::jsonb)
                                        FROM refunds r
                                        WHERE r.payment_id = p.id
                                        AND r.deleted_at IS NULL
                                    )
                                )
                                ORDER BY p.created_at DESC
                            ), ''[]''::jsonb)
                            FROM payments p
                            LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
                            ' || v_sql || '
                        )
                    )'
            INTO v_report
            USING p_start_date, p_end_date, p_user_id, p_status, p_currency;

        WHEN 'daily_summary' THEN
            EXECUTE '
                SELECT 
                    jsonb_build_object(
                        ''report_type'', ''daily_summary'',
                        ''start_date'', $1,
                        ''end_date'', $2,
                        ''daily_totals'', (
                            SELECT COALESCE(jsonb_agg(
                                jsonb_build_object(
                                    ''date'', DATE_TRUNC(''day'', p.created_at)::date,
                                    ''total_amount'', SUM(p.amount),
                                    ''transaction_count'', COUNT(p.id),
                                    ''average_amount'', AVG(p.amount)
                                )
                                ORDER BY DATE_TRUNC(''day'', p.created_at)::date
                            ), ''[]''::jsonb)
                            FROM payments p
                            ' || v_sql || '
                            GROUP BY DATE_TRUNC(''day'', p.created_at)::date
                        )
                    )'
            INTO v_report
            USING p_start_date, p_end_date, p_user_id, p_status, p_currency;

        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Invalid report type: ' || p_report_type
            );
    END CASE;

    RETURN jsonb_build_object(
        'success', true,
        'report', COALESCE(v_report, '{}'::jsonb)
    );
END;
$_$;


ALTER FUNCTION "public"."generate_payment_report"("p_report_type" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_user_id" "uuid", "p_status" "text", "p_currency" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_alert_subscribers"("p_alert_type" "text", "p_severity" "text") RETURNS TABLE("user_id" "uuid", "notification_type" "text", "channel" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    np.user_id,
    np.type AS notification_type,
    np.channel
  FROM 
    notification_preferences np
  WHERE 
    np.is_active = true
    AND p_alert_type = ANY(np.event_types)
    AND (
      (p_severity = 'error' AND np.min_severity IN ('info', 'warning', 'error')) OR
      (p_severity = 'warning' AND np.min_severity IN ('info', 'warning')) OR
      (p_severity = 'info' AND np.min_severity = 'info')
    );
END;
$$;


ALTER FUNCTION "public"."get_alert_subscribers"("p_alert_type" "text", "p_severity" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_avg_session_duration"("days" integer) RETURNS TABLE("avg_duration" numeric, "bounce_rate" numeric)
    LANGUAGE "sql" STABLE
    AS $$
  WITH session_data AS (
    SELECT 
      session_id,
      EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) AS duration
    FROM public.analytics_events
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL
    GROUP BY session_id
  ),
  bounce_sessions AS (
    SELECT 
      session_id
    FROM public.analytics_events
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL
    GROUP BY session_id
    HAVING COUNT(*) = 1
  )
  SELECT 
    COALESCE(AVG(duration), 0) AS avg_duration,
    (COUNT(bs.session_id) * 100.0 / NULLIF(COUNT(sd.session_id), 0)) AS bounce_rate
  FROM session_data sd
  LEFT JOIN bounce_sessions bs ON sd.session_id = bs.session_id;
$$;


ALTER FUNCTION "public"."get_avg_session_duration"("days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_budget_compliance"("p_budget_id" "uuid", "p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  budget_record RECORD;
  compliance_data JSONB;
  total_metrics INTEGER;
  compliant_metrics INTEGER;
  daily_stats JSONB;
BEGIN
  -- Get budget details
  SELECT * INTO budget_record 
  FROM performance_budgets 
  WHERE id = p_budget_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Budget not found');
  END IF;
  
  -- Calculate compliance
  EXECUTE format('
    WITH metrics AS (
      SELECT 
        DATE(created_at) AS date,
        AVG(
          CASE 
            WHEN %L = ''page_load'' THEN (event_data->>''value'')::NUMERIC
            WHEN %L = ''first_input_delay'' THEN (event_data->>''delay'')::NUMERIC
            WHEN %L = ''long_task_duration'' THEN (event_data->>''duration'')::NUMERIC
            ELSE NULL
          END
        ) AS avg_value,
        COUNT(*) AS count
      FROM analytics_events
      WHERE 
        event_type = ''performance_metrics''
        AND event_data->>''metric_name'' = %L
        AND created_at >= NOW() - (%L || '' days'')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY date
    )
    SELECT 
      COALESCE(SUM(count), 0) AS total,
      COALESCE(SUM(CASE WHEN avg_value <= %L THEN count ELSE 0 END), 0) AS compliant,
      COALESCE(jsonb_agg(
        jsonb_build_object(
          ''date'', date,
          ''avg_value'', avg_value,
          ''count'', count,
          ''is_compliant'', avg_value <= %L
        )
        ORDER BY date
      ) FILTER (WHERE date IS NOT NULL), ''[]''::jsonb) AS daily_stats
    FROM metrics',
    budget_record.metric,
    budget_record.metric,
    budget_record.metric,
    CASE 
      WHEN budget_record.metric = 'page_load' THEN 'page_load'
      WHEN budget_record.metric = 'first_input_delay' THEN 'first_input_delay'
      WHEN budget_record.metric = 'long_task_duration' THEN 'long_task'
      ELSE ''
    END,
    p_days::TEXT,
    budget_record.threshold,
    budget_record.threshold
  ) INTO compliance_data;
  
  RETURN compliance_data;
END;
$$;


ALTER FUNCTION "public"."get_budget_compliance"("p_budget_id" "uuid", "p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_client_geolocation"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  ip_address TEXT;
  geo_data JSONB;
BEGIN
  -- Get client IP from request headers
  ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
  IF ip_address IS NULL THEN
    ip_address := current_setting('request.headers', true)::json->>'x-real-ip';
  END IF;
  
  IF ip_address IS NULL THEN
    RETURN jsonb_build_object('error', 'Could not determine IP address');
  END IF;

  -- Use ipinfo.io (free tier available)
  -- Note: For production, you should use a service with a proper API key
  SELECT 
    content::jsonb INTO geo_data
  FROM 
    http_get(concat('https://ipinfo.io/', ip_address, '/json'));
  
  RETURN jsonb_build_object(
    'ip', geo_data->>'ip',
    'country', geo_data->>'country',
    'region', geo_data->>'region',
    'city', geo_data->>'city',
    'latitude', split_part(geo_data->>'loc', ',', 1)::float,
    'longitude', split_part(geo_data->>'loc', ',', 2)::float
  );
END;
$$;


ALTER FUNCTION "public"."get_client_geolocation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_events_by_type"("days" integer) RETURNS TABLE("event_type" "text", "event_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    event_type,
    COUNT(*) AS event_count
  FROM public.analytics_events
  WHERE created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY event_type
  ORDER BY event_count DESC;
$$;


ALTER FUNCTION "public"."get_events_by_type"("days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_notification_analytics"("p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSONB;
BEGIN
  WITH daily_stats AS (
    SELECT 
      DATE(created_at) AS date,
      COUNT(*) AS count
    FROM 
      notifications
    WHERE 
      created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY 
      DATE(created_at)
    ORDER BY 
      DATE(created_at)
  ),
  read_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE read = true) AS read_count,
      COUNT(*) AS total_count
    FROM 
      notifications
    WHERE 
      created_at >= NOW() - (p_days || ' days')::INTERVAL
  ),
  top_events AS (
    SELECT 
      event_type,
      COUNT(*) AS count,
      ROUND(AVG(CASE WHEN read THEN 1.0 ELSE 0.0 END)::NUMERIC, 2) AS read_rate
    FROM 
      notifications
    WHERE 
      created_at >= NOW() - (p_days || ' days')::INTERVAL
      AND event_type IS NOT NULL
    GROUP BY 
      event_type
    ORDER BY 
      COUNT(*) DESC
    LIMIT 10
  )
  SELECT 
    jsonb_build_object(
      'total_notifications', (SELECT total_count FROM read_stats),
      'read_rate', (SELECT read_count::FLOAT / NULLIF(total_count, 0) FROM read_stats),
      'avg_daily_notifications', (SELECT AVG(count)::NUMERIC(10,1) FROM daily_stats),
      'daily_stats', COALESCE(jsonb_agg(daily_stats ORDER BY date), '[]'::jsonb),
      'top_events', COALESCE(jsonb_agg(top_events), '[]'::jsonb)
    ) INTO result
  FROM 
    (SELECT 1) AS dummy;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_notification_analytics"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_details"("p_order_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'order', (
        SELECT jsonb_build_object(
          'id', o.id,
          'order_number', o.order_number,
          'status', o.status,
          'created_at', o.created_at,
          'updated_at', o.updated_at,
          'subtotal', o.subtotal,
          'shipping', o.shipping_cost,
          'tax', o.tax_amount,
          'total', o.total_amount,
          'shipping_address', o.shipping_address,
          'billing_address', o.billing_address,
          'payment_method', (
            SELECT jsonb_build_object(
              'type', pm.type,
              'last4', pm.last4,
              'brand', pm.brand,
              'exp_month', pm.exp_month,
              'exp_year', pm.exp_year
            )
            FROM payment_methods pm
            WHERE pm.id = o.payment_method_id
          )
        )
        FROM orders o
        WHERE o.id = p_order_id
      ),
      'items', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'product_image', p.image_url,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal,
            'status', oi.status,
            'return_eligible', oi.return_eligible,
            'return_requested', oi.return_requested,
            'return_status', oi.return_status
          )
        )
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = p_order_id
      ),
      'status_history', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'old_status', osh.old_status,
            'new_status', osh.new_status,
            'changed_at', osh.changed_at,
            'notes', osh.notes
          )
          ORDER BY osh.changed_at DESC
        )
        FROM order_status_history osh
        WHERE osh.order_id = p_order_id
      ),
      'payments', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'amount', p.amount,
            'status', p.status,
            'created_at', p.created_at,
            'payment_intent_id', p.payment_intent_id,
            'refunded_amount', p.refunded_amount
          )
          ORDER BY p.created_at DESC
        )
        FROM payments p
        WHERE p.order_id = p_order_id
      )
    ) INTO v_result
  FROM orders o
  WHERE o.id = p_order_id;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."get_order_details"("p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_history"("_user_id" "uuid", "_limit" integer DEFAULT 10, "_offset" integer DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
  _total_orders BIGINT;
  _order_data JSONB;
BEGIN
  -- Get total count of orders
  SELECT COUNT(*) INTO _total_orders
  FROM orders
  WHERE user_id = _user_id;
  
  -- Get paginated orders
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'order_id', o.id,
        'status', o.status,
        'total', o.total/100.0,
        'currency', p.currency,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'payment', jsonb_build_object(
          'status', p.status,
          'payment_intent_id', p.payment_intent_id,
          'card_brand', pm.brand,
          'card_last4', pm.last4
        )
      )
    ) INTO _order_data
  FROM 
    orders o
  JOIN 
    payments p ON o.id = p.order_id
  LEFT JOIN 
    payment_methods pm ON o.payment_method_id = pm.id
  WHERE 
    o.user_id = _user_id
  ORDER BY 
    o.created_at DESC
  LIMIT _limit
  OFFSET _offset;
  
  -- Build the result
  _result := jsonb_build_object(
    'total_orders', _total_orders,
    'offset', _offset,
    'limit', _limit,
    'orders', COALESCE(_order_data, '[]'::jsonb)
  );
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_page_views"("days" integer) RETURNS integer
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.analytics_events
  WHERE event_type = 'page_view'
  AND created_at >= NOW() - (days || ' days')::INTERVAL;
$$;


ALTER FUNCTION "public"."get_page_views"("days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_details"("p_payment_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'payment_id', p.id,
            'user_id', p.user_id,
            'order_id', p.order_id,
            'amount', p.amount,
            'currency', p.currency,
            'status', p.status,
            'payment_method', jsonb_build_object(
                'id', pm.id,
                'brand', pm.brand,
                'last4', pm.last4,
                'exp_month', pm.exp_month,
                'exp_year', pm.exp_year
            ),
            'created_at', p.created_at,
            'updated_at', p.updated_at,
            'refunds', COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                    'id', r.id,
                    'amount', r.amount,
                    'status', r.status,
                    'reason', r.reason,
                    'created_at', r.created_at,
                    'processed_at', r.processed_at
                ))
                FROM refunds r
                WHERE r.payment_id = p.id
                AND r.deleted_at IS NULL
            ), '[]'::jsonb)
        ) INTO v_result
    FROM 
        payments p
        LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id
    WHERE 
        p.id = p_payment_id
        AND p.deleted_at IS NULL;

    IF v_result IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Payment not found'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'data', v_result
    );
END;
$$;


ALTER FUNCTION "public"."get_payment_details"("p_payment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_method_details"("_user_id" "uuid", "_payment_method_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Get payment method details
  SELECT 
    jsonb_build_object(
      'id', id,
      'brand', brand,
      'last4', last4,
      'exp_month', exp_month,
      'exp_year', exp_year,
      'is_default', is_default,
      'created_at', created_at,
      'updated_at', updated_at,
      'card_metadata', jsonb_build_object(
        'brand_logo', 
        CASE 
          WHEN brand = 'visa' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/visa.svg'
          WHEN brand = 'mastercard' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/mastercard.svg'
          WHEN brand = 'amex' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/amex.svg'
          ELSE 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/generic.svg'
        END,
        'card_bg_color', 
        CASE 
          WHEN brand = 'visa' THEN 'linear-gradient(135deg, #1a1f71 0%, #f79a1e 100%)'
          WHEN brand = 'mastercard' THEN 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)'
          WHEN brand = 'amex' THEN 'linear-gradient(135deg, #0070ba 0%, #00a6e8 100%)'
          ELSE 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
        END
      )
    ) INTO _result
  FROM 
    payment_methods
  WHERE 
    id = _payment_method_id 
    AND user_id = _user_id
    AND deleted_at IS NULL;
  
  -- If not found, return empty object
  IF _result IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_payment_method_details"("_user_id" "uuid", "_payment_method_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_statistics"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT 
        jsonb_build_object(
            'total_spent', COALESCE((
                SELECT SUM(amount)
                FROM payments
                WHERE 
                    user_id = p_user_id
                    AND status = 'succeeded'
                    AND deleted_at IS NULL
            ), 0),
            'total_refunded', COALESCE((
                SELECT COALESCE(SUM(r.amount), 0)
                FROM refunds r
                JOIN payments p ON r.payment_id = p.id
                WHERE 
                    p.user_id = p_user_id
                    AND r.status = 'succeeded'
                    AND r.deleted_at IS NULL
                    AND p.deleted_at IS NULL
            ), 0),
            'payment_methods', (
                SELECT COUNT(*)
                FROM payment_methods
                WHERE 
                    user_id = p_user_id
                    AND deleted_at IS NULL
            ),
            'successful_payments', (
                SELECT COUNT(*)
                FROM payments
                WHERE 
                    user_id = p_user_id
                    AND status = 'succeeded'
                    AND deleted_at IS NULL
            ),
            'failed_payments', (
                SELECT COUNT(*)
                FROM payments
                WHERE 
                    user_id = p_user_id
                    AND status = 'failed'
                    AND deleted_at IS NULL
            ),
            'refunded_payments', (
                SELECT COUNT(DISTINCT payment_id)
                FROM refunds r
                JOIN payments p ON r.payment_id = p.id
                WHERE 
                    p.user_id = p_user_id
                    AND r.status = 'succeeded'
                    AND r.deleted_at IS NULL
                    AND p.deleted_at IS NULL
            ),
            'favorite_payment_method', (
                SELECT 
                    jsonb_build_object(
                        'brand', brand,
                        'last4', last4,
                        'count', COUNT(*)
                    )
                FROM payments
                WHERE 
                    user_id = p_user_id
                    AND status = 'succeeded'
                    AND deleted_at IS NULL
                GROUP BY brand, last4
                ORDER BY COUNT(*) DESC
                LIMIT 1
            )
        ) INTO v_stats;

    RETURN jsonb_build_object(
        'success', true,
        'data', v_stats
    );
END;
$$;


ALTER FUNCTION "public"."get_payment_statistics"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_payment_summary"("p_user_id" "uuid", "p_period" "text" DEFAULT 'month'::"text", "p_start_date" timestamp with time zone DEFAULT ("now"() - '1 year'::interval), "p_end_date" timestamp with time zone DEFAULT "now"()) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $_$
DECLARE
    v_date_format TEXT;
    v_interval TEXT;
    v_sql TEXT;
    v_result JSONB;
BEGIN
    -- Set date format and interval based on period
    CASE p_period
        WHEN 'day' THEN
            v_date_format := 'YYYY-MM-DD';
            v_interval := '1 day';
        WHEN 'week' THEN
            v_date_format := 'IYYY-"W"IW';
            v_interval := '1 week';
        WHEN 'month' THEN
            v_date_format := 'YYYY-MM';
            v_interval := '1 month';
        WHEN 'year' THEN
            v_date_format := 'YYYY';
            v_interval := '1 year';
        ELSE
            v_date_format := 'YYYY-MM';
            v_interval := '1 month';
    END CASE;

    -- Build the query
    v_sql := '
        WITH date_series AS (
            SELECT generate_series(
                date_trunc($1, $2::timestamp),
                date_trunc($1, $3::timestamp) + (''1 '' || $1)::interval,
                (''1 '' || $1)::interval
            ) AS period_start
        )
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    ''period'', to_char(ds.period_start, $4),
                    ''start_date'', ds.period_start,
                    ''end_date'', ds.period_start + (''1 '' || $1)::interval - interval ''1 second'',
                    ''total_amount'', COALESCE(SUM(p.amount), 0),
                    ''payment_count'', COUNT(p.id),
                    ''average_amount'', COALESCE(AVG(p.amount), 0)
                )
                ORDER BY ds.period_start
            )
        FROM 
            date_series ds
            LEFT JOIN payments p ON 
                p.created_at >= ds.period_start AND 
                p.created_at < ds.period_start + (''1 '' || $1)::interval AND
                p.user_id = $5 AND
                p.status = ''succeeded'' AND
                p.deleted_at IS NULL
        GROUP BY 
            ds.period_start
        ORDER BY 
            ds.period_start';

    -- Execute the query
    EXECUTE v_sql 
    INTO v_result
    USING 
        p_period,
        p_start_date,
        p_end_date,
        v_date_format,
        p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'period', p_period,
        'start_date', p_start_date,
        'end_date', p_end_date,
        'data', COALESCE(v_result, '[]'::jsonb)
    );
END;
$_$;


ALTER FUNCTION "public"."get_payment_summary"("p_user_id" "uuid", "p_period" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_performance_metrics"("days" integer) RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    jsonb_build_object(
      'avg_page_load', AVG((event_data->>'value')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'page_load'),
      'avg_first_input_delay', AVG((event_data->>'delay')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'first_input_delay'),
      'long_tasks_count', COUNT(*) FILTER (WHERE event_data->>'metric_name' = 'long_task'),
      'avg_long_task_duration', AVG((event_data->>'duration')::NUMERIC) FILTER (WHERE event_data->>'metric_name' = 'long_task')
    )
  FROM public.analytics_events
  WHERE event_type = 'performance_metrics'
  AND created_at >= NOW() - (days || ' days')::INTERVAL;
$$;


ALTER FUNCTION "public"."get_performance_metrics"("days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_popular_pages"("days" integer, "limit_n" integer) RETURNS TABLE("page_path" "text", "view_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT 
    event_data->>'path' AS page_path,
    COUNT(*) AS view_count
  FROM public.analytics_events
  WHERE event_type = 'page_view'
  AND created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY event_data->>'path'
  ORDER BY view_count DESC
  LIMIT limit_n;
$$;


ALTER FUNCTION "public"."get_popular_pages"("days" integer, "limit_n" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text" DEFAULT NULL::"text", "p_district" "text" DEFAULT NULL::"text", "p_mandal" "text" DEFAULT NULL::"text") RETURNS integer
    LANGUAGE "plpgsql" STABLE
    AS $$
declare
  v_category text;
  v_amount integer;
begin
  select category into v_category from public.products where id = p_product_id;

  -- Search most specific to least
  select dp.amount into v_amount
  from public.deposit_policies dp
  where dp.active = true
    and (
      (dp.product_id = p_product_id and dp.mandal is not null and dp.mandal = p_mandal)
      or (dp.product_id = p_product_id and dp.district is not null and dp.district = p_district and dp.mandal is null)
      or (dp.product_id = p_product_id and dp.state is not null and dp.state = p_state and dp.district is null and dp.mandal is null)
      or (dp.product_id = p_product_id and dp.state is null and dp.district is null and dp.mandal is null)
      or (dp.product_id is null and dp.product_category is not null and dp.product_category = v_category and dp.mandal is not null and dp.mandal = p_mandal)
      or (dp.product_id is null and dp.product_category is not null and dp.product_category = v_category and dp.district is not null and dp.district = p_district and dp.mandal is null)
      or (dp.product_id is null and dp.product_category is not null and dp.product_category = v_category and dp.state is not null and dp.state = p_state and dp.district is null and dp.mandal is null)
      or (dp.product_id is null and dp.product_category is not null and dp.product_category = v_category and dp.state is null and dp.district is null and dp.mandal is null)
    )
  order by 
    -- Specificity score
    case when dp.product_id = p_product_id then 100 else 0 end +
    case when dp.product_category is not null and dp.product_category = v_category then 10 else 0 end +
    case when dp.state is not null then 3 else 0 end +
    case when dp.district is not null then 2 else 0 end +
    case when dp.mandal is not null then 1 else 0 end,
    dp.priority desc,
    dp.updated_at desc
  limit 1;

  if v_amount is not null then
    return v_amount;
  end if;

  -- fallback to product's column or default 5000
  select coalesce(required_deposit_amount, 5000) into v_amount from public.products where id = p_product_id;
  return v_amount;
end;
$$;


ALTER FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text", "p_district" "text", "p_mandal" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unique_visitors"("days" integer) RETURNS integer
    LANGUAGE "sql" STABLE
    AS $$
  SELECT COUNT(DISTINCT session_id)::INTEGER
  FROM public.analytics_events
  WHERE created_at >= NOW() - (days || ' days')::INTERVAL;
$$;


ALTER FUNCTION "public"."get_unique_visitors"("days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_dashboard"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Get user data
  WITH user_data AS (
    SELECT * FROM user_dashboard 
    WHERE user_dashboard.user_id = _user_id
  )
  SELECT 
    jsonb_build_object(
      'user', jsonb_build_object(
        'user_id', ud.user_id,
        'email', ud.email,
        'full_name', ud.full_name
      ),
      'stats', jsonb_build_object(
        'total_orders', ud.total_orders,
        'total_spent', ud.total_spent,
        'payment_methods_count', ud.payment_methods_count
      ),
      'recent_orders', (
        WITH recent_orders AS (
          SELECT 
            order_id,
            order_status,
            order_amount,
            order_date,
            payment_status,
            card_brand,
            card_last4
          FROM order_details 
          WHERE user_id = _user_id
          ORDER BY order_date DESC
          LIMIT 5
        )
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'order_id', ro.order_id,
          'status', ro.order_status,
          'amount', ro.order_amount,
          'date', ro.order_date,
          'payment_status', ro.payment_status,
          'card_brand', ro.card_brand,
          'card_last4', ro.card_last4
        )), '[]'::jsonb)
        FROM recent_orders ro
      ),
      'payment_methods', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'id', upm.id,
          'brand', upm.brand,
          'last4', upm.last4,
          'exp_month', upm.exp_month,
          'exp_year', upm.exp_year,
          'is_default', upm.is_default
        ) ORDER BY upm.is_default DESC, upm.created_at DESC), '[]'::jsonb)
        FROM user_payment_methods upm
        WHERE upm.user_id = _user_id
      )
    ) INTO _result
  FROM 
    user_data ud;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_user_dashboard"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_order_history"("_user_id" "uuid", "_limit" integer DEFAULT 10, "_offset" integer DEFAULT 0, "_status_filter" "text" DEFAULT NULL::"text", "_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "_search_term" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    _result JSONB;
    _total_count BIGINT;
    _filtered_count BIGINT;
BEGIN
    -- Get total count of all user orders
    SELECT COUNT(*) INTO _total_count
    FROM orders
    WHERE user_id = _user_id;

    -- Get filtered count based on parameters
    SELECT COUNT(*) INTO _filtered_count
    FROM orders o
    JOIN payments p ON o.id = p.order_id
    WHERE o.user_id = _user_id
    AND (_status_filter IS NULL OR o.status = _status_filter)
    AND (_start_date IS NULL OR o.created_at >= _start_date)
    AND (_end_date IS NULL OR o.created_at <= _end_date)
    AND (
        _search_term IS NULL OR
        p.payment_intent_id ILIKE '%' || _search_term || '%'
    );

    -- Get paginated and filtered order details
    WITH order_details AS (
        SELECT 
            o.id as order_id,
            o.status as order_status,
            o.total/100.0 as amount,
            o.created_at as order_date,
            o.updated_at as last_updated,
            p.status as payment_status,
            p.payment_intent_id,
            p.updated_at as payment_updated,
            pm.brand as card_brand,
            pm.last4 as card_last4,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'old_status', osh.old_status,
                        'new_status', osh.new_status,
                        'changed_at', osh.created_at
                    ) 
                    ORDER BY osh.created_at
                ) FILTER (WHERE osh.id IS NOT NULL),
                '[]'::jsonb
            ) as status_history,
            (
                SELECT COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'event_type', pe.event_type,
                            'status', pe.status,
                            'amount', pe.amount/100.0,
                            'currency', pe.currency,
                            'created_at', pe.created_at,
                            'metadata', pe.metadata
                        ) 
                        ORDER BY pe.created_at
                    ),
                    '[]'::jsonb
                )
                FROM payment_events pe
                WHERE pe.payment_id = p.id
            ) as payment_events
        FROM 
            orders o
        JOIN 
            payments p ON o.id = p.order_id
        LEFT JOIN 
            payment_methods pm ON o.payment_method_id = pm.id
        LEFT JOIN 
            order_status_history osh ON o.id = osh.order_id
        WHERE 
            o.user_id = _user_id
            AND (_status_filter IS NULL OR o.status = _status_filter)
            AND (_start_date IS NULL OR o.created_at >= _start_date)
            AND (_end_date IS NULL OR o.created_at <= _end_date)
            AND (
                _search_term IS NULL OR
                p.payment_intent_id ILIKE '%' || _search_term || '%'
            )
        GROUP BY 
            o.id, p.id, pm.id, pm.brand, pm.last4
        ORDER BY 
            o.created_at DESC
        LIMIT _limit
        OFFSET _offset
    )
    SELECT 
        jsonb_build_object(
            'user_id', _user_id,
            'total_orders', _total_count,
            'filtered_orders', _filtered_count,
            'current_page', CASE WHEN _limit > 0 THEN (_offset / _limit) + 1 ELSE 1 END,
            'total_pages', CASE WHEN _limit > 0 THEN GREATEST(CEIL(_filtered_count::FLOAT / _limit), 1) ELSE 1 END,
            'orders_per_page', _limit,
            'total_spent', COALESCE(SUM(amount), 0),
            'orders', COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'order_id', order_id,
                        'status', order_status,
                        'amount', amount,
                        'order_date', order_date,
                        'last_updated', last_updated,
                        'payment', jsonb_build_object(
                            'status', payment_status,
                            'payment_intent_id', payment_intent_id,
                            'last_updated', payment_updated,
                            'card_brand', card_brand,
                            'card_last4', card_last4
                        ),
                        'status_history', status_history,
                        'payment_events', payment_events
                    ) 
                    ORDER BY order_date DESC
                ),
                '[]'::jsonb
            )
        ) INTO _result
    FROM 
        order_details;
    
    RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_user_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer, "_status_filter" "text", "_start_date" timestamp with time zone, "_end_date" timestamp with time zone, "_search_term" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_payment_methods"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Get all payment methods for the user
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'brand', brand,
        'last4', last4,
        'exp_month', exp_month,
        'exp_year', exp_year,
        'is_default', is_default,
        'created_at', created_at,
        'card_metadata', jsonb_build_object(
          'brand_logo', 
          CASE 
            WHEN brand = 'visa' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/visa.svg'
            WHEN brand = 'mastercard' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/mastercard.svg'
            WHEN brand = 'amex' THEN 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/amex.svg'
            ELSE 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c7cfa6/svg/color/generic.svg'
          END,
          'card_bg_color', 
          CASE 
            WHEN brand = 'visa' THEN 'linear-gradient(135deg, #1a1f71 0%, #f79a1e 100%)'
            WHEN brand = 'mastercard' THEN 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)'
            WHEN brand = 'amex' THEN 'linear-gradient(135deg, #0070ba 0%, #00a6e8 100%)'
            ELSE 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
          END
        )
      )
      ORDER BY is_default DESC, created_at DESC
    ) INTO _result
  FROM 
    payment_methods
  WHERE 
    user_id = _user_id
    AND deleted_at IS NULL;
  
  -- If no payment methods, return empty array
  IF _result IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_user_payment_methods"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile"("_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Get user profile with auth data
  SELECT 
    jsonb_build_object(
      'user_id', u.id,
      'email', u.email,
      'email_confirmed', u.email_confirmed_at IS NOT NULL,
      'phone', u.phone,
      'phone_confirmed', u.phone_confirmed_at IS NOT NULL,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url,
      'created_at', u.created_at,
      'last_sign_in', u.last_sign_in_at,
      'metadata', u.raw_user_meta_data
    ) INTO _result
  FROM 
    auth.users u
  LEFT JOIN 
    public.profiles p ON u.id = p.id
  WHERE 
    u.id = _user_id;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."get_user_profile"("_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_payment_dispute"("p_dispute_id" "text", "p_payment_id" "uuid", "p_amount" numeric, "p_currency" character varying, "p_reason" "text", "p_status" "text", "p_evidence_due_by" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_evidence" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_payment RECORD;
    v_dispute_id TEXT;
    v_dispute_status TEXT;
    v_result JSONB;
BEGIN
    -- Start transaction
    BEGIN
        -- Get payment details with row lock
        SELECT * INTO v_payment
        FROM payments
        WHERE id = p_payment_id
        FOR UPDATE;

        IF v_payment IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Payment not found'
            );
        END IF;

        -- Check if dispute already exists
        SELECT id, status INTO v_dispute_id, v_dispute_status
        FROM payment_disputes
        WHERE dispute_id = p_dispute_id
        LIMIT 1;

        IF v_dispute_id IS NOT NULL THEN
            -- Update existing dispute
            UPDATE payment_disputes
            SET 
                status = p_status,
                amount = p_amount,
                currency = p_currency,
                reason = p_reason,
                evidence_due_by = COALESCE(p_evidence_due_by, evidence_due_by),
                evidence = COALESCE(evidence || p_evidence, evidence, p_evidence),
                updated_at = NOW()
            WHERE id = v_dispute_id
            RETURNING 
                jsonb_build_object(
                    'id', id,
                    'dispute_id', dispute_id,
                    'payment_id', payment_id,
                    'status', status,
                    'amount', amount,
                    'currency', currency,
                    'reason', reason,
                    'evidence_due_by', evidence_due_by,
                    'created_at', created_at,
                    'updated_at', updated_at
                ) INTO v_result;

            -- If status changed, log the change
            IF v_dispute_status != p_status THEN
                INSERT INTO payment_dispute_history (
                    dispute_id,
                    status,
                    amount,
                    metadata
                ) VALUES (
                    v_dispute_id,
                    p_status,
                    p_amount,
                    jsonb_build_object(
                        'previous_status', v_dispute_status,
                        'changed_at', NOW(),
                        'reason', 'Status updated'
                    )
                );
            END IF;
        ELSE
            -- Create new dispute
            INSERT INTO payment_disputes (
                dispute_id,
                payment_id,
                user_id,
                amount,
                currency,
                reason,
                status,
                evidence_due_by,
                evidence
            ) VALUES (
                p_dispute_id,
                p_payment_id,
                v_payment.user_id,
                p_amount,
                p_currency,
                p_reason,
                p_status,
                p_evidence_due_by,
                p_evidence
            )
            RETURNING 
                jsonb_build_object(
                    'id', id,
                    'dispute_id', dispute_id,
                    'payment_id', payment_id,
                    'status', status,
                    'amount', amount,
                    'currency', currency,
                    'reason', reason,
                    'evidence_due_by', evidence_due_by,
                    'created_at', created_at,
                    'updated_at', updated_at
                ) INTO v_result;

            -- Log the dispute creation
            INSERT INTO payment_dispute_history (
                dispute_id,
                status,
                amount,
                metadata
            ) VALUES (
                (v_result->>'id')::UUID,
                p_status,
                p_amount,
                jsonb_build_object(
                    'created_at', NOW(),
                    'reason', 'Dispute created'
                )
            );
        END IF;

        -- Update payment status based on dispute status
        CASE p_status
            WHEN 'needs_response' THEN
                -- Payment is under dispute, but no action needed yet
                NULL;
                
            WHEN 'under_review' THEN
                -- Payment is under review by the payment processor
                UPDATE payments
                SET 
                    status = 'disputed',
                    updated_at = NOW()
                WHERE id = p_payment_id;
                
            WHEN 'won' THEN
                -- Dispute resolved in merchant's favor
                UPDATE payments
                SET 
                    status = 'succeeded', -- Or whatever status is appropriate
                    updated_at = NOW()
                WHERE id = p_payment_id;
                
            WHEN 'lost' THEN
                -- Dispute lost, funds will be debited
                -- You might want to create a negative payment or adjustment
                UPDATE payments
                SET 
                    status = 'chargeback',
                    updated_at = NOW()
                WHERE id = p_payment_id;
                
                -- Record the chargeback
                INSERT INTO chargebacks (
                    payment_id,
                    dispute_id,
                    amount,
                    currency,
                    status,
                    reason
                ) VALUES (
                    p_payment_id,
                    p_dispute_id,
                    p_amount,
                    p_currency,
                    'completed',
                    p_reason
                );
                
            WHEN 'warning_closed' THEN
                -- Dispute was a warning that has been closed
                -- No further action needed, but good to log
                NULL;
                
            ELSE
                -- For any other status, just log it
                NULL;
        END CASE;

        -- Commit transaction
        COMMIT;

        RETURN jsonb_build_object(
            'success', true,
            'message', 'Dispute processed successfully',
            'dispute', v_result
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on error
        ROLLBACK;
        
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Error processing dispute: ' || SQLERRM,
            'error', SQLERRM
        );
    END;
END;
$$;


ALTER FUNCTION "public"."handle_payment_dispute"("p_dispute_id" "text", "p_payment_id" "uuid", "p_amount" numeric, "p_currency" character varying, "p_reason" "text", "p_status" "text", "p_evidence_due_by" timestamp with time zone, "p_evidence" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce(
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('super_admin','admin')
    ), false
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select coalesce((select role in ('admin','superadmin') from public.profiles where id = uid), false);
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_performance_alert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_result JSONB;
BEGIN
  -- Only process new alerts that haven't been notified
  IF NEW.notification_status IS DISTINCT FROM 'sent' THEN
    -- Call the Edge Function to handle notifications
    SELECT 
      net.http_post(
        'https://your-project-ref.supabase.co/functions/v1/notify-performance-alert',
        jsonb_build_object(
          'alert_id', NEW.id,
          'type', NEW.type,
          'message', NEW.message,
          'metric', NEW.metric,
          'value', NEW.value,
          'threshold', NEW.threshold,
          'created_at', NEW.created_at
        )::text,
        'application/json',
        jsonb_build_object(
          'Authorization', 'Bearer ' || current_setting('app.settings.service_key', true)
        )
      ) INTO notification_result;

    -- Update the alert with notification status
    IF notification_result->>'status' = '201' THEN
      NEW.notified_at = NOW();
      NEW.notification_status = 'sent';
    ELSE
      NEW.notification_status = 'failed';
      RAISE WARNING 'Failed to send notification for alert %: %', NEW.id, notification_result;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_performance_alert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_batch_refunds"("p_refund_requests" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_refund_request JSONB;
    v_results JSONB := '[]'::JSONB;
    v_result JSONB;
    v_payment_id UUID;
    v_amount DECIMAL(12, 2);
    v_reason TEXT;
    v_metadata JSONB;
    v_refund_id UUID;
    v_success_count INT := 0;
    v_failure_count INT := 0;
    v_errors JSONB := '[]'::JSONB;
BEGIN
    -- Start transaction
    BEGIN
        -- Process each refund request
        FOR v_refund_request IN SELECT * FROM jsonb_array_elements(p_refund_requests)
        LOOP
            BEGIN
                -- Extract refund details
                v_payment_id := (v_refund_request->>'payment_id')::UUID;
                v_amount := (v_refund_request->>'amount')::DECIMAL;
                v_reason := v_refund_request->>'reason';
                v_metadata := v_refund_request->'metadata';

                -- Process the refund
                INSERT INTO refunds (
                    payment_id,
                    amount,
                    currency,
                    status,
                    reason,
                    metadata
                )
                SELECT 
                    v_payment_id,
                    v_amount,
                    p.currency,
                    'pending', -- Status will be updated by the payment processor
                    v_reason,
                    v_metadata
                FROM 
                    payments p
                WHERE 
                    p.id = v_payment_id
                    AND p.status = 'succeeded'
                    AND p.deleted_at IS NULL
                RETURNING id, status INTO v_refund_id, v_result;

                -- If no rows were inserted, the payment might not exist or is not eligible for refund
                IF v_refund_id IS NULL THEN
                    RAISE EXCEPTION 'Payment not found or not eligible for refund';
                END IF;

                -- In a real implementation, you would:
                -- 1. Call the payment gateway to process the refund
                -- 2. Update the refund status based on the gateway response
                -- For this example, we'll simulate a successful refund
                UPDATE refunds
                SET 
                    status = 'succeeded',
                    processed_at = NOW(),
                    updated_at = NOW()
                WHERE id = v_refund_id
                RETURNING 
                    jsonb_build_object(
                        'success', true,
                        'refund_id', id,
                        'payment_id', payment_id,
                        'amount', amount,
                        'currency', currency,
                        'status', status
                    ) INTO v_result;

                -- Update payment status if fully refunded
                UPDATE payments
                SET 
                    status = CASE 
                        WHEN (
                            SELECT COALESCE(SUM(r.amount), 0) 
                            FROM refunds r 
                            WHERE r.payment_id = payments.id 
                            AND r.status = 'succeeded'
                            AND r.deleted_at IS NULL
                        ) >= payments.amount 
                        THEN 'refunded' 
                        ELSE 'partially_refunded' 
                    END,
                    updated_at = NOW()
                WHERE id = v_payment_id;

                -- Add to results
                v_results := v_results || v_result;
                v_success_count := v_success_count + 1;

            EXCEPTION WHEN OTHERS THEN
                -- Record the error
                v_failure_count := v_failure_count + 1;
                v_errors := v_errors || jsonb_build_object(
                    'payment_id', COALESCE(v_payment_id::TEXT, 'unknown'),
                    'error', SQLERRM
                );

                -- Add error to results
                v_results := v_results || jsonb_build_object(
                    'success', false,
                    'payment_id', COALESCE(v_payment_id::TEXT, 'unknown'),
                    'error', SQLERRM
                );
            END;
        END LOOP;

        -- Commit the transaction
        COMMIT;

        -- Return summary
        RETURN jsonb_build_object(
            'success', true,
            'processed', jsonb_build_object(
                'total', jsonb_array_length(p_refund_requests),
                'succeeded', v_success_count,
                'failed', v_failure_count
            ),
            'results', v_results,
            'errors', CASE WHEN jsonb_array_length(v_errors) > 0 THEN v_errors ELSE '[]'::JSONB END
        );

    EXCEPTION WHEN OTHERS THEN
        -- Rollback on any error
        ROLLBACK;
        
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Batch refund processing failed: ' || SQLERRM,
            'processed', jsonb_build_object(
                'succeeded', v_success_count,
                'failed', v_failure_count
            ),
            'error', SQLERRM
        );
    END;
END;
$$;


ALTER FUNCTION "public"."process_batch_refunds"("p_refund_requests" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_payment"("p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" character varying DEFAULT 'INR'::character varying) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_payment_id UUID;
    v_payment_status TEXT;
    v_available_balance DECIMAL(12, 2);
    v_payment_method_id TEXT;
BEGIN
    -- Start transaction
    BEGIN
        -- Get user's default payment method
        SELECT payment_method_id INTO v_payment_method_id
        FROM payment_methods
        WHERE user_id = p_user_id AND is_default = true
        LIMIT 1;

        IF v_payment_method_id IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'No default payment method found'
            );
        END IF;

        -- Check if order exists and is in pending state
        IF NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE id = p_order_id 
            AND user_id = p_user_id 
            AND status = 'pending'
        ) THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Invalid or already processed order'
            );
        END IF;

        -- Process payment (simplified example)
        -- In a real implementation, this would call a payment gateway
        INSERT INTO payments (
            user_id,
            order_id,
            payment_method_id,
            amount,
            currency,
            status
        ) VALUES (
            p_user_id,
            p_order_id,
            v_payment_method_id,
            p_amount,
            p_currency,
            'succeeded'
        )
        RETURNING id, status INTO v_payment_id, v_payment_status;

        -- Update order status
        UPDATE orders
        SET 
            status = 'paid',
            payment_id = v_payment_id,
            updated_at = NOW()
        WHERE id = p_order_id;

        -- Record in audit log
        INSERT INTO payment_audit_log (
            payment_id,
            status,
            amount,
            metadata
        ) VALUES (
            v_payment_id,
            v_payment_status,
            p_amount,
            jsonb_build_object(
                'processed_at', NOW(),
                'user_id', p_user_id,
                'order_id', p_order_id
            )
        );

        -- Commit transaction
        COMMIT;

        RETURN jsonb_build_object(
            'success', true,
            'payment_id', v_payment_id,
            'status', v_payment_status,
            'message', 'Payment processed successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Payment processing failed: ' || SQLERRM
        );
    END;
END;
$$;


ALTER FUNCTION "public"."process_payment"("p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_payment_webhook"("p_event_id" "text", "p_event_type" "text", "p_event_data" "jsonb", "p_signature" "text" DEFAULT NULL::"text", "p_webhook_secret" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_event_id TEXT;
    v_processed_at TIMESTAMPTZ := NOW();
    v_payment_id UUID;
    v_payment_status TEXT;
    v_order_id UUID;
    v_user_id UUID;
    v_amount DECIMAL(12, 2);
    v_currency VARCHAR(3);
    v_payment_method_id TEXT;
    v_error_message TEXT;
    v_webhook_event_id BIGINT;
BEGIN
    -- Check if we've already processed this event
    SELECT id INTO v_webhook_event_id
    FROM payment_webhook_events
    WHERE event_id = p_event_id
    LIMIT 1;

    IF v_webhook_event_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Event already processed',
            'event_id', p_event_id
        );
    END IF;

    -- In a real implementation, you would:
    -- 1. Verify the webhook signature using p_signature and p_webhook_secret
    -- 2. Parse the event data based on the payment gateway's format
    -- 3. Handle different event types appropriately

    -- For this example, we'll handle a few common event types
    CASE p_event_type
        WHEN 'payment_intent.succeeded' THEN
            -- Extract payment details from the event data
            -- This is a simplified example - actual implementation would depend on the payment gateway
            v_payment_id := p_event_data->>'id';
            v_payment_status := 'succeeded';
            v_amount := (p_event_data->>'amount')::DECIMAL / 100; -- Convert from cents
            v_currency := p_event_data->>'currency';
            v_payment_method_id := p_event_data->'payment_method';
            
            -- In a real implementation, you would update the payment status
            -- and trigger any necessary business logic
            -- For example:
            -- UPDATE payments SET status = v_payment_status WHERE payment_intent_id = v_payment_id RETURNING id, order_id, user_id INTO v_payment_id, v_order_id, v_user_id;
            
            -- Then you might update the order status, send notifications, etc.

        WHEN 'payment_intent.payment_failed' THEN
            v_payment_id := p_event_data->>'id';
            v_payment_status := 'failed';
            v_error_message := COALESCE(
                p_event_data->'last_payment_error'->>'message',
                'Payment failed'
            );
            
            -- Update payment status and record error
            -- UPDATE payments SET status = 'failed', error_message = v_error_message WHERE payment_intent_id = v_payment_id;

        WHEN 'charge.refunded' THEN
            -- Handle refunds
            v_payment_id := p_event_data->'payment_intent';
            -- Process refund details...

        ELSE
            -- Log unhandled event types
            NULL;
    END CASE;

    -- Record the webhook event
    INSERT INTO payment_webhook_events (
        event_id,
        event_type,
        event_data,
        processed_at,
        status,
        error_message
    ) VALUES (
        p_event_id,
        p_event_type,
        p_event_data,
        v_processed_at,
        CASE WHEN v_error_message IS NULL THEN 'processed' ELSE 'error' END,
        v_error_message
    )
    RETURNING id INTO v_webhook_event_id;

    -- In a real implementation, you might want to:
    -- 1. Send notifications for certain events
    -- 2. Trigger follow-up actions
    -- 3. Update related records

    RETURN jsonb_build_object(
        'success', v_error_message IS NULL,
        'event_id', p_event_id,
        'webhook_event_id', v_webhook_event_id,
        'message', COALESCE(v_error_message, 'Webhook processed successfully')
    );

EXCEPTION WHEN OTHERS THEN
    -- Log the error
    INSERT INTO payment_webhook_events (
        event_id,
        event_type,
        event_data,
        processed_at,
        status,
        error_message
    ) VALUES (
        p_event_id,
        p_event_type,
        p_event_data,
        v_processed_at,
        'error',
        SQLERRM
    );

    RETURN jsonb_build_object(
        'success', false,
        'event_id', p_event_id,
        'message', 'Error processing webhook: ' || SQLERRM
    );
END;
$$;


ALTER FUNCTION "public"."process_payment_webhook"("p_event_id" "text", "p_event_type" "text", "p_event_data" "jsonb", "p_signature" "text", "p_webhook_secret" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_subscription_payment"("p_subscription_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_subscription RECORD;
    v_payment_id UUID;
    v_payment_status TEXT;
    v_next_billing_date TIMESTAMPTZ;
BEGIN
    -- Start transaction
    BEGIN
        -- Get subscription details with row lock
        SELECT * INTO v_subscription
        FROM subscriptions
        WHERE id = p_subscription_id
        AND status = 'active'
        AND deleted_at IS NULL
        FOR UPDATE;

        IF v_subscription IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Subscription not found or not active'
            );
        END IF;

        -- Check if it's time to bill
        IF v_subscription.next_billing_date > NOW() THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Not yet due for billing'
            );
        END IF;

        -- Process payment
        INSERT INTO payments (
            user_id,
            subscription_id,
            payment_method_id,
            amount,
            currency,
            status,
            description
        ) VALUES (
            v_subscription.user_id,
            v_subscription.id,
            v_subscription.payment_method_id,
            v_subscription.amount,
            v_subscription.currency,
            'pending',
            'Subscription payment for ' || v_subscription.plan_name || ' (' || 
            to_char(v_subscription.current_period_start, 'YYYY-MM-DD') || ' to ' || 
            to_char(v_subscription.current_period_end, 'YYYY-MM-DD') || ')'
        )
        RETURNING id, status INTO v_payment_id, v_payment_status;

        -- In a real implementation, you would:
        -- 1. Call the payment gateway to process the payment
        -- 2. Update the payment status based on the gateway response
        -- 3. Handle retries for failed payments
        -- For this example, we'll simulate a successful payment
        v_payment_status := 'succeeded';
        
        UPDATE payments
        SET 
            status = v_payment_status,
            updated_at = NOW()
        WHERE id = v_payment_id;

        -- Update subscription for next billing period
        v_next_billing_date := v_subscription.next_billing_date + 
            CASE v_subscription.billing_cycle
                WHEN 'daily' THEN INTERVAL '1 day'
                WHEN 'weekly' THEN INTERVAL '1 week'
                WHEN 'monthly' THEN INTERVAL '1 month'
                WHEN 'quarterly' THEN INTERVAL '3 months'
                WHEN 'yearly' THEN INTERVAL '1 year'
                ELSE INTERVAL '1 month'
            END;

        UPDATE subscriptions
        SET 
            current_period_start = v_subscription.next_billing_date,
            current_period_end = v_next_billing_date - INTERVAL '1 day',
            next_billing_date = v_next_billing_date,
            updated_at = NOW()
        WHERE id = v_subscription.id;

        -- Record in subscription history
        INSERT INTO subscription_history (
            subscription_id,
            payment_id,
            event_type,
            amount,
            currency,
            status,
            metadata
        ) VALUES (
            v_subscription.id,
            v_payment_id,
            'payment_processed',
            v_subscription.amount,
            v_subscription.currency,
            v_payment_status,
            jsonb_build_object(
                'billing_period_start', v_subscription.current_period_start,
                'billing_period_end', v_subscription.current_period_end,
                'next_billing_date', v_next_billing_date
            )
        );

        -- Commit transaction
        COMMIT;

        RETURN jsonb_build_object(
            'success', true,
            'payment_id', v_payment_id,
            'status', v_payment_status,
            'next_billing_date', v_next_billing_date,
            'message', 'Subscription payment processed successfully'
        );

    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Subscription payment processing failed: ' || SQLERRM
        );
    END;
END;
$$;


ALTER FUNCTION "public"."process_subscription_payment"("p_subscription_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."profiles_set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at := now();
  return new;
end;
$$;


ALTER FUNCTION "public"."profiles_set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_order_return"("p_order_id" "uuid", "p_items" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_order_status TEXT;
  v_return_id UUID;
  v_result JSONB;
  v_item RECORD;
BEGIN
  -- Get order status
  SELECT status INTO v_order_status
  FROM orders
  WHERE id = p_order_id;

  -- Check if order is eligible for return
  IF v_order_status NOT IN ('delivered', 'completed') THEN
    RAISE EXCEPTION 'Order is not eligible for return';
  END IF;

  -- Create return request
  INSERT INTO order_returns (
    order_id,
    status,
    requested_at
  ) VALUES (
    p_order_id,
    'requested',
    NOW()
  )
  RETURNING id INTO v_return_id;

  -- Add return items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_return_items (
      return_id,
      order_item_id,
      quantity,
      reason,
      status
    ) VALUES (
      v_return_id,
      (v_item->>'itemId')::UUID,
      (v_item->>'quantity')::INTEGER,
      v_item->>'reason',
      'pending'
    );

    -- Update order item status
    UPDATE order_items
    SET 
      return_requested = TRUE,
      return_status = 'pending'
    WHERE id = (v_item->>'itemId')::UUID;
  END LOOP;

  -- Update order status
  UPDATE orders
  SET 
    status = 'return_requested',
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Add status history
  INSERT INTO order_status_history (order_id, old_status, new_status, notes)
  VALUES (p_order_id, v_order_status, 'return_requested', 'Return requested by customer');

  -- Return result
  SELECT jsonb_build_object(
    'return_id', v_return_id,
    'order_id', p_order_id,
    'status', 'return_requested',
    'items_affected', jsonb_array_length(p_items)
  ) INTO v_result;

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."request_order_return"("p_order_id" "uuid", "p_items" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_payments"("p_user_id" "uuid", "p_query" "text" DEFAULT NULL::"text", "p_status" "text" DEFAULT NULL::"text", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_min_amount" numeric DEFAULT NULL::numeric, "p_max_amount" numeric DEFAULT NULL::numeric, "p_currency" character varying DEFAULT NULL::character varying, "p_limit" integer DEFAULT 10, "p_offset" integer DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $_$
DECLARE
    v_total_count BIGINT;
    v_payments JSONB;
    v_search_condition TEXT;
    v_params TEXT[];
    v_param_count INT := 0;
    v_sql TEXT;
    v_count_sql TEXT;
BEGIN
    -- Build the base query
    v_sql := '
        SELECT 
            jsonb_build_object(
                ''id'', p.id,
                ''order_id'', p.order_id,
                ''amount'', p.amount,
                ''currency'', p.currency,
                ''status'', p.status,
                ''payment_method'', jsonb_build_object(
                    ''brand'', pm.brand,
                    ''last4'', pm.last4
                ),
                ''created_at'', p.created_at,
                ''refunded_amount'', COALESCE((
                    SELECT SUM(r.amount)
                    FROM refunds r
                    WHERE r.payment_id = p.id
                    AND r.status = ''succeeded''
                    AND r.deleted_at IS NULL
                ), 0)
            )';

    v_count_sql := 'SELECT COUNT(*) FROM payments p';

    -- Build WHERE conditions
    v_search_condition := ' WHERE p.user_id = $1 AND p.deleted_at IS NULL';
    v_param_count := 1;
    v_params := ARRAY[p_user_id::TEXT];

    -- Add status filter
    IF p_status IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.status = $' || v_param_count;
        v_params := array_append(v_params, p_status);
    END IF;

    -- Add date range filter
    IF p_start_date IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.created_at >= $' || v_param_count;
        v_params := array_append(v_params, p_start_date::TEXT);
    END IF;

    IF p_end_date IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.created_at <= $' || v_param_count;
        v_params := array_append(v_params, p_end_date::TEXT);
    END IF;

    -- Add amount range filter
    IF p_min_amount IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.amount >= $' || v_param_count;
        v_params := array_append(v_params, p_min_amount::TEXT);
    END IF;

    IF p_max_amount IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.amount <= $' || v_param_count;
        v_params := array_append(v_params, p_max_amount::TEXT);
    END IF;

    -- Add currency filter
    IF p_currency IS NOT NULL THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND p.currency = $' || v_param_count;
        v_params := array_append(v_params, p_currency);
    END IF;

    -- Add search query filter
    IF p_query IS NOT NULL AND p_query != '' THEN
        v_param_count := v_param_count + 1;
        v_search_condition := v_search_condition || ' AND (
            p.id::TEXT ILIKE ''%'' || $' || v_param_count || ' || ''%'' OR
            p.order_id::TEXT ILIKE ''%'' || $' || v_param_count || ' || ''%'' OR
            p.payment_intent_id ILIKE ''%'' || $' || v_param_count || ' || ''%'' OR
            pm.brand ILIKE ''%'' || $' || v_param_count || ' || ''%'' OR
            pm.last4 ILIKE ''%'' || $' || v_param_count || ' || ''%''
        )';
        v_params := array_append(v_params, p_query);
    END IF;

    -- Add JOIN for payment methods
    v_sql := v_sql || ' FROM payments p LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id';
    v_count_sql := v_count_sql || ' p LEFT JOIN payment_methods pm ON p.payment_method_id = pm.payment_method_id';

    -- Add WHERE conditions to both queries
    v_sql := v_sql || v_search_condition || ' ORDER BY p.created_at DESC LIMIT ' || p_limit || ' OFFSET ' || p_offset;
    v_count_sql := v_count_sql || v_search_condition;

    -- Execute count query
    EXECUTE v_count_sql INTO v_total_count
    USING p_user_id, 
          CASE WHEN p_status IS NOT NULL THEN p_status ELSE NULL END,
          CASE WHEN p_start_date IS NOT NULL THEN p_start_date ELSE NULL END,
          CASE WHEN p_end_date IS NOT NULL THEN p_end_date ELSE NULL END,
          CASE WHEN p_min_amount IS NOT NULL THEN p_min_amount ELSE NULL END,
          CASE WHEN p_max_amount IS NOT NULL THEN p_max_amount ELSE NULL END,
          CASE WHEN p_currency IS NOT NULL THEN p_currency ELSE NULL END,
          CASE WHEN p_query IS NOT NULL AND p_query != '' THEN p_query ELSE NULL END;

    -- Execute search query
    EXECUTE 'SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM (' || v_sql || ') t'
    INTO v_payments
    USING p_user_id, 
          CASE WHEN p_status IS NOT NULL THEN p_status ELSE NULL END,
          CASE WHEN p_start_date IS NOT NULL THEN p_start_date ELSE NULL END,
          CASE WHEN p_end_date IS NOT NULL THEN p_end_date ELSE NULL END,
          CASE WHEN p_min_amount IS NOT NULL THEN p_min_amount ELSE NULL END,
          CASE WHEN p_max_amount IS NOT NULL THEN p_max_amount ELSE NULL END,
          CASE WHEN p_currency IS NOT NULL THEN p_currency ELSE NULL END,
          CASE WHEN p_query IS NOT NULL AND p_query != '' THEN p_query ELSE NULL END;

    RETURN jsonb_build_object(
        'success', true,
        'data', COALESCE(v_payments, '[]'::jsonb),
        'pagination', jsonb_build_object(
            'total', COALESCE(v_total_count, 0),
            'limit', p_limit,
            'offset', p_offset,
            'has_more', (p_offset + p_limit) < COALESCE(v_total_count, 0)
        )
    );
END;
$_$;


ALTER FUNCTION "public"."search_payments"("p_user_id" "uuid", "p_query" "text", "p_status" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_min_amount" numeric, "p_max_amount" numeric, "p_currency" character varying, "p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_default_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
BEGIN
  -- Start transaction
  BEGIN
    -- Unset any existing default
    UPDATE payment_methods
    SET 
      is_default = false,
      updated_at = NOW()
    WHERE 
      user_id = _user_id 
      AND is_default = true
      AND deleted_at IS NULL;
    
    -- Set the new default
    UPDATE payment_methods
    SET 
      is_default = true,
      updated_at = NOW()
    WHERE 
      id = _payment_method_id
      AND user_id = _user_id
      AND deleted_at IS NULL
    RETURNING 
      jsonb_build_object(
        'id', id,
        'brand', brand,
        'last4', last4,
        'is_default', is_default,
        'updated_at', updated_at
      ) INTO _result;
    
    -- Check if any rows were updated
    IF _result IS NULL THEN
      RAISE EXCEPTION 'Payment method not found or does not belong to user';
    END IF;
    
    RETURN _result;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error setting default payment method: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."set_default_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  salt text := encode(gen_random_bytes(16), 'hex');
  h text;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;
  h := encode(digest(raw_token || salt, 'sha256'), 'hex');
  update public.employees set qr_token_salt = salt, qr_token_hash = h, updated_at = now() where id = emp_id;
end;
$$;


ALTER FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_role_by_email"("target_email" "text", "new_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new_role not in ('user','admin','superadmin','moderator') then
    raise exception 'Invalid role: %', new_role using errcode = '22023';
  end if;

  if not public.is_admin(auth.uid()) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.profiles p
    set role = new_role
  where lower(p.email) = lower(target_email);

  if not found then
    raise exception 'No profile found for email %', target_email using errcode = 'P0002';
  end if;
end;
$$;


ALTER FUNCTION "public"."set_role_by_email"("target_email" "text", "new_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."support_messages_touch_conversation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  update public.support_conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;


ALTER FUNCTION "public"."support_messages_touch_conversation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW; 
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_on_payment_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _order_user_id UUID;
  _order_status TEXT;
BEGIN
  -- Get the order details
  SELECT user_id, status 
  INTO _order_user_id, _order_status
  FROM orders 
  WHERE id = NEW.order_id
  FOR UPDATE;
  
  -- Only proceed if order exists
  IF _order_user_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- When payment is marked as completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update the order status to processing if it's still pending
    IF _order_status = 'pending' THEN
      UPDATE orders
      SET 
        status = 'processing',
        updated_at = NOW()
      WHERE id = NEW.order_id;
    END IF;
    
    -- Log the payment completion
    INSERT INTO payment_events (
      payment_id,
      event_type,
      status,
      amount,
      currency,
      metadata
    ) VALUES (
      NEW.id,
      'payment_completed',
      NEW.status,
      NEW.amount,
      COALESCE(NEW.currency, 'USD'),
      jsonb_build_object(
        'order_id', NEW.order_id,
        'previous_status', OLD.status,
        'user_id', _order_user_id
      )
    );
  END IF;
  
  -- When payment fails
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    -- Update the order status to payment_failed
    UPDATE orders
    SET 
      status = 'payment_failed',
      updated_at = NOW()
    WHERE id = NEW.order_id;
    
    -- Log the payment failure
    INSERT INTO payment_events (
      payment_id,
      event_type,
      status,
      amount,
      currency,
      metadata
    ) VALUES (
      NEW.id,
      'payment_failed',
      NEW.status,
      NEW.amount,
      COALESCE(NEW.currency, 'USD'),
      jsonb_build_object(
        'order_id', NEW.order_id,
        'failure_reason', NEW.failure_reason,
        'previous_status', OLD.status,
        'user_id', _order_user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_order_on_payment_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_status"("_user_id" "uuid", "_order_id" "uuid", "_new_status" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
  _old_status TEXT;
  _order_exists BOOLEAN;
  _payment_id UUID;
  _payment_status TEXT;
BEGIN
  -- Check if order exists and belongs to user
  SELECT status, true 
  INTO _old_status, _order_exists
  FROM orders 
  WHERE id = _order_id 
    AND user_id = _user_id
  FOR UPDATE;  -- Lock the row for update
  
  IF NOT _order_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Order not found or access denied'
    );
  END IF;
  
  -- Get payment status for logging
  SELECT id, status 
  INTO _payment_id, _payment_status
  FROM payments 
  WHERE order_id = _order_id;
  
  -- Update the order status
  UPDATE orders
  SET 
    status = _new_status,
    updated_at = NOW()
  WHERE id = _order_id
  RETURNING 
    jsonb_build_object(
      'order_id', id,
      'old_status', _old_status,
      'new_status', status,
      'updated_at', updated_at,
      'payment', jsonb_build_object(
        'payment_id', _payment_id,
        'status', _payment_status
      )
    ) INTO _result;
  
  -- Log the status change
  INSERT INTO order_status_history (
    order_id,
    old_status,
    new_status,
    changed_by,
    payment_id
  ) VALUES (
    _order_id,
    _old_status,
    _new_status,
    _user_id,
    _payment_id
  );
  
  RETURN _result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', 'Error updating order status: ' || SQLERRM
  );
END;
$$;


ALTER FUNCTION "public"."update_order_status"("_user_id" "uuid", "_order_id" "uuid", "_new_status" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text", "p_brand" "text" DEFAULT NULL::"text", "p_last4" "text" DEFAULT NULL::"text", "p_exp_month" integer DEFAULT NULL::integer, "p_exp_year" integer DEFAULT NULL::integer, "p_is_default" boolean DEFAULT NULL::boolean) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_update_count INT;
BEGIN
    -- Update the payment method
    UPDATE payment_methods
    SET 
        brand = COALESCE(p_brand, brand),
        last4 = COALESCE(p_last4, last4),
        exp_month = COALESCE(p_exp_month, exp_month),
        exp_year = COALESCE(p_exp_year, exp_year),
        is_default = COALESCE(p_is_default, is_default),
        updated_at = NOW()
    WHERE 
        user_id = p_user_id
        AND payment_method_id = p_payment_method_id
        AND deleted_at IS NULL
    RETURNING 1 INTO v_update_count;

    IF v_update_count = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Payment method not found or not owned by user'
        );
    END IF;

    -- If setting as default, unset any other default
    IF p_is_default = true THEN
        UPDATE payment_methods
        SET 
            is_default = false,
            updated_at = NOW()
        WHERE 
            user_id = p_user_id
            AND payment_method_id != p_payment_method_id
            AND is_default = true
            AND deleted_at IS NULL;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment method updated successfully'
    );
END;
$$;


ALTER FUNCTION "public"."update_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text", "p_brand" "text", "p_last4" "text", "p_exp_month" integer, "p_exp_year" integer, "p_is_default" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_bid_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if tg_op in ('INSERT','UPDATE') then
    update public.products p
      set bid_count = coalesce((select count(*) from public.bids b where b.product_id = new.product_id), 0)
      where p.id = new.product_id;
  elsif tg_op = 'DELETE' then
    update public.products p
      set bid_count = coalesce((select count(*) from public.bids b where b.product_id = old.product_id), 0)
      where p.id = old.product_id;
  end if;
  return null;
end;
$$;


ALTER FUNCTION "public"."update_product_bid_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_counts"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET bid_count = bid_count + 1 WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_product_counts"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_profile"("_user_id" "uuid", "_profile_data" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  _result JSONB;
  _full_name TEXT;
  _avatar_url TEXT;
  _phone TEXT;
  _user_email TEXT;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO _user_email
  FROM auth.users
  WHERE id = _user_id;
  
  -- Extract profile data
  _full_name := _profile_data->>'full_name';
  _avatar_url := _profile_data->>'avatar_url';
  _phone := _profile_data->>'phone';
  
  -- Update the profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    phone,
    updated_at
  ) VALUES (
    _user_id,
    _user_email,  -- Set email from auth.users
    _full_name,
    _avatar_url,
    _phone,
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    phone = EXCLUDED.phone,
    updated_at = NOW()
  RETURNING 
    jsonb_build_object(
      'user_id', id,
      'email', email,
      'full_name', full_name,
      'avatar_url', avatar_url,
      'phone', phone,
      'updated_at', updated_at
    ) INTO _result;
  
  RETURN _result;
END;
$$;


ALTER FUNCTION "public"."update_user_profile"("_user_id" "uuid", "_profile_data" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_bid_ledger_chain"("p_auction_id" "uuid") RETURNS TABLE("ok" boolean, "broken_at" "uuid", "expected_hash" "text", "actual_hash" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  v_prev_hash text := null;
  v_expected text;
  r record;
begin
  for r in
    select * from public.bid_ledger
    where auction_id = p_auction_id
    order by ts asc
  loop
    v_expected := encode(
      digest(coalesce(v_prev_hash, '') || r.auction_id::text || r.bid_id::text || r.bidder_id::text || r.amount::text || r.ts::text, 'sha256'),
      'hex'
    );

    if r.hash <> v_expected then
      ok := false;
      broken_at := r.ledger_id;
      expected_hash := v_expected;
      actual_hash := r.hash;
      return next;
      return;
    end if;

    v_prev_hash := r.hash;
  end loop;

  ok := true;
  broken_at := null;
  expected_hash := null;
  actual_hash := null;
  return next;
end;
$$;


ALTER FUNCTION "public"."verify_bid_ledger_chain"("p_auction_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_employee"("qr_token" "text") RETURNS TABLE("employee_code" "text", "name" "text", "role" "text", "city" "text", "state" "text", "active" boolean, "verified_at" timestamp with time zone)
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
begin
  return query
  select v.employee_code, v.name, v.role, v.city, v.state, v.active, v.verified_at
  from public.public_employee_verification_view v
  join public.employees e on e.employee_code = v.employee_code
  where e.qr_token_hash = encode(digest(qr_token || coalesce(e.qr_token_salt,''), 'sha256'), 'hex')
    and e.active = true
  limit 1;
end;
$$;


ALTER FUNCTION "public"."verify_employee"("qr_token" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "account_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text" NOT NULL,
    "balance_cents" bigint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "accounts_type_check" CHECK (("type" = ANY (ARRAY['platform'::"text", 'seller'::"text", 'escrow'::"text", 'user_wallet'::"text"])))
);


ALTER TABLE "public"."accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ad_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ad_id" "uuid" NOT NULL,
    "auction_id" "uuid",
    "start_time" timestamp with time zone,
    "slot_index" integer
);


ALTER TABLE "public"."ad_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "full_name" "text",
    "street" "text" NOT NULL,
    "city" "text" NOT NULL,
    "state" "text",
    "postal_code" "text",
    "country" "text" NOT NULL,
    "phone" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_action_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "auction_id" "uuid",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_action_logs_target_type_check" CHECK (("target_type" = ANY (ARRAY['bid'::"text", 'auction'::"text", 'ad'::"text", 'deposit'::"text"])))
);


ALTER TABLE "public"."admin_action_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "environment" "text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "actor_id" "uuid" NOT NULL,
    "channel" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "before_state" "jsonb",
    "after_state" "jsonb",
    "reason_code" "text",
    "reason_text" "text",
    "policy_codes" "text"[]
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "target_table" "text" NOT NULL,
    "target_id" "uuid",
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "media_url" "text" NOT NULL,
    "duration_sec" integer NOT NULL,
    "sponsor_id" "uuid",
    "active" boolean DEFAULT true NOT NULL,
    "metrics_impressions" bigint DEFAULT 0 NOT NULL,
    "metrics_clicks" bigint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "recommendation_type" "text" NOT NULL,
    "confidence_score" numeric NOT NULL,
    "predicted_value" numeric,
    "reasons" "text"[] DEFAULT '{}'::"text"[],
    "viewed" boolean DEFAULT false,
    "clicked" boolean DEFAULT false,
    "bid_placed" boolean DEFAULT false,
    "model_version" "text",
    "features_used" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    CONSTRAINT "ai_recommendations_confidence_score_check" CHECK ((("confidence_score" >= (0)::numeric) AND ("confidence_score" <= (100)::numeric))),
    CONSTRAINT "ai_recommendations_recommendation_type_check" CHECK (("recommendation_type" = ANY (ARRAY['trending'::"text", 'undervalued'::"text", 'similar'::"text", 'ending_soon'::"text", 'price_drop'::"text"])))
);


ALTER TABLE "public"."ai_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text" NOT NULL,
    "user_id" "text",
    "event_type" "text" NOT NULL,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "page_url" "text",
    "user_agent" "text",
    "screen_resolution" "text",
    "referrer" "text",
    "is_retry" boolean DEFAULT false,
    "original_timestamp" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "device_type" "text",
    "browser" "text",
    "os" "text",
    "country" "text",
    "screen_width" integer,
    "screen_height" integer
);


ALTER TABLE "public"."analytics_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_ad_slots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "slot_id" "text" NOT NULL,
    "start_sec" integer NOT NULL,
    "duration_sec" integer NOT NULL,
    "ad_id" "uuid"
);


ALTER TABLE "public"."auction_ad_slots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_audit_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "entry_type" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start_time" timestamp with time zone
);


ALTER TABLE "public"."auction_audit_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_bids" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auction_id" "uuid",
    "bidder_id" "uuid",
    "amount" numeric(12,2) NOT NULL,
    "is_winner" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auction_bids" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone NOT NULL,
    "location_id" "uuid",
    "rules" "jsonb",
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."auction_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_reminders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "auction_id" "uuid",
    "auction_type" "text" NOT NULL,
    "reminder_time" timestamp with time zone NOT NULL,
    "sent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auction_reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auction_winners" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auction_id" "uuid",
    "winner_id" "uuid",
    "final_price" numeric(12,2) NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status",
    "payment_id" "text",
    "payment_date" timestamp with time zone,
    "delivery_status" "public"."delivery_status" DEFAULT 'pending'::"public"."delivery_status",
    "delivery_date" timestamp with time zone,
    "delivery_address" "jsonb",
    "token_fee_paid" boolean DEFAULT false,
    "token_fee_amount" numeric(12,2) DEFAULT 0,
    "token_fee_paid_at" timestamp with time zone,
    "finance_provider_key" "text",
    "finance_status" "text",
    "insurance_provider_key" "uuid",
    "insurance_status" "public"."insurance_status",
    "insurance_policy_number" "text",
    "insurance_coverage_amount" numeric(12,2),
    "insurance_expiry_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "insurance_policy_id" "uuid"
);


ALTER TABLE "public"."auction_winners" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."auctions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "auction_type" "text" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone NOT NULL,
    "actual_start_time" timestamp with time zone,
    "actual_end_time" timestamp with time zone,
    "starting_price" numeric NOT NULL,
    "current_price" numeric NOT NULL,
    "reserve_price" numeric,
    "final_price" numeric,
    "increment_amount" numeric DEFAULT 100,
    "stream_url" "text",
    "stream_key" "text",
    "rtmp_url" "text",
    "viewer_count" integer DEFAULT 0,
    "chat_enabled" boolean DEFAULT true,
    "recording_enabled" boolean DEFAULT false,
    "min_bid" numeric,
    "tender_fee" numeric,
    "submission_deadline" timestamp with time zone,
    "opening_date" timestamp with time zone,
    "sealed_bids" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'scheduled'::"text",
    "seller_id" "uuid",
    "winner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "event_id" "uuid",
    "location_id" "uuid",
    "winner_user_id" "uuid",
    "yard_id" "text",
    "auto_approve" boolean DEFAULT true,
    "min_increment_cents" bigint,
    "reserve_price_cents" bigint,
    "live_metadata" "jsonb",
    "finance_provider_key" "text",
    "finance_status" "text",
    "insurance_provider_key" "text",
    CONSTRAINT "auctions_auction_type_check" CHECK (("auction_type" = ANY (ARRAY['live'::"text", 'timed'::"text", 'tender'::"text"]))),
    CONSTRAINT "auctions_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'active'::"text", 'live'::"text", 'paused'::"text", 'ended'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."auctions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."auctions"."insurance_provider_key" IS 'References finance_partners.key for insurance provider (e.g., secure_insure)';



CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "automation_id" "uuid" NOT NULL,
    "user_id" "text",
    "event_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text",
    "error" "text"
);


ALTER TABLE "public"."automation_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "trigger" "jsonb" NOT NULL,
    "filters" "jsonb",
    "actions" "jsonb"[] NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."automations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."banner_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "image_url" "text" NOT NULL,
    "link_url" "text",
    "title" "text",
    "alt_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."banner_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."banner_schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slot" "text" NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "end_at" timestamp with time zone NOT NULL,
    "banner_asset_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."banner_schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bid_ledger" (
    "ledger_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "bid_id" "uuid" NOT NULL,
    "bidder_id" "uuid" NOT NULL,
    "amount" numeric(18,2) NOT NULL,
    "ts" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "prev_hash" "text",
    "hash" "text" NOT NULL
);


ALTER TABLE "public"."bid_ledger" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bid_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "idempotency_key" "text" NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "bidder_id" "uuid" NOT NULL,
    "response" "jsonb" NOT NULL,
    "status_code" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."bid_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bids" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "amount_cents" bigint NOT NULL,
    "type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "meta" "jsonb",
    "sequence" bigint NOT NULL,
    CONSTRAINT "bids_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text"]))),
    CONSTRAINT "bids_type_check" CHECK (("type" = ANY (ARRAY['manual'::"text", 'auto'::"text", 'admin_override'::"text"])))
);


ALTER TABLE "public"."bids" OWNER TO "postgres";


CREATE UNIQUE INDEX IF NOT EXISTS "uniq_accepted_bid_per_auction" ON "public"."bids" ("auction_id") WHERE "status" = 'accepted';


CREATE SEQUENCE IF NOT EXISTS "public"."bids_sequence_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bids_sequence_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bids_sequence_seq" OWNED BY "public"."bids"."sequence";



CREATE TABLE IF NOT EXISTS "public"."blocked_devices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "device_fingerprint" "text" NOT NULL,
    "reason" "text",
    "blocked_by" "uuid",
    "blocked_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."blocked_devices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bulk_upload_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "upload_type" "text" NOT NULL,
    "status" "text" DEFAULT 'processing'::"text",
    "total_rows" integer DEFAULT 0,
    "processed_rows" integer DEFAULT 0,
    "successful_rows" integer DEFAULT 0,
    "failed_rows" integer DEFAULT 0,
    "errors" "jsonb" DEFAULT '[]'::"jsonb",
    "warnings" "jsonb" DEFAULT '[]'::"jsonb",
    "created_products" "uuid"[] DEFAULT '{}'::"uuid"[],
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "processing_time" interval,
    CONSTRAINT "bulk_upload_jobs_status_check" CHECK (("status" = ANY (ARRAY['processing'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "bulk_upload_jobs_upload_type_check" CHECK (("upload_type" = ANY (ARRAY['products'::"text", 'vehicles'::"text", 'machinery'::"text", 'art'::"text", 'property'::"text"])))
);


ALTER TABLE "public"."bulk_upload_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."buyers" (
    "id" "uuid" NOT NULL,
    "loyalty_level" "text" DEFAULT 'standard'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."buyers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid",
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "message_type" "text" DEFAULT 'chat'::"text",
    "is_flagged" boolean DEFAULT false,
    "is_hidden" boolean DEFAULT false,
    "moderated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "chat_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['chat'::"text", 'bid'::"text", 'system'::"text", 'announcement'::"text"])))
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."commission_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "buyer_commission_percent" numeric(5,2) DEFAULT 10 NOT NULL,
    "seller_commission_percent" numeric(5,2) DEFAULT 3 NOT NULL,
    "platform_flat_fee_cents" integer DEFAULT 0 NOT NULL,
    "category_overrides" "jsonb",
    "active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."commission_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "gstin" "text",
    "status" "text" DEFAULT 'active'::"text",
    "soft_deleted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "contact_email" "text",
    CONSTRAINT "companies_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'blocked'::"text"])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_members" (
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "invited_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "company_members_role_check" CHECK (("role" = ANY (ARRAY['company_admin'::"text", 'seller'::"text"]))),
    CONSTRAINT "company_members_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'blocked'::"text", 'invited'::"text"])))
);


ALTER TABLE "public"."company_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."creative_works" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "artist_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "work_type" "text" NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "video_proof" "text",
    "creation_process_video" "text",
    "verification_status" "text" DEFAULT 'pending'::"text",
    "ai_analysis" "jsonb" DEFAULT '{}'::"jsonb",
    "human_review" "jsonb" DEFAULT '{}'::"jsonb",
    "authenticity_score" numeric,
    "materials_used" "text"[],
    "techniques" "text"[],
    "time_to_create" "text",
    "inspiration" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "creative_works_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"]))),
    CONSTRAINT "creative_works_work_type_check" CHECK (("work_type" = ANY (ARRAY['painting'::"text", 'sculpture'::"text", 'woodwork'::"text", 'handmade'::"text", 'digital_art'::"text", 'photography'::"text"])))
);


ALTER TABLE "public"."creative_works" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."daily_performance_metrics" AS
 SELECT "date"("created_at") AS "date",
    "avg"((("event_data" ->> 'value'::"text"))::numeric) FILTER (WHERE (("event_data" ->> 'metric_name'::"text") = 'page_load'::"text")) AS "avg_page_load",
    "avg"((("event_data" ->> 'delay'::"text"))::numeric) FILTER (WHERE (("event_data" ->> 'metric_name'::"text") = 'first_input_delay'::"text")) AS "avg_first_input_delay",
    "count"(*) FILTER (WHERE (("event_data" ->> 'metric_name'::"text") = 'long_task'::"text")) AS "long_tasks_count",
    "avg"((("event_data" ->> 'duration'::"text"))::numeric) FILTER (WHERE (("event_data" ->> 'metric_name'::"text") = 'long_task'::"text")) AS "avg_long_task_duration"
   FROM "public"."analytics_events"
  WHERE ("event_type" = 'performance_metrics'::"text")
  GROUP BY ("date"("created_at"))
  ORDER BY ("date"("created_at")) DESC;


ALTER VIEW "public"."daily_performance_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deliveries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "buyer_id" "uuid",
    "seller_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "tracking_updates" "jsonb"[] DEFAULT '{}'::"jsonb"[]
);


ALTER TABLE "public"."deliveries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deposit_policies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "product_id" "uuid",
    "product_category" "text",
    "state" "text",
    "district" "text",
    "mandal" "text",
    "amount" integer NOT NULL,
    "refundable" boolean DEFAULT true NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "deposit_policies_amount_check" CHECK (("amount" > 0))
);


ALTER TABLE "public"."deposit_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deposits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "type" "text" NOT NULL,
    "amount" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_ref" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "refunded_at" timestamp with time zone,
    "amount_cents" bigint,
    CONSTRAINT "deposits_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "deposits_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'refunded'::"text", 'failed'::"text"]))),
    CONSTRAINT "deposits_type_check" CHECK (("type" = ANY (ARRAY['token'::"text", 'security'::"text"])))
);


ALTER TABLE "public"."deposits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location_id" "uuid",
    "employee_code" "text",
    "qr_token_salt" "text",
    "qr_token_hash" "text",
    "active" boolean DEFAULT true,
    "verified_at" timestamp with time zone,
    "created_by" "uuid"
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "function_name" "text" NOT NULL,
    "error_message" "text" NOT NULL,
    "error_detail" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."error_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_products" (
    "event_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL
);


ALTER TABLE "public"."event_products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fee_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category" "text",
    "commission_percent" numeric,
    "commission_flat" numeric,
    "active" boolean DEFAULT true,
    "start_at" timestamp with time zone,
    "end_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fee_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "product_title" "text",
    "lead_type" "text" NOT NULL,
    "status" "text" DEFAULT 'new'::"text" NOT NULL,
    "name" "text",
    "phone" "text",
    "email" "text",
    "notes" "text",
    "source" "text" DEFAULT 'product_detail_cta'::"text",
    "loan_application_id" "uuid",
    CONSTRAINT "finance_leads_lead_type_check" CHECK (("lead_type" = ANY (ARRAY['loan'::"text", 'insurance'::"text"]))),
    CONSTRAINT "finance_leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'in_progress'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."finance_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_partners" (
    "key" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "partner_type" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "finance_partners_partner_type_check" CHECK (("partner_type" = ANY (ARRAY['bank'::"text", 'nbfc'::"text", 'insurance'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."finance_partners" OWNER TO "postgres";


COMMENT ON TABLE "public"."finance_partners" IS 'Stores finance and insurance partners like banks, NBFCs, and insurance providers';



CREATE TABLE IF NOT EXISTS "public"."inspection_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inspection_id" "uuid" NOT NULL,
    "step_id" "uuid",
    "file_type" "text" NOT NULL,
    "path" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inspection_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inspection_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inspection_id" "uuid" NOT NULL,
    "step_key" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "step_type" "text" NOT NULL,
    "sequence" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "result" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "manual_status" "text",
    "manual_notes" "text",
    CONSTRAINT "inspection_steps_manual_status_check" CHECK (("manual_status" = ANY (ARRAY['pending'::"text", 'pass'::"text", 'fail'::"text", 'retake_needed'::"text"]))),
    CONSTRAINT "inspection_steps_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'skipped'::"text"])))
);


ALTER TABLE "public"."inspection_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inspection_visits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "state" "text",
    "district" "text",
    "city" "text",
    "village" "text",
    "visit_time" timestamp with time zone,
    "amount" integer NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_ref" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "inspection_visits_amount_check" CHECK (("amount" > 0)),
    CONSTRAINT "inspection_visits_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'cancelled'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."inspection_visits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inspections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "requested_by" "uuid" NOT NULL,
    "assigned_inspector_id" "uuid",
    "company_id" "uuid",
    "product_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "ai_report" "jsonb",
    "manual_review_notes" "text",
    "final_grade" "text",
    "final_decision" "text",
    "inspected_by" "uuid",
    "requested_reinspection_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "final_status" "text" DEFAULT 'pending'::"text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    CONSTRAINT "inspections_final_decision_check" CHECK (("final_decision" = ANY (ARRAY['pass'::"text", 'fail'::"text", 'recheck'::"text"]))),
    CONSTRAINT "inspections_final_grade_check" CHECK (("final_grade" = ANY (ARRAY['A+'::"text", 'A'::"text", 'B'::"text", 'C'::"text"]))),
    CONSTRAINT "inspections_final_status_check" CHECK (("final_status" = ANY (ARRAY['pending'::"text", 'awaiting_review'::"text", 'ai_reviewed'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "inspections_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'awaiting_review'::"text", 'approved'::"text", 'rejected'::"text", 'recheck_requested'::"text"])))
);


ALTER TABLE "public"."inspections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance_documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "policy_id" "uuid",
    "name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "file_type" "text",
    "file_size" integer,
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."insurance_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance_policies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auction_winner_id" "uuid",
    "provider_id" "uuid",
    "policy_number" "text" NOT NULL,
    "status" "public"."insurance_status" DEFAULT 'pending'::"public"."insurance_status",
    "coverage_amount" numeric(12,2) NOT NULL,
    "premium_amount" numeric(12,2) NOT NULL,
    "start_date" "date" NOT NULL,
    "expiry_date" "date" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."insurance_policies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."insurance_providers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "contact_email" "text",
    "contact_phone" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."insurance_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "investor_id" "uuid" NOT NULL,
    "plan_type" "text" NOT NULL,
    "amount" numeric(18,2) NOT NULL,
    "currency" character varying(8) DEFAULT 'INR'::character varying,
    "tenure_months" integer,
    "roi_percentage" numeric(5,2),
    "revenue_share_percentage" numeric(5,2),
    "target_return_percentage" numeric(5,2),
    "lock_in_until" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text",
    "agreement_signed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "investments_amount_check" CHECK (("amount" >= (0)::numeric))
);


ALTER TABLE "public"."investments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investor_leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company" "text",
    "cheque_size" "text",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."investor_leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."investor_ledger_entries" (
    "id" bigint NOT NULL,
    "investment_id" "uuid" NOT NULL,
    "entry_type" "text" NOT NULL,
    "amount" numeric(18,2) NOT NULL,
    "balance_after" numeric(18,2) NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."investor_ledger_entries" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."investor_ledger_entries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."investor_ledger_entries_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."investor_ledger_entries_id_seq" OWNED BY "public"."investor_ledger_entries"."id";



CREATE TABLE IF NOT EXISTS "public"."investors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "pan" "text",
    "kyc_docs" "jsonb",
    "bank_account" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."investors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "token" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expires_at" timestamp with time zone DEFAULT ("now"() + '14 days'::interval) NOT NULL,
    "accepted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "invitations_role_check" CHECK (("role" = ANY (ARRAY['company_admin'::"text", 'seller'::"text"])))
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid",
    "buyer_id" "uuid",
    "seller_id" "uuid",
    "invoice_number" "text",
    "base_amount" numeric NOT NULL,
    "gst_amount" numeric DEFAULT 0 NOT NULL,
    "total_amount" numeric NOT NULL,
    "gst_rate" numeric DEFAULT 0 NOT NULL,
    "gst_mode" "text",
    "pdf_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."issues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "reason" "text" NOT NULL,
    "description" "text" NOT NULL,
    "attachment_url" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kyc_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "admin_id" "uuid",
    "action" "text" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "kyc_audit_logs_action_check" CHECK (("action" = ANY (ARRAY['approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."kyc_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kyc_doc_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "environment" "text" DEFAULT 'prod'::"text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "actor_id" "uuid",
    "channel" "text" NOT NULL,
    "ip_address" "inet",
    "user_agent" "text",
    "subject_user_id" "uuid" NOT NULL,
    "kyc_profile_id" "uuid",
    "document_type" "text" NOT NULL,
    "document_id" "uuid" NOT NULL,
    "storage_provider" "text" NOT NULL,
    "storage_bucket" "text" NOT NULL,
    "storage_key_reference" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "kyc_flow_stage" "text",
    "retention_category" "text",
    "retention_due_at" timestamp with time zone,
    "reason_code" "text",
    "reason_text" "text",
    "policy_codes" "text"[],
    "access_scope" "text",
    "access_purpose" "text",
    "is_sensitive_view" boolean
);


ALTER TABLE "public"."kyc_doc_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "location" "text",
    "company_name" "text",
    "company_type" "text",
    "interest" "text",
    "source" "text",
    "notes" "text",
    "status" "text" DEFAULT 'new'::"text",
    "assigned_to" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "leads_company_type_check" CHECK (("company_type" = ANY (ARRAY['bank'::"text", 'nbfc'::"text", 'dealer'::"text", 'sme'::"text", 'individual'::"text", 'government'::"text", 'other'::"text"]))),
    CONSTRAINT "leads_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'qualified'::"text", 'won'::"text", 'lost'::"text"])))
);


ALTER TABLE "public"."leads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_accounts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_type" "text" NOT NULL,
    "owner_id" "uuid",
    "currency" "text" DEFAULT 'INR'::"text" NOT NULL,
    "account_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ledger_accounts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ledger_entries" (
    "entry_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "transaction_id" "uuid" NOT NULL,
    "account_id" "uuid" NOT NULL,
    "debit" bigint DEFAULT 0 NOT NULL,
    "credit" bigint DEFAULT 0 NOT NULL,
    "balance_after" bigint NOT NULL,
    "ts" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."ledger_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_auctions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid",
    "seller_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "stream_url" "text",
    "start_time" timestamp with time zone DEFAULT "now"(),
    "end_time" timestamp with time zone,
    "is_live" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "starting_price" numeric(10,2),
    "current_price" numeric(10,2),
    "increment_amount" numeric(10,2),
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."live_auctions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."live_streams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "stream_url" "text" NOT NULL,
    "stream_key" "text",
    "rtmp_url" "text",
    "quality_settings" "jsonb" DEFAULT '{"fps": 30, "bitrate": 4000, "resolution": "1080p"}'::"jsonb",
    "chat_enabled" boolean DEFAULT true,
    "recording_enabled" boolean DEFAULT false,
    "status" "text" DEFAULT 'scheduled'::"text",
    "viewer_count" integer DEFAULT 0,
    "peak_viewers" integer DEFAULT 0,
    "scheduled_start" timestamp with time zone,
    "actual_start" timestamp with time zone,
    "end_time" timestamp with time zone,
    "total_watch_time" integer DEFAULT 0,
    "engagement_rate" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "live_streams_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'live'::"text", 'paused'::"text", 'ended'::"text"])))
);


ALTER TABLE "public"."live_streams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "address" "text",
    "city" "text",
    "state" "text",
    "country" "text",
    "lat" double precision,
    "lng" double precision
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketing_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "event_type" "text",
    "path" "text",
    "source" "text",
    "utm_source" "text",
    "utm_campaign" "text",
    "utm_medium" "text",
    "route_param" "text",
    "user_id" "uuid"
);


ALTER TABLE "public"."marketing_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderation_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_type" "text" NOT NULL,
    "content_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "reported_by" "uuid",
    "report_reason" "text" NOT NULL,
    "report_details" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "moderated_by" "uuid",
    "moderated_at" timestamp with time zone,
    "moderation_reason" "text",
    "ai_flagged" boolean DEFAULT false,
    "ai_confidence" numeric,
    "ai_reasons" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "moderation_queue_content_type_check" CHECK (("content_type" = ANY (ARRAY['product'::"text", 'comment'::"text", 'message'::"text", 'image'::"text", 'video'::"text"]))),
    CONSTRAINT "moderation_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."moderation_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sent_at" timestamp with time zone
);


ALTER TABLE "public"."notification_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "event_types" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "min_severity" "text" DEFAULT 'warning'::"text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notification_preferences_min_severity_check" CHECK (("min_severity" = ANY (ARRAY['info'::"text", 'warning'::"text", 'error'::"text"]))),
    CONSTRAINT "notification_preferences_type_check" CHECK (("type" = ANY (ARRAY['email'::"text", 'slack'::"text", 'in_app'::"text"])))
);


ALTER TABLE "public"."notification_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone,
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['bid_won'::"text", 'bid_placed'::"text", 'auction_ending'::"text", 'delivery_update'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "total" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payment_method_id" "uuid"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "payment_method_id" "text" NOT NULL,
    "brand" "text" NOT NULL,
    "last4" "text" NOT NULL,
    "exp_month" integer NOT NULL,
    "exp_year" integer NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "order_id" "uuid",
    "payment_intent_id" "text" NOT NULL,
    "amount" integer NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "status" "public"."payment_status" NOT NULL,
    "failure_reason" "text",
    "refunded_amount" integer DEFAULT 0,
    "refunded_at" timestamp with time zone,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_details" AS
 SELECT "o"."id" AS "order_id",
    "o"."user_id",
    "o"."status" AS "order_status",
    (("o"."total")::numeric / 100.0) AS "order_amount",
    "o"."created_at" AS "order_date",
    "o"."updated_at" AS "last_updated",
    "o"."payment_method_id",
    "p"."id" AS "payment_id",
    "p"."status" AS "payment_status",
    "p"."payment_intent_id",
    (("p"."amount")::numeric / 100.0) AS "payment_amount",
    "p"."currency",
    (("p"."refunded_amount")::numeric / 100.0) AS "refunded_amount",
    "p"."refunded_at",
    "pm"."brand" AS "card_brand",
    "pm"."last4" AS "card_last4",
    "pm"."exp_month",
    "pm"."exp_year"
   FROM (("public"."orders" "o"
     JOIN "public"."payments" "p" ON (("o"."id" = "p"."order_id")))
     LEFT JOIN "public"."payment_methods" "pm" ON (("o"."payment_method_id" = "pm"."id")));


ALTER VIEW "public"."order_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "price" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."order_statistics" AS
 SELECT "user_id",
    "status" AS "order_status",
    "count"(*) AS "order_count",
    (("sum"("total"))::numeric / 100.0) AS "total_amount"
   FROM "public"."orders"
  GROUP BY "user_id", "status"
  ORDER BY "user_id", "status";


ALTER VIEW "public"."order_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_status_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "old_status" "text" NOT NULL,
    "new_status" "text" NOT NULL,
    "changed_by" "uuid" NOT NULL,
    "payment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb"
);


ALTER TABLE "public"."order_status_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_id" "uuid",
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "metadata" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payment_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_events" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "payment_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "amount" integer NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payment_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."payment_method_statistics" AS
 SELECT "user_id",
    "brand",
    "count"(*) AS "card_count",
    "max"(
        CASE
            WHEN "is_default" THEN 'Yes'::"text"
            ELSE 'No'::"text"
        END) AS "has_default"
   FROM "public"."payment_methods"
  WHERE ("deleted_at" IS NULL)
  GROUP BY "user_id", "brand";


ALTER VIEW "public"."payment_method_statistics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "metric" "text" NOT NULL,
    "value" numeric NOT NULL,
    "threshold" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "resolved" boolean DEFAULT false,
    "resolved_at" timestamp with time zone,
    "notified_at" timestamp with time zone,
    "notification_status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "performance_alerts_notification_status_check" CHECK (("notification_status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."performance_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "metric" "text" NOT NULL,
    "threshold" numeric NOT NULL,
    "period" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "performance_budgets_metric_check" CHECK (("metric" = ANY (ARRAY['page_load'::"text", 'first_input_delay'::"text", 'long_task_duration'::"text", 'long_task_count'::"text"]))),
    CONSTRAINT "performance_budgets_period_check" CHECK (("period" = ANY (ARRAY['day'::"text", 'week'::"text", 'month'::"text"])))
);


ALTER TABLE "public"."performance_budgets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pixel_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pixel_id" "text" NOT NULL,
    "event" "text" NOT NULL,
    "metadata" "jsonb",
    "visitor_id" "text",
    "user_id" "text",
    "utm" "jsonb",
    "event_id" "text",
    "ts" timestamp with time zone NOT NULL,
    "enriched" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pixel_events" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."policy_details" AS
 SELECT "p"."id",
    "p"."auction_winner_id",
    "p"."provider_id",
    "p"."policy_number",
    "p"."status",
    "p"."coverage_amount",
    "p"."premium_amount",
    "p"."start_date",
    "p"."expiry_date",
    "p"."details",
    "p"."created_at",
    "p"."updated_at",
    "p"."created_by",
    "p"."updated_by",
    "ip"."name" AS "provider_name",
    "ip"."description" AS "provider_description"
   FROM ("public"."insurance_policies" "p"
     JOIN "public"."insurance_providers" "ip" ON (("p"."provider_id" = "ip"."id")));


ALTER VIEW "public"."policy_details" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2),
    "category" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "end_date" timestamp with time zone NOT NULL,
    "how_old" "text",
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    "view_count" integer DEFAULT 0,
    "is_premium" boolean DEFAULT false,
    "is_trending" boolean DEFAULT false,
    "variant" "text",
    "vin" "text",
    "registration_city" "text",
    "km_driven" integer,
    "fuel_type" "text",
    "owners_count" "text",
    "disclosures" "jsonb",
    "rc_url" "text",
    "insurance_url" "text",
    "puc_url" "text",
    "service_history_urls" "text"[],
    "required_deposit_amount" integer DEFAULT 5000,
    "auction_type" "text" DEFAULT 'timed'::"text",
    "condition" "text" DEFAULT 'used'::"text",
    "starting_price" numeric(14,2) DEFAULT 0 NOT NULL,
    "current_price" numeric(14,2) DEFAULT 0 NOT NULL,
    "image_url" "text",
    "reserve_price" numeric(14,2) DEFAULT 0 NOT NULL,
    "increment_amount" numeric(14,2) DEFAULT 0 NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "location" "text",
    "start_date" timestamp with time zone,
    "seller_id" "uuid",
    "subcategory" "text",
    "bid_count" integer DEFAULT 0 NOT NULL,
    "making_video_url" "text",
    "artist_name" "text",
    "artist_bio" "text",
    "artist_rating" numeric,
    "verification_status" "text" DEFAULT 'unverified'::"text",
    "shipping_info" "jsonb",
    "base_price" numeric(12,2),
    "admin_notes" "text",
    "brand" "text",
    CONSTRAINT "products_auction_type_check" CHECK (("auction_type" = ANY (ARRAY['live'::"text", 'timed'::"text", 'tender'::"text"]))),
    CONSTRAINT "products_condition_check" CHECK (("condition" = ANY (ARRAY['new'::"text", 'used'::"text", 'refurbished'::"text", 'good'::"text", 'excellent'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "phone" "text",
    "avatar_url" "text",
    "user_type" "text" DEFAULT 'buyer'::"text",
    "role" "text" DEFAULT 'user'::"text",
    "is_verified" boolean DEFAULT false,
    "verification_status" "text" DEFAULT 'pending'::"text",
    "business_name" "text",
    "company_type" "text",
    "company_registration" "text",
    "gst_number" "text",
    "rating" numeric(3,2) DEFAULT 0,
    "total_sales" integer DEFAULT 0,
    "total_purchases" integer DEFAULT 0,
    "kyc_verified" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "phone_verified" boolean DEFAULT false,
    "aadhaar_number" "text",
    "aadhaar_name" "text",
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "token_fee_paid_at" timestamp with time zone,
    "full_name" "text",
    "referrer_user_id" "uuid",
    "referrer_agent_id" "uuid",
    "company_id" "uuid",
    CONSTRAINT "profiles_company_type_check" CHECK (("company_type" = ANY (ARRAY['nbfc'::"text", 'bank'::"text", 'government'::"text", 'third_party'::"text", NULL::"text"]))),
    CONSTRAINT "profiles_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"]))),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'moderator'::"text"]))),
    CONSTRAINT "profiles_user_type_check" CHECK (("user_type" = ANY (ARRAY['buyer'::"text", 'seller'::"text", 'company'::"text", 'both'::"text"]))),
    CONSTRAINT "profiles_verification_status_check" CHECK (("verification_status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_employee_verification_view" AS
 SELECT "e"."employee_code",
    "e"."name",
    "e"."role",
    COALESCE("l"."city", "l"."name", ''::"text") AS "city",
    COALESCE("l"."state", ''::"text") AS "state",
    "e"."active",
    "e"."verified_at"
   FROM ("public"."employees" "e"
     LEFT JOIN "public"."locations" "l" ON (("l"."id" = "e"."location_id")));


ALTER VIEW "public"."public_employee_verification_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."refunds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_id" "uuid" NOT NULL,
    "amount" integer NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    "reason" "public"."refund_reason" NOT NULL,
    "status" "public"."refund_status" DEFAULT 'pending'::"public"."refund_status" NOT NULL,
    "receipt_number" "text",
    "failure_reason" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."refunds" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reserve_auto_drop_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "environment" "text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "actor_id" "uuid",
    "channel" "text" NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "listing_id" "uuid",
    "seller_id" "uuid" NOT NULL,
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "old_reserve_cents" bigint,
    "new_reserve_cents" bigint,
    "change_delta_cents" bigint,
    "trigger_reason_code" "text",
    "trigger_details" "jsonb",
    "approval_type" "text" NOT NULL,
    "policy_codes" "text"[],
    "before_state" "jsonb",
    "after_state" "jsonb"
);


ALTER TABLE "public"."reserve_auto_drop_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid",
    "reviewer_id" "uuid",
    "reviewee_id" "uuid",
    "rating" integer NOT NULL,
    "title" "text",
    "comment" "text",
    "review_type" "text" NOT NULL,
    "verified_purchase" boolean DEFAULT false,
    "helpful_votes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_review_type_check" CHECK (("review_type" = ANY (ARRAY['seller'::"text", 'buyer'::"text", 'product'::"text"])))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."revoked_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "jti" "text",
    "revoked_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."revoked_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."segments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "criteria_json" "jsonb" NOT NULL,
    "last_evaluated_at" timestamp with time zone,
    "size" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."segments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seller_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid",
    "date" "date" NOT NULL,
    "total_views" integer DEFAULT 0,
    "total_bids" integer DEFAULT 0,
    "total_sales" numeric(12,2) DEFAULT 0,
    "active_listings" integer DEFAULT 0,
    "conversion_rate" numeric(5,2) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."seller_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seller_penalties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "severity" "text" NOT NULL,
    "points" integer DEFAULT 0 NOT NULL,
    "reason" "text",
    "evidence_json" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "applied_by" "uuid",
    "applied_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."seller_penalties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sellers" (
    "id" "uuid" NOT NULL,
    "company_name" "text",
    "kyc_status" "text" DEFAULT 'pending'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sellers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settlements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "winner_id" "uuid" NOT NULL,
    "seller_id" "uuid" NOT NULL,
    "final_price_cents" bigint NOT NULL,
    "fee_cents" bigint DEFAULT 0 NOT NULL,
    "seller_cents" bigint NOT NULL,
    "status" "public"."settlement_status" DEFAULT 'pending_escrow'::"public"."settlement_status" NOT NULL,
    "dispute_until" timestamp with time zone,
    "escrow_funded_at" timestamp with time zone,
    "settled_at" timestamp with time zone,
    "payout_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."settlements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "monthly_price" numeric NOT NULL,
    "features" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid",
    "plan_id" "uuid",
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "listing_quota" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "phone_e164" "text"
);


ALTER TABLE "public"."support_conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid",
    "role" "text" DEFAULT 'user'::"text",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sender_role" "text" DEFAULT 'user'::"text" NOT NULL,
    CONSTRAINT "support_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."support_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_ticket_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "sender_type" "text" NOT NULL,
    "sender_id" "uuid",
    "channel" "text" NOT NULL,
    "message_type" "text" NOT NULL,
    "content_text" "text",
    "content_json" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "support_ticket_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['user'::"text", 'ai'::"text", 'agent'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."support_ticket_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "phone_e164" "text",
    "auction_id" "uuid",
    "product_id" "uuid",
    "external_ticket_id" "text",
    "source_channel" "text" NOT NULL,
    "category" "text" NOT NULL,
    "sub_category" "text",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "severity_level" "text" DEFAULT 'S3'::"text" NOT NULL,
    "assignee_id" "uuid",
    "sla_due_at" timestamp with time zone,
    "first_response_at" timestamp with time zone,
    "resolved_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "conversation_id" "uuid",
    "subject" "text",
    "last_update_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "support_tickets_category_check" CHECK (("category" = ANY (ARRAY['bidding'::"text", 'refund'::"text", 'payment'::"text", 'product'::"text", 'account'::"text"]))),
    CONSTRAINT "support_tickets_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "support_tickets_severity_level_check" CHECK (("severity_level" = ANY (ARRAY['S1'::"text", 'S2'::"text", 'S3'::"text"]))),
    CONSTRAINT "support_tickets_source_channel_check" CHECK (("source_channel" = ANY (ARRAY['web'::"text", 'app'::"text", 'whatsapp'::"text", 'ivr'::"text", 'email'::"text", 'admin'::"text", 'ai_widget'::"text"]))),
    CONSTRAINT "support_tickets_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'waiting_on_customer'::"text", 'waiting_on_internal'::"text", 'resolved'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "is_public" boolean DEFAULT false,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "type" "text" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "description" "text",
    "reference_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ref_type" "text",
    "ref_id" "text",
    CONSTRAINT "transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "transactions_type_check" CHECK (("type" = ANY (ARRAY['wallet_topup'::"text", 'wallet_withdrawal'::"text", 'bid_deposit'::"text", 'bid_refund'::"text", 'sale_payout'::"text", 'commission'::"text", 'penalty'::"text"])))
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "page_views" integer DEFAULT 0,
    "session_duration" interval,
    "products_viewed" "uuid"[] DEFAULT '{}'::"uuid"[],
    "searches_performed" "text"[] DEFAULT '{}'::"text"[],
    "categories_browsed" "text"[] DEFAULT '{}'::"text"[],
    "total_bids" integer DEFAULT 0,
    "won_auctions" integer DEFAULT 0,
    "average_bid_amount" numeric DEFAULT 0,
    "preferred_categories" "text"[] DEFAULT '{}'::"text"[],
    "login_frequency" numeric DEFAULT 0,
    "last_active" timestamp with time zone,
    "date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_controls" (
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'normal'::"text" NOT NULL,
    "notes" "text",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cooldown_until" timestamp with time zone,
    "cooldown_reason" "text",
    "cooldown_source" "text",
    "penalty_points" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."user_controls" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_dashboard" AS
 SELECT "u"."id" AS "user_id",
    "u"."email",
    "p"."full_name",
    ( SELECT "count"(*) AS "count"
           FROM "public"."orders" "o"
          WHERE ("o"."user_id" = "u"."id")) AS "total_orders",
    ( SELECT COALESCE((("sum"("o"."total"))::numeric / 100.0), (0)::numeric) AS "coalesce"
           FROM "public"."orders" "o"
          WHERE ("o"."user_id" = "u"."id")) AS "total_spent",
    ( SELECT "count"(*) AS "count"
           FROM "public"."payment_methods" "pm"
          WHERE (("pm"."user_id" = "u"."id") AND ("pm"."deleted_at" IS NULL))) AS "payment_methods_count"
   FROM ("auth"."users" "u"
     LEFT JOIN "public"."profiles" "p" ON (("u"."id" = "p"."id")));


ALTER VIEW "public"."user_dashboard" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_deposit_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "deposit_id" "uuid" NOT NULL,
    "amount_cents" bigint NOT NULL,
    "status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_deposit_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_otp_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "channel" "text" NOT NULL,
    "otp_hash" "text" NOT NULL,
    "otp_salt" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "attempts" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 5 NOT NULL,
    "consumed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "user_otp_codes_channel_check" CHECK (("channel" = ANY (ARRAY['sms'::"text", 'email'::"text", 'whatsapp'::"text"])))
);


ALTER TABLE "public"."user_otp_codes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_payment_methods" AS
 SELECT "id",
    "user_id",
    "payment_method_id",
    "brand",
    "last4",
    "exp_month",
    "exp_year",
    "is_default",
    "created_at",
    "updated_at",
    "deleted_at"
   FROM "public"."payment_methods"
  WHERE ("deleted_at" IS NULL);


ALTER VIEW "public"."user_payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "phone" "text",
    "kyc_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "roles" "text"[] DEFAULT ARRAY['buyer'::"text"] NOT NULL,
    "wallet_available_cents" bigint DEFAULT 0 NOT NULL,
    "wallet_escrow_cents" bigint DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_profiles_kyc_status_check" CHECK (("kyc_status" = ANY (ARRAY['pending'::"text", 'verified'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_risk" (
    "user_id" "uuid" NOT NULL,
    "risk_score" integer NOT NULL,
    "risk_level" "text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_risk_risk_level_check" CHECK (("risk_level" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."user_risk" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_risks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "risk_score" numeric NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_risks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "doc_type" "text",
    "visible_to_public" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."vehicle_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."vehicle_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vin" "text",
    "make" "text",
    "model" "text",
    "year" integer,
    "color" "text",
    "kms" integer,
    "rc_verified" boolean DEFAULT false,
    "accident_history" "text",
    "condition_notes" "text",
    "special_highlights" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallet_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "environment" "text" DEFAULT 'prod'::"text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "actor_id" "uuid",
    "channel" "text" NOT NULL,
    "ip_address" "inet",
    "wallet_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text" NOT NULL,
    "event_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "amount_delta_cents" bigint NOT NULL,
    "wallet_balance_before_cents" bigint NOT NULL,
    "wallet_balance_after_cents" bigint NOT NULL,
    "escrow_balance_before_cents" bigint,
    "escrow_balance_after_cents" bigint,
    "source_type" "text",
    "source_reference" "text",
    "auction_id" "uuid",
    "bid_id" "uuid",
    "order_id" "uuid",
    "reason_code" "text",
    "reason_text" "text",
    "policy_codes" "text"[]
);


ALTER TABLE "public"."wallet_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallet_balances" (
    "account_id" "uuid" NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text" NOT NULL,
    "available_balance" numeric(18,2) DEFAULT 0 NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."wallet_balances" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallet_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "wallet_id" "uuid",
    "amount" numeric NOT NULL,
    "transaction_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "payment_method" "text",
    "payment_gateway" "text",
    "gateway_transaction_id" "text",
    "auction_id" "uuid",
    "bid_id" "uuid",
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "yard_id" "text",
    CONSTRAINT "wallet_transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "wallet_transactions_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['deposit'::"text", 'withdrawal'::"text", 'bid_hold'::"text", 'bid_release'::"text", 'payment'::"text", 'refund'::"text", 'commission'::"text"])))
);


ALTER TABLE "public"."wallet_transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wallets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "balance" numeric DEFAULT 0,
    "frozen_amount" numeric DEFAULT 0,
    "total_deposited" numeric DEFAULT 0,
    "total_withdrawn" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "currency" "text" DEFAULT 'INR'::"text",
    "locked_amount" numeric(14,2) DEFAULT 0 NOT NULL,
    CONSTRAINT "wallets_balance_check" CHECK (("balance" >= (0)::numeric)),
    CONSTRAINT "wallets_locked_amount_check" CHECK (("locked_amount" >= (0)::numeric)),
    CONSTRAINT "wallets_locked_le_balance_check" CHECK (("locked_amount" <= "balance"))
);


ALTER TABLE "public"."wallets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."watchlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."watchlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhook_events" (
    "id" "text" NOT NULL,
    "provider" "text" DEFAULT 'razorpay'::"text" NOT NULL,
    "event" "text",
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "processed_at" timestamp with time zone
);


ALTER TABLE "public"."webhook_events" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."weekly_performance_trends" AS
 SELECT "date",
    "round"("avg_page_load") AS "avg_page_load_ms",
    "round"("avg_first_input_delay") AS "avg_fid_ms",
    "long_tasks_count",
    "round"("avg_long_task_duration") AS "avg_long_task_ms"
   FROM "public"."daily_performance_metrics"
  WHERE ("date" >= (CURRENT_DATE - '30 days'::interval))
  ORDER BY "date" DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."weekly_performance_trends" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."win_payment_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "win_payment_id" "uuid" NOT NULL,
    "changed_by" "uuid",
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "old_status" "text",
    "new_status" "text",
    "meta" "jsonb",
    "note" "text"
);


ALTER TABLE "public"."win_payment_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."win_payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "method" "text" NOT NULL,
    "reference_number" "text",
    "screenshot_url" "text",
    "amount" numeric(14,2) NOT NULL,
    "currency" "text" DEFAULT 'INR'::"text" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'pending_verification'::"text" NOT NULL,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "notes" "text",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."win_payments" OWNER TO "postgres";


ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_amount_check" CHECK (("amount" > (0)::numeric));
ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_status_check" CHECK (("status" = ANY (ARRAY['pending_verification'::"text", 'approved'::"text", 'rejected'::"text", 'pending_documents'::"text", 'partial_payment'::"text", 'refund_in_progress'::"text"])));


CREATE TABLE IF NOT EXISTS "public"."winner_delivery_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auction_id" "uuid" NOT NULL,
    "winner_id" "uuid" NOT NULL,
    "delivery_mode" "text" NOT NULL,
    "branch_id" "uuid",
    "address_line1" "text",
    "address_line2" "text",
    "city" "text",
    "state" "text",
    "pincode" "text",
    "country" "text" DEFAULT 'IN'::"text",
    "primary_phone" "text",
    "alternate_phone" "text",
    "contact_name" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "internal_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "winner_delivery_preferences_delivery_mode_check" CHECK (("delivery_mode" = ANY (ARRAY['delivery'::"text", 'pickup'::"text"]))),
    CONSTRAINT "winner_delivery_preferences_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'ready_for_dispatch'::"text", 'in_transit'::"text", 'out_for_delivery'::"text", 'picked_up'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."winner_delivery_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlist" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "product_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wishlist" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wishlists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."yard_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "yard_id" "text" NOT NULL,
    "amount" numeric(12,2) DEFAULT 5000 NOT NULL,
    "status" "text" DEFAULT 'held'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."yard_tokens" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bids" ALTER COLUMN "sequence" SET DEFAULT "nextval"('"public"."bids_sequence_seq"'::"regclass");



ALTER TABLE ONLY "public"."investor_ledger_entries" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."investor_ledger_entries_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."ad_schedule"
    ADD CONSTRAINT "ad_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_action_logs"
    ADD CONSTRAINT "admin_action_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ads"
    ADD CONSTRAINT "ads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_recommendations"
    ADD CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_events"
    ADD CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_ad_slots"
    ADD CONSTRAINT "auction_ad_slots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_audit_entries"
    ADD CONSTRAINT "auction_audit_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_bids"
    ADD CONSTRAINT "auction_bids_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_events"
    ADD CONSTRAINT "auction_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_reminders"
    ADD CONSTRAINT "auction_reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auction_reminders"
    ADD CONSTRAINT "auction_reminders_user_id_auction_id_key" UNIQUE ("user_id", "auction_id");



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_auction_id_winner_id_key" UNIQUE ("auction_id", "winner_id");



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_automation_id_user_id_event_id_key" UNIQUE ("automation_id", "user_id", "event_id");



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automations"
    ADD CONSTRAINT "automations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banner_assets"
    ADD CONSTRAINT "banner_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."banner_schedules"
    ADD CONSTRAINT "banner_schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bid_ledger"
    ADD CONSTRAINT "bid_ledger_pkey" PRIMARY KEY ("ledger_id");



ALTER TABLE ONLY "public"."bid_requests"
    ADD CONSTRAINT "bid_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocked_devices"
    ADD CONSTRAINT "blocked_devices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_upload_jobs"
    ADD CONSTRAINT "bulk_upload_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."commission_settings"
    ADD CONSTRAINT "commission_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_pkey" PRIMARY KEY ("company_id", "user_id");



ALTER TABLE ONLY "public"."creative_works"
    ADD CONSTRAINT "creative_works_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deposit_policies"
    ADD CONSTRAINT "deposit_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deposits"
    ADD CONSTRAINT "deposits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_products"
    ADD CONSTRAINT "event_products_pkey" PRIMARY KEY ("event_id", "product_id");



ALTER TABLE ONLY "public"."fee_rules"
    ADD CONSTRAINT "fee_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_leads"
    ADD CONSTRAINT "finance_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_partners"
    ADD CONSTRAINT "finance_partners_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."inspection_files"
    ADD CONSTRAINT "inspection_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspection_steps"
    ADD CONSTRAINT "inspection_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspection_visits"
    ADD CONSTRAINT "inspection_visits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_documents"
    ADD CONSTRAINT "insurance_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."insurance_providers"
    ADD CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investments"
    ADD CONSTRAINT "investments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_leads"
    ADD CONSTRAINT "investor_leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investor_ledger_entries"
    ADD CONSTRAINT "investor_ledger_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."investors"
    ADD CONSTRAINT "investors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kyc_audit_logs"
    ADD CONSTRAINT "kyc_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kyc_doc_audit_log"
    ADD CONSTRAINT "kyc_doc_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_accounts"
    ADD CONSTRAINT "ledger_accounts_owner_type_owner_id_account_type_currency_key" UNIQUE ("owner_type", "owner_id", "account_type", "currency");



ALTER TABLE ONLY "public"."ledger_accounts"
    ADD CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("entry_id");



ALTER TABLE ONLY "public"."live_auctions"
    ADD CONSTRAINT "live_auctions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."live_streams"
    ADD CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketing_events"
    ADD CONSTRAINT "marketing_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_queue"
    ADD CONSTRAINT "moderation_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_events"
    ADD CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_type_channel_key" UNIQUE ("user_id", "type", "channel");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_audit_log"
    ADD CONSTRAINT "payment_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_alerts"
    ADD CONSTRAINT "performance_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_budgets"
    ADD CONSTRAINT "performance_budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pixel_events"
    ADD CONSTRAINT "pixel_events_event_id_key" UNIQUE ("event_id");



ALTER TABLE ONLY "public"."pixel_events"
    ADD CONSTRAINT "pixel_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reserve_auto_drop_log"
    ADD CONSTRAINT "reserve_auto_drop_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."revoked_sessions"
    ADD CONSTRAINT "revoked_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."segments"
    ADD CONSTRAINT "segments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_analytics"
    ADD CONSTRAINT "seller_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seller_analytics"
    ADD CONSTRAINT "seller_analytics_seller_id_date_key" UNIQUE ("seller_id", "date");



ALTER TABLE ONLY "public"."seller_penalties"
    ADD CONSTRAINT "seller_penalties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_plans"
    ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_conversations"
    ADD CONSTRAINT "support_conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "uq_payment_intent" UNIQUE ("payment_intent_id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "uq_payment_method_user" UNIQUE ("user_id", "payment_method_id");



ALTER TABLE ONLY "public"."user_analytics"
    ADD CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_analytics"
    ADD CONSTRAINT "user_analytics_user_id_date_key" UNIQUE ("user_id", "date");



ALTER TABLE ONLY "public"."user_controls"
    ADD CONSTRAINT "user_controls_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_deposit_history"
    ADD CONSTRAINT "user_deposit_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_otp_codes"
    ADD CONSTRAINT "user_otp_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_risk"
    ADD CONSTRAINT "user_risk_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_risks"
    ADD CONSTRAINT "user_risks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_documents"
    ADD CONSTRAINT "vehicle_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_images"
    ADD CONSTRAINT "vehicle_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_vin_key" UNIQUE ("vin");



ALTER TABLE ONLY "public"."wallet_audit_log"
    ADD CONSTRAINT "wallet_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallet_balances"
    ADD CONSTRAINT "wallet_balances_pkey" PRIMARY KEY ("account_id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."watchlist"
    ADD CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."watchlist"
    ADD CONSTRAINT "watchlist_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."webhook_events"
    ADD CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."win_payment_audit_logs"
    ADD CONSTRAINT "win_payment_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_auction_id_winner_id_key" UNIQUE ("auction_id", "winner_id");



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_auction_winner_key" UNIQUE ("auction_id", "winner_id");



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."yard_tokens"
    ADD CONSTRAINT "yard_tokens_pkey" PRIMARY KEY ("id");



CREATE INDEX "accounts_user_type_idx" ON "public"."accounts" USING "btree" ("user_id", "type");



CREATE INDEX "bid_ledger_auction_id_ts_idx" ON "public"."bid_ledger" USING "btree" ("auction_id", "ts");



CREATE UNIQUE INDEX "bid_requests_unique_key" ON "public"."bid_requests" USING "btree" ("idempotency_key", "auction_id", "bidder_id");



CREATE UNIQUE INDEX "blocked_devices_fingerprint_idx" ON "public"."blocked_devices" USING "btree" ("device_fingerprint");



CREATE INDEX "deposit_policies_active_idx" ON "public"."deposit_policies" USING "btree" ("active");



CREATE INDEX "deposit_policies_category_idx" ON "public"."deposit_policies" USING "btree" ("product_category");



CREATE INDEX "deposit_policies_geo_idx" ON "public"."deposit_policies" USING "btree" ("state", "district", "mandal");



CREATE INDEX "deposit_policies_product_idx" ON "public"."deposit_policies" USING "btree" ("product_id");



CREATE INDEX "deposits_product_idx" ON "public"."deposits" USING "btree" ("product_id");



CREATE INDEX "deposits_user_idx" ON "public"."deposits" USING "btree" ("user_id");



CREATE UNIQUE INDEX "employees_employee_code_idx" ON "public"."employees" USING "btree" ("employee_code");



CREATE INDEX "employees_location_idx" ON "public"."employees" USING "btree" ("location_id");



CREATE INDEX "idx_ad_schedule_auction" ON "public"."ad_schedule" USING "btree" ("auction_id", "start_time");



CREATE INDEX "idx_addresses_default" ON "public"."addresses" USING "btree" ("user_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_addresses_user_id" ON "public"."addresses" USING "btree" ("user_id");



CREATE INDEX "idx_admin_audit_log_actor_id" ON "public"."admin_audit_log" USING "btree" ("actor_id");



CREATE INDEX "idx_admin_audit_log_created_at" ON "public"."admin_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_logs_admin" ON "public"."admin_action_logs" USING "btree" ("admin_id", "created_at" DESC);



CREATE INDEX "idx_admin_logs_auction" ON "public"."admin_action_logs" USING "btree" ("auction_id", "created_at" DESC);



CREATE INDEX "idx_admin_logs_target" ON "public"."admin_action_logs" USING "btree" ("target_type", "target_id");



CREATE INDEX "idx_ads_active" ON "public"."ads" USING "btree" ("active");



CREATE INDEX "idx_analytics_events_browser" ON "public"."analytics_events" USING "btree" ("browser");



CREATE INDEX "idx_analytics_events_country" ON "public"."analytics_events" USING "btree" ("country");



CREATE INDEX "idx_analytics_events_created_at" ON "public"."analytics_events" USING "btree" ("created_at");



CREATE INDEX "idx_analytics_events_device_type" ON "public"."analytics_events" USING "btree" ("device_type");



CREATE INDEX "idx_analytics_events_event_type" ON "public"."analytics_events" USING "btree" ("event_type");



CREATE INDEX "idx_analytics_events_session_id" ON "public"."analytics_events" USING "btree" ("session_id");



CREATE INDEX "idx_analytics_events_user_id" ON "public"."analytics_events" USING "btree" ("user_id");



CREATE INDEX "idx_auction_ad_slots_auction" ON "public"."auction_ad_slots" USING "btree" ("auction_id");



CREATE INDEX "idx_auction_audit_entries_auction" ON "public"."auction_audit_entries" USING "btree" ("auction_id", "created_at" DESC);



CREATE INDEX "idx_auction_winners_auction_id" ON "public"."auction_winners" USING "btree" ("auction_id");



CREATE INDEX "idx_auction_winners_winner_id" ON "public"."auction_winners" USING "btree" ("winner_id");



CREATE INDEX "idx_auctions_end_date" ON "public"."auctions" USING "btree" ("end_date");



CREATE INDEX "idx_auctions_insurance_provider_key" ON "public"."auctions" USING "btree" ("insurance_provider_key");



CREATE INDEX "idx_auctions_status" ON "public"."auctions" USING "btree" ("status");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_audit_logs_entity" ON "public"."audit_logs" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_bids_auction_created" ON "public"."bids" USING "btree" ("auction_id", "created_at" DESC);



CREATE INDEX "idx_bids_auction_sequence" ON "public"."bids" USING "btree" ("auction_id", "sequence");



CREATE INDEX "idx_bids_user_auction" ON "public"."bids" USING "btree" ("user_id", "auction_id");



CREATE INDEX "idx_deposits_user_created" ON "public"."deposits" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_insurance_documents_policy" ON "public"."insurance_documents" USING "btree" ("policy_id");



CREATE INDEX "idx_insurance_policies_auction_winner" ON "public"."insurance_policies" USING "btree" ("auction_winner_id");



CREATE INDEX "idx_insurance_policies_auction_winner_id" ON "public"."insurance_policies" USING "btree" ("auction_winner_id");



CREATE INDEX "idx_insurance_policies_provider" ON "public"."insurance_policies" USING "btree" ("provider_id");



CREATE INDEX "idx_insurance_policies_status" ON "public"."insurance_policies" USING "btree" ("status");



CREATE INDEX "idx_investor_ledger_investment" ON "public"."investor_ledger_entries" USING "btree" ("investment_id", "created_at");



CREATE INDEX "idx_investor_status" ON "public"."investments" USING "btree" ("status");



CREATE INDEX "idx_live_auctions_product" ON "public"."live_auctions" USING "btree" ("product_id");



CREATE INDEX "idx_live_auctions_seller" ON "public"."live_auctions" USING "btree" ("seller_id");



CREATE INDEX "idx_marketing_events_created_at" ON "public"."marketing_events" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_order_status_history_created_at" ON "public"."order_status_history" USING "btree" ("created_at");



CREATE INDEX "idx_order_status_history_order_id" ON "public"."order_status_history" USING "btree" ("order_id");



CREATE INDEX "idx_orders_payment_method_id" ON "public"."orders" USING "btree" ("payment_method_id");



CREATE INDEX "idx_orders_user_id" ON "public"."orders" USING "btree" ("user_id");



CREATE INDEX "idx_payment_audit_log_created_at" ON "public"."payment_audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_payment_audit_log_payment_id" ON "public"."payment_audit_log" USING "btree" ("payment_id");



CREATE INDEX "idx_payment_events_created_at" ON "public"."payment_events" USING "btree" ("created_at");



CREATE INDEX "idx_payment_events_payment_id" ON "public"."payment_events" USING "btree" ("payment_id");



CREATE INDEX "idx_payment_methods_payment_method_id" ON "public"."payment_methods" USING "btree" ("payment_method_id");



CREATE INDEX "idx_payment_methods_user_id" ON "public"."payment_methods" USING "btree" ("user_id");



CREATE INDEX "idx_payments_created_at" ON "public"."payments" USING "btree" ("created_at");



CREATE INDEX "idx_payments_order_id" ON "public"."payments" USING "btree" ("order_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_payments_user_id" ON "public"."payments" USING "btree" ("user_id");



CREATE INDEX "idx_performance_alerts_resolved" ON "public"."performance_alerts" USING "btree" ("resolved", "created_at");



CREATE INDEX "idx_products_auction_type" ON "public"."products" USING "btree" ("auction_type");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");



CREATE INDEX "idx_products_current_price" ON "public"."products" USING "btree" ("current_price");



CREATE INDEX "idx_products_end_date" ON "public"."products" USING "btree" ("end_date");



CREATE INDEX "idx_products_image_url_nulls" ON "public"."products" USING "btree" ((("image_url" IS NOT NULL)));



CREATE INDEX "idx_products_seller_id" ON "public"."products" USING "btree" ("seller_id");



CREATE INDEX "idx_products_status" ON "public"."products" USING "btree" ("status");



CREATE INDEX "idx_products_subcategory" ON "public"."products" USING "btree" ("subcategory");



CREATE INDEX "idx_refunds_payment_id" ON "public"."refunds" USING "btree" ("payment_id");



CREATE INDEX "idx_refunds_status" ON "public"."refunds" USING "btree" ("status");



CREATE INDEX "idx_reserve_auto_drop_auction" ON "public"."reserve_auto_drop_log" USING "btree" ("auction_id", "created_at" DESC);



CREATE INDEX "idx_reserve_auto_drop_log_auction_id" ON "public"."reserve_auto_drop_log" USING "btree" ("auction_id");



CREATE INDEX "idx_reserve_auto_drop_log_created_at" ON "public"."reserve_auto_drop_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_reserve_auto_drop_log_seller_id" ON "public"."reserve_auto_drop_log" USING "btree" ("seller_id");



CREATE INDEX "idx_support_conversations_updated" ON "public"."support_conversations" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_support_conversations_user" ON "public"."support_conversations" USING "btree" ("user_id");



CREATE INDEX "idx_support_messages_conv" ON "public"."support_messages" USING "btree" ("conversation_id");



CREATE INDEX "idx_support_messages_created" ON "public"."support_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_support_ticket_messages_created_at" ON "public"."support_ticket_messages" USING "btree" ("created_at");



CREATE INDEX "idx_support_ticket_messages_ticket" ON "public"."support_ticket_messages" USING "btree" ("ticket_id");



CREATE INDEX "idx_support_tickets_category" ON "public"."support_tickets" USING "btree" ("category");



CREATE INDEX "idx_support_tickets_phone" ON "public"."support_tickets" USING "btree" ("phone_e164");



CREATE INDEX "idx_support_tickets_status" ON "public"."support_tickets" USING "btree" ("status");



CREATE INDEX "idx_support_tickets_user" ON "public"."support_tickets" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_user" ON "public"."transactions" USING "btree" ("user_id");



CREATE INDEX "idx_user_deposit_history_user" ON "public"."user_deposit_history" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_user_profiles_phone" ON "public"."user_profiles" USING "btree" ("phone");



CREATE INDEX "idx_user_profiles_roles" ON "public"."user_profiles" USING "gin" ("roles");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_vehicle_docs_vehicle" ON "public"."vehicle_documents" USING "btree" ("vehicle_id");



CREATE INDEX "idx_vehicle_images_vehicle" ON "public"."vehicle_images" USING "btree" ("vehicle_id");



CREATE INDEX "idx_vehicles_make_model_year" ON "public"."vehicles" USING "btree" ("make", "model", "year");



CREATE INDEX "idx_wallet_audit_auction" ON "public"."wallet_audit_log" USING "btree" ("auction_id", "created_at" DESC);



CREATE INDEX "idx_wallet_audit_user_created" ON "public"."wallet_audit_log" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_wallet_transactions_user_id" ON "public"."wallet_transactions" USING "btree" ("user_id");



CREATE INDEX "idx_watchlist_user" ON "public"."watchlist" USING "btree" ("user_id");



CREATE INDEX "idx_weekly_trends_date" ON "public"."weekly_performance_trends" USING "btree" ("date");



CREATE INDEX "idx_yard_tokens_user_yard" ON "public"."yard_tokens" USING "btree" ("user_id", "yard_id");



CREATE INDEX "inspection_visits_product_idx" ON "public"."inspection_visits" USING "btree" ("product_id");



CREATE INDEX "inspection_visits_user_idx" ON "public"."inspection_visits" USING "btree" ("user_id");



CREATE INDEX "issues_auction_id_idx" ON "public"."issues" USING "btree" ("auction_id");



CREATE INDEX "issues_user_id_idx" ON "public"."issues" USING "btree" ("user_id");



CREATE INDEX "kyc_doc_audit_log_actor_idx" ON "public"."kyc_doc_audit_log" USING "btree" ("actor_id", "created_at");



CREATE INDEX "kyc_doc_audit_log_document_idx" ON "public"."kyc_doc_audit_log" USING "btree" ("document_id", "created_at");



CREATE INDEX "kyc_doc_audit_log_event_type_idx" ON "public"."kyc_doc_audit_log" USING "btree" ("event_type", "created_at");



CREATE INDEX "kyc_doc_audit_log_subject_idx" ON "public"."kyc_doc_audit_log" USING "btree" ("subject_user_id", "created_at");



CREATE INDEX "ledger_entries_account_ts_idx" ON "public"."ledger_entries" USING "btree" ("account_id", "ts");



CREATE INDEX "notification_events_status_idx" ON "public"."notification_events" USING "btree" ("status", "created_at");



CREATE INDEX "revoked_sessions_user_idx" ON "public"."revoked_sessions" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "seller_penalties_seller_applied_idx" ON "public"."seller_penalties" USING "btree" ("seller_id", "applied_at" DESC);



CREATE UNIQUE INDEX "settlements_auction_unique" ON "public"."settlements" USING "btree" ("auction_id");



CREATE UNIQUE INDEX "transactions_ref_unique" ON "public"."transactions" USING "btree" ("ref_type", "ref_id") WHERE (("ref_type" IS NOT NULL) AND ("ref_id" IS NOT NULL));



CREATE INDEX "user_otp_codes_user_channel_idx" ON "public"."user_otp_codes" USING "btree" ("user_id", "channel", "created_at" DESC);



CREATE INDEX "wallet_audit_log_auction_idx" ON "public"."wallet_audit_log" USING "btree" ("auction_id", "bid_id");



CREATE INDEX "wallet_audit_log_event_type_idx" ON "public"."wallet_audit_log" USING "btree" ("event_type", "created_at");



CREATE INDEX "wallet_audit_log_user_idx" ON "public"."wallet_audit_log" USING "btree" ("user_id", "created_at");



CREATE INDEX "wallet_audit_log_wallet_idx" ON "public"."wallet_audit_log" USING "btree" ("wallet_id", "created_at");



CREATE INDEX "wallet_tx_auction_idx" ON "public"."wallet_transactions" USING "btree" ("auction_id");



CREATE INDEX "wallet_tx_bid_idx" ON "public"."wallet_transactions" USING "btree" ("bid_id");



CREATE INDEX "wallet_tx_user_idx" ON "public"."wallet_transactions" USING "btree" ("user_id");



CREATE INDEX "wallet_tx_yard_idx" ON "public"."wallet_transactions" USING "btree" ("yard_id");



CREATE INDEX "win_payment_audit_logs_changed_at_idx" ON "public"."win_payment_audit_logs" USING "btree" ("changed_at" DESC);



CREATE INDEX "win_payment_audit_logs_payment_id_idx" ON "public"."win_payment_audit_logs" USING "btree" ("win_payment_id");



CREATE INDEX "win_payments_auction_id_idx" ON "public"."win_payments" USING "btree" ("auction_id");



CREATE INDEX "win_payments_buyer_id_idx" ON "public"."win_payments" USING "btree" ("buyer_id");



CREATE INDEX "win_payments_status_idx" ON "public"."win_payments" USING "btree" ("status");



CREATE INDEX "win_payments_submitted_at_idx" ON "public"."win_payments" USING "btree" ("submitted_at" DESC);



CREATE OR REPLACE TRIGGER "profiles_set_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."profiles_set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."analytics_events" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "set_updated_at" BEFORE UPDATE ON "public"."performance_budgets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_commission_settings_single_active" BEFORE INSERT OR UPDATE ON "public"."commission_settings" FOR EACH ROW EXECUTE FUNCTION "public"."commission_settings_enforce_single_active"();



CREATE OR REPLACE TRIGGER "trg_payment_status_change" AFTER UPDATE ON "public"."payments" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."update_order_on_payment_change"();



CREATE OR REPLACE TRIGGER "trg_support_messages_touch_conversation" AFTER INSERT ON "public"."support_messages" FOR EACH ROW EXECUTE FUNCTION "public"."support_messages_touch_conversation"();



CREATE OR REPLACE TRIGGER "trigger_check_budget_violations" AFTER INSERT ON "public"."analytics_events" FOR EACH ROW EXECUTE FUNCTION "public"."check_budget_violations"();



CREATE OR REPLACE TRIGGER "trigger_check_performance" AFTER INSERT ON "public"."analytics_events" FOR EACH ROW WHEN (("new"."event_type" = 'performance_metrics'::"text")) EXECUTE FUNCTION "public"."check_performance_issues"();



CREATE OR REPLACE TRIGGER "trigger_notify_performance_alert" BEFORE INSERT OR UPDATE ON "public"."performance_alerts" FOR EACH ROW WHEN (("new"."notification_status" IS DISTINCT FROM 'sent'::"text")) EXECUTE FUNCTION "public"."notify_performance_alert"();



CREATE OR REPLACE TRIGGER "trigger_page_load_alert" AFTER INSERT ON "public"."analytics_events" FOR EACH ROW WHEN ((("new"."event_type" = 'performance_metrics'::"text") AND (("new"."event_data" ->> 'metric_name'::"text") = 'page_load'::"text"))) EXECUTE FUNCTION "public"."check_page_load_threshold"();



CREATE OR REPLACE TRIGGER "trigger_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_auction_winners_modtime" BEFORE UPDATE ON "public"."auction_winners" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_insurance_policies_modtime" BEFORE UPDATE ON "public"."insurance_policies" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_insurance_providers_modtime" BEFORE UPDATE ON "public"."insurance_providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



CREATE OR REPLACE TRIGGER "update_order_on_payment_change" AFTER UPDATE ON "public"."payments" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."update_order_on_payment_change"();



ALTER TABLE ONLY "public"."accounts"
    ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ad_schedule"
    ADD CONSTRAINT "ad_schedule_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ad_schedule"
    ADD CONSTRAINT "ad_schedule_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_action_logs"
    ADD CONSTRAINT "admin_action_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_action_logs"
    ADD CONSTRAINT "admin_action_logs_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_recommendations"
    ADD CONSTRAINT "ai_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_recommendations"
    ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_ad_slots"
    ADD CONSTRAINT "auction_ad_slots_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "public"."ads"("id");



ALTER TABLE ONLY "public"."auction_ad_slots"
    ADD CONSTRAINT "auction_ad_slots_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_audit_entries"
    ADD CONSTRAINT "auction_audit_entries_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_bids"
    ADD CONSTRAINT "auction_bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_bids"
    ADD CONSTRAINT "auction_bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_events"
    ADD CONSTRAINT "auction_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."auction_reminders"
    ADD CONSTRAINT "auction_reminders_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_reminders"
    ADD CONSTRAINT "auction_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_insurance_policy_id_fkey" FOREIGN KEY ("insurance_policy_id") REFERENCES "public"."insurance_policies"("id");



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_insurance_provider_key_fkey" FOREIGN KEY ("insurance_provider_key") REFERENCES "public"."insurance_providers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."auction_winners"
    ADD CONSTRAINT "auction_winners_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."auction_events"("id");



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."auctions"
    ADD CONSTRAINT "auctions_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."automation_executions"
    ADD CONSTRAINT "automation_executions_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "public"."automations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."banner_schedules"
    ADD CONSTRAINT "banner_schedules_banner_asset_id_fkey" FOREIGN KEY ("banner_asset_id") REFERENCES "public"."banner_assets"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bid_ledger"
    ADD CONSTRAINT "bid_ledger_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bid_ledger"
    ADD CONSTRAINT "bid_ledger_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bid_requests"
    ADD CONSTRAINT "bid_requests_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bid_requests"
    ADD CONSTRAINT "bid_requests_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocked_devices"
    ADD CONSTRAINT "blocked_devices_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."blocked_devices"
    ADD CONSTRAINT "blocked_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bulk_upload_jobs"
    ADD CONSTRAINT "bulk_upload_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."buyers"
    ADD CONSTRAINT "buyers_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."commission_settings"
    ADD CONSTRAINT "commission_settings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."commission_settings"
    ADD CONSTRAINT "commission_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."creative_works"
    ADD CONSTRAINT "creative_works_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deliveries"
    ADD CONSTRAINT "deliveries_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."deposit_policies"
    ADD CONSTRAINT "deposit_policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."deposit_policies"
    ADD CONSTRAINT "deposit_policies_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deposits"
    ADD CONSTRAINT "deposits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deposits"
    ADD CONSTRAINT "deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."event_products"
    ADD CONSTRAINT "event_products_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."auction_events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_products"
    ADD CONSTRAINT "event_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_leads"
    ADD CONSTRAINT "finance_leads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "fk_order" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "fk_orders_payment_method_id" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "fk_orders_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_audit_log"
    ADD CONSTRAINT "fk_payment_audit_log_payment_id" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_audit_log"
    ADD CONSTRAINT "fk_payment_audit_log_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "fk_payment_methods_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "fk_payments_order_id" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "fk_payments_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."refunds"
    ADD CONSTRAINT "fk_refunds_payment_id" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "fk_user" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inspection_files"
    ADD CONSTRAINT "inspection_files_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspection_files"
    ADD CONSTRAINT "inspection_files_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "public"."inspection_steps"("id");



ALTER TABLE ONLY "public"."inspection_steps"
    ADD CONSTRAINT "inspection_steps_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "public"."inspections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspection_visits"
    ADD CONSTRAINT "inspection_visits_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspection_visits"
    ADD CONSTRAINT "inspection_visits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_assigned_inspector_id_fkey" FOREIGN KEY ("assigned_inspector_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_inspected_by_fkey" FOREIGN KEY ("inspected_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_requested_reinspection_by_fkey" FOREIGN KEY ("requested_reinspection_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."inspections"
    ADD CONSTRAINT "inspections_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."insurance_documents"
    ADD CONSTRAINT "insurance_documents_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "public"."insurance_policies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insurance_documents"
    ADD CONSTRAINT "insurance_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_auction_winner_id_fkey" FOREIGN KEY ("auction_winner_id") REFERENCES "public"."auction_winners"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."insurance_policies"
    ADD CONSTRAINT "insurance_policies_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."investments"
    ADD CONSTRAINT "investments_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "public"."investors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."investor_ledger_entries"
    ADD CONSTRAINT "investor_ledger_entries_investment_id_fkey" FOREIGN KEY ("investment_id") REFERENCES "public"."investments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."issues"
    ADD CONSTRAINT "issues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kyc_audit_logs"
    ADD CONSTRAINT "kyc_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."kyc_audit_logs"
    ADD CONSTRAINT "kyc_audit_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."leads"
    ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("account_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."ledger_entries"
    ADD CONSTRAINT "ledger_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."live_auctions"
    ADD CONSTRAINT "live_auctions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."live_auctions"
    ADD CONSTRAINT "live_auctions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."live_streams"
    ADD CONSTRAINT "live_streams_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moderation_queue"
    ADD CONSTRAINT "moderation_queue_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."moderation_queue"
    ADD CONSTRAINT "moderation_queue_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."notification_events"
    ADD CONSTRAINT "notification_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_preferences"
    ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_status_history"
    ADD CONSTRAINT "order_status_history_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referrer_agent_id_fkey" FOREIGN KEY ("referrer_agent_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_referrer_user_id_fkey" FOREIGN KEY ("referrer_user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."revoked_sessions"
    ADD CONSTRAINT "revoked_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seller_analytics"
    ADD CONSTRAINT "seller_analytics_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."seller_penalties"
    ADD CONSTRAINT "seller_penalties_applied_by_fkey" FOREIGN KEY ("applied_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."seller_penalties"
    ADD CONSTRAINT "seller_penalties_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sellers"
    ADD CONSTRAINT "sellers_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settlements"
    ADD CONSTRAINT "settlements_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id");



ALTER TABLE ONLY "public"."support_messages"
    ADD CONSTRAINT "support_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_ticket_messages"
    ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."support_conversations"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_analytics"
    ADD CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_controls"
    ADD CONSTRAINT "user_controls_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_controls"
    ADD CONSTRAINT "user_controls_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_deposit_history"
    ADD CONSTRAINT "user_deposit_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_otp_codes"
    ADD CONSTRAINT "user_otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_risk"
    ADD CONSTRAINT "user_risk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicle_documents"
    ADD CONSTRAINT "vehicle_documents_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vehicle_images"
    ADD CONSTRAINT "vehicle_images_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_balances"
    ADD CONSTRAINT "wallet_balances_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id");



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallet_transactions"
    ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wallets"
    ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watchlist"
    ADD CONSTRAINT "watchlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."watchlist"
    ADD CONSTRAINT "watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."win_payment_audit_logs"
    ADD CONSTRAINT "win_payment_audit_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."win_payment_audit_logs"
    ADD CONSTRAINT "win_payment_audit_logs_win_payment_id_fkey" FOREIGN KEY ("win_payment_id") REFERENCES "public"."win_payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."win_payments"
    ADD CONSTRAINT "win_payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "public"."auctions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."winner_delivery_preferences"
    ADD CONSTRAINT "winner_delivery_preferences_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist"
    ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlists"
    ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."yard_tokens"
    ADD CONSTRAINT "yard_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage all products" ON "public"."products" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"]))))));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "profiles_1"
  WHERE (("profiles_1"."id" = "auth"."uid"()) AND ("profiles_1"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"]))))));



CREATE POLICY "Anyone can view active auctions" ON "public"."auctions" FOR SELECT TO "authenticated" USING (("status" = ANY (ARRAY['active'::"text", 'live'::"text"])));



CREATE POLICY "Anyone can view active products" ON "public"."products" FOR SELECT TO "authenticated" USING (("status" = 'active'::"text"));



CREATE POLICY "Enable all for admin users" ON "public"."insurance_providers" USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "auth"."users"
  WHERE (("users"."raw_user_meta_data" ->> 'role'::"text") = 'admin'::"text")))));



CREATE POLICY "Enable insert for all users" ON "public"."analytics_events" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."insurance_providers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."analytics_events" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Sellers can manage their auctions" ON "public"."auctions" TO "authenticated" USING (("seller_id" = "auth"."uid"()));



CREATE POLICY "Sellers can view own analytics" ON "public"."seller_analytics" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "seller_id"));



CREATE POLICY "Service role can manage error logs" ON "public"."error_logs" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage order history" ON "public"."order_status_history" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage payment events" ON "public"."payment_events" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can access their own wallet" ON "public"."wallets" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create their own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own payment methods" ON "public"."payment_methods" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own payments" ON "public"."payments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own policies" ON "public"."insurance_policies" FOR INSERT WITH CHECK (("auth"."uid"() = "auction_winner_id"));



CREATE POLICY "Users can delete from own watchlist" ON "public"."watchlist" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own addresses" ON "public"."addresses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own payment methods" ON "public"."payment_methods" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own addresses" ON "public"."addresses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert to own watchlist" ON "public"."watchlist" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own wishlist" ON "public"."wishlist" TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own wallet" ON "public"."wallets" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own addresses" ON "public"."addresses" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own payment methods" ON "public"."payment_methods" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own recommendations" ON "public"."ai_recommendations" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own transactions" ON "public"."transactions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own wallet" ON "public"."wallets" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own watchlist" ON "public"."watchlist" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own addresses" ON "public"."addresses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own order history" ON "public"."order_status_history" FOR SELECT USING (("auth"."uid"() = ( SELECT "orders"."user_id"
   FROM "public"."orders"
  WHERE ("orders"."id" = "order_status_history"."order_id"))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payment events" ON "public"."payment_events" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."payments" "p"
     JOIN "public"."orders" "o" ON (("p"."order_id" = "o"."id")))
  WHERE (("p"."id" = "payment_events"."payment_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own payment methods" ON "public"."payment_methods" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own transactions" ON "public"."wallet_transactions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_audit_logs_admins_insert" ON "public"."admin_audit_logs" FOR INSERT WITH CHECK (("auth"."role"() = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])));



CREATE POLICY "admin_audit_logs_admins_read" ON "public"."admin_audit_logs" FOR SELECT USING (("auth"."role"() = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])));



ALTER TABLE "public"."ai_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auction_bids" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auction_reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auction_winners" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auctions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bulk_upload_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "companies_admin_write" ON "public"."companies" USING ("public"."is_admin"());



CREATE POLICY "companies_read" ON "public"."companies" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m"
  WHERE (("m"."company_id" = "companies"."id") AND ("m"."user_id" = "auth"."uid"()) AND ("m"."status" = 'active'::"text"))))));



ALTER TABLE "public"."company_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "company_members_company_admin_manage" ON "public"."company_members" FOR INSERT WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m2"
  WHERE (("m2"."company_id" = "company_members"."company_id") AND ("m2"."user_id" = "auth"."uid"()) AND ("m2"."role" = 'company_admin'::"text"))))));



CREATE POLICY "company_members_read" ON "public"."company_members" FOR SELECT USING (("public"."is_admin"() OR ("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m2"
  WHERE (("m2"."company_id" = "company_members"."company_id") AND ("m2"."user_id" = "auth"."uid"()) AND ("m2"."role" = 'company_admin'::"text"))))));



CREATE POLICY "company_members_update_delete" ON "public"."company_members" FOR UPDATE USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m2"
  WHERE (("m2"."company_id" = "company_members"."company_id") AND ("m2"."user_id" = "auth"."uid"()) AND ("m2"."role" = 'company_admin'::"text")))))) WITH CHECK (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m2"
  WHERE (("m2"."company_id" = "company_members"."company_id") AND ("m2"."user_id" = "auth"."uid"()) AND ("m2"."role" = 'company_admin'::"text"))))));



CREATE POLICY "conv_admin_update" ON "public"."support_conversations" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "conv_user_insert" ON "public"."support_conversations" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "conv_user_read" ON "public"."support_conversations" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."creative_works" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deliveries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deposit_policies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deposit_policies_admin_rw" ON "public"."deposit_policies" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."deposits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "deposits_insert_own" ON "public"."deposits" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "deposits_select_own" ON "public"."deposits" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "deposits_update_admin" ON "public"."deposits" FOR UPDATE USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employees_admin_rw" ON "public"."employees" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."error_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "finance_leads_insert_admin" ON "public"."finance_leads" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))));



CREATE POLICY "finance_leads_insert_any_auth" ON "public"."finance_leads" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "finance_leads_select_admin" ON "public"."finance_leads" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))));



CREATE POLICY "finance_leads_update_admin" ON "public"."finance_leads" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"text"))))));



ALTER TABLE "public"."inspection_visits" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "inspection_visits_insert_own" ON "public"."inspection_visits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "inspection_visits_select_own" ON "public"."inspection_visits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "inspection_visits_update_admin" ON "public"."inspection_visits" FOR UPDATE USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."insurance_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_policies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."insurance_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."investments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investments_deny_all" ON "public"."investments" USING (false) WITH CHECK (false);



ALTER TABLE "public"."investor_leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investor_leads_admin" ON "public"."investor_leads" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



CREATE POLICY "investor_leads_public_insert" ON "public"."investor_leads" FOR INSERT WITH CHECK (true);



CREATE POLICY "investor_ledger_deny_all" ON "public"."investor_ledger_entries" USING (false) WITH CHECK (false);



ALTER TABLE "public"."investor_ledger_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."investors" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "investors_deny_all" ON "public"."investors" USING (false) WITH CHECK (false);



ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invitations_manage" ON "public"."invitations" USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m"
  WHERE (("m"."company_id" = "invitations"."company_id") AND ("m"."user_id" = "auth"."uid"()) AND ("m"."role" = 'company_admin'::"text"))))));



CREATE POLICY "invitations_read" ON "public"."invitations" FOR SELECT USING (("public"."is_admin"() OR (EXISTS ( SELECT 1
   FROM "public"."company_members" "m"
  WHERE (("m"."company_id" = "invitations"."company_id") AND ("m"."user_id" = "auth"."uid"()) AND ("m"."role" = 'company_admin'::"text"))))));



CREATE POLICY "kyc_audit_admin_all" ON "public"."kyc_audit_logs" USING ("public"."is_admin"("auth"."uid"())) WITH CHECK ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."kyc_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leads_insert_authenticated" ON "public"."leads" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "leads_read_owner_admin" ON "public"."leads" FOR SELECT TO "authenticated" USING ((("assigned_to" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])))))));



CREATE POLICY "leads_update_owner_admin" ON "public"."leads" FOR UPDATE TO "authenticated" USING ((("assigned_to" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])))))));



ALTER TABLE "public"."live_streams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_queue" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "msg_user_insert" ON "public"."support_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."support_conversations" "c"
  WHERE (("c"."id" = "support_messages"."conversation_id") AND (("c"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



CREATE POLICY "msg_user_read" ON "public"."support_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."support_conversations" "c"
  WHERE (("c"."id" = "support_messages"."conversation_id") AND (("c"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_status_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "products_read_public_or_owner_or_admin" ON "public"."products" FOR SELECT USING ((("status" = 'active'::"text") OR "public"."is_admin"()));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_all" ON "public"."profiles" USING ("public"."is_admin"());



CREATE POLICY "profiles_select_self" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"())));



CREATE POLICY "profiles_self_read" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "profiles_self_update" ON "public"."profiles" FOR UPDATE USING ((("auth"."uid"() = "id") OR "public"."is_admin"()));



CREATE POLICY "profiles_update_self" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"()))) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_admin"("auth"."uid"())));



ALTER TABLE "public"."refunds" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seller_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seller_penalties" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "seller_penalties_admin_rw" ON "public"."seller_penalties" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (COALESCE("p"."role", ''::"text") = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (COALESCE("p"."role", ''::"text") = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



ALTER TABLE "public"."support_conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_controls" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "user_controls_admin_rw" ON "public"."user_controls" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (COALESCE("p"."role", ''::"text") = ANY (ARRAY['admin'::"text", 'super_admin'::"text"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND (COALESCE("p"."role", ''::"text") = ANY (ARRAY['admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "user_controls_user_read_own" ON "public"."user_controls" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallet_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wallets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."watchlist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."webhook_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "webhook_events_admin_read" ON "public"."webhook_events" FOR SELECT USING ("public"."is_admin"("auth"."uid"()));



ALTER TABLE "public"."wishlist" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlists" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "wishlists_delete_own" ON "public"."wishlists" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "wishlists_insert_own" ON "public"."wishlists" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "wishlists_select_own" ON "public"."wishlists" FOR SELECT USING (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."bids_set_timestamps"() TO "anon";
GRANT ALL ON FUNCTION "public"."bids_set_timestamps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."bids_set_timestamps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_fee"("p_amount" numeric, "p_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_fee"("p_amount" numeric, "p_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_fee"("p_amount" numeric, "p_category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_payment_fees"("p_amount" numeric, "p_currency" character varying, "p_payment_method_type" "text", "p_is_international" boolean, "p_merchant_category_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_payment_fees"("p_amount" numeric, "p_currency" character varying, "p_payment_method_type" "text", "p_is_international" boolean, "p_merchant_category_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_payment_fees"("p_amount" numeric, "p_currency" character varying, "p_payment_method_type" "text", "p_is_international" boolean, "p_merchant_category_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_risk_score"("user_json" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_risk_score"("user_json" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_risk_score"("user_json" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_risk_score_for_user"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_risk_score_for_user"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_risk_score_for_user"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_perform_action"("_user_id" "uuid", "_action" "text", "_resource_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."can_perform_action"("_user_id" "uuid", "_action" "text", "_resource_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_perform_action"("_user_id" "uuid", "_action" "text", "_resource_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."cancel_order"("p_order_id" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_order"("p_order_id" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_order"("p_order_id" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_budget_violations"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_budget_violations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_budget_violations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_page_load_threshold"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_page_load_threshold"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_page_load_threshold"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_performance_issues"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_performance_issues"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_performance_issues"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_transaction_balanced"("p_transaction_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_transaction_balanced"("p_transaction_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_transaction_balanced"("p_transaction_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."commission_settings_enforce_single_active"() TO "anon";
GRANT ALL ON FUNCTION "public"."commission_settings_enforce_single_active"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."commission_settings_enforce_single_active"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_bid"("p_auction_id" "uuid", "p_user_id" "uuid", "p_amount" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_bid"("p_auction_id" "uuid", "p_user_id" "uuid", "p_amount" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_bid"("p_auction_id" "uuid", "p_user_id" "uuid", "p_amount" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_order"("_user_id" "uuid", "_status" "text", "_total" integer, "_payment_method_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order"("_user_id" "uuid", "_status" "text", "_total" integer, "_payment_method_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order"("_user_id" "uuid", "_status" "text", "_total" integer, "_payment_method_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_daily_metrics_view"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_daily_metrics_view"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_daily_metrics_view"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_payment_report"("p_report_type" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_user_id" "uuid", "p_status" "text", "p_currency" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."generate_payment_report"("p_report_type" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_user_id" "uuid", "p_status" "text", "p_currency" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_payment_report"("p_report_type" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_user_id" "uuid", "p_status" "text", "p_currency" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_alert_subscribers"("p_alert_type" "text", "p_severity" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_alert_subscribers"("p_alert_type" "text", "p_severity" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_alert_subscribers"("p_alert_type" "text", "p_severity" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_avg_session_duration"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_avg_session_duration"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_avg_session_duration"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_budget_compliance"("p_budget_id" "uuid", "p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_budget_compliance"("p_budget_id" "uuid", "p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_budget_compliance"("p_budget_id" "uuid", "p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_client_geolocation"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_client_geolocation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_client_geolocation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_events_by_type"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_events_by_type"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_events_by_type"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_notification_analytics"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_notification_analytics"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_notification_analytics"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_order_details"("p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_page_views"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_page_views"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_page_views"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payment_details"("p_payment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_details"("p_payment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_details"("p_payment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payment_method_details"("_user_id" "uuid", "_payment_method_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_method_details"("_user_id" "uuid", "_payment_method_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_method_details"("_user_id" "uuid", "_payment_method_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payment_statistics"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_statistics"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_statistics"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_payment_summary"("p_user_id" "uuid", "p_period" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_payment_summary"("p_user_id" "uuid", "p_period" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_payment_summary"("p_user_id" "uuid", "p_period" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_performance_metrics"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_performance_metrics"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_performance_metrics"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_popular_pages"("days" integer, "limit_n" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_popular_pages"("days" integer, "limit_n" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_popular_pages"("days" integer, "limit_n" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text", "p_district" "text", "p_mandal" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text", "p_district" "text", "p_mandal" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text", "p_district" "text", "p_mandal" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_required_deposit"("p_product_id" "uuid", "p_state" "text", "p_district" "text", "p_mandal" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unique_visitors"("days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_unique_visitors"("days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unique_visitors"("days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_dashboard"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_dashboard"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_dashboard"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer, "_status_filter" "text", "_start_date" timestamp with time zone, "_end_date" timestamp with time zone, "_search_term" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer, "_status_filter" "text", "_start_date" timestamp with time zone, "_end_date" timestamp with time zone, "_search_term" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_order_history"("_user_id" "uuid", "_limit" integer, "_offset" integer, "_status_filter" "text", "_start_date" timestamp with time zone, "_end_date" timestamp with time zone, "_search_term" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_payment_methods"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_payment_methods"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_payment_methods"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_payment_dispute"("p_dispute_id" "text", "p_payment_id" "uuid", "p_amount" numeric, "p_currency" character varying, "p_reason" "text", "p_status" "text", "p_evidence_due_by" timestamp with time zone, "p_evidence" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."handle_payment_dispute"("p_dispute_id" "text", "p_payment_id" "uuid", "p_amount" numeric, "p_currency" character varying, "p_reason" "text", "p_status" "text", "p_evidence_due_by" timestamp with time zone, "p_evidence" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_payment_dispute"("p_dispute_id" "text", "p_payment_id" "uuid", "p_amount" numeric, "p_currency" character varying, "p_reason" "text", "p_status" "text", "p_evidence_due_by" timestamp with time zone, "p_evidence" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_performance_alert"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_performance_alert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_performance_alert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_batch_refunds"("p_refund_requests" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."process_batch_refunds"("p_refund_requests" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_batch_refunds"("p_refund_requests" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_payment"("p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."process_payment"("p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_payment"("p_user_id" "uuid", "p_order_id" "uuid", "p_amount" numeric, "p_currency" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_payment_webhook"("p_event_id" "text", "p_event_type" "text", "p_event_data" "jsonb", "p_signature" "text", "p_webhook_secret" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_payment_webhook"("p_event_id" "text", "p_event_type" "text", "p_event_data" "jsonb", "p_signature" "text", "p_webhook_secret" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_payment_webhook"("p_event_id" "text", "p_event_type" "text", "p_event_data" "jsonb", "p_signature" "text", "p_webhook_secret" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_subscription_payment"("p_subscription_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."process_subscription_payment"("p_subscription_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_subscription_payment"("p_subscription_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."profiles_set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."profiles_set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."profiles_set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."request_order_return"("p_order_id" "uuid", "p_items" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."request_order_return"("p_order_id" "uuid", "p_items" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_order_return"("p_order_id" "uuid", "p_items" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_payments"("p_user_id" "uuid", "p_query" "text", "p_status" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_min_amount" numeric, "p_max_amount" numeric, "p_currency" character varying, "p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_payments"("p_user_id" "uuid", "p_query" "text", "p_status" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_min_amount" numeric, "p_max_amount" numeric, "p_currency" character varying, "p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_payments"("p_user_id" "uuid", "p_query" "text", "p_status" "text", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone, "p_min_amount" numeric, "p_max_amount" numeric, "p_currency" character varying, "p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_default_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_default_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_default_payment_method"("_user_id" "uuid", "_payment_method_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_employee_qr_token"("emp_id" "uuid", "raw_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_role_by_email"("target_email" "text", "new_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."set_role_by_email"("target_email" "text", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_role_by_email"("target_email" "text", "new_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."support_messages_touch_conversation"() TO "anon";
GRANT ALL ON FUNCTION "public"."support_messages_touch_conversation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."support_messages_touch_conversation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_on_payment_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_on_payment_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_on_payment_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_status"("_user_id" "uuid", "_order_id" "uuid", "_new_status" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_status"("_user_id" "uuid", "_order_id" "uuid", "_new_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_status"("_user_id" "uuid", "_order_id" "uuid", "_new_status" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text", "p_brand" "text", "p_last4" "text", "p_exp_month" integer, "p_exp_year" integer, "p_is_default" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."update_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text", "p_brand" "text", "p_last4" "text", "p_exp_month" integer, "p_exp_year" integer, "p_is_default" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payment_method"("p_user_id" "uuid", "p_payment_method_id" "text", "p_brand" "text", "p_last4" "text", "p_exp_month" integer, "p_exp_year" integer, "p_is_default" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_bid_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_bid_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_bid_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_counts"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_counts"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_counts"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_profile"("_user_id" "uuid", "_profile_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_profile"("_user_id" "uuid", "_profile_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_profile"("_user_id" "uuid", "_profile_data" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_bid_ledger_chain"("p_auction_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_bid_ledger_chain"("p_auction_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_bid_ledger_chain"("p_auction_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."verify_employee"("qr_token" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."verify_employee"("qr_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_employee"("qr_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_employee"("qr_token" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."accounts" TO "anon";
GRANT ALL ON TABLE "public"."accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts" TO "service_role";



GRANT ALL ON TABLE "public"."ad_schedule" TO "anon";
GRANT ALL ON TABLE "public"."ad_schedule" TO "authenticated";
GRANT ALL ON TABLE "public"."ad_schedule" TO "service_role";



GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."admin_action_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_action_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_action_logs" TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ads" TO "anon";
GRANT ALL ON TABLE "public"."ads" TO "authenticated";
GRANT ALL ON TABLE "public"."ads" TO "service_role";



GRANT ALL ON TABLE "public"."ai_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."ai_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_events" TO "anon";
GRANT ALL ON TABLE "public"."analytics_events" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_events" TO "service_role";



GRANT ALL ON TABLE "public"."auction_ad_slots" TO "anon";
GRANT ALL ON TABLE "public"."auction_ad_slots" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_ad_slots" TO "service_role";



GRANT ALL ON TABLE "public"."auction_audit_entries" TO "anon";
GRANT ALL ON TABLE "public"."auction_audit_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_audit_entries" TO "service_role";



GRANT ALL ON TABLE "public"."auction_bids" TO "anon";
GRANT ALL ON TABLE "public"."auction_bids" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_bids" TO "service_role";



GRANT ALL ON TABLE "public"."auction_events" TO "anon";
GRANT ALL ON TABLE "public"."auction_events" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_events" TO "service_role";



GRANT ALL ON TABLE "public"."auction_reminders" TO "anon";
GRANT ALL ON TABLE "public"."auction_reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_reminders" TO "service_role";



GRANT ALL ON TABLE "public"."auction_winners" TO "anon";
GRANT ALL ON TABLE "public"."auction_winners" TO "authenticated";
GRANT ALL ON TABLE "public"."auction_winners" TO "service_role";



GRANT ALL ON TABLE "public"."auctions" TO "anon";
GRANT ALL ON TABLE "public"."auctions" TO "authenticated";
GRANT ALL ON TABLE "public"."auctions" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."automation_executions" TO "anon";
GRANT ALL ON TABLE "public"."automation_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_executions" TO "service_role";



GRANT ALL ON TABLE "public"."automations" TO "anon";
GRANT ALL ON TABLE "public"."automations" TO "authenticated";
GRANT ALL ON TABLE "public"."automations" TO "service_role";



GRANT ALL ON TABLE "public"."banner_assets" TO "anon";
GRANT ALL ON TABLE "public"."banner_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."banner_assets" TO "service_role";



GRANT ALL ON TABLE "public"."banner_schedules" TO "anon";
GRANT ALL ON TABLE "public"."banner_schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."banner_schedules" TO "service_role";



GRANT ALL ON TABLE "public"."bid_ledger" TO "anon";
GRANT ALL ON TABLE "public"."bid_ledger" TO "authenticated";
GRANT ALL ON TABLE "public"."bid_ledger" TO "service_role";



GRANT ALL ON TABLE "public"."bid_requests" TO "anon";
GRANT ALL ON TABLE "public"."bid_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."bid_requests" TO "service_role";



GRANT ALL ON TABLE "public"."bids" TO "anon";
GRANT ALL ON TABLE "public"."bids" TO "authenticated";
GRANT ALL ON TABLE "public"."bids" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bids_sequence_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bids_sequence_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bids_sequence_seq" TO "service_role";



GRANT ALL ON TABLE "public"."blocked_devices" TO "anon";
GRANT ALL ON TABLE "public"."blocked_devices" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_devices" TO "service_role";



GRANT ALL ON TABLE "public"."bulk_upload_jobs" TO "anon";
GRANT ALL ON TABLE "public"."bulk_upload_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."bulk_upload_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."buyers" TO "anon";
GRANT ALL ON TABLE "public"."buyers" TO "authenticated";
GRANT ALL ON TABLE "public"."buyers" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."commission_settings" TO "anon";
GRANT ALL ON TABLE "public"."commission_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."commission_settings" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_members" TO "anon";
GRANT ALL ON TABLE "public"."company_members" TO "authenticated";
GRANT ALL ON TABLE "public"."company_members" TO "service_role";



GRANT ALL ON TABLE "public"."creative_works" TO "anon";
GRANT ALL ON TABLE "public"."creative_works" TO "authenticated";
GRANT ALL ON TABLE "public"."creative_works" TO "service_role";



GRANT ALL ON TABLE "public"."daily_performance_metrics" TO "anon";
GRANT ALL ON TABLE "public"."daily_performance_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_performance_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."deliveries" TO "anon";
GRANT ALL ON TABLE "public"."deliveries" TO "authenticated";
GRANT ALL ON TABLE "public"."deliveries" TO "service_role";



GRANT ALL ON TABLE "public"."deposit_policies" TO "anon";
GRANT ALL ON TABLE "public"."deposit_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."deposit_policies" TO "service_role";



GRANT ALL ON TABLE "public"."deposits" TO "anon";
GRANT ALL ON TABLE "public"."deposits" TO "authenticated";
GRANT ALL ON TABLE "public"."deposits" TO "service_role";



GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."event_products" TO "anon";
GRANT ALL ON TABLE "public"."event_products" TO "authenticated";
GRANT ALL ON TABLE "public"."event_products" TO "service_role";



GRANT ALL ON TABLE "public"."fee_rules" TO "anon";
GRANT ALL ON TABLE "public"."fee_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."fee_rules" TO "service_role";



GRANT ALL ON TABLE "public"."finance_leads" TO "anon";
GRANT ALL ON TABLE "public"."finance_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_leads" TO "service_role";



GRANT ALL ON TABLE "public"."finance_partners" TO "anon";
GRANT ALL ON TABLE "public"."finance_partners" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_partners" TO "service_role";



GRANT ALL ON TABLE "public"."inspection_files" TO "anon";
GRANT ALL ON TABLE "public"."inspection_files" TO "authenticated";
GRANT ALL ON TABLE "public"."inspection_files" TO "service_role";



GRANT ALL ON TABLE "public"."inspection_steps" TO "anon";
GRANT ALL ON TABLE "public"."inspection_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."inspection_steps" TO "service_role";



GRANT ALL ON TABLE "public"."inspection_visits" TO "anon";
GRANT ALL ON TABLE "public"."inspection_visits" TO "authenticated";
GRANT ALL ON TABLE "public"."inspection_visits" TO "service_role";



GRANT ALL ON TABLE "public"."inspections" TO "anon";
GRANT ALL ON TABLE "public"."inspections" TO "authenticated";
GRANT ALL ON TABLE "public"."inspections" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_documents" TO "anon";
GRANT ALL ON TABLE "public"."insurance_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_documents" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_policies" TO "anon";
GRANT ALL ON TABLE "public"."insurance_policies" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_policies" TO "service_role";



GRANT ALL ON TABLE "public"."insurance_providers" TO "anon";
GRANT ALL ON TABLE "public"."insurance_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."insurance_providers" TO "service_role";



GRANT ALL ON TABLE "public"."investments" TO "anon";
GRANT ALL ON TABLE "public"."investments" TO "authenticated";
GRANT ALL ON TABLE "public"."investments" TO "service_role";



GRANT ALL ON TABLE "public"."investor_leads" TO "anon";
GRANT ALL ON TABLE "public"."investor_leads" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_leads" TO "service_role";



GRANT ALL ON TABLE "public"."investor_ledger_entries" TO "anon";
GRANT ALL ON TABLE "public"."investor_ledger_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."investor_ledger_entries" TO "service_role";



GRANT ALL ON SEQUENCE "public"."investor_ledger_entries_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."investor_ledger_entries_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."investor_ledger_entries_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."investors" TO "anon";
GRANT ALL ON TABLE "public"."investors" TO "authenticated";
GRANT ALL ON TABLE "public"."investors" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."issues" TO "anon";
GRANT ALL ON TABLE "public"."issues" TO "authenticated";
GRANT ALL ON TABLE "public"."issues" TO "service_role";



GRANT ALL ON TABLE "public"."kyc_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."kyc_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."kyc_doc_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."kyc_doc_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."kyc_doc_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."leads" TO "anon";
GRANT ALL ON TABLE "public"."leads" TO "authenticated";
GRANT ALL ON TABLE "public"."leads" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_accounts" TO "anon";
GRANT ALL ON TABLE "public"."ledger_accounts" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_accounts" TO "service_role";



GRANT ALL ON TABLE "public"."ledger_entries" TO "anon";
GRANT ALL ON TABLE "public"."ledger_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."ledger_entries" TO "service_role";



GRANT ALL ON TABLE "public"."live_auctions" TO "anon";
GRANT ALL ON TABLE "public"."live_auctions" TO "authenticated";
GRANT ALL ON TABLE "public"."live_auctions" TO "service_role";



GRANT ALL ON TABLE "public"."live_streams" TO "anon";
GRANT ALL ON TABLE "public"."live_streams" TO "authenticated";
GRANT ALL ON TABLE "public"."live_streams" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."marketing_events" TO "anon";
GRANT ALL ON TABLE "public"."marketing_events" TO "authenticated";
GRANT ALL ON TABLE "public"."marketing_events" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_queue" TO "anon";
GRANT ALL ON TABLE "public"."moderation_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_queue" TO "service_role";



GRANT ALL ON TABLE "public"."notification_events" TO "anon";
GRANT ALL ON TABLE "public"."notification_events" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_events" TO "service_role";



GRANT ALL ON TABLE "public"."notification_preferences" TO "anon";
GRANT ALL ON TABLE "public"."notification_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."order_details" TO "anon";
GRANT ALL ON TABLE "public"."order_details" TO "authenticated";
GRANT ALL ON TABLE "public"."order_details" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."order_statistics" TO "anon";
GRANT ALL ON TABLE "public"."order_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."order_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."order_status_history" TO "anon";
GRANT ALL ON TABLE "public"."order_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."order_status_history" TO "service_role";



GRANT ALL ON TABLE "public"."payment_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."payment_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."payment_events" TO "anon";
GRANT ALL ON TABLE "public"."payment_events" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_events" TO "service_role";



GRANT ALL ON TABLE "public"."payment_method_statistics" TO "anon";
GRANT ALL ON TABLE "public"."payment_method_statistics" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_method_statistics" TO "service_role";



GRANT ALL ON TABLE "public"."performance_alerts" TO "anon";
GRANT ALL ON TABLE "public"."performance_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."performance_budgets" TO "anon";
GRANT ALL ON TABLE "public"."performance_budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_budgets" TO "service_role";



GRANT ALL ON TABLE "public"."pixel_events" TO "anon";
GRANT ALL ON TABLE "public"."pixel_events" TO "authenticated";
GRANT ALL ON TABLE "public"."pixel_events" TO "service_role";



GRANT ALL ON TABLE "public"."policy_details" TO "anon";
GRANT ALL ON TABLE "public"."policy_details" TO "authenticated";
GRANT ALL ON TABLE "public"."policy_details" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."public_employee_verification_view" TO "anon";
GRANT ALL ON TABLE "public"."public_employee_verification_view" TO "authenticated";
GRANT ALL ON TABLE "public"."public_employee_verification_view" TO "service_role";



GRANT ALL ON TABLE "public"."refunds" TO "anon";
GRANT ALL ON TABLE "public"."refunds" TO "authenticated";
GRANT ALL ON TABLE "public"."refunds" TO "service_role";



GRANT ALL ON TABLE "public"."reserve_auto_drop_log" TO "anon";
GRANT ALL ON TABLE "public"."reserve_auto_drop_log" TO "authenticated";
GRANT ALL ON TABLE "public"."reserve_auto_drop_log" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."revoked_sessions" TO "anon";
GRANT ALL ON TABLE "public"."revoked_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."revoked_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."segments" TO "anon";
GRANT ALL ON TABLE "public"."segments" TO "authenticated";
GRANT ALL ON TABLE "public"."segments" TO "service_role";



GRANT ALL ON TABLE "public"."seller_analytics" TO "anon";
GRANT ALL ON TABLE "public"."seller_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."seller_penalties" TO "anon";
GRANT ALL ON TABLE "public"."seller_penalties" TO "authenticated";
GRANT ALL ON TABLE "public"."seller_penalties" TO "service_role";



GRANT ALL ON TABLE "public"."sellers" TO "anon";
GRANT ALL ON TABLE "public"."sellers" TO "authenticated";
GRANT ALL ON TABLE "public"."sellers" TO "service_role";



GRANT ALL ON TABLE "public"."settlements" TO "anon";
GRANT ALL ON TABLE "public"."settlements" TO "authenticated";
GRANT ALL ON TABLE "public"."settlements" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_plans" TO "anon";
GRANT ALL ON TABLE "public"."subscription_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_plans" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."support_conversations" TO "anon";
GRANT ALL ON TABLE "public"."support_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."support_conversations" TO "service_role";



GRANT ALL ON TABLE "public"."support_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_messages" TO "service_role";



GRANT ALL ON TABLE "public"."support_ticket_messages" TO "anon";
GRANT ALL ON TABLE "public"."support_ticket_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ticket_messages" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."user_analytics" TO "anon";
GRANT ALL ON TABLE "public"."user_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."user_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."user_controls" TO "anon";
GRANT ALL ON TABLE "public"."user_controls" TO "authenticated";
GRANT ALL ON TABLE "public"."user_controls" TO "service_role";



GRANT ALL ON TABLE "public"."user_dashboard" TO "anon";
GRANT ALL ON TABLE "public"."user_dashboard" TO "authenticated";
GRANT ALL ON TABLE "public"."user_dashboard" TO "service_role";



GRANT ALL ON TABLE "public"."user_deposit_history" TO "anon";
GRANT ALL ON TABLE "public"."user_deposit_history" TO "authenticated";
GRANT ALL ON TABLE "public"."user_deposit_history" TO "service_role";



GRANT ALL ON TABLE "public"."user_otp_codes" TO "anon";
GRANT ALL ON TABLE "public"."user_otp_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."user_otp_codes" TO "service_role";



GRANT ALL ON TABLE "public"."user_payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."user_payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."user_payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_risk" TO "anon";
GRANT ALL ON TABLE "public"."user_risk" TO "authenticated";
GRANT ALL ON TABLE "public"."user_risk" TO "service_role";



GRANT ALL ON TABLE "public"."user_risks" TO "anon";
GRANT ALL ON TABLE "public"."user_risks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_risks" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_documents" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_documents" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_images" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_images" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_images" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."wallet_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_balances" TO "anon";
GRANT ALL ON TABLE "public"."wallet_balances" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_balances" TO "service_role";



GRANT ALL ON TABLE "public"."wallet_transactions" TO "anon";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."wallet_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."wallets" TO "anon";
GRANT ALL ON TABLE "public"."wallets" TO "authenticated";
GRANT ALL ON TABLE "public"."wallets" TO "service_role";



GRANT ALL ON TABLE "public"."watchlist" TO "anon";
GRANT ALL ON TABLE "public"."watchlist" TO "authenticated";
GRANT ALL ON TABLE "public"."watchlist" TO "service_role";



GRANT ALL ON TABLE "public"."webhook_events" TO "anon";
GRANT ALL ON TABLE "public"."webhook_events" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_events" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_performance_trends" TO "anon";
GRANT ALL ON TABLE "public"."weekly_performance_trends" TO "authenticated";
GRANT ALL ON TABLE "public"."weekly_performance_trends" TO "service_role";



GRANT ALL ON TABLE "public"."win_payment_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."win_payment_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."win_payment_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."win_payments" TO "anon";
GRANT ALL ON TABLE "public"."win_payments" TO "authenticated";
GRANT ALL ON TABLE "public"."win_payments" TO "service_role";



GRANT ALL ON TABLE "public"."winner_delivery_preferences" TO "anon";
GRANT ALL ON TABLE "public"."winner_delivery_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."winner_delivery_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist" TO "anon";
GRANT ALL ON TABLE "public"."wishlist" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist" TO "service_role";



GRANT ALL ON TABLE "public"."wishlists" TO "anon";
GRANT ALL ON TABLE "public"."wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlists" TO "service_role";



GRANT ALL ON TABLE "public"."yard_tokens" TO "anon";
GRANT ALL ON TABLE "public"."yard_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."yard_tokens" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";





























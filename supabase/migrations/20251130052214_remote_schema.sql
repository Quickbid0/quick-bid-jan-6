drop trigger if exists "set_updated_at" on "public"."analytics_events";

drop trigger if exists "trigger_check_budget_violations" on "public"."analytics_events";

drop trigger if exists "trigger_check_performance" on "public"."analytics_events";

drop trigger if exists "trigger_page_load_alert" on "public"."analytics_events";

drop trigger if exists "update_auction_winners_modtime" on "public"."auction_winners";

drop trigger if exists "trg_commission_settings_single_active" on "public"."commission_settings";

drop trigger if exists "update_insurance_policies_modtime" on "public"."insurance_policies";

drop trigger if exists "update_insurance_providers_modtime" on "public"."insurance_providers";

drop trigger if exists "trg_payment_status_change" on "public"."payments";

drop trigger if exists "update_order_on_payment_change" on "public"."payments";

drop trigger if exists "trigger_notify_performance_alert" on "public"."performance_alerts";

drop trigger if exists "set_updated_at" on "public"."performance_budgets";

drop trigger if exists "trigger_products_updated_at" on "public"."products";

drop trigger if exists "profiles_set_updated_at" on "public"."profiles";

drop trigger if exists "trigger_profiles_updated_at" on "public"."profiles";

drop trigger if exists "trg_support_messages_touch_conversation" on "public"."support_messages";

drop policy "Enable insert for all users" on "public"."analytics_events";

drop policy "companies_admin_write" on "public"."companies";

drop policy "companies_read" on "public"."companies";

drop policy "company_members_company_admin_manage" on "public"."company_members";

drop policy "company_members_read" on "public"."company_members";

drop policy "company_members_update_delete" on "public"."company_members";

drop policy "deposit_policies_admin_rw" on "public"."deposit_policies";

drop policy "deposits_update_admin" on "public"."deposits";

drop policy "employees_admin_rw" on "public"."employees";

drop policy "finance_leads_insert_admin" on "public"."finance_leads";

drop policy "finance_leads_select_admin" on "public"."finance_leads";

drop policy "finance_leads_update_admin" on "public"."finance_leads";

drop policy "inspection_visits_update_admin" on "public"."inspection_visits";

drop policy "investor_leads_admin" on "public"."investor_leads";

drop policy "invitations_manage" on "public"."invitations";

drop policy "invitations_read" on "public"."invitations";

drop policy "kyc_audit_admin_all" on "public"."kyc_audit_logs";

drop policy "leads_read_owner_admin" on "public"."leads";

drop policy "leads_update_owner_admin" on "public"."leads";

drop policy "Users can view their own order history" on "public"."order_status_history";

drop policy "Users can view their own payment events" on "public"."payment_events";

drop policy "Admins can manage all products" on "public"."products";

drop policy "products_read_public_or_owner_or_admin" on "public"."products";

drop policy "Admins can view all profiles" on "public"."profiles";

drop policy "profiles_admin_all" on "public"."profiles";

drop policy "profiles_select_self" on "public"."profiles";

drop policy "profiles_self_read" on "public"."profiles";

drop policy "profiles_self_update" on "public"."profiles";

drop policy "profiles_update_self" on "public"."profiles";

drop policy "seller_penalties_admin_rw" on "public"."seller_penalties";

drop policy "conv_admin_update" on "public"."support_conversations";

drop policy "conv_user_insert" on "public"."support_conversations";

drop policy "conv_user_read" on "public"."support_conversations";

drop policy "msg_user_insert" on "public"."support_messages";

drop policy "msg_user_read" on "public"."support_messages";

drop policy "user_controls_admin_rw" on "public"."user_controls";

drop policy "webhook_events_admin_read" on "public"."webhook_events";

alter table "public"."ad_schedule" drop constraint "ad_schedule_ad_id_fkey";

alter table "public"."ad_schedule" drop constraint "ad_schedule_auction_id_fkey";

alter table "public"."admin_action_logs" drop constraint "admin_action_logs_admin_id_fkey";

alter table "public"."admin_action_logs" drop constraint "admin_action_logs_auction_id_fkey";

alter table "public"."admin_audit_logs" drop constraint "admin_audit_logs_admin_id_fkey";

alter table "public"."ai_recommendations" drop constraint "ai_recommendations_product_id_fkey";

alter table "public"."ai_recommendations" drop constraint "ai_recommendations_user_id_fkey";

alter table "public"."auction_ad_slots" drop constraint "auction_ad_slots_ad_id_fkey";

alter table "public"."auction_ad_slots" drop constraint "auction_ad_slots_auction_id_fkey";

alter table "public"."auction_audit_entries" drop constraint "auction_audit_entries_auction_id_fkey";

alter table "public"."auction_bids" drop constraint "auction_bids_auction_id_fkey";

alter table "public"."auction_bids" drop constraint "auction_bids_bidder_id_fkey";

alter table "public"."auction_reminders" drop constraint "auction_reminders_auction_id_fkey";

alter table "public"."auction_reminders" drop constraint "auction_reminders_user_id_fkey";

alter table "public"."auction_winners" drop constraint "auction_winners_auction_id_fkey";

alter table "public"."auction_winners" drop constraint "auction_winners_insurance_policy_id_fkey";

alter table "public"."auction_winners" drop constraint "auction_winners_insurance_provider_key_fkey";

alter table "public"."auction_winners" drop constraint "auction_winners_winner_id_fkey";

alter table "public"."auctions" drop constraint "auctions_event_id_fkey";

alter table "public"."auctions" drop constraint "auctions_location_id_fkey";

alter table "public"."auctions" drop constraint "auctions_product_id_fkey";

alter table "public"."auctions" drop constraint "auctions_seller_id_fkey";

alter table "public"."auctions" drop constraint "auctions_winner_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_user_id_fkey";

alter table "public"."automation_executions" drop constraint "automation_executions_automation_id_fkey";

alter table "public"."banner_schedules" drop constraint "banner_schedules_banner_asset_id_fkey";

alter table "public"."bid_ledger" drop constraint "bid_ledger_auction_id_fkey";

alter table "public"."bid_requests" drop constraint "bid_requests_auction_id_fkey";

alter table "public"."bids" drop constraint "bids_auction_id_fkey";

alter table "public"."bids" drop constraint "bids_user_id_fkey";

alter table "public"."bulk_upload_jobs" drop constraint "bulk_upload_jobs_user_id_fkey";

alter table "public"."buyers" drop constraint "buyers_id_fkey";

alter table "public"."chat_messages" drop constraint "chat_messages_auction_id_fkey";

alter table "public"."chat_messages" drop constraint "chat_messages_moderated_by_fkey";

alter table "public"."chat_messages" drop constraint "chat_messages_user_id_fkey";

alter table "public"."commission_settings" drop constraint "commission_settings_created_by_fkey";

alter table "public"."commission_settings" drop constraint "commission_settings_updated_by_fkey";

alter table "public"."company_members" drop constraint "company_members_company_id_fkey";

alter table "public"."creative_works" drop constraint "creative_works_artist_id_fkey";

alter table "public"."deliveries" drop constraint "deliveries_buyer_id_fkey";

alter table "public"."deliveries" drop constraint "deliveries_product_id_fkey";

alter table "public"."deliveries" drop constraint "deliveries_seller_id_fkey";

alter table "public"."deposit_policies" drop constraint "deposit_policies_created_by_fkey";

alter table "public"."deposit_policies" drop constraint "deposit_policies_product_id_fkey";

alter table "public"."deposits" drop constraint "deposits_product_id_fkey";

alter table "public"."deposits" drop constraint "deposits_user_id_fkey";

alter table "public"."employees" drop constraint "employees_location_id_fkey";

alter table "public"."event_products" drop constraint "event_products_event_id_fkey";

alter table "public"."event_products" drop constraint "event_products_product_id_fkey";

alter table "public"."inspection_files" drop constraint "inspection_files_inspection_id_fkey";

alter table "public"."inspection_files" drop constraint "inspection_files_step_id_fkey";

alter table "public"."inspection_steps" drop constraint "inspection_steps_inspection_id_fkey";

alter table "public"."inspection_visits" drop constraint "inspection_visits_product_id_fkey";

alter table "public"."inspection_visits" drop constraint "inspection_visits_user_id_fkey";

alter table "public"."inspections" drop constraint "inspections_assigned_inspector_id_fkey";

alter table "public"."inspections" drop constraint "inspections_company_id_fkey";

alter table "public"."inspections" drop constraint "inspections_inspected_by_fkey";

alter table "public"."inspections" drop constraint "inspections_product_id_fkey";

alter table "public"."inspections" drop constraint "inspections_requested_by_fkey";

alter table "public"."inspections" drop constraint "inspections_requested_reinspection_by_fkey";

alter table "public"."inspections" drop constraint "inspections_reviewed_by_fkey";

alter table "public"."insurance_documents" drop constraint "insurance_documents_policy_id_fkey";

alter table "public"."insurance_documents" drop constraint "insurance_documents_uploaded_by_fkey";

alter table "public"."insurance_policies" drop constraint "insurance_policies_auction_winner_id_fkey";

alter table "public"."insurance_policies" drop constraint "insurance_policies_created_by_fkey";

alter table "public"."insurance_policies" drop constraint "insurance_policies_provider_id_fkey";

alter table "public"."insurance_policies" drop constraint "insurance_policies_updated_by_fkey";

alter table "public"."investments" drop constraint "investments_investor_id_fkey";

alter table "public"."investor_ledger_entries" drop constraint "investor_ledger_entries_investment_id_fkey";

alter table "public"."invitations" drop constraint "invitations_company_id_fkey";

alter table "public"."invoices" drop constraint "invoices_auction_id_fkey";

alter table "public"."invoices" drop constraint "invoices_buyer_id_fkey";

alter table "public"."invoices" drop constraint "invoices_seller_id_fkey";

alter table "public"."issues" drop constraint "issues_auction_id_fkey";

alter table "public"."issues" drop constraint "issues_product_id_fkey";

alter table "public"."issues" drop constraint "issues_user_id_fkey";

alter table "public"."kyc_audit_logs" drop constraint "kyc_audit_logs_admin_id_fkey";

alter table "public"."kyc_audit_logs" drop constraint "kyc_audit_logs_profile_id_fkey";

alter table "public"."leads" drop constraint "leads_assigned_to_fkey";

alter table "public"."ledger_entries" drop constraint "ledger_entries_account_id_fkey";

alter table "public"."ledger_entries" drop constraint "ledger_entries_transaction_id_fkey";

alter table "public"."live_auctions" drop constraint "live_auctions_product_id_fkey";

alter table "public"."live_auctions" drop constraint "live_auctions_seller_id_fkey";

alter table "public"."live_streams" drop constraint "live_streams_auction_id_fkey";

alter table "public"."moderation_queue" drop constraint "moderation_queue_moderated_by_fkey";

alter table "public"."moderation_queue" drop constraint "moderation_queue_reported_by_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."order_items" drop constraint "order_items_order_id_fkey";

alter table "public"."order_items" drop constraint "order_items_product_id_fkey";

alter table "public"."order_status_history" drop constraint "fk_order";

alter table "public"."order_status_history" drop constraint "order_status_history_order_id_fkey";

alter table "public"."order_status_history" drop constraint "order_status_history_payment_id_fkey";

alter table "public"."orders" drop constraint "fk_orders_payment_method_id";

alter table "public"."orders" drop constraint "fk_orders_user_id";

alter table "public"."orders" drop constraint "orders_user_id_fkey";

alter table "public"."payment_audit_log" drop constraint "fk_payment_audit_log_payment_id";

alter table "public"."payment_audit_log" drop constraint "fk_payment_audit_log_user_id";

alter table "public"."payment_events" drop constraint "payment_events_payment_id_fkey";

alter table "public"."payment_methods" drop constraint "fk_payment_methods_user_id";

alter table "public"."payments" drop constraint "fk_payments_order_id";

alter table "public"."payments" drop constraint "fk_payments_user_id";

alter table "public"."products" drop constraint "products_seller_id_fkey";

alter table "public"."profiles" drop constraint "profiles_company_id_fkey";

alter table "public"."profiles" drop constraint "profiles_referrer_agent_id_fkey";

alter table "public"."profiles" drop constraint "profiles_referrer_user_id_fkey";

alter table "public"."refunds" drop constraint "fk_refunds_payment_id";

alter table "public"."reviews" drop constraint "reviews_auction_id_fkey";

alter table "public"."reviews" drop constraint "reviews_reviewee_id_fkey";

alter table "public"."reviews" drop constraint "reviews_reviewer_id_fkey";

alter table "public"."seller_analytics" drop constraint "seller_analytics_seller_id_fkey";

alter table "public"."sellers" drop constraint "sellers_id_fkey";

alter table "public"."settlements" drop constraint "settlements_auction_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" drop constraint "subscriptions_seller_id_fkey";

alter table "public"."support_messages" drop constraint "support_messages_conversation_id_fkey";

alter table "public"."support_ticket_messages" drop constraint "support_ticket_messages_ticket_id_fkey";

alter table "public"."support_tickets" drop constraint "support_tickets_auction_id_fkey";

alter table "public"."support_tickets" drop constraint "support_tickets_conversation_id_fkey";

alter table "public"."support_tickets" drop constraint "support_tickets_product_id_fkey";

alter table "public"."support_tickets" drop constraint "support_tickets_user_id_fkey";

alter table "public"."system_settings" drop constraint "system_settings_updated_by_fkey";

alter table "public"."transactions" drop constraint "transactions_user_id_fkey";

alter table "public"."user_analytics" drop constraint "user_analytics_user_id_fkey";

alter table "public"."user_deposit_history" drop constraint "user_deposit_history_user_id_fkey";

alter table "public"."user_risk" drop constraint "user_risk_user_id_fkey";

alter table "public"."vehicle_documents" drop constraint "vehicle_documents_vehicle_id_fkey";

alter table "public"."vehicle_images" drop constraint "vehicle_images_vehicle_id_fkey";

alter table "public"."wallet_balances" drop constraint "wallet_balances_account_id_fkey";

alter table "public"."wallet_transactions" drop constraint "wallet_transactions_auction_id_fkey";

alter table "public"."wallet_transactions" drop constraint "wallet_transactions_user_id_fkey";

alter table "public"."wallet_transactions" drop constraint "wallet_transactions_wallet_id_fkey";

alter table "public"."wallets" drop constraint "wallets_user_id_fkey";

alter table "public"."watchlist" drop constraint "watchlist_product_id_fkey";

alter table "public"."watchlist" drop constraint "watchlist_user_id_fkey";

alter table "public"."win_payment_audit_logs" drop constraint "win_payment_audit_logs_changed_by_fkey";

alter table "public"."win_payment_audit_logs" drop constraint "win_payment_audit_logs_win_payment_id_fkey";

alter table "public"."win_payments" drop constraint "win_payments_auction_id_fkey";

alter table "public"."win_payments" drop constraint "win_payments_buyer_id_fkey";

alter table "public"."win_payments" drop constraint "win_payments_verified_by_fkey";

alter table "public"."winner_delivery_preferences" drop constraint "winner_delivery_preferences_auction_id_fkey";

alter table "public"."winner_delivery_preferences" drop constraint "winner_delivery_preferences_branch_id_fkey";

alter table "public"."winner_delivery_preferences" drop constraint "winner_delivery_preferences_winner_id_fkey";

alter table "public"."wishlist" drop constraint "wishlist_product_id_fkey";

alter table "public"."wishlist" drop constraint "wishlist_user_id_fkey";

alter table "public"."wishlists" drop constraint "wishlists_user_id_fkey";

drop view if exists "public"."order_details";

drop view if exists "public"."policy_details";

drop materialized view if exists "public"."weekly_performance_trends";

alter table "public"."addresses" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."auction_bids" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."auction_winners" alter column "delivery_status" set default 'pending'::public.delivery_status;

alter table "public"."auction_winners" alter column "delivery_status" set data type public.delivery_status using "delivery_status"::text::public.delivery_status;

alter table "public"."auction_winners" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."auction_winners" alter column "insurance_status" set data type public.insurance_status using "insurance_status"::text::public.insurance_status;

alter table "public"."auction_winners" alter column "payment_status" set default 'pending'::public.payment_status;

alter table "public"."auction_winners" alter column "payment_status" set data type public.payment_status using "payment_status"::text::public.payment_status;

alter table "public"."audit_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."bids" alter column "sequence" set default nextval('public.bids_sequence_seq'::regclass);

alter table "public"."deliveries" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."error_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."insurance_documents" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."insurance_policies" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."insurance_policies" alter column "status" set default 'pending'::public.insurance_status;

alter table "public"."insurance_policies" alter column "status" set data type public.insurance_status using "status"::text::public.insurance_status;

alter table "public"."insurance_providers" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."investor_ledger_entries" alter column "id" set default nextval('public.investor_ledger_entries_id_seq'::regclass);

alter table "public"."live_auctions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."order_status_history" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."payment_events" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."payments" alter column "status" set data type public.payment_status using "status"::text::public.payment_status;

alter table "public"."refunds" alter column "reason" set data type public.refund_reason using "reason"::text::public.refund_reason;

alter table "public"."refunds" alter column "status" set default 'pending'::public.refund_status;

alter table "public"."refunds" alter column "status" set data type public.refund_status using "status"::text::public.refund_status;

alter table "public"."settlements" alter column "status" set default 'pending_escrow'::public.settlement_status;

alter table "public"."settlements" alter column "status" set data type public.settlement_status using "status"::text::public.settlement_status;

alter table "public"."ad_schedule" add constraint "ad_schedule_ad_id_fkey" FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE not valid;

alter table "public"."ad_schedule" validate constraint "ad_schedule_ad_id_fkey";

alter table "public"."ad_schedule" add constraint "ad_schedule_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."ad_schedule" validate constraint "ad_schedule_auction_id_fkey";

alter table "public"."admin_action_logs" add constraint "admin_action_logs_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.user_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."admin_action_logs" validate constraint "admin_action_logs_admin_id_fkey";

alter table "public"."admin_action_logs" add constraint "admin_action_logs_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE SET NULL not valid;

alter table "public"."admin_action_logs" validate constraint "admin_action_logs_auction_id_fkey";

alter table "public"."admin_audit_logs" add constraint "admin_audit_logs_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."admin_audit_logs" validate constraint "admin_audit_logs_admin_id_fkey";

alter table "public"."ai_recommendations" add constraint "ai_recommendations_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."ai_recommendations" validate constraint "ai_recommendations_product_id_fkey";

alter table "public"."ai_recommendations" add constraint "ai_recommendations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."ai_recommendations" validate constraint "ai_recommendations_user_id_fkey";

alter table "public"."auction_ad_slots" add constraint "auction_ad_slots_ad_id_fkey" FOREIGN KEY (ad_id) REFERENCES public.ads(id) not valid;

alter table "public"."auction_ad_slots" validate constraint "auction_ad_slots_ad_id_fkey";

alter table "public"."auction_ad_slots" add constraint "auction_ad_slots_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."auction_ad_slots" validate constraint "auction_ad_slots_auction_id_fkey";

alter table "public"."auction_audit_entries" add constraint "auction_audit_entries_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."auction_audit_entries" validate constraint "auction_audit_entries_auction_id_fkey";

alter table "public"."auction_bids" add constraint "auction_bids_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."auction_bids" validate constraint "auction_bids_auction_id_fkey";

alter table "public"."auction_bids" add constraint "auction_bids_bidder_id_fkey" FOREIGN KEY (bidder_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."auction_bids" validate constraint "auction_bids_bidder_id_fkey";

alter table "public"."auction_reminders" add constraint "auction_reminders_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."auction_reminders" validate constraint "auction_reminders_auction_id_fkey";

alter table "public"."auction_reminders" add constraint "auction_reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."auction_reminders" validate constraint "auction_reminders_user_id_fkey";

alter table "public"."auction_winners" add constraint "auction_winners_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."auction_winners" validate constraint "auction_winners_auction_id_fkey";

alter table "public"."auction_winners" add constraint "auction_winners_insurance_policy_id_fkey" FOREIGN KEY (insurance_policy_id) REFERENCES public.insurance_policies(id) not valid;

alter table "public"."auction_winners" validate constraint "auction_winners_insurance_policy_id_fkey";

alter table "public"."auction_winners" add constraint "auction_winners_insurance_provider_key_fkey" FOREIGN KEY (insurance_provider_key) REFERENCES public.insurance_providers(id) ON DELETE SET NULL not valid;

alter table "public"."auction_winners" validate constraint "auction_winners_insurance_provider_key_fkey";

alter table "public"."auction_winners" add constraint "auction_winners_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."auction_winners" validate constraint "auction_winners_winner_id_fkey";

alter table "public"."auctions" add constraint "auctions_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.auction_events(id) not valid;

alter table "public"."auctions" validate constraint "auctions_event_id_fkey";

alter table "public"."auctions" add constraint "auctions_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.locations(id) not valid;

alter table "public"."auctions" validate constraint "auctions_location_id_fkey";

alter table "public"."auctions" add constraint "auctions_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."auctions" validate constraint "auctions_product_id_fkey";

alter table "public"."auctions" add constraint "auctions_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."auctions" validate constraint "auctions_seller_id_fkey";

alter table "public"."auctions" add constraint "auctions_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES public.profiles(id) not valid;

alter table "public"."auctions" validate constraint "auctions_winner_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."automation_executions" add constraint "automation_executions_automation_id_fkey" FOREIGN KEY (automation_id) REFERENCES public.automations(id) ON DELETE CASCADE not valid;

alter table "public"."automation_executions" validate constraint "automation_executions_automation_id_fkey";

alter table "public"."banner_schedules" add constraint "banner_schedules_banner_asset_id_fkey" FOREIGN KEY (banner_asset_id) REFERENCES public.banner_assets(id) ON DELETE SET NULL not valid;

alter table "public"."banner_schedules" validate constraint "banner_schedules_banner_asset_id_fkey";

alter table "public"."bid_ledger" add constraint "bid_ledger_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."bid_ledger" validate constraint "bid_ledger_auction_id_fkey";

alter table "public"."bid_requests" add constraint "bid_requests_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."bid_requests" validate constraint "bid_requests_auction_id_fkey";

alter table "public"."bids" add constraint "bids_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."bids" validate constraint "bids_auction_id_fkey";

alter table "public"."bids" add constraint "bids_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bids" validate constraint "bids_user_id_fkey";

alter table "public"."bulk_upload_jobs" add constraint "bulk_upload_jobs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."bulk_upload_jobs" validate constraint "bulk_upload_jobs_user_id_fkey";

alter table "public"."buyers" add constraint "buyers_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) not valid;

alter table "public"."buyers" validate constraint "buyers_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_auction_id_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_moderated_by_fkey" FOREIGN KEY (moderated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_moderated_by_fkey";

alter table "public"."chat_messages" add constraint "chat_messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."chat_messages" validate constraint "chat_messages_user_id_fkey";

alter table "public"."commission_settings" add constraint "commission_settings_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."commission_settings" validate constraint "commission_settings_created_by_fkey";

alter table "public"."commission_settings" add constraint "commission_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."commission_settings" validate constraint "commission_settings_updated_by_fkey";

alter table "public"."company_members" add constraint "company_members_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."company_members" validate constraint "company_members_company_id_fkey";

alter table "public"."creative_works" add constraint "creative_works_artist_id_fkey" FOREIGN KEY (artist_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."creative_works" validate constraint "creative_works_artist_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) not valid;

alter table "public"."deliveries" validate constraint "deliveries_buyer_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."deliveries" validate constraint "deliveries_product_id_fkey";

alter table "public"."deliveries" add constraint "deliveries_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) not valid;

alter table "public"."deliveries" validate constraint "deliveries_seller_id_fkey";

alter table "public"."deposit_policies" add constraint "deposit_policies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."deposit_policies" validate constraint "deposit_policies_created_by_fkey";

alter table "public"."deposit_policies" add constraint "deposit_policies_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."deposit_policies" validate constraint "deposit_policies_product_id_fkey";

alter table "public"."deposits" add constraint "deposits_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."deposits" validate constraint "deposits_product_id_fkey";

alter table "public"."deposits" add constraint "deposits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."deposits" validate constraint "deposits_user_id_fkey";

alter table "public"."employees" add constraint "employees_location_id_fkey" FOREIGN KEY (location_id) REFERENCES public.locations(id) not valid;

alter table "public"."employees" validate constraint "employees_location_id_fkey";

alter table "public"."event_products" add constraint "event_products_event_id_fkey" FOREIGN KEY (event_id) REFERENCES public.auction_events(id) ON DELETE CASCADE not valid;

alter table "public"."event_products" validate constraint "event_products_event_id_fkey";

alter table "public"."event_products" add constraint "event_products_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."event_products" validate constraint "event_products_product_id_fkey";

alter table "public"."inspection_files" add constraint "inspection_files_inspection_id_fkey" FOREIGN KEY (inspection_id) REFERENCES public.inspections(id) ON DELETE CASCADE not valid;

alter table "public"."inspection_files" validate constraint "inspection_files_inspection_id_fkey";

alter table "public"."inspection_files" add constraint "inspection_files_step_id_fkey" FOREIGN KEY (step_id) REFERENCES public.inspection_steps(id) not valid;

alter table "public"."inspection_files" validate constraint "inspection_files_step_id_fkey";

alter table "public"."inspection_steps" add constraint "inspection_steps_inspection_id_fkey" FOREIGN KEY (inspection_id) REFERENCES public.inspections(id) ON DELETE CASCADE not valid;

alter table "public"."inspection_steps" validate constraint "inspection_steps_inspection_id_fkey";

alter table "public"."inspection_visits" add constraint "inspection_visits_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."inspection_visits" validate constraint "inspection_visits_product_id_fkey";

alter table "public"."inspection_visits" add constraint "inspection_visits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."inspection_visits" validate constraint "inspection_visits_user_id_fkey";

alter table "public"."inspections" add constraint "inspections_assigned_inspector_id_fkey" FOREIGN KEY (assigned_inspector_id) REFERENCES public.profiles(id) not valid;

alter table "public"."inspections" validate constraint "inspections_assigned_inspector_id_fkey";

alter table "public"."inspections" add constraint "inspections_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) not valid;

alter table "public"."inspections" validate constraint "inspections_company_id_fkey";

alter table "public"."inspections" add constraint "inspections_inspected_by_fkey" FOREIGN KEY (inspected_by) REFERENCES public.profiles(id) not valid;

alter table "public"."inspections" validate constraint "inspections_inspected_by_fkey";

alter table "public"."inspections" add constraint "inspections_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."inspections" validate constraint "inspections_product_id_fkey";

alter table "public"."inspections" add constraint "inspections_requested_by_fkey" FOREIGN KEY (requested_by) REFERENCES public.profiles(id) not valid;

alter table "public"."inspections" validate constraint "inspections_requested_by_fkey";

alter table "public"."inspections" add constraint "inspections_requested_reinspection_by_fkey" FOREIGN KEY (requested_reinspection_by) REFERENCES public.profiles(id) not valid;

alter table "public"."inspections" validate constraint "inspections_requested_reinspection_by_fkey";

alter table "public"."inspections" add constraint "inspections_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) not valid;

alter table "public"."inspections" validate constraint "inspections_reviewed_by_fkey";

alter table "public"."insurance_documents" add constraint "insurance_documents_policy_id_fkey" FOREIGN KEY (policy_id) REFERENCES public.insurance_policies(id) ON DELETE CASCADE not valid;

alter table "public"."insurance_documents" validate constraint "insurance_documents_policy_id_fkey";

alter table "public"."insurance_documents" add constraint "insurance_documents_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."insurance_documents" validate constraint "insurance_documents_uploaded_by_fkey";

alter table "public"."insurance_policies" add constraint "insurance_policies_auction_winner_id_fkey" FOREIGN KEY (auction_winner_id) REFERENCES public.auction_winners(id) ON DELETE CASCADE not valid;

alter table "public"."insurance_policies" validate constraint "insurance_policies_auction_winner_id_fkey";

alter table "public"."insurance_policies" add constraint "insurance_policies_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."insurance_policies" validate constraint "insurance_policies_created_by_fkey";

alter table "public"."insurance_policies" add constraint "insurance_policies_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES public.insurance_providers(id) ON DELETE SET NULL not valid;

alter table "public"."insurance_policies" validate constraint "insurance_policies_provider_id_fkey";

alter table "public"."insurance_policies" add constraint "insurance_policies_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."insurance_policies" validate constraint "insurance_policies_updated_by_fkey";

alter table "public"."investments" add constraint "investments_investor_id_fkey" FOREIGN KEY (investor_id) REFERENCES public.investors(id) ON DELETE CASCADE not valid;

alter table "public"."investments" validate constraint "investments_investor_id_fkey";

alter table "public"."investor_ledger_entries" add constraint "investor_ledger_entries_investment_id_fkey" FOREIGN KEY (investment_id) REFERENCES public.investments(id) ON DELETE CASCADE not valid;

alter table "public"."investor_ledger_entries" validate constraint "investor_ledger_entries_investment_id_fkey";

alter table "public"."invitations" add constraint "invitations_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE not valid;

alter table "public"."invitations" validate constraint "invitations_company_id_fkey";

alter table "public"."invoices" add constraint "invoices_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_auction_id_fkey";

alter table "public"."invoices" add constraint "invoices_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_buyer_id_fkey";

alter table "public"."invoices" add constraint "invoices_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_seller_id_fkey";

alter table "public"."issues" add constraint "issues_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."issues" validate constraint "issues_auction_id_fkey";

alter table "public"."issues" add constraint "issues_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."issues" validate constraint "issues_product_id_fkey";

alter table "public"."issues" add constraint "issues_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."issues" validate constraint "issues_user_id_fkey";

alter table "public"."kyc_audit_logs" add constraint "kyc_audit_logs_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.profiles(id) not valid;

alter table "public"."kyc_audit_logs" validate constraint "kyc_audit_logs_admin_id_fkey";

alter table "public"."kyc_audit_logs" add constraint "kyc_audit_logs_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."kyc_audit_logs" validate constraint "kyc_audit_logs_profile_id_fkey";

alter table "public"."leads" add constraint "leads_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) not valid;

alter table "public"."leads" validate constraint "leads_assigned_to_fkey";

alter table "public"."ledger_entries" add constraint "ledger_entries_account_id_fkey" FOREIGN KEY (account_id) REFERENCES public.accounts(account_id) ON DELETE RESTRICT not valid;

alter table "public"."ledger_entries" validate constraint "ledger_entries_account_id_fkey";

alter table "public"."ledger_entries" add constraint "ledger_entries_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE not valid;

alter table "public"."ledger_entries" validate constraint "ledger_entries_transaction_id_fkey";

alter table "public"."live_auctions" add constraint "live_auctions_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."live_auctions" validate constraint "live_auctions_product_id_fkey";

alter table "public"."live_auctions" add constraint "live_auctions_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) not valid;

alter table "public"."live_auctions" validate constraint "live_auctions_seller_id_fkey";

alter table "public"."live_streams" add constraint "live_streams_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."live_streams" validate constraint "live_streams_auction_id_fkey";

alter table "public"."moderation_queue" add constraint "moderation_queue_moderated_by_fkey" FOREIGN KEY (moderated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."moderation_queue" validate constraint "moderation_queue_moderated_by_fkey";

alter table "public"."moderation_queue" add constraint "moderation_queue_reported_by_fkey" FOREIGN KEY (reported_by) REFERENCES public.profiles(id) not valid;

alter table "public"."moderation_queue" validate constraint "moderation_queue_reported_by_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."order_status_history" add constraint "fk_order" FOREIGN KEY (order_id) REFERENCES public.orders(id) not valid;

alter table "public"."order_status_history" validate constraint "fk_order";

alter table "public"."order_status_history" add constraint "order_status_history_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_order_id_fkey";

alter table "public"."order_status_history" add constraint "order_status_history_payment_id_fkey" FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL not valid;

alter table "public"."order_status_history" validate constraint "order_status_history_payment_id_fkey";

alter table "public"."orders" add constraint "fk_orders_payment_method_id" FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL not valid;

alter table "public"."orders" validate constraint "fk_orders_payment_method_id";

alter table "public"."orders" add constraint "fk_orders_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "fk_orders_user_id";

alter table "public"."orders" add constraint "orders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_user_id_fkey";

alter table "public"."payment_audit_log" add constraint "fk_payment_audit_log_payment_id" FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE not valid;

alter table "public"."payment_audit_log" validate constraint "fk_payment_audit_log_payment_id";

alter table "public"."payment_audit_log" add constraint "fk_payment_audit_log_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."payment_audit_log" validate constraint "fk_payment_audit_log_user_id";

alter table "public"."payment_events" add constraint "payment_events_payment_id_fkey" FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE not valid;

alter table "public"."payment_events" validate constraint "payment_events_payment_id_fkey";

alter table "public"."payment_methods" add constraint "fk_payment_methods_user_id" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."payment_methods" validate constraint "fk_payment_methods_user_id";

alter table "public"."payments" add constraint "fk_payments_order_id" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL not valid;

alter table "public"."payments" validate constraint "fk_payments_order_id";

alter table "public"."payments" add constraint "fk_payments_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."payments" validate constraint "fk_payments_user_id";

alter table "public"."products" add constraint "products_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."products" validate constraint "products_seller_id_fkey";

alter table "public"."profiles" add constraint "profiles_company_id_fkey" FOREIGN KEY (company_id) REFERENCES public.companies(id) not valid;

alter table "public"."profiles" validate constraint "profiles_company_id_fkey";

alter table "public"."profiles" add constraint "profiles_referrer_agent_id_fkey" FOREIGN KEY (referrer_agent_id) REFERENCES public.profiles(id) not valid;

alter table "public"."profiles" validate constraint "profiles_referrer_agent_id_fkey";

alter table "public"."profiles" add constraint "profiles_referrer_user_id_fkey" FOREIGN KEY (referrer_user_id) REFERENCES public.profiles(id) not valid;

alter table "public"."profiles" validate constraint "profiles_referrer_user_id_fkey";

alter table "public"."refunds" add constraint "fk_refunds_payment_id" FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE not valid;

alter table "public"."refunds" validate constraint "fk_refunds_payment_id";

alter table "public"."reviews" add constraint "reviews_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_auction_id_fkey";

alter table "public"."reviews" add constraint "reviews_reviewee_id_fkey" FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_reviewee_id_fkey";

alter table "public"."reviews" add constraint "reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_reviewer_id_fkey";

alter table "public"."seller_analytics" add constraint "seller_analytics_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."seller_analytics" validate constraint "seller_analytics_seller_id_fkey";

alter table "public"."sellers" add constraint "sellers_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) not valid;

alter table "public"."sellers" validate constraint "sellers_id_fkey";

alter table "public"."settlements" add constraint "settlements_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."settlements" validate constraint "settlements_auction_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_plan_id_fkey";

alter table "public"."subscriptions" add constraint "subscriptions_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.sellers(id) not valid;

alter table "public"."subscriptions" validate constraint "subscriptions_seller_id_fkey";

alter table "public"."support_messages" add constraint "support_messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.support_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."support_messages" validate constraint "support_messages_conversation_id_fkey";

alter table "public"."support_ticket_messages" add constraint "support_ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES public.support_tickets(id) ON DELETE CASCADE not valid;

alter table "public"."support_ticket_messages" validate constraint "support_ticket_messages_ticket_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_auction_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.support_conversations(id) not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_conversation_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_product_id_fkey";

alter table "public"."support_tickets" add constraint "support_tickets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) not valid;

alter table "public"."support_tickets" validate constraint "support_tickets_user_id_fkey";

alter table "public"."system_settings" add constraint "system_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public.profiles(id) not valid;

alter table "public"."system_settings" validate constraint "system_settings_updated_by_fkey";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."user_analytics" add constraint "user_analytics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_analytics" validate constraint "user_analytics_user_id_fkey";

alter table "public"."user_deposit_history" add constraint "user_deposit_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_deposit_history" validate constraint "user_deposit_history_user_id_fkey";

alter table "public"."user_risk" add constraint "user_risk_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_risk" validate constraint "user_risk_user_id_fkey";

alter table "public"."vehicle_documents" add constraint "vehicle_documents_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE not valid;

alter table "public"."vehicle_documents" validate constraint "vehicle_documents_vehicle_id_fkey";

alter table "public"."vehicle_images" add constraint "vehicle_images_vehicle_id_fkey" FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE not valid;

alter table "public"."vehicle_images" validate constraint "vehicle_images_vehicle_id_fkey";

alter table "public"."wallet_balances" add constraint "wallet_balances_account_id_fkey" FOREIGN KEY (account_id) REFERENCES public.ledger_accounts(id) ON DELETE CASCADE not valid;

alter table "public"."wallet_balances" validate constraint "wallet_balances_account_id_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_auction_id_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_user_id_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_wallet_id_fkey" FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_wallet_id_fkey";

alter table "public"."wallets" add constraint "wallets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."wallets" validate constraint "wallets_user_id_fkey";

alter table "public"."watchlist" add constraint "watchlist_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."watchlist" validate constraint "watchlist_product_id_fkey";

alter table "public"."watchlist" add constraint "watchlist_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."watchlist" validate constraint "watchlist_user_id_fkey";

alter table "public"."win_payment_audit_logs" add constraint "win_payment_audit_logs_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."win_payment_audit_logs" validate constraint "win_payment_audit_logs_changed_by_fkey";

alter table "public"."win_payment_audit_logs" add constraint "win_payment_audit_logs_win_payment_id_fkey" FOREIGN KEY (win_payment_id) REFERENCES public.win_payments(id) ON DELETE CASCADE not valid;

alter table "public"."win_payment_audit_logs" validate constraint "win_payment_audit_logs_win_payment_id_fkey";

alter table "public"."win_payments" add constraint "win_payments_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."win_payments" validate constraint "win_payments_auction_id_fkey";

alter table "public"."win_payments" add constraint "win_payments_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE RESTRICT not valid;

alter table "public"."win_payments" validate constraint "win_payments_buyer_id_fkey";

alter table "public"."win_payments" add constraint "win_payments_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."win_payments" validate constraint "win_payments_verified_by_fkey";

alter table "public"."winner_delivery_preferences" add constraint "winner_delivery_preferences_auction_id_fkey" FOREIGN KEY (auction_id) REFERENCES public.auctions(id) ON DELETE CASCADE not valid;

alter table "public"."winner_delivery_preferences" validate constraint "winner_delivery_preferences_auction_id_fkey";

alter table "public"."winner_delivery_preferences" add constraint "winner_delivery_preferences_branch_id_fkey" FOREIGN KEY (branch_id) REFERENCES public.locations(id) not valid;

alter table "public"."winner_delivery_preferences" validate constraint "winner_delivery_preferences_branch_id_fkey";

alter table "public"."winner_delivery_preferences" add constraint "winner_delivery_preferences_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."winner_delivery_preferences" validate constraint "winner_delivery_preferences_winner_id_fkey";

alter table "public"."wishlist" add constraint "wishlist_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist" validate constraint "wishlist_product_id_fkey";

alter table "public"."wishlist" add constraint "wishlist_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."wishlist" validate constraint "wishlist_user_id_fkey";

alter table "public"."wishlists" add constraint "wishlists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."wishlists" validate constraint "wishlists_user_id_fkey";

create or replace view "public"."daily_performance_metrics" as  SELECT date(created_at) AS date,
    avg(((event_data ->> 'value'::text))::numeric) FILTER (WHERE ((event_data ->> 'metric_name'::text) = 'page_load'::text)) AS avg_page_load,
    avg(((event_data ->> 'delay'::text))::numeric) FILTER (WHERE ((event_data ->> 'metric_name'::text) = 'first_input_delay'::text)) AS avg_first_input_delay,
    count(*) FILTER (WHERE ((event_data ->> 'metric_name'::text) = 'long_task'::text)) AS long_tasks_count,
    avg(((event_data ->> 'duration'::text))::numeric) FILTER (WHERE ((event_data ->> 'metric_name'::text) = 'long_task'::text)) AS avg_long_task_duration
   FROM public.analytics_events
  WHERE (event_type = 'performance_metrics'::text)
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


create or replace view "public"."order_details" as  SELECT o.id AS order_id,
    o.user_id,
    o.status AS order_status,
    ((o.total)::numeric / 100.0) AS order_amount,
    o.created_at AS order_date,
    o.updated_at AS last_updated,
    o.payment_method_id,
    p.id AS payment_id,
    p.status AS payment_status,
    p.payment_intent_id,
    ((p.amount)::numeric / 100.0) AS payment_amount,
    p.currency,
    ((p.refunded_amount)::numeric / 100.0) AS refunded_amount,
    p.refunded_at,
    pm.brand AS card_brand,
    pm.last4 AS card_last4,
    pm.exp_month,
    pm.exp_year
   FROM ((public.orders o
     JOIN public.payments p ON ((o.id = p.order_id)))
     LEFT JOIN public.payment_methods pm ON ((o.payment_method_id = pm.id)));


create or replace view "public"."order_statistics" as  SELECT user_id,
    status AS order_status,
    count(*) AS order_count,
    ((sum(total))::numeric / 100.0) AS total_amount
   FROM public.orders
  GROUP BY user_id, status
  ORDER BY user_id, status;


create or replace view "public"."payment_method_statistics" as  SELECT user_id,
    brand,
    count(*) AS card_count,
    max(
        CASE
            WHEN is_default THEN 'Yes'::text
            ELSE 'No'::text
        END) AS has_default
   FROM public.payment_methods
  WHERE (deleted_at IS NULL)
  GROUP BY user_id, brand;


create or replace view "public"."policy_details" as  SELECT p.id,
    p.auction_winner_id,
    p.provider_id,
    p.policy_number,
    p.status,
    p.coverage_amount,
    p.premium_amount,
    p.start_date,
    p.expiry_date,
    p.details,
    p.created_at,
    p.updated_at,
    p.created_by,
    p.updated_by,
    ip.name AS provider_name,
    ip.description AS provider_description
   FROM (public.insurance_policies p
     JOIN public.insurance_providers ip ON ((p.provider_id = ip.id)));


create or replace view "public"."public_employee_verification_view" as  SELECT e.employee_code,
    e.name,
    e.role,
    COALESCE(l.city, l.name, ''::text) AS city,
    COALESCE(l.state, ''::text) AS state,
    e.active,
    e.verified_at
   FROM (public.employees e
     LEFT JOIN public.locations l ON ((l.id = e.location_id)));


create or replace view "public"."user_dashboard" as  SELECT u.id AS user_id,
    u.email,
    p.full_name,
    ( SELECT count(*) AS count
           FROM public.orders o
          WHERE (o.user_id = u.id)) AS total_orders,
    ( SELECT COALESCE(((sum(o.total))::numeric / 100.0), (0)::numeric) AS "coalesce"
           FROM public.orders o
          WHERE (o.user_id = u.id)) AS total_spent,
    ( SELECT count(*) AS count
           FROM public.payment_methods pm
          WHERE ((pm.user_id = u.id) AND (pm.deleted_at IS NULL))) AS payment_methods_count
   FROM (auth.users u
     LEFT JOIN public.profiles p ON ((u.id = p.id)));


create or replace view "public"."user_payment_methods" as  SELECT id,
    user_id,
    payment_method_id,
    brand,
    last4,
    exp_month,
    exp_year,
    is_default,
    created_at,
    updated_at,
    deleted_at
   FROM public.payment_methods
  WHERE (deleted_at IS NULL);


create materialized view "public"."weekly_performance_trends" as  SELECT date,
    round(avg_page_load) AS avg_page_load_ms,
    round(avg_first_input_delay) AS avg_fid_ms,
    long_tasks_count,
    round(avg_long_task_duration) AS avg_long_task_ms
   FROM public.daily_performance_metrics
  WHERE (date >= (CURRENT_DATE - '30 days'::interval))
  ORDER BY date DESC;



  create policy "Enable insert for all users"
  on "public"."analytics_events"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "companies_admin_write"
  on "public"."companies"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "companies_read"
  on "public"."companies"
  as permissive
  for select
  to public
using ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m
  WHERE ((m.company_id = companies.id) AND (m.user_id = auth.uid()) AND (m.status = 'active'::text))))));



  create policy "company_members_company_admin_manage"
  on "public"."company_members"
  as permissive
  for insert
  to public
with check ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m2
  WHERE ((m2.company_id = company_members.company_id) AND (m2.user_id = auth.uid()) AND (m2.role = 'company_admin'::text))))));



  create policy "company_members_read"
  on "public"."company_members"
  as permissive
  for select
  to public
using ((public.is_admin() OR (user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.company_members m2
  WHERE ((m2.company_id = company_members.company_id) AND (m2.user_id = auth.uid()) AND (m2.role = 'company_admin'::text))))));



  create policy "company_members_update_delete"
  on "public"."company_members"
  as permissive
  for update
  to public
using ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m2
  WHERE ((m2.company_id = company_members.company_id) AND (m2.user_id = auth.uid()) AND (m2.role = 'company_admin'::text))))))
with check ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m2
  WHERE ((m2.company_id = company_members.company_id) AND (m2.user_id = auth.uid()) AND (m2.role = 'company_admin'::text))))));



  create policy "deposit_policies_admin_rw"
  on "public"."deposit_policies"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "deposits_update_admin"
  on "public"."deposits"
  as permissive
  for update
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "employees_admin_rw"
  on "public"."employees"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "finance_leads_insert_admin"
  on "public"."finance_leads"
  as permissive
  for insert
  to public
with check (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))));



  create policy "finance_leads_select_admin"
  on "public"."finance_leads"
  as permissive
  for select
  to public
using (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))));



  create policy "finance_leads_update_admin"
  on "public"."finance_leads"
  as permissive
  for update
  to public
using (((auth.role() = 'authenticated'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::text))))));



  create policy "inspection_visits_update_admin"
  on "public"."inspection_visits"
  as permissive
  for update
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "investor_leads_admin"
  on "public"."investor_leads"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "invitations_manage"
  on "public"."invitations"
  as permissive
  for all
  to public
using ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m
  WHERE ((m.company_id = invitations.company_id) AND (m.user_id = auth.uid()) AND (m.role = 'company_admin'::text))))));



  create policy "invitations_read"
  on "public"."invitations"
  as permissive
  for select
  to public
using ((public.is_admin() OR (EXISTS ( SELECT 1
   FROM public.company_members m
  WHERE ((m.company_id = invitations.company_id) AND (m.user_id = auth.uid()) AND (m.role = 'company_admin'::text))))));



  create policy "kyc_audit_admin_all"
  on "public"."kyc_audit_logs"
  as permissive
  for all
  to public
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));



  create policy "leads_read_owner_admin"
  on "public"."leads"
  as permissive
  for select
  to authenticated
using (((assigned_to = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::text, 'superadmin'::text])))))));



  create policy "leads_update_owner_admin"
  on "public"."leads"
  as permissive
  for update
  to authenticated
using (((assigned_to = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::text, 'superadmin'::text])))))));



  create policy "Users can view their own order history"
  on "public"."order_status_history"
  as permissive
  for select
  to public
using ((auth.uid() = ( SELECT orders.user_id
   FROM public.orders
  WHERE (orders.id = order_status_history.order_id))));



  create policy "Users can view their own payment events"
  on "public"."payment_events"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.payments p
     JOIN public.orders o ON ((p.order_id = o.id)))
  WHERE ((p.id = payment_events.payment_id) AND (o.user_id = auth.uid())))));



  create policy "Admins can manage all products"
  on "public"."products"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::text, 'superadmin'::text]))))));



  create policy "products_read_public_or_owner_or_admin"
  on "public"."products"
  as permissive
  for select
  to public
using (((status = 'active'::text) OR public.is_admin()));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles profiles_1
  WHERE ((profiles_1.id = auth.uid()) AND (profiles_1.role = ANY (ARRAY['admin'::text, 'superadmin'::text]))))));



  create policy "profiles_admin_all"
  on "public"."profiles"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "profiles_select_self"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((id = auth.uid()) OR public.is_admin(auth.uid())));



  create policy "profiles_self_read"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "profiles_self_update"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((auth.uid() = id) OR public.is_admin()));



  create policy "profiles_update_self"
  on "public"."profiles"
  as permissive
  for update
  to public
using (((id = auth.uid()) OR public.is_admin(auth.uid())))
with check (((id = auth.uid()) OR public.is_admin(auth.uid())));



  create policy "seller_penalties_admin_rw"
  on "public"."seller_penalties"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (COALESCE(p.role, ''::text) = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (COALESCE(p.role, ''::text) = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "conv_admin_update"
  on "public"."support_conversations"
  as permissive
  for update
  to public
using (public.is_admin());



  create policy "conv_user_insert"
  on "public"."support_conversations"
  as permissive
  for insert
  to public
with check (((user_id = auth.uid()) OR public.is_admin()));



  create policy "conv_user_read"
  on "public"."support_conversations"
  as permissive
  for select
  to public
using (((user_id = auth.uid()) OR public.is_admin()));



  create policy "msg_user_insert"
  on "public"."support_messages"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.support_conversations c
  WHERE ((c.id = support_messages.conversation_id) AND ((c.user_id = auth.uid()) OR public.is_admin())))));



  create policy "msg_user_read"
  on "public"."support_messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.support_conversations c
  WHERE ((c.id = support_messages.conversation_id) AND ((c.user_id = auth.uid()) OR public.is_admin())))));



  create policy "user_controls_admin_rw"
  on "public"."user_controls"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (COALESCE(p.role, ''::text) = ANY (ARRAY['admin'::text, 'super_admin'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (COALESCE(p.role, ''::text) = ANY (ARRAY['admin'::text, 'super_admin'::text]))))));



  create policy "webhook_events_admin_read"
  on "public"."webhook_events"
  as permissive
  for select
  to public
using (public.is_admin(auth.uid()));


CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.analytics_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_check_budget_violations AFTER INSERT ON public.analytics_events FOR EACH ROW EXECUTE FUNCTION public.check_budget_violations();

CREATE TRIGGER trigger_check_performance AFTER INSERT ON public.analytics_events FOR EACH ROW WHEN ((new.event_type = 'performance_metrics'::text)) EXECUTE FUNCTION public.check_performance_issues();

CREATE TRIGGER trigger_page_load_alert AFTER INSERT ON public.analytics_events FOR EACH ROW WHEN (((new.event_type = 'performance_metrics'::text) AND ((new.event_data ->> 'metric_name'::text) = 'page_load'::text))) EXECUTE FUNCTION public.check_page_load_threshold();

CREATE TRIGGER update_auction_winners_modtime BEFORE UPDATE ON public.auction_winners FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trg_commission_settings_single_active BEFORE INSERT OR UPDATE ON public.commission_settings FOR EACH ROW EXECUTE FUNCTION public.commission_settings_enforce_single_active();

CREATE TRIGGER update_insurance_policies_modtime BEFORE UPDATE ON public.insurance_policies FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER update_insurance_providers_modtime BEFORE UPDATE ON public.insurance_providers FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TRIGGER trg_payment_status_change AFTER UPDATE ON public.payments FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.update_order_on_payment_change();

CREATE TRIGGER update_order_on_payment_change AFTER UPDATE ON public.payments FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.update_order_on_payment_change();

CREATE TRIGGER trigger_notify_performance_alert BEFORE INSERT OR UPDATE ON public.performance_alerts FOR EACH ROW WHEN ((new.notification_status IS DISTINCT FROM 'sent'::text)) EXECUTE FUNCTION public.notify_performance_alert();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.performance_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_set_updated_at();

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_support_messages_touch_conversation AFTER INSERT ON public.support_messages FOR EACH ROW EXECUTE FUNCTION public.support_messages_touch_conversation();



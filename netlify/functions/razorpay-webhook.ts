import crypto from 'crypto';
import Razorpay from 'razorpay';
import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { createBalancedTransaction } from './_utils/ledger';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

    const signature = event.headers['x-razorpay-signature'] || event.headers['X-Razorpay-Signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return json(500, { error: 'Webhook secret not configured' });

    const body = event.body || '';
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) return json(400, { error: 'Invalid signature' });

    const payload = JSON.parse(body);
    const eventType = payload?.event;
    const payment = payload?.payload?.payment?.entity;

    if (!payment) return json(200, { ok: true });

    const key_id = process.env.RAZORPAY_KEY_ID as string;
    const key_secret = process.env.RAZORPAY_KEY_SECRET as string;
    const rzp = new Razorpay({ key_id, key_secret });

    // Enrich from order if needed
    let notes = payment.notes || {};
    if ((!notes || Object.keys(notes).length === 0) && payment.order_id) {
      try {
        const order = await rzp.orders.fetch(payment.order_id);
        notes = order?.notes || {};
      } catch {}
    }

    const supabaseUrl = process.env.SUPABASE_URL as string;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
    if (!supabaseUrl || !serviceRole) return json(500, { error: 'Supabase credentials missing' });
    const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    // Idempotency: skip if this payment.id already processed
    const eventId = payment.id as string;
    if (!eventId) return json(400, { error: 'Missing payment id' });
    const { data: existingEvt, error: existingErr } = await admin
      .from('webhook_events')
      .select('id')
      .eq('id', eventId)
      .maybeSingle();
    if (existingErr) console.error('webhook_events select error', existingErr);
    if (existingEvt?.id) {
      return json(200, { ok: true, skipped: true });
    }

    // Log event payload
    await admin.from('webhook_events').insert({
      id: eventId,
      provider: 'razorpay',
      event: eventType,
      payload
    });

    const metaType = notes?.type as string | undefined;
    const uid = (notes?.user_id as string | undefined) || payment?.email || '';
    const productId = notes?.product_id as string | null;
    const amount = Number(notes?.amount) || Math.round(Number(payment.amount) / 100);

    if (eventType === 'payment.captured' || eventType === 'payment.authorized') {
      if (metaType === 'wallet_topup') {
        const walletUserId = notes?.user_id as string | undefined;
        if (!walletUserId) {
          return json(400, { error: 'Missing user_id for wallet_topup' });
        }
        const amountCents = Number(payment.amount);
        if (!amountCents || amountCents <= 0) {
          return json(400, { error: 'Invalid amount for wallet_topup' });
        }
        const { data: wallet, error: walletErr } = await admin
          .from('wallet_accounts')
          .select('*')
          .eq('user_id', walletUserId)
          .maybeSingle();
        if (walletErr) {
          console.error('wallet_accounts select error', walletErr);
          return json(500, { error: 'Failed to load wallet account' });
        }
        let walletId = wallet?.id as string | undefined;
        let currentBalance = Number(wallet?.current_balance_cents) || 0;
        if (!walletId) {
          const { data: inserted, error: insertErr } = await admin
            .from('wallet_accounts')
            .insert({ user_id: walletUserId, currency: 'INR', current_balance_cents: amountCents })
            .select()
            .single();
          if (insertErr) {
            console.error('wallet_accounts insert error', insertErr);
            return json(500, { error: 'Failed to create wallet account' });
          }
          walletId = inserted.id as string;
          currentBalance = 0;
        }

        const newBalance = currentBalance + amountCents;

        // Double-entry ledger: credit user's generic wallet account from an implicit external source
        await createBalancedTransaction({
          client: admin as any,
          transactionType: 'WALLET_DEPOSIT',
          refType: 'razorpay_payment',
          refId: payment.id as string,
          metadata: {
            notes,
            eventType,
            razorpayPaymentId: payment.id,
            orderId: payment.order_id,
            userId: walletUserId,
            amountCents,
          },
          lines: [
            // Credit the user's wallet account in the generic ledger
            {
              userId: walletUserId,
              type: 'user_wallet',
              deltaCents: amountCents,
            },
          ],
        });

        // Legacy wallet ledger + balance update for backward compatibility with existing UI
        const { error: ledgerErr } = await admin.from('wallet_ledger').insert({
          wallet_id: walletId,
          entry_type: 'DEPOSIT',
          amount_cents: amountCents,
          balance_after_cents: newBalance,
          ref_type: 'razorpay_payment',
          ref_id: payment.id,
          metadata: { notes, eventType },
        });
        if (ledgerErr) {
          console.error('wallet_ledger insert error', ledgerErr);
          return json(500, { error: 'Failed to write wallet ledger entry' });
        }

        const { error: updateErr } = await admin
          .from('wallet_accounts')
          .update({ current_balance_cents: newBalance })
          .eq('id', walletId);
        if (updateErr) {
          console.error('wallet_accounts update error', updateErr);
          return json(500, { error: 'Failed to update wallet balance' });
        }
      } else if (metaType === 'token') {
        if (!uid) return json(400, { error: 'Missing user_id for token' });
        await admin.from('profiles').update({ token_fee_paid_at: new Date().toISOString() }).eq('id', uid);
      } else if (metaType === 'security') {
        if (!uid || !productId) return json(400, { error: 'Missing user_id/product_id for security' });
        await admin.from('deposits').insert({ user_id: uid, product_id: productId, type: 'security', amount, status: 'paid', payment_ref: payment.id }).select().single();
      } else if (metaType === 'settlement') {
        const auctionId = notes?.auction_id as string | undefined;
        if (!uid || !auctionId) {
          return json(400, { error: 'Missing user_id/auction_id for settlement' });
        }
        // Load auction to get seller_id, winner_id, final_price
        const { data: auction, error: auctionErr } = await admin
          .from('auctions')
          .select('id, winner_id, final_price, seller_id, product_id')
          .eq('id', auctionId)
          .maybeSingle();
        if (auctionErr) {
          console.error('webhook: settlement auction select error', auctionErr);
          return json(500, { error: 'Failed to load auction' });
        }
        if (!auction || !auction.winner_id || auction.final_price == null || !auction.seller_id) {
          return json(400, { error: 'Auction incomplete for settlement' });
        }
        // Idempotent: skip if settlement already exists for this auction
        const { data: existingSettle, error: settleSelectErr } = await admin
          .from('settlements')
          .select('id')
          .eq('auction_id', auctionId)
          .maybeSingle();
        if (settleSelectErr) {
          console.error('webhook: settlement select error', settleSelectErr);
        }
        if (!existingSettle?.id) {
          const finalPriceCents = Math.round(Number(auction.final_price) * 100);
          // Compute commissions from active commission_settings
          let buyerCommissionCents = 0;
          let sellerCommissionCents = 0;
          let platformFlatCents = 0;
          try {
            const { data: settings } = await admin
              .from('commission_settings')
              .select('buyer_commission_percent, seller_commission_percent, platform_flat_fee_cents')
              .eq('active', true)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            const buyerPct = Number(settings?.buyer_commission_percent ?? 10);
            const sellerPct = Number(settings?.seller_commission_percent ?? 3);
            platformFlatCents = Number(settings?.platform_flat_fee_cents ?? 0);
            buyerCommissionCents = Math.round(finalPriceCents * (buyerPct / 100));
            sellerCommissionCents = Math.round(finalPriceCents * (sellerPct / 100));
          } catch (err) {
            console.warn('webhook: commission_settings not found, using defaults 10%/3%/0');
            buyerCommissionCents = Math.round(finalPriceCents * 0.10);
            sellerCommissionCents = Math.round(finalPriceCents * 0.03);
            platformFlatCents = 0;
          }
          const totalCommissionCents = buyerCommissionCents + sellerCommissionCents + (platformFlatCents || 0);
          const netToSellerCents = finalPriceCents - sellerCommissionCents - (platformFlatCents || 0);
          const nowIso = new Date().toISOString();
          const { error: insertErr } = await admin
            .from('settlements')
            .insert({
              auction_id: auctionId,
              winner_id: auction.winner_id,
              seller_id: auction.seller_id,
              final_price_cents: finalPriceCents,
              fee_cents: totalCommissionCents,
              seller_cents: netToSellerCents,
              status: 'escrow_funded',
              escrow_funded_at: nowIso,
              metadata: {
                notes,
                razorpay_payment_id: payment.id,
                order_id: payment.order_id,
                platform_flat_cents: platformFlatCents,
                buyer_commission_cents: buyerCommissionCents,
                seller_commission_cents: sellerCommissionCents,
              },
            });
          if (insertErr) {
            console.error('webhook: settlement insert error', insertErr);
            return json(500, { error: 'Failed to record settlement' });
          }
        }
      } else if (metaType === 'visit') {
        if (!uid) return json(400, { error: 'Missing user_id for visit' });
        const state = (notes?.state as string | undefined) || null;
        const district = (notes?.district as string | undefined) || null;
        const city = (notes?.city as string | undefined) || null;
        const village = (notes?.village as string | undefined) || null;
        const visitProductId = (notes?.product_id as string | undefined) || null;
        await admin.from('inspection_visits').insert({ user_id: uid, product_id: visitProductId, state, district, city, village, amount, status: 'paid', payment_ref: payment.id }).select().maybeSingle();
      } else if (metaType === 'listing_fee') {
        const listingProductId = notes?.product_id as string | undefined;
        const listingSellerId = notes?.seller_id as string | undefined;
        if (!listingProductId || !listingSellerId) {
          return json(400, { error: 'Missing product_id/seller_id for listing_fee' });
        }

        await admin
          .from('listings')
          .update({ listing_fee_paid: true, updated_at: new Date().toISOString() })
          .eq('product_id', listingProductId)
          .eq('seller_id', listingSellerId);
      } else if (metaType === 'verification') {
        const vProductId = notes?.product_id as string | undefined;
        const vSellerId = notes?.seller_id as string | undefined;
        const vType = notes?.verification_type as string | undefined; // e.g. vehicle_basic, craft_premium
        const vCategory = notes?.category as string | undefined;
        const vPrice = Number(notes?.amount) || amount;

        if (!vProductId || !vSellerId || !vType || !vCategory) {
          return json(400, { error: 'Missing fields for verification payment' });
        }

        await admin.from('verification').insert({
          product_id: vProductId,
          seller_id: vSellerId,
          vtype: vType,
          category: vCategory,
          price: vPrice,
          status: 'in_progress',
          ownership_status: 'in_review',
        });
      } else if (metaType === 'subscription') {
        const subSellerId = notes?.seller_id as string | undefined;
        const plan = notes?.plan as 'starter' | 'pro' | 'premium' | undefined;
        const priceMonthly = Number(notes?.amount) || amount;
        const listingQuota = notes?.listing_quota !== undefined ? Number(notes?.listing_quota) : null;
        const boostQuota = notes?.boost_quota !== undefined ? Number(notes?.boost_quota) : null;

        if (!subSellerId || !plan) {
          return json(400, { error: 'Missing seller_id/plan for subscription payment' });
        }

        const startsAt = new Date().toISOString();
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await admin.from('subscriptions').insert({
          seller_id: subSellerId,
          plan,
          price_monthly: priceMonthly,
          listing_quota: listingQuota,
          boost_quota: boostQuota,
          starts_at: startsAt,
          expires_at: expiresAt.toISOString(),
          is_active: true,
        });
      } else if (metaType === 'boost') {
        const boostListingId = notes?.listing_id as string | undefined;
        const boostSellerId = notes?.seller_id as string | undefined;
        const btype = notes?.boost_type as 'day_1' | 'day_3' | 'day_7' | 'day_15' | undefined;
        const durationDays = Number(notes?.duration_days) || (btype === 'day_3' ? 3 : btype === 'day_7' ? 7 : btype === 'day_15' ? 15 : 1);
        const boostPrice = Number(notes?.amount) || amount;

        if (!boostListingId || !boostSellerId || !btype) {
          return json(400, { error: 'Missing listing_id/seller_id/boost_type for boost payment' });
        }

        const startsAt = new Date();
        const endsAt = new Date(startsAt.getTime());
        endsAt.setDate(endsAt.getDate() + durationDays);

        await admin.from('boosts').insert({
          listing_id: boostListingId,
          seller_id: boostSellerId,
          btype,
          duration_days: durationDays,
          price: boostPrice,
          source: 'paid',
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          status: 'active',
        });
      }
    }

    // Mark processed
    await admin.from('webhook_events').update({ processed_at: new Date().toISOString() }).eq('id', eventId);

    return json(200, { ok: true });
  } catch (e: any) {
    console.error('razorpay-webhook error', e);
    return json(500, { error: e.message || 'Internal error' });
  }
};

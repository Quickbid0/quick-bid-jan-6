import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../../../supabaseAdmin';

interface RecordSettlementParams {
  payoutId: string;
}

/**
 * Record double-entry ledger movements for a completed seller payout.
 *
 * This service assumes the following tables already exist:
 * - ledger_accounts(id, owner_type, owner_id, currency, account_type, status, created_at)
 * - ledger_entries(entry_id, transaction_id, account_id, debit, credit, balance_after, ts)
 * - wallet_balances(account_id, currency, available_balance, updated_at)
 */
export async function recordSettlementForPayout(params: RecordSettlementParams): Promise<void> {
  const { payoutId } = params;

  if (!supabaseAdmin) {
    console.warn('recordSettlementForPayout: supabaseAdmin not configured, skipping ledger write');
    return;
  }

  // 1) Load payout
  const { data: payout, error: payoutErr } = await supabaseAdmin
    .from('payouts')
    .select('id, seller_id, net_payout, currency, status')
    .eq('id', payoutId)
    .maybeSingle();

  if (payoutErr) {
    console.error('recordSettlementForPayout: payout select error', payoutErr);
    throw new Error('Failed to load payout for settlement');
  }

  if (!payout) {
    throw new Error(`Payout not found for id=${payoutId}`);
  }

  if (!payout.seller_id) {
    throw new Error(`Payout ${payoutId} has no seller_id`);
  }

  const netPayout = Number(payout.net_payout || 0);
  if (netPayout <= 0) {
    // Nothing to settle; avoid writing zero-amount ledger entries
    console.warn('recordSettlementForPayout: net_payout is not positive, skipping ledger write', {
      payoutId,
      netPayout,
    });
    return;
  }

  const currency: string = payout.currency || 'INR';

  // 2) Resolve or create accounts
  const sellerWalletAccountId = await getOrCreateAccount({
    ownerType: 'seller',
    ownerId: payout.seller_id as string,
    accountType: 'seller_wallet',
    currency,
  });

  const platformClearingAccountId = await getOrCreateAccount({
    ownerType: 'platform',
    ownerId: null,
    accountType: 'platform_clearing',
    currency,
  });

  // 3) Insert ledger entries as a single transaction_id
  const transactionId = randomUUID();
  const ts = new Date().toISOString();

  // Fetch current balances to compute balance_after (best-effort, not strictly transactional)
  const [sellerBalance, platformBalance] = await Promise.all([
    getCurrentBalance(sellerWalletAccountId, currency),
    getCurrentBalance(platformClearingAccountId, currency),
  ]);

  const newPlatformBalance = platformBalance - netPayout;
  const newSellerBalance = sellerBalance + netPayout;

  const { error: insertErr } = await supabaseAdmin.from('ledger_entries').insert([
    {
      transaction_id: transactionId,
      account_id: platformClearingAccountId,
      debit: netPayout,
      credit: 0,
      balance_after: newPlatformBalance,
      ts,
    },
    {
      transaction_id: transactionId,
      account_id: sellerWalletAccountId,
      debit: 0,
      credit: netPayout,
      balance_after: newSellerBalance,
      ts,
    },
  ]);

  if (insertErr) {
    console.error('recordSettlementForPayout: ledger_entries insert error', insertErr);
    throw new Error('Failed to write settlement ledger entries');
  }

  // 4) Upsert wallet balances to match the new balances
  const now = new Date().toISOString();

  const { error: balanceErr } = await supabaseAdmin.from('wallet_balances').upsert([
    {
      account_id: platformClearingAccountId,
      currency,
      available_balance: newPlatformBalance,
      updated_at: now,
    },
    {
      account_id: sellerWalletAccountId,
      currency,
      available_balance: newSellerBalance,
      updated_at: now,
    },
  ]);

  if (balanceErr) {
    console.error('recordSettlementForPayout: wallet_balances upsert error', balanceErr);
    // Do not throw here to avoid partial failure after entries were written; instead rely on reconciliation
  }
}

interface AccountLookup {
  ownerType: string;
  ownerId: string | null;
  accountType: string;
  currency: string;
}

async function getOrCreateAccount(params: AccountLookup): Promise<string> {
  const { ownerType, ownerId, accountType, currency } = params;

  const client = supabaseAdmin!;
  const { data: existing, error: selectErr } = await client
    .from('ledger_accounts')
    .select('id')
    .eq('owner_type', ownerType)
    .eq('account_type', accountType)
    .eq('currency', currency)
    .eq('owner_id', ownerId)
    .maybeSingle();

  if (selectErr) {
    console.error('getOrCreateAccount: select error', selectErr);
  } else if (existing?.id) {
    return existing.id as string;
  }

  const { data: inserted, error: insertErr } = await client
    .from('ledger_accounts')
    .insert({
      owner_type: ownerType,
      owner_id: ownerId,
      account_type: accountType,
      currency,
      status: 'active',
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('getOrCreateAccount: insert error', insertErr);
    throw new Error('Failed to create ledger account');
  }

  return inserted.id as string;
}

async function getCurrentBalance(accountId: string, currency: string): Promise<number> {
  const client = supabaseAdmin!;
  const { data, error } = await client
    .from('wallet_balances')
    .select('available_balance')
    .eq('account_id', accountId)
    .eq('currency', currency)
    .maybeSingle();

  if (error) {
    console.error('getCurrentBalance: select error', error);
    return 0;
  }

  if (!data || data.available_balance == null) {
    return 0;
  }

  return Number(data.available_balance) || 0;
}

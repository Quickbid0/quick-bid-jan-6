import { SupabaseClient } from '@supabase/supabase-js';

export type AccountType = 'platform' | 'seller' | 'escrow' | 'user_wallet';

export interface LedgerLine {
  accountId?: string;
  userId?: string | null;
  type: AccountType;
  currency?: string;
  /**
   * Signed amount in cents.
   * Positive = credit (increase balance), negative = debit (decrease balance).
   */
  deltaCents: number;
}

export interface CreateBalancedTransactionArgs {
  client: SupabaseClient;
  transactionType: string;
  refType?: string;
  refId?: string;
  metadata?: Record<string, any>;
  lines: LedgerLine[];
}

interface AccountRow {
  account_id: string;
  balance_cents: number;
}

/**
 * Creates a balanced transaction using the generic accounts / transactions / ledger_entries tables.
 *
 * Idempotency: if a transaction with the same (transactionType, refType, refId) already exists,
 * this function is a no-op and simply returns that transaction_id.
 */
export async function createBalancedTransaction(args: CreateBalancedTransactionArgs): Promise<string> {
  const { client, transactionType, refType, refId, metadata, lines } = args;

  if (!lines || lines.length === 0) {
    throw new Error('createBalancedTransaction: at least one ledger line is required');
  }

  // Idempotency on (type, ref_type, ref_id)
  if (refType && refId) {
    const { data: existing, error: existingErr } = await client
      .from('transactions')
      .select('transaction_id')
      .eq('type', transactionType)
      .eq('ref_type', refType)
      .eq('ref_id', refId)
      .maybeSingle();

    if (existingErr) {
      console.error('createBalancedTransaction: transactions select error', existingErr);
      throw new Error('Failed to check existing transaction');
    }

    if (existing?.transaction_id) {
      return existing.transaction_id as string;
    }
  }

  // Resolve or create accounts for each line
  const resolvedAccounts: AccountRow[] = [];

  for (const line of lines) {
    if (!line.accountId && !line.userId) {
      throw new Error('createBalancedTransaction: each line must have accountId or userId');
    }
    if (!line.deltaCents || !Number.isInteger(line.deltaCents)) {
      throw new Error('createBalancedTransaction: deltaCents must be a non-zero integer');
    }

    if (line.accountId) {
      const { data, error } = await client
        .from('accounts')
        .select('account_id, balance_cents')
        .eq('account_id', line.accountId)
        .maybeSingle();

      if (error) {
        console.error('createBalancedTransaction: accounts select by id error', error);
        throw new Error('Failed to load account by id');
      }
      if (!data) {
        throw new Error(`Account not found for account_id=${line.accountId}`);
      }
      resolvedAccounts.push({
        account_id: data.account_id as string,
        balance_cents: Number(data.balance_cents) || 0,
      });
    } else {
      const currency = line.currency || 'INR';
      const { data, error } = await client
        .from('accounts')
        .select('account_id, balance_cents')
        .eq('user_id', line.userId)
        .eq('type', line.type)
        .eq('currency', currency)
        .maybeSingle();

      if (error) {
        console.error('createBalancedTransaction: accounts select error', error);
        throw new Error('Failed to load account');
      }

      if (!data) {
        const { data: inserted, error: insertErr } = await client
          .from('accounts')
          .insert({
            user_id: line.userId,
            type: line.type,
            currency,
          })
          .select('account_id, balance_cents')
          .single();

        if (insertErr) {
          console.error('createBalancedTransaction: accounts insert error', insertErr);
          throw new Error('Failed to create account');
        }

        resolvedAccounts.push({
          account_id: inserted.account_id as string,
          balance_cents: Number(inserted.balance_cents) || 0,
        });
      } else {
        resolvedAccounts.push({
          account_id: data.account_id as string,
          balance_cents: Number(data.balance_cents) || 0,
        });
      }
    }
  }

  const { data: tx, error: txErr } = await client
    .from('transactions')
    .insert({
      type: transactionType,
      status: 'pending',
      ref_type: refType,
      ref_id: refId,
      metadata: metadata || {},
    })
    .select('transaction_id')
    .single();

  if (txErr) {
    console.error('createBalancedTransaction: transactions insert error', txErr);
    throw new Error('Failed to create transaction');
  }

  const transactionId = tx.transaction_id as string;

  // Insert entries and update balances
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const acc = resolvedAccounts[i];
    const delta = line.deltaCents;

    const debit = delta < 0 ? -delta : 0;
    const credit = delta > 0 ? delta : 0;
    const newBalance = acc.balance_cents + delta;

    const { error: entryErr } = await client.from('ledger_entries').insert({
      transaction_id: transactionId,
      account_id: acc.account_id,
      debit,
      credit,
      balance_after: newBalance,
    });

    if (entryErr) {
      console.error('createBalancedTransaction: ledger_entries insert error', entryErr);
      throw new Error('Failed to insert ledger entry');
    }

    const { error: acctUpdateErr } = await client
      .from('accounts')
      .update({ balance_cents: newBalance })
      .eq('account_id', acc.account_id);

    if (acctUpdateErr) {
      console.error('createBalancedTransaction: accounts update error', acctUpdateErr);
      throw new Error('Failed to update account balance');
    }

    // update in-memory balance for chained entries on same account
    acc.balance_cents = newBalance;
  }

  // Optional: mark transaction as completed
  const { error: txUpdateErr } = await client
    .from('transactions')
    .update({ status: 'completed' })
    .eq('transaction_id', transactionId);

  if (txUpdateErr) {
    console.error('createBalancedTransaction: transactions update error', txUpdateErr);
  }

  return transactionId;
}

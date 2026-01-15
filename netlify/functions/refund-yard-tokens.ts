import { Handler } from "@netlify/functions";

export const config = {
  schedule: "15 * * * *", // run at 15 minutes past every hour
};

const handler: Handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL as string;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: "Missing Supabase service env" };
  }

  try {
    // 1) Load all held yard tokens
    const tokensResp = await fetch(
      `${SUPABASE_URL}/rest/v1/yard_tokens?status=eq.held`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );

    if (!tokensResp.ok) {
      const text = await tokensResp.text();
      return { statusCode: 500, body: `Failed to load yard tokens: ${text}` };
    }

    const tokens: Array<{
      id: string;
      user_id: string;
      yard_id: string;
      amount: number;
    }> = await tokensResp.json();

    if (!tokens || tokens.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, refunded: 0 }) };
    }

    // Group tokens by yard
    const byYard: Record<string, typeof tokens> = {};
    for (const t of tokens) {
      byYard[t.yard_id] = byYard[t.yard_id] || [];
      byYard[t.yard_id].push(t);
    }

    let refundCount = 0;

    // 2) For each yard, determine winners from ended auctions
    for (const [yardId, yardTokens] of Object.entries(byYard)) {
      const auctionsResp = await fetch(
        `${SUPABASE_URL}/rest/v1/auctions?yard_id=eq.${encodeURIComponent(
          yardId
        )}&status=in.(ended,settled)`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );

      if (!auctionsResp.ok) {
        // Skip this yard, log and continue
        console.error(
          `Failed to load auctions for yard ${yardId}:`,
          await auctionsResp.text()
        );
        continue;
      }

      const auctions: Array<{ id: string; winner_user_id: string | null }> =
        await auctionsResp.json();

      const winnerSet = new Set(
        auctions
          .map((a) => a.winner_user_id)
          .filter((u): u is string => !!u)
      );

      // Tokens to refund: those whose user did NOT win in this yard
      const refundable = yardTokens.filter((t) => !winnerSet.has(t.user_id));
      if (refundable.length === 0) continue;

      for (const token of refundable) {
        // 3) Create a refund wallet transaction
        const refundTxResp = await fetch(
          `${SUPABASE_URL}/rest/v1/wallet_transactions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Prefer: "return=representation",
            },
            body: JSON.stringify([
              {
                user_id: token.user_id,
                amount: token.amount,
                transaction_type: "refund",
                status: "completed",
                yard_id: yardId,
                description: "Yard token refund",
              },
            ]),
          }
        );

        if (!refundTxResp.ok) {
          console.error(
            `Failed to insert refund tx for token ${token.id}:`,
            await refundTxResp.text()
          );
          continue;
        }

        const refundTxJson = await refundTxResp.json();
        const refundTxId = refundTxJson?.[0]?.id ?? null;

        // 4) Update wallet balance (increment by amount)
        const walletUpdateResp = await fetch(
          `${SUPABASE_URL}/rest/v1/rpc/update_wallet_balance`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              p_user_id: token.user_id,
              p_amount: token.amount,
            }),
          }
        );

        if (!walletUpdateResp.ok) {
          console.error(
            `Failed to update wallet for refund token ${token.id}:`,
            await walletUpdateResp.text()
          );
          continue;
        }

        // Best-effort notification for wallet refund
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify([
              {
                user_id: token.user_id,
                type: "wallet",
                title: "Wallet refund processed",
                message: `Your yard token amount of ${token.amount} has been refunded to your wallet.`,
                metadata: {
                  yard_id: yardId,
                  yard_token_id: token.id,
                  refund_transaction_id: refundTxId,
                },
                read: false,
                read_at: null,
              },
            ]),
          });
        } catch (notifErr) {
          console.error('refund-yard-tokens: failed to insert wallet notification', notifErr);
        }

        // 5) Mark yard token as refunded
        const updateTokenResp = await fetch(
          `${SUPABASE_URL}/rest/v1/yard_tokens?id=eq.${token.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              status: "refunded",
              refunded_transaction_id: refundTxId,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!updateTokenResp.ok) {
          console.error(
            `Failed to mark yard_token ${token.id} as refunded:`,
            await updateTokenResp.text()
          );
          continue;
        }

        refundCount += 1;
      }

      // Optionally: mark winners' tokens as forfeited
      const winnerTokens = yardTokens.filter((t) => winnerSet.has(t.user_id));
      if (winnerTokens.length > 0) {
        const ids = winnerTokens.map((t) => t.id).join(",");
        const forfeitedResp = await fetch(
          `${SUPABASE_URL}/rest/v1/yard_tokens?id=in.(${ids})`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              Prefer: "return=minimal",
            },
            body: JSON.stringify({
              status: "forfeited",
              updated_at: new Date().toISOString(),
            }),
          }
        );

        if (!forfeitedResp.ok) {
          console.error(
            `Failed to mark winner yard_tokens forfeited for yard ${yardId}:`,
            await forfeitedResp.text()
          );
        }
      }
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, refunded: refundCount }) };
  } catch (e: any) {
    console.error('refund-yard-tokens error', e);
    return { statusCode: 500, body: `Error: ${e.message}` };
  }
};

export { handler };

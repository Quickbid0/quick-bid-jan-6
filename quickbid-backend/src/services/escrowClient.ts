import fetch from 'node-fetch';

interface EscrowReleaseParams {
  escrowId: string;
  netToSellerCents: number;
  feeToPlatformCents: number;
  reference?: string;
}

export const escrowClient = {
  async release({ escrowId, netToSellerCents, feeToPlatformCents, reference }: EscrowReleaseParams) {
    const baseUrl = process.env.ESCROW_API_URL;
    const apiKey = process.env.ESCROW_API_KEY;

    if (!baseUrl || !apiKey) {
      console.error('escrowClient.release: ESCROW_API_URL or ESCROW_API_KEY not configured');
      return { ok: false, error: 'escrow_api_not_configured' };
    }

    const resp = await fetch(baseUrl.replace(/\/$/, '') + '/release', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ escrowId, netToSellerCents, feeToPlatformCents, reference }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      return { ok: false, status: resp.status, body } as const;
    }

    let json: any = null;
    try {
      json = await resp.json();
    } catch {
      // ignore
    }

    return { ok: true, reference: json?.reference } as const;
  },
};

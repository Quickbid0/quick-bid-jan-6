const API_BASE = import.meta.env.VITE_SERVER_URL;

export type DepositStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export interface InitiateDepositParams {
  amountCents: number;
  auctionId?: string;
}

export interface InitiateDepositResponse {
  depositId: string;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
  key_id: string;
}

export interface DepositStatusResponse {
  id: string;
  status: DepositStatus;
  amountCents: number;
}

export async function initiateDeposit(
  params: InitiateDepositParams,
): Promise<InitiateDepositResponse> {
  try {
    const res = await fetch(`${API_BASE}/deposits/initiate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`DEPOSIT_INIT_FAILED: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('DEPOSIT_INIT_FAILED: Network error');
  }
}

export async function getDepositStatus(
  depositId: string,
): Promise<DepositStatusResponse> {
  try {
    const res = await fetch(`${API_BASE}/deposits/${depositId}/status`, {
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`DEPOSIT_STATUS_FAILED: ${res.status} - ${errorText}`);
    }

    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('DEPOSIT_STATUS_FAILED: Network error');
  }
}

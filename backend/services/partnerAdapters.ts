import type { Pool } from 'pg';

export type LoanApplicationForAdapter = {
  id: string;
  userId: string;
  productId: string;
  requestedAmount: number;
  tenorMonths: number;
  loanType?: string;
  documents: Array<{ path: string; type?: string }>;
};

export type InsuranceApplicationForAdapter = {
  id: string;
  userId: string;
  productId: string;
  premiumAmount?: number;
  documents: Array<{ path: string; type?: string }>;
};

export type SendLeadResult = {
  status: 'sent' | 'queued' | 'failed';
  partnerRefId?: string;
  partnerMessage?: string;
  rawResponse?: any;
};

export interface LoanPartnerAdapter {
  sendLead(app: LoanApplicationForAdapter, providerConfig: any): Promise<SendLeadResult>;
  checkStatus(partnerRefId: string, providerConfig: any): Promise<{ status: string; details?: any }>;
}

export interface InsurancePartnerAdapter {
  sendLead(app: InsuranceApplicationForAdapter, providerConfig: any): Promise<SendLeadResult>;
  checkStatus(partnerRefId: string, providerConfig: any): Promise<{ status: string; details?: any }>;
}

class DemoBankAdapter implements LoanPartnerAdapter {
  async sendLead(app: LoanApplicationForAdapter, providerConfig: any): Promise<SendLeadResult> {
    const partnerRefId = `DEMO-${Date.now()}-${app.id}`;
    const partnerMessage = 'Lead received by DemoBank (mock).';

    return {
      status: 'sent',
      partnerRefId,
      partnerMessage,
      rawResponse: { provider: 'DemoBank', env: providerConfig?.api_base_url || 'mock' },
    };
  }

  async checkStatus(partnerRefId: string): Promise<{ status: string; details?: any }> {
    return {
      status: 'approved',
      details: { partnerRefId },
    };
  }
}

class SecureInsureAdapter implements InsurancePartnerAdapter {
  async sendLead(app: InsuranceApplicationForAdapter, providerConfig: any): Promise<SendLeadResult> {
    const partnerRefId = `SECURE-${Date.now()}-${app.id}`;
    const partnerMessage = 'Lead received by SecureInsure (mock).';

    return {
      status: 'sent',
      partnerRefId,
      partnerMessage,
      rawResponse: { provider: 'SecureInsure', env: providerConfig?.api_base_url || 'mock' },
    };
  }

  async checkStatus(partnerRefId: string): Promise<{ status: string; details?: any }> {
    return {
      status: 'active',
      details: { partnerRefId },
    };
  }
}

const demoBankAdapter = new DemoBankAdapter();
const secureInsureAdapter = new SecureInsureAdapter();

export function getLoanPartnerAdapter(adapterKey: string): LoanPartnerAdapter | undefined {
  switch (adapterKey) {
    case 'demo_bank':
      return demoBankAdapter;
    default:
      return undefined;
  }
}

export function getInsurancePartnerAdapter(adapterKey: string): InsurancePartnerAdapter | undefined {
  switch (adapterKey) {
    case 'secure_insure':
      return secureInsureAdapter;
    default:
      return undefined;
  }
}

export async function loadLoanProviderConfig(pool: Pool, providerId: string) {
  const { rows } = await pool.query(
    `select id, name, api_base_url, partner_type, country, dsa_code, commission_percent,
            webhook_secret, status, hmac_header_name, adapter_key
       from public.loan_providers
      where id = $1`,
    [providerId],
  );
  return rows[0];
}

export async function loadInsuranceProviderConfig(pool: Pool, providerId: string) {
  const { rows } = await pool.query(
    `select id, name, api_base_url, insurance_type, commission_percent,
            webhook_secret, status, hmac_header_name, adapter_key
       from public.insurance_providers
      where id = $1`,
    [providerId],
  );
  return rows[0];
}

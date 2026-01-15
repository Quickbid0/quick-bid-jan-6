import { partnerWebhookHandler } from '../backend/controllers/partnerWebhookController';
import { computeHmacSha256 } from '../backend/services/hmacService';

interface MockQueryCall {
  sql: string;
  params: any[];
}

describe('partnerWebhookHandler integration-ish flow', () => {
  it('updates loan application and creates partner_commission on approved webhook', async () => {
    const calls: MockQueryCall[] = [];

    const mockPool = {
      query: jest.fn(async (sql: string, params?: any[]) => {
        calls.push({ sql, params: params || [] });

        if (sql.includes('from public.loan_providers') && sql.includes('from public.insurance_providers')) {
          // provider lookup by adapter_key
          return {
            rows: [
              {
                partner_type: 'loan',
                partner_id: 'provider-1',
                webhook_secret: 'demo-secret',
                hmac_header_name: 'X-Partner-Signature',
                adapter_key: 'demo_bank',
              },
            ],
          } as any;
        }

        if (sql.includes('update public.loan_applications')) {
          return {
            rows: [
              {
                id: 'loan-app-1',
                user_id: 'user-1',
                requested_amount: 200000,
                commission_amount: null,
                provider_id: 'provider-1',
              },
            ],
          } as any;
        }

        if (sql.includes('select commission_percent from public.loan_providers')) {
          return {
            rows: [{ commission_percent: 2.5 }],
          } as any;
        }

        // default: inserts etc.
        return { rows: [] } as any;
      }),
    } as any;

    const payload = {
      event_type: 'loan_status_update',
      partner_ref_id: 'DEMO-REF-1',
      status: 'approved',
    };

    const rawBody = JSON.stringify(payload);
    const secret = 'demo-secret';
    const hex = computeHmacSha256(secret, rawBody);
    const signature = `sha256=${hex}`;

    const req: any = {
      params: { partnerKey: 'demo_bank' },
      headers: {
        'x-partner-signature': signature,
      },
      body: payload,
      rawBody,
      header(name: string) {
        const key = name.toLowerCase();
        return (this.headers as any)[key];
      },
    };

    let statusCode = 200;
    let jsonBody: any = null;

    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(body: any) {
        jsonBody = body;
        return this;
      },
    };

    const handler = partnerWebhookHandler(mockPool);
    await handler(req, res);

    expect(statusCode).toBe(200);
    expect(jsonBody).toEqual({ status: 'ok' });

    const updateCall = calls.find((c) => c.sql.includes('update public.loan_applications'));
    expect(updateCall).toBeDefined();
    expect(updateCall?.params[0]).toBe('approved');
    expect(updateCall?.params[2]).toBe('DEMO-REF-1');

    const commissionInsert = calls.find((c) => c.sql.includes('insert into public.partner_commissions'));
    expect(commissionInsert).toBeDefined();
    expect(commissionInsert?.params[0]).toBe('provider-1');
    // params: [partner_id, application_id, commission_amount]
    expect(typeof commissionInsert?.params[2]).toBe('number');
    // status is hardcoded as 'pending' inside the SQL, not passed as a parameter
    expect(commissionInsert?.sql).toContain("values ('loan', $1, 'loan', $2, $3, 'pending')");
  });
});

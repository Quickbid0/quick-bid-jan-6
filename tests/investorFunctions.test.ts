import { handler as investorCreate } from '../netlify/functions/investor-create';
import { handler as investmentCreate } from '../netlify/functions/investment-create';
import { handler as investmentApprove } from '../netlify/functions/investment-approve';
import { handler as investmentPayout } from '../netlify/functions/investment-payout';

jest.mock('@supabase/supabase-js', () => {
  const ledgerSelectChain = {
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({
      data: [{ balance_after: 50000 }],
      error: null,
    }),
  };

  const ledgerTable = {
    select: jest.fn().mockReturnValue(ledgerSelectChain),
    insert: jest.fn().mockResolvedValue({ error: null }),
  };

  const investmentsSelectChain = {
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: { id: 'inv-1', investor_id: 'investor-1' },
      error: null,
    }),
  };

  const investmentsTable = {
    select: jest.fn().mockReturnValue(investmentsSelectChain),
  };

  const investorsSelectChain = {
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: {
        full_name: 'Test Investor',
        email: 'test@example.com',
        bank_account: { account_number: '1234567890' },
      },
      error: null,
    }),
  };

  const investorsTable = {
    select: jest.fn().mockReturnValue(investorsSelectChain),
  };

  const from = (table: string) => {
    if (table === 'investor_ledger_entries') return ledgerTable as any;
    if (table === 'investments') return investmentsTable as any;
    if (table === 'investors') return investorsTable as any;
    return ledgerTable as any;
  };

  return {
    createClient: jest.fn(() => ({ from })),
  };
});

const makeEvent = (overrides: Partial<any> = {}) => ({
  httpMethod: 'POST',
  body: '',
  headers: {},
  queryStringParameters: {},
  ...overrides,
});

const makeContext = () => ({} as any);

describe('Investor Netlify functions - basic validation', () => {
  test('investor-create rejects non-POST', async () => {
    const res: any = await investorCreate(makeEvent({ httpMethod: 'GET' }) as any, makeContext());
    expect(res.statusCode).toBe(405);
  });

  test('investor-create requires full_name and email', async () => {
    const res: any = await investorCreate(makeEvent({ body: JSON.stringify({}) }) as any, makeContext());
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('investment-create rejects non-POST', async () => {
    const res: any = await investmentCreate(makeEvent({ httpMethod: 'GET' }) as any, makeContext());
    expect(res.statusCode).toBe(405);
  });

  test('investment-approve rejects missing id', async () => {
    const res: any = await investmentApprove(
      makeEvent({ httpMethod: 'POST', queryStringParameters: {} }) as any,
      makeContext(),
    );
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('investment-payout rejects non-POST', async () => {
    const res: any = await investmentPayout(makeEvent({ httpMethod: 'GET' }) as any, makeContext());
    expect(res.statusCode).toBe(405);
  });

  test('investment-payout requires investment_id and amount', async () => {
    const res: any = await investmentPayout(makeEvent({ body: JSON.stringify({}) }) as any, makeContext());
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  test('investment-payout returns 200 on happy path', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.INVESTOR_EMAILS_ENABLED = 'false';

    const event = makeEvent({
      body: JSON.stringify({
        investment_id: 'inv-1',
        amount: 10000,
        metadata: { txn_ref: 'TEST-UTR' },
      }),
    });

    const res: any = await investmentPayout(event as any, makeContext());
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(body.balance_after).toBe(40000); // 50000 - 10000 from mock
  });
});

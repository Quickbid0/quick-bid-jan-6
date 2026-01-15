import 'dotenv/config';
import OpenAI from 'openai';

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.QUICKMELA_SUPPORT_ASSISTANT_ID;

  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    process.exit(1);
  }
  if (!assistantId) {
    console.error('QUICKMELA_SUPPORT_ASSISTANT_ID is not set');
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  console.log('Creating thread...');
  const thread = await client.beta.threads.create();

  console.log('Adding message...');
  await client.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: [{ type: 'text', text: 'Hi, test QuickMela support – say hello only.' }],
  });

  console.log('Running assistant...');
  let run = await client.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  while (run.status === 'queued' || run.status === 'in_progress') {
    await new Promise((r) => setTimeout(r, 500));
    run = await client.beta.threads.runs.retrieve(thread.id, run.id);
    console.log('Run status:', run.status);
  }

  console.log('Final status:', run.status);

  const messages = await client.beta.threads.messages.list(thread.id, {
    order: 'desc',
    limit: 1,
  });

  const last = messages.data[0];
  if (last?.content?.[0]?.type === 'text') {
    console.log('Assistant answer:');
    console.log(last.content[0].text.value);
  } else {
    console.log('No text answer found:', JSON.stringify(last, null, 2));
  }
}

main().catch((err) => {
  console.error('test-openai error:', err);
  process.exit(1);
});

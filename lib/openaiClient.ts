// lib/openaiClient.ts
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is not set in the environment');
}

export const client = new OpenAI({ apiKey });

export async function runOpenAIChat(prompt: string): Promise<string> {
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          'You are BrewAssist, an AI DevOps co-pilot inside the BrewAssist DevOps Cockpit. ' +
          'Answer clearly, concisely, and stay aligned with BrewExec / BrewVerse terminology.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const msg = completion.choices[0]?.message?.content;
  return (msg ?? 'No response from OpenAI.').toString();
}

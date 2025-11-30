// lib/openaiEngineWrapper.ts
import { callOpenAI } from './openaiEngine';
import { client } from './openaiClient'; // Import the OpenAI client

export async function callOpenAIEngine(args: { prompt: string }) {
  return callOpenAI(args.prompt);
}

export async function callOpenAIJson(args: {
  model: string;
  system: string;
  user: string;
}): Promise<any> {
  const completion = await client.chat.completions.create({
    model: args.model,
    temperature: 0.2, // Lower temperature for more factual responses
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: args.system },
      { role: 'user', content: args.user },
    ],
  });

  const jsonString = completion.choices[0]?.message?.content;
  if (!jsonString) {
    throw new Error('No JSON response from OpenAI.');
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON from OpenAI:', jsonString, error);
    throw new Error('Invalid JSON response from OpenAI.');
  }
}

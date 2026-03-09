import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getClaudeClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const CLAUDE_MODEL = 'gpt-4o-mini';

export function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
}

export async function callClaude(prompt: string): Promise<string> {
  const openai = getClaudeClient();

  const response = await openai.chat.completions.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return content;
}

export async function callClaudeForJson<T>(prompt: string): Promise<T> {
  const text = await callClaude(prompt);
  const cleaned = stripJsonFences(text);

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse OpenAI response as JSON: ${cleaned.slice(0, 200)}`
    );
  }
}

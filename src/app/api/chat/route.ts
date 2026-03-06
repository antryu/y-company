import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { agentPersonas, SYSTEM_PROMPT_PREFIX } from '@/data/personas';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { agentId, message, history } = await req.json();

    if (!agentId || !message) {
      return NextResponse.json({ error: 'Missing agentId or message' }, { status: 400 });
    }

    const persona = agentPersonas[agentId];
    if (!persona) {
      return NextResponse.json({ error: 'Unknown agent' }, { status: 404 });
    }

    const systemPrompt = `${SYSTEM_PROMPT_PREFIX}\n\n${persona}`;

    const messages = [
      ...(history || []).slice(-10).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}

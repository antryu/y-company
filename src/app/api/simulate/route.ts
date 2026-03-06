import { NextResponse } from 'next/server';

// Simulation state is managed client-side, but this route
// can be used for AI-powered agent interactions via Gemini

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST() {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Generate a random agent interaction or reflection
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `You are a simulation engine for _y Holdings, a fictional company with 29 AI agents.
Generate a brief, realistic workplace interaction or observation.
Keep it to 1-2 sentences in Korean. Be specific about what the agent is doing.
Examples: "Buildy가 새 API 엔드포인트의 코드 리뷰를 완료했다." or "Quanty와 Tradey가 오후 시장 전략에 대해 논의 중이다."`,
          }],
        },
        contents: [{
          role: 'user',
          parts: [{ text: 'Generate one workplace activity for the simulation.' }],
        }],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.9,
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ activity: text });
  } catch (error) {
    console.error('Simulate API error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}

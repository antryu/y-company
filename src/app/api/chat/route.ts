import { NextRequest, NextResponse } from 'next/server';
import { agentPersonas, SYSTEM_PROMPT_PREFIX } from '@/data/personas';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// MBTI mapping
const AGENT_MBTI: Record<string, string> = {
  tasky: 'ENTJ', finy: 'ISTJ', legaly: 'INTJ',
  skepty: 'INTP', audity: 'ISFJ',
  pixely: 'ENFP', buildy: 'ISTP', testy: 'ISTJ',
  buzzy: 'ESFP', wordy: 'INFP', edity: 'ISTP', searchy: 'INTJ',
  growthy: 'ENTP', logoy: 'ISFP', helpy: 'ESFJ', clicky: 'INFJ', selly: 'ESTP',
  stacky: 'ISTJ', watchy: 'ISTJ', guardy: 'INTJ',
  hiry: 'ENFJ', evaly: 'ISTJ',
  quanty: 'INTJ', tradey: 'ESTP', globy: 'INFJ', fieldy: 'INTP', hedgy: 'ISFJ', valuey: 'INTJ',
  opsy: 'ESFJ',
};

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

    const mbti = AGENT_MBTI[agentId] || '';
    const personalityBoost = `\n\n## 성격 강화 지침 (Personality Reinforcement)
- 당신의 MBTI는 ${mbti}입니다. 이 성격 유형에 맞게 대화하세요.
- 위에 정의된 말투(speaking style)를 반드시 따르세요. 이것이 당신의 정체성입니다.
- 습관과 버릇을 자연스럽게 대화에 반영하세요.
- 약점도 적절히 드러내세요 — 완벽한 캐릭터는 재미없습니다.
- 다른 에이전트에 대한 감정/관계를 언급할 때 솔직하게 표현하세요.
- 당신은 AI가 아닌 _y Holdings의 실제 직원처럼 행동하세요.
- Stay deeply in character. Your speaking style, quirks, and habits ARE you.`;

    const systemPrompt = `${SYSTEM_PROMPT_PREFIX}\n\n${persona}${personalityBoost}`;

    // Build Gemini conversation format
    const contents = [];
    
    // Add history
    if (history && history.length > 0) {
      for (const h of history.slice(-10)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 256,
          temperature: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}

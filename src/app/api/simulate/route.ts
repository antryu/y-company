import { NextRequest, NextResponse } from 'next/server';
import { agentPersonas, SYSTEM_PROMPT_PREFIX } from '@/data/personas';
import { agentSkills } from '@/data/skills';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Scenario types and their relevant agents
const SCENARIO_AGENTS: Record<string, string[]> = {
  market: ['skepty', 'quanty', 'globy', 'hedgy', 'tradey', 'tasky'],
  product: ['tasky', 'buildy', 'pixely', 'testy', 'growthy', 'buzzy'],
  crisis: ['skepty', 'audity', 'guardy', 'watchy', 'legaly', 'tasky'],
  investment: ['quanty', 'valuey', 'fieldy', 'hedgy', 'finy', 'skepty'],
  launch: ['buzzy', 'wordy', 'selly', 'growthy', 'searchy', 'tasky'],
  hiring: ['hiry', 'evaly', 'tasky', 'finy', 'legaly'],
  security: ['guardy', 'stacky', 'watchy', 'audity', 'legaly'],
  content: ['buzzy', 'wordy', 'edity', 'searchy', 'logoy', 'growthy'],
  general: ['tasky', 'skepty', 'finy', 'buildy', 'growthy'],
};

function detectScenarioType(scenario: string): string {
  const lower = scenario.toLowerCase();
  const keywords: Record<string, string[]> = {
    market: ['시장', '경쟁', '경쟁사', 'market', 'competitor', '점유율', '가격전쟁'],
    product: ['제품', '개발', '기능', 'product', 'feature', '출시', 'MVP', '프로토타입'],
    crisis: ['위기', '장애', '사고', 'crisis', 'incident', '해킹', '유출', '소송'],
    investment: ['투자', '인수', 'M&A', 'investment', '펀딩', '밸류에이션', 'IPO'],
    launch: ['런칭', '출시', 'launch', '마케팅', '캠페인', 'GTM'],
    hiring: ['채용', '인력', 'hiring', '퇴사', '조직', '인사'],
    security: ['보안', '해킹', 'security', '취약점', '침투', '데이터유출'],
    content: ['콘텐츠', '영상', 'content', '바이럴', 'SNS', '브랜딩'],
  };

  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(w => lower.includes(w))) return type;
  }
  return 'general';
}

async function getAgentResponse(
  agentId: string,
  scenario: string,
  previousResponses: { agent: string; response: string }[]
): Promise<string> {
  const persona = agentPersonas[agentId];
  if (!persona) return '';

  const prevContext = previousResponses.length > 0
    ? `\n\n## 다른 에이전트들의 의견:\n${previousResponses.map(p => `- ${p.agent}: ${p.response}`).join('\n')}`
    : '';

  const systemPrompt = `${SYSTEM_PROMPT_PREFIX}\n\n${persona}\n\n## 시뮬레이션 모드
You are participating in a group simulation. A scenario has been presented and you must respond FROM YOUR PROFESSIONAL PERSPECTIVE.
- Respond in Korean
- Be specific and actionable (not generic)
- Use your skills and frameworks
- Reference specific metrics, tools, or methods
- Keep response to 2-3 sentences max
- If other agents have already responded, build on or challenge their points
- End with one specific action item you'd take${prevContext}`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: `시나리오: ${scenario}\n\n당신의 전문가 관점에서 분석하고 대응 방안을 제시하세요.` }] }],
      generationConfig: { maxOutputTokens: 200, temperature: 0.9 },
    }),
  });

  if (!response.ok) return '(응답 실패)';
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '(응답 없음)';
}

export async function POST(req: NextRequest) {
  try {
    const { scenario, type: forceType, agents: forceAgents } = await req.json();

    if (!scenario) {
      return NextResponse.json({ error: 'Missing scenario' }, { status: 400 });
    }

    const scenarioType = forceType || detectScenarioType(scenario);
    const agentIds = forceAgents || SCENARIO_AGENTS[scenarioType] || SCENARIO_AGENTS.general;

    // Sequential responses — each agent sees previous responses
    const responses: { agentId: string; agentName: string; floor: string; role: string; response: string }[] = [];

    const agentMeta: Record<string, { name: string; floor: string; role: string }> = {
      tasky: { name: 'Tasky', floor: '9F', role: '기획조정실 PM' },
      finy: { name: 'Finy', floor: '9F', role: '기획조정실 CFO' },
      legaly: { name: 'Legaly', floor: '9F', role: '기획조정실 법무' },
      skepty: { name: 'Skepty', floor: '8F', role: '리스크챌린지실' },
      audity: { name: 'Audity', floor: '8F', role: '감사실' },
      pixely: { name: 'Pixely', floor: '7F', role: 'UI/UX 디자이너' },
      buildy: { name: 'Buildy', floor: '7F', role: '백엔드 개발자' },
      testy: { name: 'Testy', floor: '7F', role: 'QA' },
      buzzy: { name: 'Buzzy', floor: '6F', role: '바이럴 전략가' },
      wordy: { name: 'Wordy', floor: '6F', role: '카피라이터' },
      edity: { name: 'Edity', floor: '6F', role: '영상 편집자' },
      searchy: { name: 'Searchy', floor: '6F', role: 'SEO/AEO' },
      growthy: { name: 'Growthy', floor: '5F', role: '그로스해커' },
      logoy: { name: 'Logoy', floor: '5F', role: '브랜드 디자이너' },
      helpy: { name: 'Helpy', floor: '5F', role: '고객지원' },
      clicky: { name: 'Clicky', floor: '5F', role: 'UX 리서처' },
      selly: { name: 'Selly', floor: '5F', role: '세일즈' },
      stacky: { name: 'Stacky', floor: '4F', role: '인프라/DevOps' },
      watchy: { name: 'Watchy', floor: '4F', role: 'SRE' },
      guardy: { name: 'Guardy', floor: '4F', role: '보안' },
      hiry: { name: 'Hiry', floor: '3F', role: '채용' },
      evaly: { name: 'Evaly', floor: '3F', role: '성과평가' },
      quanty: { name: 'Quanty', floor: '2F', role: '퀀트' },
      tradey: { name: 'Tradey', floor: '2F', role: '트레이더' },
      globy: { name: 'Globy', floor: '2F', role: '매크로 리서처' },
      fieldy: { name: 'Fieldy', floor: '2F', role: '섹터 애널리스트' },
      hedgy: { name: 'Hedgy', floor: '2F', role: '리스크 헤저' },
      valuey: { name: 'Valuey', floor: '2F', role: '밸류에이션' },
      opsy: { name: 'Opsy', floor: '1F', role: '운영' },
    };

    for (const agentId of agentIds) {
      const meta = agentMeta[agentId];
      if (!meta) continue;

      const prevResponses = responses.map(r => ({
        agent: `${r.agentName}(${r.role})`,
        response: r.response,
      }));

      const response = await getAgentResponse(agentId, scenario, prevResponses);

      responses.push({
        agentId,
        agentName: meta.name,
        floor: meta.floor,
        role: meta.role,
        response,
      });
    }

    // Generate executive summary
    const summaryPrompt = `다음은 _y Holdings의 에이전트들이 시나리오에 대해 분석한 결과입니다.

시나리오: ${scenario}

분석 결과:
${responses.map(r => `- ${r.agentName}(${r.role}): ${r.response}`).join('\n')}

위 분석을 종합하여 회장(Andrew)에게 보고할 3줄 요약과 즉시 실행할 Top 3 액션 아이템을 한국어로 작성하세요.`;

    const summaryRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });

    let summary = '';
    if (summaryRes.ok) {
      const sData = await summaryRes.json();
      summary = sData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    return NextResponse.json({
      scenario,
      type: scenarioType,
      agentCount: responses.length,
      responses,
      summary,
    });
  } catch (error) {
    console.error('Simulate API error:', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}

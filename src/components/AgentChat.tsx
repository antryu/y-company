'use client';

import { useState, useRef, useEffect } from 'react';
import { Agent, floors } from '@/data/floors';
import { Lang, t } from '@/data/i18n';
import { agentSkills } from '@/data/skills';

interface Props {
  agent: Agent;
  onClose: () => void;
  lang: Lang;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// MBTI mapping for agents (personality-based)
const AGENT_MBTI: Record<string, string> = {
  andrew: 'ENTJ',
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

function getAgentSuggestions(agent: Agent, lang: Lang): string[] {
  const role = agent.role.toLowerCase();
  if (lang === 'ko') {
    const base = [
      '오늘 무슨 일 하고 있어요?',
      '당신의 부서에 대해 알려주세요',
    ];
    if (role.includes('dev') || role.includes('design') || role.includes('qa')) {
      base.push('현재 진행 중인 프로젝트는?');
    } else if (role.includes('trading') || role.includes('quant') || role.includes('valuation')) {
      base.push('요즘 시장 상황은 어때요?');
    } else if (role.includes('marketing') || role.includes('growth') || role.includes('sales')) {
      base.push('최근 마케팅 성과는?');
    } else {
      base.push('다른 에이전트와 협업은 어때요?');
    }
    return base;
  }
  const base = [
    'What are you working on today?',
    'Tell me about your department',
  ];
  if (role.includes('dev') || role.includes('design') || role.includes('qa')) {
    base.push('What projects are in progress?');
  } else if (role.includes('trading') || role.includes('quant') || role.includes('valuation')) {
    base.push("How's the market looking?");
  } else if (role.includes('marketing') || role.includes('growth') || role.includes('sales')) {
    base.push('How are recent campaigns performing?');
  } else {
    base.push('How do you collaborate with others?');
  }
  return base;
}

export function AgentChat({ agent, onClose, lang }: Props) {
  const text = t[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const skills = agentSkills[agent.id]?.skills?.slice(0, 3) || [];
  const mbti = AGENT_MBTI[agent.id] || '—';
  const floorInfo = floors.find((f) => f.level === agent.floor);
  const suggestions = getAgentSuggestions(agent, lang);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: msg.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: msg.trim(),
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: text.chatError }]);
    } finally {
      setLoading(false);
    }
  };

  const statusColor =
    agent.status === 'working' ? '#22c55e' :
    agent.status === 'meeting' ? '#f59e0b' : '#6b7280';

  const statusText =
    agent.status === 'working' ? text.working :
    agent.status === 'meeting' ? text.meeting : text.idle;

  return (
    <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[420px] bg-[#060b14] z-50 flex flex-col animate-slideIn border-l border-white/5">
      {/* Header with agent profile */}
      <div className="px-4 pt-4 pb-3 glass-strong shrink-0">
        {/* Close + status row */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg glass hover:bg-white/10 text-gray-400 hover:text-white transition text-sm"
          >
            ✕
          </button>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}80` }}
            />
            <span className="text-[10px] text-gray-400">{statusText}</span>
          </div>
        </div>

        {/* Agent profile */}
        <div className="flex items-center gap-4">
          {/* Large avatar */}
          <div className="relative shrink-0">
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg">
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-amber-400/60 bg-gradient-to-br from-gray-800 to-gray-900">
                  {agent.name[0]}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate">
              {agent.name}
              <span className="text-gray-500 font-normal text-xs ml-1.5">#{agent.number}</span>
            </h3>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              {agent.role}
            </p>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-300/80 font-medium">
                {mbti}
              </span>
              {floorInfo && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">
                  {floorInfo.emoji} {floorInfo.label}
                </span>
              )}
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400">
                {agent.department}
              </span>
            </div>
          </div>
        </div>

        {/* Skill tags */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {skills.map((s, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-0.5 rounded-full glass text-gray-300"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-4 pt-4">
            <p className="text-xs text-gray-500 text-center">
              {text.chatWith} {agent.name}
            </p>

            {/* Suggested questions */}
            <div className="space-y-2">
              <p className="text-[10px] text-gray-600 text-center">{text.suggestedQuestions}</p>
              <div className="flex flex-col gap-1.5 stagger-children">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left px-3 py-2 text-[11px] rounded-xl glass hover:bg-white/10 text-gray-300 transition"
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0 mr-2 mt-1">
                {agent.image ? (
                  <img src={agent.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {agent.name[0]}
                  </div>
                )}
              </div>
            )}
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500/20 text-amber-50 rounded-br-md border border-amber-400/10'
                  : 'glass text-gray-200 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0 mr-2 mt-1">
              {agent.image ? (
                <img src={agent.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                  {agent.name[0]}
                </div>
              )}
            </div>
            <div className="glass px-3 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 glass-strong shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={text.typeMessage}
            className="flex-1 glass rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 text-amber-300 text-sm font-medium transition border border-amber-400/20"
          >
            {text.send}
          </button>
        </form>
      </div>
    </div>
  );
}

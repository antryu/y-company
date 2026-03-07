'use client';

import { useState, useRef, useEffect } from 'react';
import { Agent } from '@/data/floors';
import { Lang, t } from '@/data/i18n';

interface Props {
  agent: Agent;
  onClose: () => void;
  lang: Lang;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS: Record<Lang, string[]> = {
  ko: [
    '오늘 무슨 일 하고 있어요?',
    '당신의 부서에 대해 알려주세요',
    '회사에서 가장 좋아하는 점은?',
    '다른 에이전트와 협업은 어때요?',
  ],
  en: [
    'What are you working on today?',
    'Tell me about your department',
    "What's your favorite thing about the company?",
    'How do you collaborate with others?',
  ],
};

export function AgentChat({ agent, onClose, lang }: Props) {
  const text = t[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="fixed inset-0 md:inset-auto md:right-0 md:top-0 md:bottom-0 md:w-[400px] bg-[#0a0f1a] z-50 flex flex-col animate-slideIn border-l border-white/5">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0f1520]/90 backdrop-blur border-b border-white/5 shrink-0">
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-sm"
        >
          ✕
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-white/10 shrink-0">
          {agent.image ? (
            <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-400">
              {agent.name[0]}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white truncate">
            {agent.name}
            <span className="text-gray-500 font-normal ml-1">#{agent.number}</span>
          </h3>
          <p className="text-[10px] text-gray-500 truncate">
            {agent.department} · {agent.role}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            agent.status === 'working' ? 'bg-green-500' :
            agent.status === 'meeting' ? 'bg-amber-500' : 'bg-gray-500'
          }`} />
          <span className="text-[10px] text-gray-400">
            {agent.status === 'working' ? text.working :
             agent.status === 'meeting' ? text.meeting : text.idle}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 text-center py-4">
              {text.chatWith} {agent.name}
            </p>
            <p className="text-[10px] text-gray-600 text-center">{text.suggestedQuestions}</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTED_QUESTIONS[lang].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-2.5 py-1.5 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition border border-white/5"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600/80 text-white rounded-br-md'
                  : 'bg-white/10 text-gray-200 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 px-3 py-2 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 bg-[#0f1520]/90 backdrop-blur border-t border-white/5 shrink-0">
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
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white text-sm font-medium transition"
          >
            {text.send}
          </button>
        </form>
      </div>
    </div>
  );
}

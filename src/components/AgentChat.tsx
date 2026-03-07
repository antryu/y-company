'use client';

import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { Agent } from '@/data/floors';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  agent: Agent;
  onClose: () => void;
}

export function AgentChat({ agent, onClose }: Props) {
  const { text, lang } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (overrideMsg?: string) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || loading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: msg,
          history: newMessages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || text.chatError }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: text.chatError }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = lang === 'ko'
    ? ['지금 뭐 하고 있어요?', '오늘 일정이 어떻게 돼요?', '부서 소개 해주세요']
    : ['What are you working on?', "What's your schedule today?", 'Tell me about your department'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Chat Panel */}
      <div className="relative w-full sm:max-w-md h-[85dvh] sm:h-[70vh] bg-gray-900 sm:rounded-2xl overflow-hidden flex flex-col animate-slide-in border border-gray-700/50">
        {/* Agent Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/80 border-b border-gray-700/50">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
              {agent.image ? (
                <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">{agent.name}</h3>
            <p className="text-xs text-gray-400 truncate">
              {agent.department} · {agent.role}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-3 pt-4">
              <p className="text-xs text-gray-500 text-center">
                {text.chatWith} {agent.name}
              </p>
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {text.suggestedQuestions}
                </p>
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="block w-full text-left px-3 py-2 text-xs text-gray-300 bg-gray-800/50 rounded-lg hover:bg-gray-800 border border-gray-700/50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-800 text-gray-200 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-400 px-3 py-2 rounded-2xl rounded-bl-md text-sm">
                <span className="animate-pulse">{text.thinking}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 bg-gray-800/50 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(undefined)}
              placeholder={text.typeMessage}
              className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-full border border-gray-600 focus:border-blue-500 focus:outline-none placeholder:text-gray-500"
            />
            <button
              onClick={() => sendMessage(undefined)}
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 transition-colors text-white text-sm"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

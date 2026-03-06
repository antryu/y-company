'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Agent } from '@/data/floors';
import { AgentState } from '@/hooks/useSimulation';

interface ChatPanelProps {
  agent: Agent;
  agentState?: AgentState;
  onClose: () => void;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPanel({ agent, agentState, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: text,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '*static* ...sorry, having connection issues. Try again?',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const isAndrew = agent.id === 'andrew';
  const statusText = agentState
    ? agentState.status === 'working' ? 'Working'
      : agentState.status === 'meeting' ? 'In Meeting'
      : agentState.status === 'elevator' ? 'In Elevator'
      : agentState.status === 'reporting' ? 'Reporting'
      : 'Idle'
    : 'Working';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-gray-900/98 border-l border-gray-700/50 z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-gray-800 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-cyan-500/30 shrink-0">
            {isAndrew ? (
              <div className="w-full h-full bg-gradient-to-br from-yellow-900/50 to-gray-900 flex items-center justify-center text-xl font-bold text-yellow-400">A</div>
            ) : (
              <Image src={agent.image} alt={agent.name} fill className="object-cover" sizes="48px" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white truncate">{agent.name}</h2>
            <p className="text-[10px] text-gray-500 font-mono truncate">
              {agent.role} · {agent.floor}F · {statusText}
            </p>
            {agentState?.activity && (
              <p className="text-[9px] text-cyan-500/60 font-mono truncate">
                📍 {agentState.activity}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg cursor-pointer shrink-0">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-gray-500">Start a conversation with {agent.name}</p>
              <p className="text-[10px] text-gray-600 mt-1">They&apos;ll respond in character!</p>
              {/* Suggested messages */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {getSuggestions(agent.id).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-[10px] px-2 py-1 rounded-full border border-gray-700 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600/20 text-cyan-100 rounded-br-sm'
                    : 'bg-gray-800/80 text-gray-200 rounded-bl-sm border border-gray-700/30'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 rounded-2xl rounded-bl-sm px-4 py-2 border border-gray-700/30">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 p-3 border-t border-gray-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${agent.name}...`}
              className="flex-1 bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-cyan-600/80 hover:bg-cyan-500/80 disabled:bg-gray-700/50 disabled:text-gray-600 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function getSuggestions(agentId: string): string[] {
  const suggestions: Record<string, string[]> = {
    tasky: ['What projects are active?', 'How\'s the timeline?', 'Any blockers?'],
    finy: ['How\'s the budget?', 'What\'s our burn rate?', 'ROI on latest project?'],
    legaly: ['Any compliance issues?', 'Review our terms?', 'IP concerns?'],
    skepty: ['What could go wrong?', 'Any hidden risks?', 'Challenge my idea'],
    audity: ['Run an audit check', 'Any irregularities?', 'Process compliance?'],
    pixely: ['Show me the latest UI', 'Design feedback?', 'Color palette thoughts?'],
    buildy: ['System status?', 'Any tech debt?', 'Architecture thoughts?'],
    testy: ['Found any bugs?', 'Test coverage?', 'QA status update?'],
    buzzy: ['What\'s trending?', 'Viral potential?', 'Social media strategy?'],
    wordy: ['Need a tagline', 'Review this copy', 'Blog topic ideas?'],
    quanty: ['Market outlook?', 'Alpha signals?', 'Model performance?'],
    tradey: ['Any opportunities?', 'Position update?', 'Market sentiment?'],
  };
  return suggestions[agentId] || ['What are you working on?', 'Tell me about your role', 'How\'s the team?'];
}

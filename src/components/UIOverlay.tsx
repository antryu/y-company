'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLang } from '@/context/LangContext';
import { floors, Agent } from '@/data/floors';
import { ActivityLogEntry } from '@/engine/simulation';

interface UIOverlayProps {
  selectedAgent: Agent | null;
  onCloseAgent: () => void;
  onFloorClick: (level: number) => void;
  selectedFloor: number | null;
  activityLog: ActivityLogEntry[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function AgentPanel({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { text } = useLang();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          message: userMsg,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error || 'No response' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: text.chatError }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, agent.id, messages, text.chatError]);

  const deptColor = floors.find(f => f.level === agent.floor)?.color || '#4A90D9';

  return (
    <div className="agent-panel animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {agent.image && (
            <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-full border-2" style={{ borderColor: deptColor }} />
          )}
          <div>
            <h3 className="text-lg font-bold">{agent.name}</h3>
            <p className="text-xs opacity-60">{agent.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-lg">
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 text-sm border-b border-white/10">
        <div className="flex justify-between">
          <span className="opacity-50">{text.department}</span>
          <span style={{ color: deptColor }}>{agent.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-50">{text.floorLabel}</span>
          <span>{agent.floor}{text.floor}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-50">{text.status}</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {text.active}
          </span>
        </div>
      </div>

      {/* Chat toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors"
        style={{ color: deptColor }}
      >
        💬 {text.chatWith} {agent.name}
        <span className="ml-auto text-xs opacity-50">{showChat ? '▼' : '▶'}</span>
      </button>

      {/* Chat area */}
      {showChat && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-center text-xs opacity-40 py-8">
                {text.suggestedQuestions}
                <div className="mt-3 space-y-2">
                  {['오늘 뭐 하고 있어?', '너의 업무를 설명해줘', '다른 팀과 어떻게 협업해?'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); }}
                      className="block w-full text-left px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors text-white/70"
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
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-cyan-900/50 text-cyan-100'
                      : 'bg-white/10 text-white/90'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-3 py-2 rounded-lg text-sm opacity-60">
                  {text.thinking}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={text.typeMessage}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30"
                style={{ backgroundColor: deptColor + '33', color: deptColor }}
              >
                {text.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UIOverlay({ selectedAgent, onCloseAgent, onFloorClick, selectedFloor, activityLog }: UIOverlayProps) {
  const { lang, setLang, text } = useLang();
  const [showActivity, setShowActivity] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex items-center justify-between px-4 py-3 pointer-events-auto"
          style={{ background: 'linear-gradient(180deg, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0) 100%)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-wider">
              <span className="text-cyan-400">_y</span>
              <span className="text-white/90 ml-1">Holdings</span>
            </h1>
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {text.live}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors md:hidden"
            >
              📋
            </button>
            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              {lang === 'ko' ? 'EN' : '한'}
            </button>
          </div>
        </div>
      </div>

      {/* Floor indicator - left side */}
      <div className="fixed left-2 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-1">
        {floors.map(floor => (
          <button
            key={floor.level}
            onClick={() => onFloorClick(floor.level)}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
              selectedFloor === floor.level
                ? 'bg-white/15 text-white'
                : 'bg-black/30 text-white/50 hover:bg-white/10 hover:text-white/80'
            }`}
            title={`${floor.label} ${floor.department}`}
          >
            <span className="w-6 text-right font-mono" style={{ color: floor.color }}>
              {floor.label}
            </span>
            <span className="hidden lg:inline opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap">
              {floor.department}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile floor selector - bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden overflow-x-auto"
        style={{ background: 'linear-gradient(0deg, rgba(3,7,18,0.95) 0%, rgba(3,7,18,0) 100%)' }}
      >
        <div className="flex gap-1 p-2 pb-4 justify-center">
          {floors.map(floor => (
            <button
              key={floor.level}
              onClick={() => onFloorClick(floor.level)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                selectedFloor === floor.level
                  ? 'bg-white/15 text-white'
                  : 'bg-black/40 text-white/40'
              }`}
              style={selectedFloor === floor.level ? { borderColor: floor.color, borderWidth: 1 } : {}}
            >
              {floor.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent panel - right side */}
      {selectedAgent && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-gray-950/95 backdrop-blur-xl border-l border-white/10 flex flex-col overflow-y-auto">
          <AgentPanel agent={selectedAgent} onClose={onCloseAgent} />
        </div>
      )}

      {/* Activity feed - desktop: right side strip, mobile: bottom sheet */}
      <div className={`fixed z-30 transition-all ${
        showActivity
          ? 'inset-0 bg-black/80 md:bg-transparent md:right-0 md:top-16 md:bottom-16 md:left-auto md:w-80'
          : 'hidden md:flex md:right-2 md:top-16 md:bottom-16 md:w-72'
      }`}>
        <div className={`${showActivity ? 'absolute bottom-0 left-0 right-0 max-h-[60vh] md:relative md:max-h-full md:h-full' : 'h-full'} bg-gray-950/80 backdrop-blur-md border border-white/10 rounded-t-xl md:rounded-xl flex flex-col overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-medium text-white/80">
              📋 {text.activityFeed}
            </h3>
            <button
              onClick={() => setShowActivity(false)}
              className="md:hidden text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activityLog.slice().reverse().map((entry, i) => {
              const floor = floors.find(f => f.level === entry.floor);
              return (
                <div key={i} className="flex gap-2 text-xs animate-fade-in">
                  <span className="text-white/30 flex-shrink-0 w-12">{formatTime(entry.timestamp)}</span>
                  <span className="flex-shrink-0" style={{ color: floor?.color || '#888' }}>
                    {entry.agentName}
                  </span>
                  <span className="text-white/50">
                    {entry.activity}
                  </span>
                </div>
              );
            })}
            {activityLog.length === 0 && (
              <div className="text-center text-xs text-white/30 py-8">
                시뮬레이션 시작 대기 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

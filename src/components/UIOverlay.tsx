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

// Muted accent colors for UI (matching the new subtle palette)
const FLOOR_UI_COLORS: Record<number, string> = {
  10: '#8B7355',
  9: '#5B8DB8',
  8: '#C0584B',
  7: '#4AAF7C',
  6: '#8B6BAE',
  5: '#CC8844',
  4: '#3DA89A',
  3: '#D4A84B',
  2: '#3BB896',
  1: '#5A9BCB',
};

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

  const uiColor = FLOOR_UI_COLORS[agent.floor] || '#5B8DB8';

  return (
    <div className="animate-slide-in flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {agent.image && (
            <img src={agent.image} alt={agent.name} className="w-12 h-12 rounded-full border-2" style={{ borderColor: uiColor }} />
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800">{agent.name}</h3>
            <p className="text-xs text-gray-400">{agent.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 text-lg">
          ✕
        </button>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2 text-sm border-b border-gray-200">
        <div className="flex justify-between">
          <span className="text-gray-400">{text.department}</span>
          <span className="text-gray-700" style={{ color: uiColor }}>{agent.department}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{text.floorLabel}</span>
          <span className="text-gray-700">{agent.floor}{text.floor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{text.status}</span>
          <span className="flex items-center gap-1.5 text-gray-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {text.active}
          </span>
        </div>
      </div>

      {/* Chat toggle */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
        style={{ color: uiColor }}
      >
        💬 {text.chatWith} {agent.name}
        <span className="ml-auto text-xs text-gray-400">{showChat ? '▼' : '▶'}</span>
      </button>

      {/* Chat area */}
      {showChat && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-8">
                {text.suggestedQuestions}
                <div className="mt-3 space-y-2">
                  {['오늘 뭐 하고 있어?', '너의 업무를 설명해줘', '다른 팀과 어떻게 협업해?'].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-left px-3 py-1.5 rounded bg-gray-50 hover:bg-gray-100 transition-colors text-gray-600 text-sm"
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
                      ? 'bg-blue-50 text-blue-900'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-400">
                  {text.thinking}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={text.typeMessage}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none focus:border-blue-300 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 text-white"
                style={{ backgroundColor: uiColor }}
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
          style={{ background: 'linear-gradient(180deg, rgba(240,242,245,0.97) 0%, rgba(240,242,245,0) 100%)' }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-wider">
              <span className="text-gray-800">_y</span>
              <span className="text-gray-500 ml-1">Holdings</span>
            </h1>
            <span className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {text.live}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600 md:hidden"
            >
              📋
            </button>
            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              {lang === 'ko' ? 'EN' : '한'}
            </button>
          </div>
        </div>
      </div>

      {/* Floor buttons - left side */}
      <div className="fixed left-2 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-1">
        {floors.map(floor => {
          const uiColor = FLOOR_UI_COLORS[floor.level] || '#5B8DB8';
          return (
            <button
              key={floor.level}
              onClick={() => onFloorClick(floor.level)}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                selectedFloor === floor.level
                  ? 'bg-white shadow-md text-gray-800 border border-gray-200'
                  : 'bg-white/60 text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-700 border border-transparent'
              }`}
              title={`${floor.label} ${floor.department}`}
            >
              <span className="w-6 text-right font-mono font-semibold" style={{ color: uiColor }}>
                {floor.label}
              </span>
              <span className="hidden lg:inline opacity-0 group-hover:opacity-100 transition-opacity text-[10px] whitespace-nowrap text-gray-500">
                {floor.department}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile floor selector */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden overflow-x-auto"
        style={{ background: 'linear-gradient(0deg, rgba(240,242,245,0.97) 0%, rgba(240,242,245,0) 100%)' }}
      >
        <div className="flex gap-1 p-2 pb-4 justify-center">
          {floors.map(floor => {
            const uiColor = FLOOR_UI_COLORS[floor.level] || '#5B8DB8';
            return (
              <button
                key={floor.level}
                onClick={() => onFloorClick(floor.level)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                  selectedFloor === floor.level
                    ? 'bg-white shadow-md text-gray-800'
                    : 'bg-white/50 text-gray-400'
                }`}
                style={selectedFloor === floor.level ? { borderColor: uiColor, borderWidth: 1 } : {}}
              >
                {floor.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Agent panel */}
      {selectedAgent && (
        <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-96 bg-white/95 backdrop-blur-xl border-l border-gray-200 flex flex-col overflow-y-auto shadow-xl">
          <AgentPanel agent={selectedAgent} onClose={onCloseAgent} />
        </div>
      )}

      {/* Activity feed */}
      <div className={`fixed z-30 transition-all ${
        showActivity
          ? 'inset-0 bg-black/20 md:bg-transparent md:right-0 md:top-16 md:bottom-16 md:left-auto md:w-80'
          : 'hidden md:flex md:right-2 md:top-16 md:bottom-16 md:w-72'
      }`}>
        <div className={`${showActivity ? 'absolute bottom-0 left-0 right-0 max-h-[60vh] md:relative md:max-h-full md:h-full' : 'h-full'} bg-white/90 backdrop-blur-md border border-gray-200 rounded-t-xl md:rounded-xl flex flex-col overflow-hidden shadow-lg`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">
              📋 {text.activityFeed}
            </h3>
            <button
              onClick={() => setShowActivity(false)}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activityLog.slice().reverse().map((entry, i) => {
              const uiColor = FLOOR_UI_COLORS[entry.floor] || '#5B8DB8';
              return (
                <div key={i} className="flex gap-2 text-xs animate-fade-in">
                  <span className="text-gray-300 flex-shrink-0 w-12">{formatTime(entry.timestamp)}</span>
                  <span className="flex-shrink-0 font-medium" style={{ color: uiColor }}>
                    {entry.agentName}
                  </span>
                  <span className="text-gray-500">
                    {entry.activity}
                  </span>
                </div>
              );
            })}
            {activityLog.length === 0 && (
              <div className="text-center text-xs text-gray-300 py-8">
                시뮬레이션 시작 대기 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

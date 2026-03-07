'use client';

import { ActivityLogEntry } from '@/engine/simulation';

interface Props {
  activities: ActivityLogEntry[];
  onClose: () => void;
}

export function ActivityFeed({ activities, onClose }: Props) {
  const sortedActivities = [...activities].reverse();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const typeIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'action': return '⚡';
      case 'chat': return '💬';
      case 'movement': return '🚶';
      case 'reflection': return '💭';
      default: return '📌';
    }
  };

  return (
    <div className="absolute bottom-14 left-2 right-2 z-20 max-h-[40vh] bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <span className="text-xs font-semibold text-gray-300">📋 활동 피드</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white text-xs transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="overflow-y-auto max-h-[35vh] px-3 py-2 space-y-1.5">
        {sortedActivities.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">활동 없음</p>
        ) : (
          sortedActivities.map((act, i) => (
            <div
              key={`${act.timestamp}-${act.agentId}-${i}`}
              className="flex items-start gap-2 text-xs animate-fade-in"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="text-[10px] text-gray-500 font-mono mt-0.5 flex-shrink-0">
                {formatTime(act.timestamp)}
              </span>
              <span className="flex-shrink-0">{typeIcon(act.type)}</span>
              <span className="text-gray-300">
                <span className="font-semibold text-white">{act.agentName}</span>
                <span className="text-gray-500"> ({act.floor}F)</span>
                {' · '}
                {act.activity}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

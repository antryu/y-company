'use client';

import { ActivityLogEntry } from '@/data/activities';

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  onClose: () => void;
}

export default function ActivityFeed({ entries, onClose }: ActivityFeedProps) {
  return (
    <div className="fixed right-2 top-16 w-72 max-h-[60vh] bg-gray-900/95 border border-gray-700/50 rounded-lg z-20 overflow-hidden shadow-xl animate-slide-in">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Activity Feed</h3>
        <button onClick={onClose} className="text-gray-600 hover:text-white text-sm cursor-pointer">✕</button>
      </div>
      <div className="overflow-y-auto max-h-[calc(60vh-40px)] p-2 space-y-1">
        {entries.length === 0 ? (
          <p className="text-[10px] text-gray-600 text-center py-4 font-mono">Waiting for activity...</p>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="flex gap-2 px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors">
              <span className="text-[9px] text-gray-600 font-mono shrink-0 mt-0.5">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <div className="text-[10px]">
                <span className="text-cyan-400 font-medium">{entry.agentName}</span>
                <span className="text-gray-500"> · {entry.floor}F</span>
                <br />
                <span className="text-gray-400">{entry.activity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

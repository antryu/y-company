'use client';

import Image from 'next/image';
import { Agent } from '@/data/floors';

interface AgentPanelProps {
  agent: Agent | null;
  onClose: () => void;
}

export default function AgentPanel({ agent, onClose }: AgentPanelProps) {
  if (!agent) return null;

  const isAndrew = agent.id === 'andrew';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 sm:w-96 bg-gray-900/95 border-l border-gray-700/50 z-50 overflow-y-auto animate-slide-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl cursor-pointer"
        >
          ✕
        </button>

        <div className="p-6 pt-12 flex flex-col items-center gap-6">
          {/* Agent Image */}
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            {isAndrew ? (
              <div className="w-full h-full bg-gradient-to-br from-yellow-900/50 to-gray-900 flex items-center justify-center">
                <span className="text-6xl font-bold text-yellow-400">A</span>
              </div>
            ) : (
              <Image
                src={agent.image}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="160px"
              />
            )}
          </div>

          {/* Name & Number */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {agent.name}
            </h2>
            <span className="text-sm text-cyan-400 font-mono">
              #{agent.number}
            </span>
          </div>

          {/* Info Cards */}
          <div className="w-full space-y-3">
            <InfoCard label="Department" value={agent.department} />
            <InfoCard label="Role" value={agent.role} />
            <InfoCard label="Floor" value={`${agent.floor}F`} />
            <InfoCard
              label="Status"
              value={
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        agent.status === 'working' ? '#2ECC71' :
                        agent.status === 'meeting' ? '#F1C40F' : '#95A5A6',
                    }}
                  />
                  {agent.status === 'working' ? 'Working' :
                   agent.status === 'meeting' ? 'In Meeting' : 'Idle'}
                </span>
              }
            />
          </div>

          {/* Decorative divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* Activity placeholder */}
          <div className="w-full">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Activity
            </h3>
            <div className="space-y-2">
              <ActivityItem time="09:00" text={`${agent.name} started work`} />
              <ActivityItem time="10:30" text="Joined team standup" />
              <ActivityItem time="11:00" text="Working on tasks" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 rounded-lg px-4 py-3 border border-gray-700/30">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-sm text-gray-200">{value}</div>
    </div>
  );
}

function ActivityItem({ time, text }: { time: string; text: string }) {
  return (
    <div className="flex gap-3 text-xs">
      <span className="text-gray-600 font-mono shrink-0">{time}</span>
      <span className="text-gray-400">{text}</span>
    </div>
  );
}

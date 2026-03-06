'use client';

// Each floor's unique furniture layout
// Positioned as percentage within the room area

interface FurnitureProps {
  floorLevel: number;
  floorColor: string;
  isNight: boolean;
  isLit: boolean;
}

export default function RoomFurniture({ floorLevel, floorColor, isNight, isLit }: FurnitureProps) {
  const screenOn = !isNight || isLit;

  switch (floorLevel) {
    case 10: return <ChairmanOffice color={floorColor} screenOn={screenOn} />;
    case 9: return <PlanningOffice color={floorColor} screenOn={screenOn} />;
    case 8: return <RiskAuditOffice color={floorColor} screenOn={screenOn} />;
    case 7: return <DevOffice color={floorColor} screenOn={screenOn} />;
    case 6: return <ContentOffice color={floorColor} screenOn={screenOn} />;
    case 5: return <MarketingOffice color={floorColor} screenOn={screenOn} />;
    case 4: return <ICTOffice color={floorColor} screenOn={screenOn} />;
    case 3: return <HROffice color={floorColor} screenOn={screenOn} />;
    case 2: return <CapitalOffice color={floorColor} screenOn={screenOn} />;
    case 1: return <LobbyOffice color={floorColor} screenOn={screenOn} />;
    default: return null;
  }
}

// === Furniture primitives ===

function Desk({ x, y, screenColor = 'cyan', screenOn = true }: { x: number; y: number; screenColor?: string; screenOn?: boolean }) {
  const colors: Record<string, string> = {
    cyan: 'rgba(0, 150, 255, 0.4)',
    green: 'rgba(0, 200, 100, 0.4)',
    amber: 'rgba(255, 180, 0, 0.4)',
    red: 'rgba(255, 80, 80, 0.4)',
    purple: 'rgba(180, 100, 255, 0.4)',
  };
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="iso-desk">
        <div className="desk-top" />
        <div className="desk-front" />
        {screenOn && (
          <div
            className="desk-screen"
            style={{
              borderColor: colors[screenColor] || colors.cyan,
              color: colors[screenColor] || colors.cyan,
              boxShadow: `0 0 6px ${colors[screenColor] || colors.cyan}`,
            }}
          />
        )}
      </div>
    </div>
  );
}

function DualScreen({ x, y, screenOn = true }: { x: number; y: number; screenOn?: boolean }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="iso-desk" style={{ width: '34px' }}>
        <div className="desk-top" style={{ width: '34px' }} />
        <div className="desk-front" style={{ width: '34px' }} />
        {screenOn && (
          <>
            <div className="desk-screen" style={{ left: '30%', width: '11px', height: '9px', top: '-7px' }} />
            <div className="desk-screen" style={{ left: '60%', width: '11px', height: '9px', top: '-7px' }} />
          </>
        )}
      </div>
    </div>
  );
}

function TripleScreen({ x, y, screenOn = true }: { x: number; y: number; screenOn?: boolean }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="iso-desk" style={{ width: '40px' }}>
        <div className="desk-top" style={{ width: '40px' }} />
        <div className="desk-front" style={{ width: '40px' }} />
        {screenOn && (
          <>
            <div className="desk-screen green" style={{ left: '15%', width: '10px', height: '8px', top: '-7px' }} />
            <div className="desk-screen amber" style={{ left: '42%', width: '10px', height: '8px', top: '-7px' }} />
            <div className="desk-screen" style={{ left: '68%', width: '10px', height: '8px', top: '-7px' }} />
          </>
        )}
      </div>
    </div>
  );
}

function Chair({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute iso-chair" style={{ left: `${x}%`, top: `${y}%` }} />
  );
}

function MeetingTable({ x, y, w = 40, h = 20 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <div
      className="absolute iso-meeting-table"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}px`, height: `${h}px` }}
    />
  );
}

function ServerRack({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute iso-server-rack" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="led green" style={{ top: '3px' }} />
      <div className="led amber" style={{ top: '8px' }} />
      <div className="led green" style={{ top: '13px' }} />
      <div className="led red" style={{ top: '18px' }} />
    </div>
  );
}

function Plant({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute iso-plant" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="leaves" />
      <div className="pot" />
    </div>
  );
}

function Whiteboard({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute iso-whiteboard"
      style={{ left: `${x}%`, top: `${y}%`, width: '30px', height: '18px' }}
    />
  );
}

function Bookshelf({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div style={{
        width: '16px', height: '22px',
        background: 'linear-gradient(180deg, #5a3a2a, #3a2a1a)',
        border: '1px solid rgba(100, 60, 30, 0.3)',
        borderRadius: '1px',
        position: 'relative',
      }}>
        {[3, 8, 13, 18].map((t, i) => (
          <div key={i} style={{
            position: 'absolute', top: `${t}px`, left: '2px', right: '2px', height: '3px',
            background: ['#c44', '#48c', '#4a4', '#c84'][i],
            borderRadius: '0.5px', opacity: 0.7,
          }} />
        ))}
      </div>
    </div>
  );
}

function CeilingLight({ x, on = true }: { x: number; on?: boolean }) {
  return (
    <div
      className={`absolute ceiling-light ${on ? '' : 'off'}`}
      style={{ left: `${x}%`, top: '2px' }}
    />
  );
}

function PresentationScreen({ x, y, screenOn = true }: { x: number; y: number; screenOn?: boolean }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div style={{
        width: '36px', height: '22px',
        background: screenOn ? 'linear-gradient(135deg, #0a1a3a, #0a2a4a)' : '#1a1a2a',
        border: `1px solid ${screenOn ? 'rgba(0, 150, 255, 0.3)' : 'rgba(60, 60, 80, 0.3)'}`,
        borderRadius: '2px',
        boxShadow: screenOn ? '0 0 8px rgba(0, 150, 255, 0.15)' : 'none',
      }}>
        {screenOn && (
          <>
            <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', height: '2px', background: 'rgba(0, 200, 100, 0.3)', borderRadius: '1px' }} />
            <div style={{ position: 'absolute', top: '9px', left: '4px', width: '60%', height: '2px', background: 'rgba(100, 150, 255, 0.3)', borderRadius: '1px' }} />
            <div style={{ position: 'absolute', top: '14px', left: '4px', width: '40%', height: '2px', background: 'rgba(255, 200, 0, 0.2)', borderRadius: '1px' }} />
          </>
        )}
      </div>
    </div>
  );
}

function RecordingBooth({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {/* Sound-proofed walls */}
      <div style={{
        width: '28px', height: '30px',
        background: 'linear-gradient(180deg, #2a1a2a, #1a0a1a)',
        border: '1px solid rgba(150, 80, 180, 0.2)',
        borderRadius: '2px',
        position: 'relative',
      }}>
        {/* Mic */}
        <div style={{
          position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)',
          width: '4px', height: '10px', background: '#555',
          borderRadius: '2px',
        }}>
          <div style={{
            position: 'absolute', top: '-3px', left: '-1px',
            width: '6px', height: '6px', background: '#666',
            borderRadius: '50%', border: '1px solid rgba(200, 100, 255, 0.3)',
          }} />
        </div>
        {/* Red recording light */}
        <div style={{
          position: 'absolute', top: '3px', right: '3px',
          width: '3px', height: '3px', borderRadius: '50%',
          background: '#f44', animation: 'blink 2s infinite',
        }} />
      </div>
    </div>
  );
}

function Sofa({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div style={{
        width: '28px', height: '12px',
        background: 'linear-gradient(180deg, #3a3a5a, #2a2a4a)',
        borderRadius: '4px 4px 2px 2px',
        border: '1px solid rgba(100, 100, 150, 0.2)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function TickerDisplay({ x, y, screenOn = true }: { x: number; y: number; screenOn?: boolean }) {
  return (
    <div className="absolute overflow-hidden" style={{ left: `${x}%`, top: `${y}%`, width: '60px', height: '8px' }}>
      <div style={{
        background: '#0a0a1a',
        border: '1px solid rgba(0, 200, 100, 0.2)',
        width: '100%', height: '100%',
        overflow: 'hidden',
        borderRadius: '1px',
      }}>
        {screenOn && (
          <div style={{
            color: 'rgba(0, 255, 100, 0.6)',
            fontSize: '5px',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            animation: 'ticker 8s linear infinite',
          }}>
            ▲ AAPL 189.2  ▼ TSLA 244.1  ▲ NVDA 878.4  △ BTC 67.2K
          </div>
        )}
      </div>
    </div>
  );
}

function ReceptionDesk({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div style={{
        width: '40px', height: '16px',
        background: 'linear-gradient(135deg, #3a3a4a, #2a2a3a)',
        borderRadius: '8px 8px 2px 2px',
        border: '1px solid rgba(100, 150, 200, 0.15)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '-3px', left: '50%', transform: 'translateX(-50%)',
          fontSize: '4px', color: 'rgba(0, 200, 255, 0.5)', fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}>
          _y
        </div>
      </div>
    </div>
  );
}

// === Floor-specific layouts ===

function ChairmanOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={20} on={screenOn} />
      <CeilingLight x={55} on={screenOn} />
      {/* Executive desk (large) */}
      <div className="absolute" style={{ left: '18%', top: '45%' }}>
        <div style={{
          width: '40px', height: '22px',
          background: 'linear-gradient(135deg, #5a4030, #3a2a20)',
          border: '1px solid rgba(200, 150, 80, 0.2)',
          borderRadius: '3px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }} />
      </div>
      {screenOn && (
        <div className="absolute desk-screen" style={{ left: '22%', top: '32%', width: '16px', height: '12px', position: 'absolute', borderColor: `${color}60` }} />
      )}
      <Chair x={22} y={70} />
      <Bookshelf x={4} y={25} />
      <Plant x={8} y={60} />
      {/* Conference table */}
      <MeetingTable x={58} y={40} w={36} h={24} />
      <Chair x={57} y={33} />
      <Chair x={70} y={33} />
      <Chair x={57} y={68} />
      <Chair x={70} y={68} />
      <Plant x={88} y={25} />
    </>
  );
}

function PlanningOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={15} on={screenOn} />
      <CeilingLight x={45} on={screenOn} />
      <Desk x={8} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={12} y={72} />
      <Desk x={22} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={26} y={72} />
      <Desk x={36} y={50} screenColor="amber" screenOn={screenOn} />
      <Chair x={40} y={72} />
      <Whiteboard x={15} y={8} />
      <Plant x={48} y={60} />
      {/* Meeting room */}
      <MeetingTable x={62} y={42} w={30} h={18} />
      <Chair x={62} y={35} />
      <Chair x={72} y={35} />
      <Chair x={62} y={65} />
      <Chair x={72} y={65} />
    </>
  );
}

function RiskAuditOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={18} on={screenOn} />
      <CeilingLight x={55} on={screenOn} />
      <Desk x={10} y={50} screenColor="red" screenOn={screenOn} />
      <Chair x={14} y={72} />
      <Desk x={28} y={50} screenColor="red" screenOn={screenOn} />
      <Chair x={32} y={72} />
      {/* Observation monitors */}
      <PresentationScreen x={5} y={8} screenOn={screenOn} />
      <Plant x={44} y={55} />
      {/* Observation room */}
      <MeetingTable x={62} y={45} w={28} h={16} />
      <Chair x={63} y={38} />
      <Chair x={73} y={38} />
      <Chair x={68} y={65} />
    </>
  );
}

function DevOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={15} on={screenOn} />
      <CeilingLight x={40} on={screenOn} />
      <DualScreen x={6} y={48} screenOn={screenOn} />
      <Chair x={12} y={72} />
      <DualScreen x={22} y={48} screenOn={screenOn} />
      <Chair x={28} y={72} />
      <DualScreen x={38} y={48} screenOn={screenOn} />
      <Chair x={44} y={72} />
      {/* Server rack */}
      <ServerRack x={52} y={30} />
      <ServerRack x={56} y={30} />
      <Plant x={3} y={30} />
      {/* Meeting room */}
      <MeetingTable x={65} y={45} w={26} h={16} />
      <Chair x={65} y={38} />
      <Chair x={75} y={38} />
      <Chair x={70} y={65} />
    </>
  );
}

function ContentOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={12} on={screenOn} />
      <CeilingLight x={35} on={screenOn} />
      <Desk x={5} y={50} screenColor="purple" screenOn={screenOn} />
      <Chair x={9} y={72} />
      <Desk x={17} y={50} screenColor="purple" screenOn={screenOn} />
      <Chair x={21} y={72} />
      <Desk x={29} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={33} y={72} />
      <Desk x={41} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={45} y={72} />
      {/* Recording booth */}
      <RecordingBooth x={62} y={28} />
      <Plant x={55} y={60} />
    </>
  );
}

function MarketingOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={10} on={screenOn} />
      <CeilingLight x={30} on={screenOn} />
      <CeilingLight x={60} on={screenOn} />
      <Desk x={3} y={50} screenColor="amber" screenOn={screenOn} />
      <Chair x={7} y={72} />
      <Desk x={14} y={50} screenColor="amber" screenOn={screenOn} />
      <Chair x={18} y={72} />
      <Desk x={25} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={29} y={72} />
      <Desk x={36} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={40} y={72} />
      <Desk x={47} y={50} screenColor="green" screenOn={screenOn} />
      <Chair x={51} y={72} />
      {/* Presentation area */}
      <PresentationScreen x={64} y={15} screenOn={screenOn} />
      <Plant x={90} y={55} />
    </>
  );
}

function ICTOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={15} on={screenOn} />
      <CeilingLight x={45} on={screenOn} />
      <DualScreen x={8} y={48} screenOn={screenOn} />
      <Chair x={14} y={72} />
      <DualScreen x={24} y={48} screenOn={screenOn} />
      <Chair x={30} y={72} />
      <DualScreen x={40} y={48} screenOn={screenOn} />
      <Chair x={46} y={72} />
      {/* Server room */}
      <ServerRack x={62} y={28} />
      <ServerRack x={67} y={28} />
      <ServerRack x={72} y={28} />
      <ServerRack x={77} y={28} />
      {/* Server room glow */}
      <div className="absolute" style={{
        left: '60%', top: '20%', width: '40px', height: '40px',
        background: 'radial-gradient(circle, rgba(0, 200, 150, 0.05), transparent)',
        pointerEvents: 'none',
      }} />
    </>
  );
}

function HROffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={18} on={screenOn} />
      <CeilingLight x={55} on={screenOn} />
      <Desk x={12} y={50} screenColor="amber" screenOn={screenOn} />
      <Chair x={16} y={72} />
      <Desk x={30} y={50} screenColor="amber" screenOn={screenOn} />
      <Chair x={34} y={72} />
      <Plant x={5} y={55} />
      <Plant x={46} y={55} />
      <Bookshelf x={44} y={25} />
      {/* Interview room */}
      <MeetingTable x={62} y={42} w={28} h={16} />
      <Chair x={63} y={35} />
      <Chair x={63} y={62} />
      <Chair x={75} y={48} />
    </>
  );
}

function CapitalOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={8} on={screenOn} />
      <CeilingLight x={25} on={screenOn} />
      <CeilingLight x={42} on={screenOn} />
      <CeilingLight x={65} on={screenOn} />
      {/* Ticker display */}
      <TickerDisplay x={5} y={5} screenOn={screenOn} />
      {/* Row 1 - 3 trading desks */}
      <TripleScreen x={3} y={35} screenOn={screenOn} />
      <Chair x={12} y={58} />
      <TripleScreen x={18} y={35} screenOn={screenOn} />
      <Chair x={27} y={58} />
      <TripleScreen x={33} y={35} screenOn={screenOn} />
      <Chair x={42} y={58} />
      {/* Row 2 - 3 more */}
      <TripleScreen x={3} y={62} screenOn={screenOn} />
      <Chair x={12} y={82} />
      <TripleScreen x={18} y={62} screenOn={screenOn} />
      <Chair x={27} y={82} />
      <TripleScreen x={33} y={62} screenOn={screenOn} />
      <Chair x={42} y={82} />
      {/* War room */}
      <PresentationScreen x={62} y={15} screenOn={screenOn} />
      <MeetingTable x={62} y={45} w={28} h={18} />
      <Chair x={63} y={38} />
      <Chair x={75} y={38} />
      <Chair x={63} y={68} />
      <Chair x={75} y={68} />
    </>
  );
}

function LobbyOffice({ color, screenOn }: { color: string; screenOn: boolean }) {
  return (
    <>
      <CeilingLight x={25} on={screenOn} />
      <CeilingLight x={60} on={screenOn} />
      {/* Reception desk */}
      <ReceptionDesk x={20} y={45} />
      <Chair x={30} y={68} />
      <Desk x={50} y={50} screenColor="cyan" screenOn={screenOn} />
      <Chair x={54} y={72} />
      {/* Lounge */}
      <Sofa x={70} y={55} />
      <Plant x={5} y={30} />
      <Plant x={90} y={30} />
      {/* Welcome sign */}
      <div className="absolute" style={{
        left: '35%', top: '8%',
        fontSize: '5px', color: 'rgba(0, 200, 255, 0.5)',
        fontFamily: 'monospace', letterSpacing: '1px',
      }}>
        WELCOME
      </div>
    </>
  );
}

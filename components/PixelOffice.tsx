'use client';

type Agent = {
  name: string;
  model?: string;
  state: string;
  detail: string;
};

function isWorking(state: string) {
  return state.toUpperCase() === 'RUNNING';
}

function colorByModel(model?: string) {
  const v = (model || '').toLowerCase();
  if (v.includes('claude')) return '#f59e0b';
  if (v.includes('codex') || v.includes('gpt')) return '#75e8ff';
  if (v.includes('local')) return '#34d399';
  return '#c4b5fd';
}

function Sprite({ color }: { color: string }) {
  return (
    <div style={{ width: 18, height: 22, imageRendering: 'pixelated' }}>
      <div style={{ width: 12, height: 10, background: color, border: '2px solid #000', margin: '0 auto' }} />
      <div style={{ width: 18, height: 10, background: '#263764', border: '2px solid #000', borderTop: 'none' }} />
    </div>
  );
}

export default function PixelOffice({ agents = [], compact = false }: { agents: Agent[]; compact?: boolean }) {
  const working = agents.filter((a) => isWorking(a.state));
  const breakroom = agents.filter((a) => !isWorking(a.state));

  return (
    <div style={{ border: '1px solid rgba(117,232,255,0.25)', borderRadius: 10, overflow: 'hidden', background: '#0b1024' }}>
      <style>{`
        @keyframes walk-cycle {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
          100% { transform: translateY(0px); }
        }
        @keyframes commute {
          0% { left: -18px; opacity: 0.35; }
          35% { left: 20%; opacity: 1; }
          100% { left: var(--desk-x); opacity: 1; }
        }
        .agent-walk {
          position: absolute;
          animation: commute 1.4s ease-out forwards, walk-cycle 280ms steps(2) infinite;
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1.3fr' : '1fr 2fr', minHeight: compact ? 220 : 320 }}>
        {/* 탕비실 */}
        <div style={{ borderRight: '2px solid rgba(255,255,255,0.08)', padding: 10, background: '#121831' }}>
          <div style={{ fontFamily: 'monospace', color: '#9fb4e7', fontSize: 12, marginBottom: 8 }}>탕비실</div>
          <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr 1fr' : 'repeat(2, minmax(80px, 1fr))', gap: 8 }}>
            {breakroom.map((agent) => (
              <div key={agent.name} title={`${agent.name} · ${agent.state}`} style={{ border: '2px solid #000', background: '#1c2549', padding: 6 }}>
                <Sprite color={colorByModel(agent.model)} />
                <div style={{ fontSize: 10, color: '#d4e0ff', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.name.replace(' Agent', '')}
                </div>
                <div style={{ marginTop: 2, fontSize: 9, color: '#8ea7dd', fontFamily: 'monospace' }}>({agent.model || 'unknown'})</div>
              </div>
            ))}
            {breakroom.length === 0 && <div style={{ color: '#6f84b8', fontSize: 11, fontFamily: 'monospace' }}>모두 업무중</div>}
          </div>
        </div>

        {/* 업무구역 */}
        <div style={{ padding: 10, background: '#0f1630' }}>
          <div style={{ fontFamily: 'monospace', color: '#9fb4e7', fontSize: 12, marginBottom: 8 }}>업무 구역 (탕비실 → 업무석 이동)</div>
          <div style={{ position: 'relative', minHeight: compact ? 170 : 250, border: '2px solid #1c2c57', background: 'linear-gradient(180deg,#121b3b,#0f1732)', borderRadius: 8, overflow: 'hidden' }}>
            {/* desks */}
            {Array.from({ length: Math.max(working.length, 4) }).map((_, i) => {
              const col = i % (compact ? 2 : 3);
              const row = Math.floor(i / (compact ? 2 : 3));
              const x = 12 + col * (compact ? 120 : 140);
              const y = 12 + row * 76;
              return (
                <div key={i} style={{ position: 'absolute', left: x, top: y, width: compact ? 90 : 110, height: 38, border: '2px solid #000', background: '#1f2d58' }} />
              );
            })}

            {working.map((agent, i) => {
              const cols = compact ? 2 : 3;
              const col = i % cols;
              const row = Math.floor(i / cols);
              const deskX = 24 + col * (compact ? 120 : 140);
              const deskY = 28 + row * 76;
              return (
                <div
                  key={agent.name}
                  className="agent-walk"
                  style={{
                    top: deskY,
                    ['--desk-x' as string]: `${deskX}px`,
                  }}
                  title={`${agent.name} (${agent.model || 'unknown'})`}
                >
                  <Sprite color={colorByModel(agent.model)} />
                  <div style={{ marginTop: 2, fontSize: 9, color: '#9edcff', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {agent.name.replace(' Agent', '')}
                  </div>
                  <div style={{ fontSize: 8, color: '#7ea8df', fontFamily: 'monospace' }}>({agent.model || 'unknown'})</div>
                </div>
              );
            })}

            {working.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f84b8', fontSize: 11, fontFamily: 'monospace' }}>
                작업 감지 대기
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '2px solid rgba(255,255,255,0.08)', padding: '6px 10px', fontSize: 11, color: '#89a0d3', fontFamily: 'monospace', background: '#0b122a' }}>
        자동 인원 반영: {agents.length}명
      </div>
    </div>
  );
}

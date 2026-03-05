'use client';

type Agent = {
  name: string;
  model?: string;
  state: string;
  detail: string;
};

function avatarColor(index: number) {
  const colors = ['#75e8ff', '#f59e0b', '#34d399', '#c4b5fd', '#fb7185', '#60a5fa'];
  return colors[index % colors.length];
}

function isWorking(state: string) {
  return state.toUpperCase() === 'RUNNING';
}

export default function PixelOffice({ agents = [] }: { agents: Agent[] }) {
  const working = agents.filter((a) => isWorking(a.state));
  const breakroom = agents.filter((a) => !isWorking(a.state));

  return (
    <div style={{ border: '1px solid rgba(117,232,255,0.25)', borderRadius: 10, overflow: 'hidden', background: '#0b1024' }}>
      <style>{`
        @keyframes pixel-work {
          0% { transform: translateY(0px); }
          25% { transform: translateY(-1px); }
          50% { transform: translateY(0px); }
          75% { transform: translateY(-1px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pixel-idle {
          0% { transform: translateX(0px); }
          50% { transform: translateX(1px); }
          100% { transform: translateX(0px); }
        }
        .pixel-working { animation: pixel-work 300ms steps(2) infinite; }
        .pixel-idle { animation: pixel-idle 900ms steps(2) infinite; }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', minHeight: 320 }}>
        <div style={{ borderRight: '2px solid rgba(255,255,255,0.08)', padding: 10, background: '#121831' }}>
          <div style={{ fontFamily: 'monospace', color: '#9fb4e7', fontSize: 12, marginBottom: 8 }}>탕비실</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(70px, 1fr))', gap: 8 }}>
            {breakroom.map((agent, i) => (
              <div key={agent.name} className="pixel-idle" title={`${agent.name} · ${agent.state}`} style={{ border: '2px solid #000', background: '#1c2549', padding: 6, imageRendering: 'pixelated' }}>
                <div style={{ width: 16, height: 16, background: avatarColor(i), border: '2px solid #000', marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: '#d4e0ff', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.name.replace(' Agent', '')}
                </div>
                <div style={{ marginTop: 2, fontSize: 9, color: '#8ea7dd', fontFamily: 'monospace' }}>({agent.model || 'unknown'})</div>
              </div>
            ))}
            {breakroom.length === 0 && <div style={{ color: '#6f84b8', fontSize: 11, fontFamily: 'monospace' }}>모두 업무중</div>}
          </div>
        </div>

        <div style={{ padding: 10, background: '#0f1630' }}>
          <div style={{ fontFamily: 'monospace', color: '#9fb4e7', fontSize: 12, marginBottom: 8 }}>업무 구역 (탕비실 → 이동 후 작업)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))', gap: 10 }}>
            {working.map((agent, i) => (
              <div key={agent.name} className="pixel-working" title={agent.detail} style={{ border: '2px solid #000', background: '#1a2242', padding: 6, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 6, right: 6, width: 6, height: 6, background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                <div style={{ width: 18, height: 18, background: avatarColor(i + 3), border: '2px solid #000', marginBottom: 4 }} />
                <div style={{ fontSize: 10, color: '#e2ebff', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.name.replace(' Agent', '')}
                </div>
                <div style={{ marginTop: 2, fontSize: 9, color: '#8fdcff', fontFamily: 'monospace' }}>({agent.model || 'unknown'})</div>
                <div style={{ marginTop: 3, fontSize: 9, color: '#77d0ff', fontFamily: 'monospace' }}>열일중</div>
              </div>
            ))}
            {working.length === 0 && <div style={{ color: '#6f84b8', fontSize: 11, fontFamily: 'monospace' }}>작업 감지 대기</div>}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '2px solid rgba(255,255,255,0.08)', padding: '6px 10px', fontSize: 11, color: '#89a0d3', fontFamily: 'monospace', background: '#0b122a' }}>
        새 에이전트가 생기면 자동으로 캐릭터가 추가됨 ({agents.length}명)
      </div>
    </div>
  );
}

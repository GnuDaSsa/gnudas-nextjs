'use client';
import { useState, useCallback } from 'react';
import { STORY, CHAR_INFO, BG_URL, CHAR_URL } from './story';
import type { CharId, CharDisplay, Position } from './story';

type Vars = { mentality: number; team_bond: number };

interface GameState {
  scene: string;
  beatIdx: number;
  vars: Vars;
  chars: CharDisplay[];
  bg: string | null;
  ended: boolean;
  endingText: string;
}

function applyEffects(vars: Vars, e: { mentality?: number; team_bond?: number }): Vars {
  return { mentality: vars.mentality + (e.mentality || 0), team_bond: vars.team_bond + (e.team_bond || 0) };
}

function updateChars(current: CharDisplay[], incoming: CharDisplay[]): CharDisplay[] {
  const next = [...current];
  for (const c of incoming) {
    const idx = next.findIndex(x => x.id === c.id);
    if (idx >= 0) next[idx] = c; else next.push(c);
  }
  return next;
}

function processToInteractive(scene: string, beatIdx: number, vars: Vars, chars: CharDisplay[], bg: string | null): GameState {
  let s = scene, i = beatIdx, v = vars, c = chars, b = bg;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const sd = STORY[s];
    if (!sd) return { scene: s, beatIdx: i, vars: v, chars: c, bg: b, ended: true, endingText: '' };
    if (i >= sd.beats.length) {
      if (sd.next) { s = sd.next; i = 0; continue; }
      return { scene: s, beatIdx: i, vars: v, chars: c, bg: b, ended: true, endingText: '' };
    }
    const beat = sd.beats[i];
    if (beat.kind === 'bg')      { b = beat.name; i++; continue; }
    if (beat.kind === 'show')    { c = updateChars(c, beat.chars); i++; continue; }
    if (beat.kind === 'hide')    { c = c.filter(ch => !beat.ids.includes(ch.id)); i++; continue; }
    if (beat.kind === 'hideAll') { c = []; i++; continue; }
    if (beat.kind === 'effects') { v = applyEffects(v, beat); i++; continue; }
    if (beat.kind === 'ending')  { return { scene: s, beatIdx: i, vars: v, chars: c, bg: b, ended: true, endingText: beat.text }; }
    return { scene: s, beatIdx: i, vars: v, chars: c, bg: b, ended: false, endingText: '' };
  }
}

const INIT = processToInteractive('start', 0, { mentality: 0, team_bond: 0 }, [], null);

function getCharStyle(pos: Position): React.CSSProperties {
  const common: React.CSSProperties = {
    position: 'absolute', bottom: '21%', height: pos === 'caller' ? '60%' : '68%',
    width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.7))',
    pointerEvents: 'none', userSelect: 'none',
  };
  if (pos === 'left'       || pos === 'left_low')   return { ...common, left: '3%', bottom: pos === 'left_low' ? '16%' : '21%' };
  if (pos === 'center'     || pos === 'center_low') return { ...common, left: '50%', transform: 'translateX(-50%)', bottom: pos === 'center_low' ? '16%' : '21%' };
  if (pos === 'right'      || pos === 'right_low')  return { ...common, right: '3%', bottom: pos === 'right_low' ? '16%' : '21%' };
  if (pos === 'caller')    return { ...common, right: '0%', bottom: '21%', height: '60%' };
  return common;
}

export default function NovelPage() {
  const [state, setState] = useState<GameState>(INIT);
  const [textKey, setTextKey] = useState(0);

  const advance = useCallback(() => {
    setState(prev => {
      if (prev.ended) return prev;
      const beat = STORY[prev.scene]?.beats[prev.beatIdx];
      if (!beat || beat.kind === 'choice') return prev;
      return processToInteractive(prev.scene, prev.beatIdx + 1, prev.vars, prev.chars, prev.bg);
    });
    setTextKey(k => k + 1);
  }, []);

  const choose = useCallback((idx: number) => {
    setState(prev => {
      const beat = STORY[prev.scene]?.beats[prev.beatIdx];
      if (!beat || beat.kind !== 'choice') return prev;
      const opt = beat.options[idx];
      const newVars = opt.effects ? applyEffects(prev.vars, opt.effects) : prev.vars;
      return processToInteractive(opt.jump, 0, newVars, prev.chars, prev.bg);
    });
    setTextKey(k => k + 1);
  }, []);

  const restart = useCallback(() => { setState(INIT); setTextKey(k => k + 1); }, []);

  const currentBeat = STORY[state.scene]?.beats[state.beatIdx];

  /* ── ENDING SCREEN ── */
  if (state.ended) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', background: '#000', color: '#f3f7ff', padding: 40 }}>
        <div style={{ fontSize: '0.9rem', color: '#7a90c8', letterSpacing: 3 }}>— ENDING —</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: 8 }}>{state.endingText}</div>
        <div style={{ fontSize: 13, color: '#7a90c8', marginTop: 12, lineHeight: 2 }}>
          멘탈 {state.vars.mentality >= 0 ? '+' : ''}{state.vars.mentality}&nbsp;&nbsp;/&nbsp;&nbsp;팀유대 +{state.vars.team_bond}
        </div>
        <button onClick={restart} style={{ marginTop: 24, padding: '0.65rem 2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#dbe8ff', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          처음부터
        </button>
      </div>
    );
  }

  /* ── GAME SCREEN ── */
  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto 2rem' }}>
      <style>{`
        @keyframes vnFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
      `}</style>

      {/* Game viewport — 16:9 */}
      <div
        style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#000', cursor: currentBeat?.kind === 'choice' ? 'default' : 'pointer', borderRadius: 4 }}
        onClick={currentBeat?.kind !== 'choice' ? advance : undefined}
      >
        {/* Background */}
        {state.bg
          ? <img src={BG_URL(state.bg)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />

        {/* Characters */}
        {state.chars.map(ch => (
          <img key={ch.id} src={CHAR_URL(ch.id as CharId)} alt={CHAR_INFO[ch.id as CharId]?.name} style={getCharStyle(ch.pos)} />
        ))}

        {/* Dialogue box */}
        {currentBeat?.kind !== 'choice' && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(4,8,28,0.91)', borderTop: '1px solid rgba(80,130,255,0.2)', padding: '14px 22px 16px', minHeight: '21%' }}>
            {currentBeat?.kind === 'dialogue' && (
              <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 5, color: CHAR_INFO[currentBeat.who]?.color || '#fff', letterSpacing: 1.5 }}>
                {CHAR_INFO[currentBeat.who]?.name}
              </div>
            )}
            <div key={textKey} style={{ fontSize: '0.95rem', color: '#eaf1ff', lineHeight: 1.9, animation: 'vnFadeIn 0.2s ease' }}>
              {(currentBeat?.kind === 'narration' || currentBeat?.kind === 'dialogue') ? currentBeat.text : null}
            </div>
            {/* Next arrow */}
            <div style={{ position: 'absolute', bottom: 8, right: 14, width: 7, height: 7, borderBottom: '2px solid #6a8fff', borderRight: '2px solid #6a8fff', transform: 'rotate(45deg)', animation: 'blink 1.2s infinite' }} />
          </div>
        )}

        {/* Choices overlay */}
        {currentBeat?.kind === 'choice' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.52)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '58%', maxWidth: 460 }}>
              {currentBeat.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  style={{ padding: '0.75rem 1.1rem', background: 'rgba(15,28,75,0.92)', border: '1px solid rgba(90,140,255,0.4)', color: '#d8e8ff', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', lineHeight: 1.6, textAlign: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(35,60,150,0.92)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(15,28,75,0.92)')}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 6, fontSize: 11, color: '#4a5a8a' }}>
        <span>멘탈 {state.vars.mentality >= 0 ? '+' : ''}{state.vars.mentality}</span>
        <span>팀유대 +{state.vars.team_bond}</span>
      </div>
    </div>
  );
}

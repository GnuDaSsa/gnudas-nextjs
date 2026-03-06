'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
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
      if (sd.next) {
        // 엔딩 분기: ending_branch 씬에서 변수로 엔딩 결정
        if (sd.next === 'ending_branch') {
          const m = v.mentality, t = v.team_bond;
          if (m >= 2 && t >= 3)      { s = 'ending_growth';   }
          else if (m < 0 && t >= 3)  { s = 'ending_team';     }
          else if (m >= 2 && t < 2)  { s = 'ending_solo';     }
          else                       { s = 'ending_burnout';  }
          i = 0; continue;
        }
        s = sd.next; i = 0; continue;
      }
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

function getCharStyle(pos: Position, id?: string): React.CSSProperties {
  const isSmallCaller = id === 'caller_ice' || id === 'caller_spring';
  const common: React.CSSProperties = {
    position: 'absolute', bottom: '21%', height: pos === 'caller' ? (isSmallCaller ? '65%' : '130%') : '68%',
    width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.7))',
    pointerEvents: 'none', userSelect: 'none',
  };
  if (pos === 'left'       || pos === 'left_low')   return { ...common, left: '3%', bottom: pos === 'left_low' ? '16%' : '21%' };
  if (pos === 'center'     || pos === 'center_low') return { ...common, left: '50%', transform: 'translateX(-50%)', bottom: pos === 'center_low' ? '16%' : '21%' };
  if (pos === 'right'      || pos === 'right_low')  return { ...common, right: '3%', bottom: pos === 'right_low' ? '16%' : '21%' };
  if (pos === 'caller')    return { ...common, top: '-47%', right: '-15%', bottom: 'auto' };
  return common;
}

// BGM zone detection: returns 1, 2, or 3
const BGM3_SCENES = new Set([
  'first_call', 'early_days', 'winter_arc', 'winter_relief',
  'ice_claim', 'choice_explain', 'choice_empathy', 'choice_escalate',
  'spring_arc', 'spring_defend', 'spring_yield', 'spring_resolution',
]);
const BGM2_SCENES = new Set([
  'transfer_end', 'ending_branch',
  'ending_growth', 'ending_team', 'ending_solo', 'ending_burnout',
]);
function getBgmTrack(scene: string, ended: boolean): 1 | 2 | 3 {
  if (ended || BGM2_SCENES.has(scene)) return 2;
  if (BGM3_SCENES.has(scene)) return 3;
  return 1;
}

export default function NovelPage() {
  const [state, setState] = useState<GameState>(INIT);
  const [textKey, setTextKey] = useState(0);
  const [bgmOn, setBgmOn] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const bgm1Ref = useRef<HTMLAudioElement | null>(null);
  const bgm2Ref = useRef<HTMLAudioElement | null>(null);
  const bgm3Ref = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const currentTrackRef = useRef(0);

  // Init audio elements once
  useEffect(() => {
    const a1 = new Audio('/novel/bgm.mp3');
    a1.loop = true; a1.volume = 0.35;
    bgm1Ref.current = a1;
    const a2 = new Audio('/novel/bgm2.mp3');
    a2.loop = true; a2.volume = 0.35;
    bgm2Ref.current = a2;
    const a3 = new Audio('/novel/bgm3.mp3');
    a3.loop = true; a3.volume = 0.35;
    bgm3Ref.current = a3;
    return () => { a1.pause(); a2.pause(); a3.pause(); };
  }, []);

  // Orientation detection
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Switch BGM based on scene — always restart from beginning on track change
  useEffect(() => {
    if (!startedRef.current) return;
    const refs = [bgm1Ref.current, bgm2Ref.current, bgm3Ref.current];
    const track = getBgmTrack(state.scene, state.ended);
    const changed = track !== currentTrackRef.current;
    currentTrackRef.current = track;
    refs.forEach((a, i) => {
      if (!a) return;
      if (i + 1 === track) {
        if (changed) { a.currentTime = 0; }
        if (bgmOn && a.paused) a.play().catch(() => {});
        else if (!bgmOn && !a.paused) a.pause();
      } else {
        if (!a.paused) a.pause();
        if (changed) a.currentTime = 0;
      }
    });
  }, [state.scene, state.ended, bgmOn]);

  // BGM toggle
  const toggleBgm = useCallback(() => {
    setBgmOn(v => {
      const next = !v;
      const refs = [bgm1Ref.current, bgm2Ref.current, bgm3Ref.current];
      const track = currentTrackRef.current;
      refs.forEach((a, i) => {
        if (!a) return;
        if (i + 1 === track) {
          if (next) a.play().catch(() => {});
          else a.pause();
        }
      });
      return next;
    });
  }, []);

  const startGame = useCallback(async () => {
    // Try Fullscreen API
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    } catch { /* ignore */ }
    // Try landscape orientation lock
    try {
      if (screen.orientation && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch { /* ignore — iOS doesn't support this */ }

    setGameStarted(true);
    startedRef.current = true;
    currentTrackRef.current = 1;
    const a1 = bgm1Ref.current;
    if (a1) { a1.currentTime = 0; a1.play().catch(() => {}); }
  }, []);

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

  const restart = useCallback(() => {
    // Exit fullscreen & unlock orientation
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if ((document as any).webkitFullscreenElement) (document as any).webkitExitFullscreen();
    } catch { /* ignore */ }
    try {
      if (screen.orientation && (screen.orientation as any).unlock) (screen.orientation as any).unlock();
    } catch { /* ignore */ }

    setState(INIT);
    setTextKey(k => k + 1);
    setGameStarted(false);
    startedRef.current = false;
    currentTrackRef.current = 0;
    [bgm1Ref, bgm2Ref, bgm3Ref].forEach(r => { if (r.current) { r.current.pause(); r.current.currentTime = 0; } });
  }, []);

  const currentBeat = STORY[state.scene]?.beats[state.beatIdx];
  const m = state.vars.mentality;
  const t = state.vars.team_bond;

  /* ── START SCREEN ── */
  if (!gameStarted) {
    return (
      <div style={{ width: '100%', maxWidth: 900, margin: '0 auto 2rem' }}>
        <style>{`
          @keyframes titleFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes startPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(106,143,255,0.4); } 50% { box-shadow: 0 0 0 8px rgba(106,143,255,0); } }
        `}</style>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', background: '#050a1a', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(30,60,160,0.25) 0%, transparent 70%)' }} />
          <div style={{ animation: 'titleFadeIn 0.8s ease both', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#4a6aaa', letterSpacing: '0.3em', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Visual Novel</div>
            <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, color: '#dce8ff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.4rem' }}>공무원 1년차</div>
            <div style={{ fontSize: 'clamp(0.8rem, 2vw, 1.05rem)', color: '#6a8aaa', letterSpacing: '0.12em', marginBottom: '2.8rem' }}>토목직 첫 발령 이야기</div>
            <button
              onClick={startGame}
              style={{ padding: '0.75rem 2.8rem', background: 'rgba(30,55,160,0.7)', border: '1px solid rgba(106,143,255,0.6)', color: '#c8deff', borderRadius: 8, cursor: 'pointer', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.15em', animation: 'startPulse 2s ease infinite' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(50,85,210,0.85)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(30,55,160,0.7)')}
            >
              시작
            </button>
          </div>
          <div style={{ position: 'absolute', bottom: 14, fontFamily: 'monospace', fontSize: '0.62rem', color: '#2a3a5a', letterSpacing: '0.1em' }}>© 2026 DLC — AI Club</div>
        </div>
      </div>
    );
  }

  /* ── FULLSCREEN WRAPPER (game + ending) ── */
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        @keyframes vnFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.2; } }
        @keyframes rotateBounce { 0%,100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
      `}</style>

      {/* Portrait rotation prompt — covers everything */}
      {isPortrait && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(2,4,18,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#c8deff', textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '2.8rem', animation: 'rotateBounce 1.6s ease-in-out infinite', display: 'inline-block' }}>📱</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>기기를 가로로 돌려주세요</div>
          <div style={{ fontSize: '0.78rem', color: '#4a6aaa', lineHeight: 1.6 }}>가로 모드에서 최적으로 플레이됩니다</div>
          <button onClick={restart} style={{ marginTop: 8, padding: '0.5rem 1.4rem', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#555', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            나가기
          </button>
        </div>
      )}

      {/* ── ENDING SCREEN ── */}
      {state.ended ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, textAlign: 'center', color: '#f3f7ff', padding: 40 }}>
          <div style={{ fontSize: '0.9rem', color: '#7a90c8', letterSpacing: 3 }}>— ENDING —</div>
          <div style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 800, marginTop: 4 }}>{state.endingText}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <div style={{ padding: '0.5rem 1.1rem', background: 'rgba(80,120,255,0.12)', border: '1px solid rgba(80,120,255,0.25)', borderRadius: 8, fontSize: 13, color: '#8aacff' }}>
              <div style={{ fontSize: '0.65rem', color: '#4a5a8a', marginBottom: 2, letterSpacing: 1 }}>멘탈</div>
              <div style={{ fontWeight: 700 }}>{m >= 0 ? '+' : ''}{m}</div>
            </div>
            <div style={{ padding: '0.5rem 1.1rem', background: 'rgba(80,200,180,0.1)', border: '1px solid rgba(80,200,180,0.2)', borderRadius: 8, fontSize: 13, color: '#6adfc8' }}>
              <div style={{ fontSize: '0.65rem', color: '#3a6a5a', marginBottom: 2, letterSpacing: 1 }}>팀유대</div>
              <div style={{ fontWeight: 700 }}>{t >= 0 ? '+' : ''}{t}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button onClick={restart} style={{ padding: '0.65rem 2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#dbe8ff', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              처음부터
            </button>
            <button onClick={toggleBgm} style={{ padding: '0.65rem 1rem', background: bgmOn ? 'rgba(60,90,200,0.3)' : 'rgba(40,40,50,0.5)', border: `1px solid ${bgmOn ? 'rgba(106,143,255,0.5)' : 'rgba(80,80,100,0.4)'}`, color: bgmOn ? '#8aacff' : '#555', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
              {bgmOn ? '♪ BGM ON' : '♪ BGM OFF'}
            </button>
          </div>
        </div>
      ) : (
        /* ── GAME SCREEN — fills screen with letterboxing ── */
        <div
          style={{ position: 'relative', width: 'min(100vw, calc(100vh * 16 / 9))', aspectRatio: '16/9', overflow: 'hidden', background: '#000', cursor: currentBeat?.kind === 'choice' ? 'default' : 'pointer' }}
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
            <img key={ch.id} src={CHAR_URL(ch.id as CharId)} alt={CHAR_INFO[ch.id as CharId]?.name} style={getCharStyle(ch.pos, ch.id)} />
          ))}

          {/* TOP-LEFT: Stats box */}
          <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, pointerEvents: 'none' }}>
            <div style={{ padding: '5px 10px', background: 'rgba(4,8,28,0.82)', border: '1px solid rgba(80,120,255,0.35)', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '0.55rem', color: '#4a5a8a', letterSpacing: '0.1em', marginBottom: 1 }}>멘탈</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: m >= 0 ? '#8aacff' : '#ff7a7a', lineHeight: 1 }}>{m >= 0 ? '+' : ''}{m}</div>
            </div>
            <div style={{ padding: '5px 10px', background: 'rgba(4,8,28,0.82)', border: '1px solid rgba(80,200,160,0.3)', borderRadius: 6, backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '0.55rem', color: '#3a6a5a', letterSpacing: '0.1em', marginBottom: 1 }}>팀유대</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6adfc8', lineHeight: 1 }}>{t >= 0 ? '+' : ''}{t}</div>
            </div>
          </div>

          {/* TOP-RIGHT: BGM button */}
          <button
            onClick={e => { e.stopPropagation(); toggleBgm(); }}
            style={{ position: 'absolute', top: 10, right: 10, padding: '5px 10px', background: bgmOn ? 'rgba(30,55,140,0.75)' : 'rgba(20,20,30,0.75)', border: `1px solid ${bgmOn ? 'rgba(106,143,255,0.5)' : 'rgba(80,80,100,0.4)'}`, borderRadius: 6, color: bgmOn ? '#8aacff' : '#555', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, backdropFilter: 'blur(4px)', lineHeight: 1.4 }}
          >
            {bgmOn ? '♪ ON' : '♪ OFF'}
          </button>

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
      )}
    </div>
  );
}

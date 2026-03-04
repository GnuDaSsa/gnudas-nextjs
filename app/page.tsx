export default function HomePage() {
  return (
    <div className="anim-fadeIn" style={{ maxWidth: 1260, margin: '2rem auto 1rem', padding: '0 1rem' }}>
      {/* Top Banner */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: 160,
        borderRadius: 20,
        border: '1px solid rgba(133,209,255,.56)',
        background: 'linear-gradient(90deg, rgba(9,25,82,.92), rgba(55,21,105,.94))',
        boxShadow: '0 16px 46px rgba(0,0,0,.38)',
        padding: '1rem 1.4rem',
        marginBottom: '1rem',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(7,12,34,.68), rgba(19,12,52,.62))',
        }} />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '.36rem' }}>
          <div style={{ color: '#7bd6ff', fontSize: '0.86rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>
            AI CLUB
          </div>
          <div style={{ color: '#bfd8ff', fontSize: '0.78rem', fontWeight: 700 }}>
            Updated 2026-02-13
          </div>
          <div style={{ color: '#f8fbff', fontSize: 'clamp(1.55rem, 2.9vw, 2.55rem)', fontWeight: 900, textShadow: '0 0 16px rgba(103,229,255,.38)' }}>
            Deep Learning Crew
          </div>
          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginTop: '.2rem' }}>
            {['회장 사진우', '총무 김동주'].map((b) => (
              <span key={b} style={{
                display: 'inline-flex', alignItems: 'center', padding: '.34rem .74rem',
                borderRadius: 999, border: '1px solid rgba(130,207,255,.58)',
                background: 'rgba(8,20,50,.64)', color: '#f2f8ff', fontSize: '0.86rem', fontWeight: 800,
              }}>{b}</span>
            ))}
          </div>
          <div style={{ marginTop: '.28rem', height: 2, width: 'min(580px,95%)', background: 'linear-gradient(90deg,rgba(122,223,255,.95),rgba(194,118,255,.78))', borderRadius: 2 }} />
        </div>
      </div>

      {/* Info Panel */}
      <section className="glass-card" style={{ padding: '1.45rem 1.5rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '.8rem' }}>
        <h2 style={{ margin: 0, fontSize: 'calc(1.3rem + 2pt)', fontWeight: 900, color: '#f3f7ff' }}>Main Hub</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
          {['AUTOMATION', 'INNOVATION', 'CODING', 'CONTENT', 'COMPETITION'].map((c) => (
            <span key={c} style={{
              padding: '.5rem .85rem', borderRadius: 999, border: '1px solid rgba(150,197,255,.42)',
              background: 'rgba(12,26,62,.56)', color: '#e6efff', fontSize: '0.96rem', fontWeight: 700,
            }}>{c}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '.85rem' }}>
          <div style={{ borderRadius: 14, border: '1px solid rgba(165,201,255,.33)', background: 'linear-gradient(180deg,rgba(17,28,65,.48),rgba(11,18,45,.56))', padding: '.86rem' }}>
            <p style={{ margin: '0 0 .55rem', color: '#f7fbff', fontSize: '1.08rem', fontWeight: 800 }}>활동내용 - Passive</p>
            {['자료공유', '아이디어 제안 및 고도화', '업무활용사례 질의응답', '카톡방 운영'].map((l) => (
              <p key={l} style={{ margin: '.34rem 0', color: '#c4d4f3', fontSize: '1rem', fontWeight: 600 }}>{l}</p>
            ))}
          </div>
          <div style={{ borderRadius: 14, border: '1px solid rgba(165,201,255,.33)', background: 'linear-gradient(180deg,rgba(17,28,65,.48),rgba(11,18,45,.56))', padding: '.86rem' }}>
            <p style={{ margin: '0 0 .55rem', color: '#f7fbff', fontSize: '1.08rem', fontWeight: 800 }}>활동내용 - Active</p>
            {['반기 1회 오프라인 모임', '아이디어회의'].map((l) => (
              <p key={l} style={{ margin: '.34rem 0', color: '#c4d4f3', fontSize: '1rem', fontWeight: 600 }}>{l}</p>
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 14, border: '1px solid rgba(165,201,255,.33)', background: 'linear-gradient(180deg,rgba(17,28,65,.48),rgba(11,18,45,.56))', padding: '.86rem' }}>
          <p style={{ margin: '0 0 .4rem', color: '#f7fbff', fontSize: '1.08rem', fontWeight: 800 }}>이번 분기 목표</p>
          <p style={{ margin: 0, color: '#c4d4f3', fontSize: '1rem', fontWeight: 600 }}>나만의 AI콘텐츠 만들기</p>
        </div>

        <div style={{ borderRadius: 12, border: '1px solid rgba(103,229,255,.4)', background: 'linear-gradient(90deg,rgba(10,30,67,.58),rgba(27,20,74,.52))', color: '#dbedff', fontSize: '0.94rem', fontWeight: 700, padding: '.78rem .9rem' }}>
          좌측 탭에서 기능을 선택하여 활용하세요.
        </div>
      </section>
    </div>
  );
}

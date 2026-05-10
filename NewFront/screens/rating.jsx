/* ============================================
   CodeBattle — Rating screen (hub:8003/profile/rating)
   ============================================ */

const LEADERBOARD = [
  { rank: 1, name: 'recurzilla',   rating: 2104, w: 412, l: 88,  wr: 82, change: +12 },
  { rank: 2, name: 'big_o_legend', rating: 2057, w: 388, l: 102, wr: 79, change: -3 },
  { rank: 3, name: 'sigsegv',      rating: 1998, w: 354, l: 121, wr: 75, change: +8 },
  { rank: 4, name: 'overflow_x',   rating: 1842, w: 281, l: 119, wr: 70, change: +2 },
  { rank: 5, name: 'kernel_panic', rating: 1602, w: 187, l: 92,  wr: 67, change: +24 },
  { rank: 6, name: 'segfault_99',  rating: 1620, w: 198, l: 109, wr: 65, change: -7 },
  { rank: 7, name: 'bytewise',     rating: 1559, w: 142, l: 88,  wr: 62, change: +5 },
  { rank: 8, name: 'thread_err',   rating: 1532, w: 156, l: 98,  wr: 61, change: 0 },
  { rank: 9, name: 'devnull42',    rating: 1481, w: 119, l: 84,  wr: 59, change: -4 },
  { rank: 10, name: 'null_ptr',    rating: 1497, w: 108, l: 79,  wr: 58, change: +1 },
];

const Medal = ({ rank }) => {
  if (rank > 3) return null;
  const colors = {
    1: { bg: 'oklch(0.78 0.15 85 / 0.18)',  fg: 'oklch(0.85 0.16 85)'  },
    2: { bg: 'oklch(0.7 0.04 280 / 0.2)',   fg: 'oklch(0.82 0.03 280)' },
    3: { bg: 'oklch(0.55 0.13 50 / 0.18)',  fg: 'oklch(0.72 0.13 50)'  },
  }[rank];
  return (
    <span style={{
      width: 26, height: 26,
      borderRadius: '50%',
      background: colors.bg,
      color: colors.fg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 700,
      border: `1px solid ${colors.fg}`,
    }}>{rank}</span>
  );
};

const RatingScreen = ({ user, rating }) => {
  const [scope, setScope] = useState('global'); // global | friends | weekly
  // Insert "you" into the leaderboard at rank 142
  const youEntry = { rank: 142, name: user, rating: rating, w: 54, l: 33, wr: 62, change: +24, isYou: true };

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rating</h1>
          <div className="page-subtitle">hub · 8003 · /profile/rating</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          {[
            { k: 'global', label: 'Global' },
            { k: 'friends', label: 'Friends' },
            { k: 'weekly', label: 'This week' },
          ].map(t => (
            <button key={t.k} onClick={() => setScope(t.k)} style={{
              padding: '6px 12px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRadius: 'var(--r-sm)',
              background: scope === t.k ? 'var(--surface-3)' : 'transparent',
              color: scope === t.k ? 'var(--text)' : 'var(--text-muted)',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Your position card */}
      <div style={{
        background: 'linear-gradient(135deg, oklch(0.22 0.06 290), oklch(0.14 0.04 280))',
        border: '1px solid oklch(0.4 0.12 290 / 0.4)',
        borderRadius: 'var(--r-xl)',
        padding: '20px 24px',
        marginBottom: 20,
        display: 'grid',
        gridTemplateColumns: '60px 1fr 130px 200px 140px',
        gap: 20,
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: -40, right: -40,
          width: 200, height: 200,
          background: 'radial-gradient(circle, oklch(0.7 0.18 290 / 0.3), transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--accent-text)',
          letterSpacing: '-0.02em',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', letterSpacing: '0.1em' }}>RANK</span>
          #{youEntry.rank}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={user} size={46} accent online/>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
              {user} <span className="badge badge-accent" style={{ marginLeft: 6, fontSize: 9 }}>you</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {youEntry.w} W / {youEntry.l} L · joined Mar '26
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>ELO</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600 }}>
            {rating}
            <span style={{ fontSize: 11, color: 'var(--success)', marginLeft: 6 }}>+{youEntry.change}</span>
          </div>
        </div>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            <span>WINRATE</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{youEntry.wr}%</span>
          </div>
          <ProgressBar value={youEntry.wr} max={100} color="var(--accent)"/>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>NEXT TIER</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, marginTop: 2 }}>
            <span style={{ color: 'var(--accent-text)' }}>Diamond</span>
            <span style={{ color: 'var(--text-muted)' }}> · 28 ELO</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card-flat" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr 110px 110px 200px 90px',
          gap: 12,
          padding: '12px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          <div>Rank</div>
          <div>Player</div>
          <div>ELO</div>
          <div>W / L</div>
          <div>Winrate</div>
          <div style={{ textAlign: 'right' }}>7d</div>
        </div>

        {LEADERBOARD.map((e, i) => (
          <div key={e.name} style={{
            display: 'grid',
            gridTemplateColumns: '70px 1fr 110px 110px 200px 90px',
            gap: 12,
            padding: '14px 18px',
            borderBottom: i === LEADERBOARD.length - 1 ? 'none' : '1px solid var(--border)',
            alignItems: 'center',
            background: e.rank <= 3 ? 'oklch(0.7 0.18 290 / 0.025)' : 'transparent',
          }}>
            <div>
              {e.rank <= 3 ? <Medal rank={e.rank}/> :
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', paddingLeft: 4 }}>{e.rank}</span>
              }
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar name={e.name} size={30}/>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                {e.rank <= 3 && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: e.rank === 1 ? 'oklch(0.85 0.16 85)' : e.rank === 2 ? 'oklch(0.82 0.03 280)' : 'oklch(0.72 0.13 50)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}>
                    {e.rank === 1 ? 'champion' : e.rank === 2 ? 'silver' : 'bronze'}
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600 }}>
              {e.rating}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
              <span style={{ color: 'var(--success)' }}>{e.w}</span>
              <span style={{ color: 'var(--text-faint)' }}> / </span>
              <span style={{ color: 'var(--danger)' }}>{e.l}</span>
            </div>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                <span style={{ color: 'var(--text)' }}>{e.wr}%</span>
              </div>
              <ProgressBar value={e.wr} max={100} color={e.rank === 1 ? 'oklch(0.85 0.16 85)' : 'var(--accent)'} height={4}/>
            </div>
            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 500,
              color: e.change > 0 ? 'var(--success)' : e.change < 0 ? 'var(--danger)' : 'var(--text-muted)',
            }}>
              {e.change > 0 ? '↑ +' : e.change < 0 ? '↓ ' : '— '}
              {e.change !== 0 ? Math.abs(e.change) : ''}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-faint)',
        letterSpacing: '0.05em',
      }}>
        showing top 10 of 4,287 ranked players · updated 2m ago
      </div>
    </div>
  );
};

Object.assign(window, { RatingScreen });

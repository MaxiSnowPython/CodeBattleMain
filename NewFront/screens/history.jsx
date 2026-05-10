/* ============================================
   CodeBattle — History screen (game:8002/game/history)
   ============================================ */

const HISTORY_DATA = [
  { id: 'a3f9c2', opp: 'kernel_panic', oppRating: 1602, task: 'two_sum',          result: 'WIN',  delta: +24, time: '4m 12s', date: 'May 9, 2026 · 14:08' },
  { id: '7e8b41', opp: 'devnull42',    oppRating: 1481, task: 'lru_cache',        result: 'LOSS', delta: -18, time: '9m 02s', date: 'May 9, 2026 · 11:31' },
  { id: 'b1d022', opp: 'bytewise',     oppRating: 1559, task: 'longest_substr',   result: 'WIN',  delta: +21, time: '6m 47s', date: 'May 8, 2026 · 22:14' },
  { id: 'c4e7a8', opp: 'segfault_99',  oppRating: 1620, task: 'merge_intervals',  result: 'WIN',  delta: +27, time: '7m 53s', date: 'May 8, 2026 · 19:02' },
  { id: 'f9d3a1', opp: 'null_ptr',     oppRating: 1497, task: 'valid_parens',     result: 'WIN',  delta: +20, time: '3m 24s', date: 'May 7, 2026 · 21:45' },
  { id: 'e2c0bb', opp: 'recurzilla',   oppRating: 1654, task: 'reverse_linked',   result: 'LOSS', delta: -22, time: '11m 17s', date: 'May 7, 2026 · 17:09' },
  { id: 'd6f3e0', opp: 'thread_err',   oppRating: 1532, task: 'group_anagrams',   result: 'WIN',  delta: +19, time: '5m 38s', date: 'May 6, 2026 · 23:51' },
  { id: '8a7211', opp: 'mem_leak',     oppRating: 1488, task: 'palindrome',       result: 'WIN',  delta: +18, time: '2m 56s', date: 'May 6, 2026 · 16:22' },
  { id: '5bc9f4', opp: 'overflow_x',   oppRating: 1607, task: 'sliding_window',   result: 'LOSS', delta: -20, time: '10m 04s', date: 'May 5, 2026 · 14:48' },
];

const HistoryScreen = ({ onOpen, onBack }) => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all'
    ? HISTORY_DATA
    : HISTORY_DATA.filter(m => m.result === filter.toUpperCase());

  const wins = HISTORY_DATA.filter(m => m.result === 'WIN').length;
  const losses = HISTORY_DATA.filter(m => m.result === 'LOSS').length;
  const total = HISTORY_DATA.length;
  const winrate = Math.round((wins / total) * 100);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* header strip — no sidebar, but small top nav for context */}
      <header style={{
        background: 'var(--surface-0)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
        }}>
          <span style={{ color: 'var(--accent-text)' }}>⚡</span>
          <span>CB</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          paddingLeft: 14,
          borderLeft: '1px solid var(--border)',
        }}>
          game · 8002 · /game/history
        </div>
        <span className="spacer"/>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back to Arena
        </button>
      </header>

      <div className="page" style={{ flex: 1 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Match History</h1>
            <div className="page-subtitle">{total} matches · last 7 days</div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          <Stat label="Matches" value={total} sub="this week"/>
          <Stat label="Wins" value={wins} sub={`${wins} W / ${losses} L`} accent/>
          <Stat label="Losses" value={losses} sub="−60 ELO total"/>
          <Stat label="Winrate" value={`${winrate}%`} sub="↑ 4% from last week"/>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 14,
          padding: 4,
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)',
          width: 'fit-content',
        }}>
          {[
            { k: 'all', label: 'All', n: total },
            { k: 'win', label: 'Wins', n: wins },
            { k: 'loss', label: 'Losses', n: losses },
          ].map(t => (
            <button key={t.k} onClick={() => setFilter(t.k)} style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              borderRadius: 'var(--r-sm)',
              background: filter === t.k ? 'var(--surface-3)' : 'transparent',
              color: filter === t.k ? 'var(--text)' : 'var(--text-muted)',
            }}>{t.label} <span style={{ color: 'var(--text-faint)', marginLeft: 6 }}>{t.n}</span></button>
          ))}
        </div>

        {/* Table */}
        <div className="card-flat" style={{ overflow: 'hidden' }}>
          {/* header row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1.4fr 1.2fr 100px 90px 1fr 24px',
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
            <div>Result</div>
            <div>Opponent</div>
            <div>Task</div>
            <div>ELO Δ</div>
            <div>Duration</div>
            <div>Date</div>
            <div></div>
          </div>

          {filtered.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onOpen?.(m)}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1.4fr 1.2fr 100px 90px 1fr 24px',
                gap: 12,
                padding: '14px 18px',
                borderBottom: i === filtered.length - 1 ? 'none' : '1px solid var(--border)',
                width: '100%',
                textAlign: 'left',
                alignItems: 'center',
                transition: 'background 0.12s',
                background: 'transparent',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <span className={`badge ${m.result === 'WIN' ? 'badge-success' : 'badge-danger'}`}>
                  {m.result}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={m.opp} size={26}/>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{m.opp}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>ELO {m.oppRating}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-dim)' }}>
                <span style={{ color: 'var(--accent-text)' }}>#</span>{m.task}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 500,
                color: m.delta > 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {m.delta > 0 ? '+' : ''}{m.delta}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                {m.time}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {m.date}
              </div>
              <div style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { HistoryScreen });

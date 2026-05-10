/* ============================================
   CodeBattle — Matchmaking screen (match:8001)
   ============================================ */

const LANGUAGES = [
  { id: 'python', label: 'Python', ext: '.py', active: true, hint: '3.11' },
  { id: 'js', label: 'JavaScript', ext: '.js', active: false, hint: 'WIP' },
  { id: 'go', label: 'Go', ext: '.go', active: false, hint: 'WIP' },
  { id: 'rust', label: 'Rust', ext: '.rs', active: false, hint: 'WIP' },
];

const LangGlyph = ({ id, size = 28 }) => {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (id) {
    case 'python': return (
      <svg {...common}><path d="M9 3h4a3 3 0 0 1 3 3v4H8a3 3 0 0 0-3 3v3a3 3 0 0 0 3 3h2"/><path d="M15 21h-4a3 3 0 0 1-3-3v-4h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3h-2"/><circle cx="10" cy="6.5" r=".6" fill="currentColor"/><circle cx="14" cy="17.5" r=".6" fill="currentColor"/></svg>
    );
    case 'js': return (
      <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M10 10v6a2 2 0 0 1-3 0M14 10c.5 0 2 .2 2 2s-3 1.5-3 3.5 1 1.5 3 1.5"/></svg>
    );
    case 'go': return (
      <svg {...common}><path d="M3 9h5M2 12h4M3 15h5"/><path d="M21 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"/><circle cx="14.5" cy="11.5" r=".7" fill="currentColor"/></svg>
    );
    case 'rust': return (
      <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M8 8h6a2 2 0 1 1 0 4h-3M8 8v8M11 12h2l3 4M8 12h3"/></svg>
    );
    default: return null;
  }
};

const LangCard = ({ lang, selected, onSelect }) => {
  const disabled = !lang.active;
  return (
    <button
      onClick={() => !disabled && onSelect(lang.id)}
      disabled={disabled}
      style={{
        position: 'relative',
        background: selected ? 'var(--accent-softer)' : 'var(--surface-1)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.15s',
        textAlign: 'left',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          color: selected ? 'var(--accent-text)' : 'var(--text-dim)',
        }}>
          <LangGlyph id={lang.id} size={24} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: disabled ? 'var(--warning)' : 'var(--text-muted)',
          letterSpacing: '0.05em',
        }}>{lang.hint}</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>{lang.label}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lang.ext}</div>
      </div>
      {selected && (
        <span style={{
          position: 'absolute', top: 10, right: 10,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'oklch(0.15 0.05 290)',
        }}>
          <Icon name="check" size={11} stroke={2.5}/>
        </span>
      )}
    </button>
  );
};

const SearchingPanel = ({ onCancel }) => {
  const [seconds, setSeconds] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const statuses = [
    'connecting to matchmaking pool…',
    'evaluating ELO ±150…',
    'searching opponents in pool…',
    'waiting for handshake…',
  ];

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    const s = setInterval(() => setStatusIdx(i => (i + 1) % statuses.length), 1800);
    return () => { clearInterval(t); clearInterval(s); };
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="fade-in" style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      padding: '40px 32px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* radar pulses */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 200, height: 200,
            marginTop: -100, marginLeft: -100,
            borderRadius: '50%',
            border: '1px solid oklch(0.7 0.18 290 / 0.3)',
            animation: `radar 2.4s ease-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}/>
        ))}
      </div>
      <style>{`
        @keyframes radar {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent-soft)',
          margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-text)',
          border: '1px solid oklch(0.7 0.18 290 / 0.3)',
        }}>
          <Spinner size={28} />
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'var(--accent-text)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>Searching for opponent</div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 36,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          marginBottom: 6,
        }}>{mm}:{ss}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', minHeight: 18 }}>
          {statuses[statusIdx]}
        </div>
        <button className="btn btn-secondary" onClick={onCancel} style={{ marginTop: 24 }}>
          <Icon name="x" size={13}/> Cancel search
        </button>
      </div>
    </div>
  );
};

const MatchmakingScreen = ({ user, rating, onMatchFound }) => {
  const [selected, setSelected] = useState('python');
  const [searching, setSearching] = useState(false);
  const findTimerRef = useRef(null);

  const startSearch = () => {
    setSearching(true);
    findTimerRef.current = setTimeout(() => {
      setSearching(false);
      onMatchFound();
    }, 4000);
  };

  const cancelSearch = () => {
    setSearching(false);
    clearTimeout(findTimerRef.current);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Arena</h1>
          <div className="page-subtitle">match · 8001 · 1v1 ranked</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-muted">
            <span className="dot" style={{ background: 'var(--success)' }}/>
            {Math.floor(Math.random() * 200) + 380} online
          </span>
          <span className="badge badge-accent">
            <Icon name="flame" size={11}/> ELO {rating}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TerminalGreeting user={user} />

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Choose language</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>1 / 4 available</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {LANGUAGES.map(lang => (
                <LangCard key={lang.id} lang={lang} selected={selected === lang.id} onSelect={setSelected} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!searching ? (
            <div style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: '32px 28px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>Ready to play</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>1v1 · Ranked</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                random task · ~10 min · ELO ±25
              </div>
              <button onClick={startSearch} className="btn btn-primary btn-lg" style={{
                width: '100%',
                padding: '18px 22px',
                fontSize: 15,
                boxShadow: 'var(--shadow-glow)',
              }}>
                <Icon name="play" size={14}/> Find Match
              </button>
              <div style={{
                marginTop: 16,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-faint)',
                letterSpacing: '0.08em',
              }}>
                press [F] to queue
              </div>
            </div>
          ) : (
            <SearchingPanel onCancel={cancelSearch} />
          )}

          <div className="card-flat" style={{ padding: '14px 16px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>Recent battles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { opp: 'kernel_panic', task: 'two_sum', won: true, t: '2h' },
                { opp: 'devnull42', task: 'lru_cache', won: false, t: '5h' },
                { opp: 'bytewise', task: 'longest_substr', won: true, t: '1d' },
              ].map((m, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontFamily: 'var(--font-mono)', fontSize: 12,
                }}>
                  <span style={{
                    width: 28, fontSize: 10,
                    color: m.won ? 'var(--success)' : 'var(--danger)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}>{m.won ? 'WIN' : 'LOSS'}</span>
                  <span style={{ color: 'var(--text)' }}>vs {m.opp}</span>
                  <span className="spacer"/>
                  <span style={{ color: 'var(--text-faint)' }}>{m.t} ago</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MatchmakingScreen });

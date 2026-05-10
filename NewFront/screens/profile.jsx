/* ============================================
   CodeBattle — Profile screen (hub:8003/profile/)
   ============================================ */

const FRIENDS = [
  { name: 'kernel_panic', rating: 1602, status: 'online',  activity: 'in match' },
  { name: 'devnull42',    rating: 1481, status: 'online',  activity: 'idle' },
  { name: 'bytewise',     rating: 1559, status: 'online',  activity: 'queueing' },
  { name: 'segfault_99',  rating: 1620, status: 'offline', activity: '2h ago' },
  { name: 'null_ptr',     rating: 1497, status: 'offline', activity: '6h ago' },
  { name: 'recurzilla',   rating: 1654, status: 'offline', activity: '1d ago' },
];

const REQUESTS = [
  { name: 'thread_err',  rating: 1532, mutual: 2 },
  { name: 'mem_leak',    rating: 1488, mutual: 0 },
];

const ProfileScreen = ({ user, rating, onChat }) => {
  const [tab, setTab] = useState('friends');
  const [addInput, setAddInput] = useState('');

  return (
    <div className="page" style={{ maxWidth: 1240 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <div className="page-subtitle">hub · 8003 · /profile/</div>
        </div>
        <button className="btn btn-secondary btn-sm">
          Edit profile
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT — user card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            padding: '28px 22px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* glow */}
            <div style={{
              position: 'absolute',
              top: -60, right: -60,
              width: 200, height: 200,
              background: 'radial-gradient(circle, oklch(0.6 0.18 290 / 0.18), transparent 70%)',
              pointerEvents: 'none',
            }}/>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar name={user} size={92} accent online/>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 18,
                fontWeight: 600,
                marginTop: 14,
                letterSpacing: '-0.01em',
              }}>{user}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                marginTop: 2,
              }}>
                joined Mar 2026 · py.dev
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <span className="badge badge-accent">
                  <Icon name="flame" size={10}/> ELO {rating}
                </span>
                <span className="badge badge-muted">
                  <Icon name="medal" size={10}/> Rank #142
                </span>
              </div>
            </div>

            {/* stat grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              marginTop: 24,
              background: 'var(--border)',
              borderRadius: 'var(--r-md)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}>
              {[
                { l: 'Matches', v: 87 },
                { l: 'Wins',    v: 54, hi: true },
                { l: 'Friends', v: 12 },
                { l: 'Winrate', v: '62%', hi: true },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'var(--surface-1)',
                  padding: '14px 14px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>{s.l}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 22,
                    fontWeight: 600,
                    marginTop: 4,
                    color: s.hi ? 'var(--accent-text)' : 'var(--text)',
                  }}>{s.v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="btn btn-primary" style={{ flex: 1 }}>
                <Icon name="play" size={12}/> Find Match
              </button>
              <button className="btn btn-secondary" style={{ flex: 1 }}>
                Settings
              </button>
            </div>
          </div>

          {/* small recent activity */}
          <div className="card-flat" style={{ padding: 16 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>Activity · last 12 days</div>
            {/* contribution-style heatmap */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 3,
            }}>
              {Array.from({length: 12}).map((_, i) => {
                const intensity = [0.05, 0.15, 0.3, 0.55, 0.8][Math.floor(Math.random() * 5)];
                return (
                  <div key={i} style={{
                    aspectRatio: '1/1',
                    background: `oklch(0.7 0.18 290 / ${intensity})`,
                    borderRadius: 3,
                    border: '1px solid var(--border)',
                  }}/>
                );
              })}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-faint)',
            }}>
              <span>less</span>
              <span>32 matches in 12 days</span>
              <span>more</span>
            </div>
          </div>
        </div>

        {/* RIGHT — friends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { k: 'friends',  label: 'Friends',  n: FRIENDS.length },
              { k: 'requests', label: 'Requests', n: REQUESTS.length },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 500,
                color: tab === t.k ? 'var(--text)' : 'var(--text-muted)',
                position: 'relative',
              }}>
                {t.label}
                <span style={{
                  marginLeft: 6,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  background: tab === t.k ? 'var(--accent-soft)' : 'var(--surface-2)',
                  color: tab === t.k ? 'var(--accent-text)' : 'var(--text-muted)',
                  padding: '1px 7px',
                  borderRadius: 999,
                }}>{t.n}</span>
                {tab === t.k && (
                  <span style={{
                    position: 'absolute',
                    bottom: -1, left: 8, right: 8,
                    height: 2,
                    background: 'var(--accent)',
                    borderRadius: 2,
                  }}/>
                )}
              </button>
            ))}
          </div>

          {tab === 'friends' && (
            <>
              {/* add friend */}
              <div style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '14px 16px',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}>
                <Icon name="plus" size={14}/>
                <input
                  className="input"
                  placeholder="Add friend by username…"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  style={{ background: 'var(--surface-0)', border: '1px solid var(--border)' }}
                />
                <button className="btn btn-primary" disabled={!addInput.trim()}>Send</button>
              </div>

              <div className="card-flat" style={{ overflow: 'hidden' }}>
                {FRIENDS.map((f, i) => (
                  <div key={f.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: i === FRIENDS.length - 1 ? 'none' : '1px solid var(--border)',
                  }}>
                    <Avatar name={f.name} size={34} online={f.status === 'online'}/>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{f.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                          ELO {f.rating}
                        </span>
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: f.status === 'online' ? 'var(--success)' : 'var(--text-muted)',
                        marginTop: 2,
                      }}>
                        {f.activity}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => onChat?.(f.name)}>
                      <Icon name="chat" size={12}/>
                    </button>
                    <button className="btn btn-secondary btn-sm" disabled={f.status !== 'online'}>
                      <Icon name="sword" size={12}/> Challenge
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'requests' && (
            <div className="card-flat" style={{ overflow: 'hidden' }}>
              {REQUESTS.map((r, i) => (
                <div key={r.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: i === REQUESTS.length - 1 ? 'none' : '1px solid var(--border)',
                }}>
                  <Avatar name={r.name} size={34}/>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      ELO {r.rating}{r.mutual > 0 && ` · ${r.mutual} mutual`}
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">Decline</button>
                  <button className="btn btn-primary btn-sm">
                    <Icon name="check" size={12}/> Accept
                  </button>
                </div>
              ))}
              {REQUESTS.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  No pending requests
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Floating Chat ---------- */
const ChatWindow = ({ open, friend, onClose }) => {
  const [messages, setMessages] = useState([
    { from: friend, text: 'gg, that was a tight one', t: '14:09' },
    { from: 'me', text: 'thx, your dp solution was clean', t: '14:10' },
    { from: friend, text: 'wanna run another round?', t: '14:11' },
  ]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (!open) return null;

  const send = () => {
    if (!draft.trim()) return;
    setMessages([...messages, { from: 'me', text: draft, t: '14:12' }]);
    setDraft('');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 320,
      height: 420,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-strong)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50,
      overflow: 'hidden',
    }} className="slide-up">
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--surface-0)',
      }}>
        <Avatar name={friend} size={28} online/>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>{friend}</div>
          <div style={{ fontSize: 10, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>online</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: 6 }}>
          <Icon name="x" size={12}/>
        </button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => {
          const me = m.from === 'me';
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start' }}>
              <div style={{
                background: me ? 'var(--accent-soft)' : 'var(--surface-2)',
                color: me ? 'var(--accent-text)' : 'var(--text)',
                padding: '7px 11px',
                borderRadius: me ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                fontSize: 12.5,
                maxWidth: '78%',
                lineHeight: 1.5,
              }}>{m.text}</div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--text-faint)',
                marginTop: 2,
              }}>{m.t}</div>
            </div>
          );
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{
        padding: 10,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 6,
        background: 'var(--surface-0)',
      }}>
        <input
          className="input"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ background: 'var(--surface-1)', fontSize: 12 }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '0 12px' }} disabled={!draft.trim()}>
          <Icon name="send" size={12}/>
        </button>
      </form>
    </div>
  );
};

Object.assign(window, { ProfileScreen, ChatWindow });

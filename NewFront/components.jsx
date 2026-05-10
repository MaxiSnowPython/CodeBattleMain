/* ============================================
   CodeBattle — Shared components
   Sidebar, Icon, Avatar, Spinner, Modal, etc.
   ============================================ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Icons ---------- */
const Icon = ({ name, size = 16, stroke = 1.6 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case 'arena': return (
      <svg {...props}><path d="M5 3l3 7-3 4 7 7M19 3l-3 7 3 4-7 7M8 10h8M9 14h6"/></svg>
    );
    case 'profile': return (
      <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
    );
    case 'rating': return (
      <svg {...props}><path d="M4 19h4v-7H4zM10 19h4V5h-4zM16 19h4v-10h-4z"/></svg>
    );
    case 'history': return (
      <svg {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/></svg>
    );
    case 'tasks': return (
      <svg {...props}><path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
    );
    case 'logout': return (
      <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
    );
    case 'search': return (
      <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
    );
    case 'send': return (
      <svg {...props}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>
    );
    case 'check': return (
      <svg {...props}><path d="M20 6 9 17l-5-5"/></svg>
    );
    case 'x': return (
      <svg {...props}><path d="M18 6 6 18M6 6l12 12"/></svg>
    );
    case 'plus': return (
      <svg {...props}><path d="M12 5v14M5 12h14"/></svg>
    );
    case 'play': return (
      <svg {...props} fill="currentColor" stroke="none"><path d="M8 5v14l11-7z"/></svg>
    );
    case 'chat': return (
      <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    );
    case 'crown': return (
      <svg {...props}><path d="m3 7 4 5 5-7 5 7 4-5v11H3z"/></svg>
    );
    case 'flame': return (
      <svg {...props}><path d="M12 2c2 5 6 6 6 11a6 6 0 1 1-12 0c0-3 2-4 3-7 2 2 3 4 3 4s0-3 0-8z"/></svg>
    );
    case 'medal': return (
      <svg {...props}><circle cx="12" cy="14" r="6"/><path d="M8 8 5 2h14l-3 6"/></svg>
    );
    case 'arrow-up': return (
      <svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    );
    case 'arrow-down': return (
      <svg {...props}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
    );
    case 'sword': return (
      <svg {...props}><path d="m14.5 17.5 4-4M14.5 17.5l-2 2-3-3 2-2M14.5 17.5l3.5 3.5h3v-3l-3.5-3.5M3 3l8 8M3 3v5l3 3"/></svg>
    );
    case 'menu': return (
      <svg {...props}><path d="M3 6h18M3 12h18M3 18h18"/></svg>
    );
    case 'eye': return (
      <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
    );
    case 'eye-off': return (
      <svg {...props}><path d="M9.9 4.2A10 10 0 0 1 12 4c6 0 10 8 10 8a17 17 0 0 1-2 3M6.6 6.6A17 17 0 0 0 2 12s4 8 10 8a9 9 0 0 0 5.4-1.7M1 1l22 22M9.5 9.5a3 3 0 0 0 4.2 4.2"/></svg>
    );
    case 'lang': return (
      <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
    );
    default: return null;
  }
};

/* ---------- Sidebar ---------- */
const NAV_ITEMS = [
  { key: 'arena', label: 'Arena', icon: 'arena', service: 'match:8001/match/hub/' },
  { key: 'profile', label: 'Profile', icon: 'profile', service: 'hub:8003/profile/' },
  { key: 'rating', label: 'Rating', icon: 'rating', service: 'hub:8003/profile/rating' },
  { key: 'history', label: 'History', icon: 'history', service: 'game:8002/game/history' },
  { key: 'tasks', label: 'Tasks', icon: 'tasks', service: '/tasks' },
];

const Sidebar = ({ active, onNav, lang, setLang, onSignOut }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="bolt">⚡</span>
        <span>CB</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-faint)', letterSpacing: '0.1em' }}>v0.42</span>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onNav(item.key)}
            title={item.service}
          >
            <span className="nav-icon"><Icon name={item.icon} size={15} /></span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="lang-toggle">
          <button className={lang === 'EN' ? 'active' : ''} onClick={() => setLang('EN')}>EN</button>
          <button className={lang === 'RU' ? 'active' : ''} onClick={() => setLang('RU')}>RU</button>
        </div>
        <button className="nav-item" onClick={onSignOut} title="hub:8003/profile/logout/">
          <span className="nav-icon"><Icon name="logout" size={15} /></span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const MobileBottomNav = ({ active, onNav }) => (
  <nav className="mobile-bottom-nav">
    {NAV_ITEMS.map(item => (
      <button
        key={item.key}
        className={`nav-item ${active === item.key ? 'active' : ''}`}
        onClick={() => onNav(item.key)}
      >
        <span className="nav-icon"><Icon name={item.icon} size={18} /></span>
        <span>{item.label}</span>
      </button>
    ))}
  </nav>
);

/* ---------- Avatar ---------- */
const Avatar = ({ name = '', size = 32, online = false, accent = false }) => {
  const initials = name.trim().slice(0, 2).toUpperCase() || '?';
  const hue = useMemo(() => {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
    return h;
  }, [name]);
  const bg = accent
    ? `linear-gradient(135deg, oklch(0.55 0.18 290), oklch(0.4 0.15 270))`
    : `linear-gradient(135deg, oklch(0.32 0.06 ${hue}), oklch(0.22 0.04 ${hue}))`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        fontSize: size * 0.36,
        color: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(255,255,255,0.06)',
        letterSpacing: '-0.02em',
      }}>{initials}</div>
      {online && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: Math.max(8, size * 0.25), height: Math.max(8, size * 0.25),
          borderRadius: '50%',
          background: 'var(--success)',
          border: '2px solid var(--surface-1)',
        }}/>
      )}
    </div>
  );
};

/* ---------- Spinner ---------- */
const Spinner = ({ size = 18 }) => (
  <span style={{
    display: 'inline-block',
    width: size, height: size,
    border: `2px solid rgba(255,255,255,0.1)`,
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  }}/>
);

/* ---------- Tooltip via title (skip), use simple hover note ---------- */

/* ---------- TerminalGreeting ---------- */
const TerminalGreeting = ({ user }) => {
  const [typed, setTyped] = useState('');
  const lines = useMemo(() => [
    { p: '~/codebattle', cmd: 'whoami', out: user },
    { p: '~/codebattle', cmd: 'cat status', out: 'ready_to_battle = true' },
  ], [user]);

  useEffect(() => {
    let i = 0;
    const full = lines.map(l => `$ ${l.cmd}\n${l.out}`).join('\n');
    const id = setInterval(() => {
      i++;
      setTyped(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [lines]);

  return (
    <div style={{
      background: 'var(--surface-0)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '8px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: 'var(--text-muted)',
        fontSize: 11,
        letterSpacing: '0.05em',
      }}>
        <span className="dot" style={{ background: '#ff5f57' }}/>
        <span className="dot" style={{ background: '#febc2e' }}/>
        <span className="dot" style={{ background: '#28c840' }}/>
        <span style={{ marginLeft: 8 }}>~/codebattle ─ zsh</span>
      </div>
      <pre style={{
        margin: 0,
        padding: '14px 16px',
        color: 'var(--text-dim)',
        whiteSpace: 'pre-wrap',
        minHeight: 84,
      }}>
        {typed.split('\n').map((line, i) => {
          if (line.startsWith('$ ')) return (
            <div key={i}><span style={{ color: 'var(--accent-text)' }}>$</span> <span style={{ color: 'var(--text)' }}>{line.slice(2)}</span></div>
          );
          return <div key={i} style={{ color: 'var(--text-dim)' }}>{line}</div>;
        })}
        <span style={{
          display: 'inline-block', width: 7, height: 13,
          background: 'var(--accent-text)', verticalAlign: 'middle',
          animation: 'pulse 1.1s steps(2) infinite',
        }}/>
      </pre>
    </div>
  );
};

/* ---------- ProgressBar ---------- */
const ProgressBar = ({ value, max = 100, color = 'var(--accent)', height = 6 }) => (
  <div style={{
    width: '100%',
    height,
    background: 'var(--surface-2)',
    borderRadius: 999,
    overflow: 'hidden',
  }}>
    <div style={{
      width: `${Math.max(0, Math.min(100, (value/max)*100))}%`,
      height: '100%',
      background: color,
      borderRadius: 999,
      transition: 'width 0.6s ease',
    }}/>
  </div>
);

/* ---------- Stat ---------- */
const Stat = ({ label, value, sub, accent = false }) => (
  <div style={{
    background: 'var(--surface-1)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-lg)',
    padding: '18px 18px',
    flex: 1,
    minWidth: 0,
  }}>
    <div style={{
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-muted)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>{label}</div>
    <div style={{
      fontSize: 28,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      marginTop: 6,
      color: accent ? 'var(--accent-text)' : 'var(--text)',
      fontFamily: 'var(--font-mono)',
    }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{sub}</div>}
  </div>
);

Object.assign(window, {
  Icon, Sidebar, MobileBottomNav, Avatar, Spinner,
  TerminalGreeting, ProgressBar, Stat, NAV_ITEMS,
});

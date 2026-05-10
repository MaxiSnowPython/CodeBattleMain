/* ============================================
   CodeBattle — Auth screens
   Login + Register
   ============================================ */

const AuthLayout = ({ children, title, sub }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: `
      radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.36 0.16 290 / 0.22), transparent 65%),
      radial-gradient(ellipse 50% 40% at 50% 100%, oklch(0.32 0.14 270 / 0.18), transparent 65%),
      var(--bg)
    `,
    position: 'relative',
    overflow: 'hidden',
  }}>
    {/* grid pattern */}
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '48px 48px',
      maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)',
      pointerEvents: 'none',
    }}/>
    <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }} className="slide-up">
      {/* logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: 'var(--font-mono)',
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-0.02em',
        }}>
          <span style={{ color: 'var(--accent-text)', fontSize: 22 }}>⚡</span>
          <span>CodeBattle</span>
        </div>
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>code · ship · win</div>
      </div>

      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        padding: '32px 32px 28px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-muted)' }}>{sub}</div>
        </div>
        {children}
      </div>

      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-faint)',
        marginTop: 24,
        letterSpacing: '0.08em',
      }}>
        auth · 8000 · v0.42
      </div>
    </div>
  </div>
);

/* ---------- Login ---------- */
const LoginScreen = ({ onLogin, onSwitch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('username and password are required');
      return;
    }
    if (password.length < 4) {
      setError('invalid credentials');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(username);
    }, 700);
  };

  return (
    <AuthLayout title="Sign in" sub="Resume your matchmaking session">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div className="form-error">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="label" htmlFor="login-user">Username</label>
          <input
            id="login-user"
            className="input"
            type="text"
            placeholder="ada_lovelace"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="label" htmlFor="login-pw">Password</label>
            <a href="#" style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>forgot?</a>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              id="login-pw"
              className="input"
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 36 }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', padding: 4, display: 'flex',
              }}
              tabIndex={-1}
            >
              <Icon name={showPw ? 'eye-off' : 'eye'} size={14} />
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <Spinner size={14} /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}>
          New to CodeBattle?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }} style={{ color: 'var(--accent-text)', fontWeight: 500 }}>Create account</a>
        </div>
      </form>
    </AuthLayout>
  );
};

/* ---------- Register ---------- */
const RegisterScreen = ({ onRegister, onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^a-zA-Z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const strengthLabel = ['', 'weak', 'fair', 'good', 'strong'][pwStrength];
  const strengthColor = ['var(--surface-3)', 'var(--danger)', 'var(--warning)', 'var(--accent-text)', 'var(--success)'][pwStrength];

  const submit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password) {
      setError('all fields are required');
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError('username: 3-20 chars, [a-zA-Z0-9_] only');
      return;
    }
    if (!/.+@.+\..+/.test(email)) {
      setError('invalid email');
      return;
    }
    if (password.length < 8) {
      setError('password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegister(username);
    }, 800);
  };

  return (
    <AuthLayout title="Create account" sub="Start battling in under a minute">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div className="form-error">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="label" htmlFor="reg-user">Username</label>
          <input
            id="reg-user"
            className="input"
            type="text"
            placeholder="your_handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </div>

        <div>
          <label className="label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            className="input"
            type="email"
            placeholder="you@domain.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="reg-pw">Password</label>
          <input
            id="reg-pw"
            className="input"
            type="password"
            placeholder="At least 8 chars"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 2,
                    background: pwStrength >= i ? strengthColor : 'var(--surface-3)',
                    transition: 'background 0.2s',
                  }}/>
                ))}
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: strengthColor,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                minWidth: 44,
                textAlign: 'right',
              }}>{strengthLabel}</span>
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="reg-confirm">Confirm password</label>
          <input
            id="reg-confirm"
            className="input"
            type="password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <Spinner size={14} /> : null}
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <div style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 4,
        }}>
          Already have one?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }} style={{ color: 'var(--accent-text)', fontWeight: 500 }}>Sign in</a>
        </div>
      </form>
    </AuthLayout>
  );
};

Object.assign(window, { LoginScreen, RegisterScreen });

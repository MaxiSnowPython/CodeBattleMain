/* ============================================
   CodeBattle — Main app + router
   ============================================ */

const App = () => {
  // route state machine: 'login' | 'register' | 'arena' | 'profile' | 'rating' | 'history' | 'tasks' | 'game'
  const [route, setRoute] = useState('login');
  const [user, setUser] = useState('');
  const [rating, setRating] = useState(1548);
  const [lang, setLang] = useState('EN');
  const [chatFriend, setChatFriend] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
    setRoute('arena');
  };

  const handleSignOut = () => {
    setUser('');
    setRoute('login');
  };

  const goto = (r) => setRoute(r);

  // Pages with sidebar
  const SIDEBAR_ROUTES = ['arena', 'profile', 'rating', 'tasks'];
  const showsSidebar = SIDEBAR_ROUTES.includes(route);

  // Map route to sidebar 'active' key
  const activeKey = route === 'arena' ? 'arena'
    : route === 'profile' ? 'profile'
    : route === 'rating' ? 'rating'
    : route === 'history' ? 'history'
    : route === 'tasks' ? 'tasks'
    : null;

  if (route === 'login') {
    return <LoginScreen onLogin={handleLogin} onSwitch={() => setRoute('register')}/>;
  }
  if (route === 'register') {
    return <RegisterScreen onRegister={handleLogin} onSwitch={() => setRoute('login')}/>;
  }

  if (route === 'game') {
    return <GameRoomScreen user={user || 'you'} opponent="kernel_panic" onExit={() => setRoute('arena')}/>;
  }

  if (route === 'history') {
    return <HistoryScreen onBack={() => setRoute('arena')} onOpen={() => setRoute('game')} />;
  }

  // Sidebar layout
  return (
    <div className="app">
      {showsSidebar && (
        <Sidebar
          active={activeKey}
          onNav={goto}
          lang={lang}
          setLang={setLang}
          onSignOut={handleSignOut}
        />
      )}
      <main className="app-content">
        {route === 'arena' && (
          <MatchmakingScreen
            user={user || 'you'}
            rating={rating}
            onMatchFound={() => setRoute('game')}
          />
        )}
        {route === 'profile' && (
          <ProfileScreen
            user={user || 'you'}
            rating={rating}
            onChat={(name) => setChatFriend(name)}
          />
        )}
        {route === 'rating' && (
          <RatingScreen user={user || 'you'} rating={rating}/>
        )}
        {route === 'tasks' && (
          <div className="page">
            <div className="page-header">
              <div>
                <h1 className="page-title">Tasks</h1>
                <div className="page-subtitle">/tasks · python · 247 problems</div>
              </div>
            </div>
            <div style={{
              padding: '80px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              border: '1px dashed var(--border)',
              borderRadius: 'var(--r-lg)',
            }}>
              task library coming soon · stub page
            </div>
          </div>
        )}
      </main>
      <MobileBottomNav active={activeKey} onNav={goto}/>
      <ChatWindow open={!!chatFriend} friend={chatFriend} onClose={() => setChatFriend(null)}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

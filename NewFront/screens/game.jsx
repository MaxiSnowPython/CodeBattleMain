/* ============================================
   CodeBattle — Game room (game:8002)
   ============================================ */

const SAMPLE_TASK = {
  id: 'two_sum',
  title: 'Two Sum',
  difficulty: 'Easy',
  description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

Return the answer in any order.`,
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    'Only one valid answer exists',
  ],
  signature: 'def two_sum(nums: list[int], target: int) -> list[int]:',
  tests: [
    { input: 'nums = [2,7,11,15], target = 9', expected: '[0, 1]' },
    { input: 'nums = [3,2,4], target = 6', expected: '[1, 2]' },
    { input: 'nums = [3,3], target = 6', expected: '[0, 1]' },
  ],
};

const STARTER = `def two_sum(nums, target):
    # your solution here
    pass`;

const PlayerCard = ({ name, rating, side, status }) => {
  const left = side === 'left';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexDirection: left ? 'row' : 'row-reverse',
      flex: 1,
      minWidth: 0,
    }}>
      <Avatar name={name} size={42} accent={left} online />
      <div style={{ minWidth: 0, textAlign: left ? 'left' : 'right' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 2, justifyContent: left ? 'flex-start' : 'flex-end', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>ELO {rating}</span>
          <span className="dot" style={{
            background: status === 'coding' ? 'var(--warning)' : status === 'submitted' ? 'var(--success)' : 'var(--accent)',
          }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

const Timer = ({ seconds }) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const warn = seconds < 60;
  return (
    <div style={{ textAlign: 'center', padding: '0 14px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>VS</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: warn ? 'var(--danger)' : 'var(--text)',
        marginTop: 2,
      }}>{mm}:{ss}</div>
    </div>
  );
};

const TestResult = ({ test, result, idx }) => {
  const passed = result?.passed;
  const pending = !result;
  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)',
      background: passed ? 'oklch(0.78 0.16 150 / 0.04)' : result ? 'oklch(0.68 0.22 25 / 0.04)' : 'var(--surface-1)',
      padding: '12px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{
          width: 18, height: 18, borderRadius: 4,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: passed ? 'var(--success-soft)' : result ? 'var(--danger-soft)' : 'var(--surface-2)',
          color: passed ? 'var(--success)' : result ? 'var(--danger)' : 'var(--text-muted)',
        }}>
          {pending ? '·' : passed ? <Icon name="check" size={11} stroke={2.5}/> : <Icon name="x" size={11} stroke={2.5}/>}
        </span>
        <span style={{ fontWeight: 600 }}>test_{idx + 1}</span>
        <span className="spacer"/>
        <span style={{
          fontSize: 10, letterSpacing: '0.08em',
          color: passed ? 'var(--success)' : result ? 'var(--danger)' : 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>{pending ? 'pending' : passed ? 'passed' : 'failed'}</span>
        {result?.time && <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>{result.time}ms</span>}
      </div>
      <div style={{ color: 'var(--text-dim)', paddingLeft: 28 }}>
        <div><span style={{ color: 'var(--text-muted)' }}>in: </span>{test.input}</div>
        <div><span style={{ color: 'var(--text-muted)' }}>expected: </span>{test.expected}</div>
        {result && !passed && (
          <div style={{ color: 'var(--danger)' }}><span style={{ color: 'var(--text-muted)' }}>got: </span>{result.actual}</div>
        )}
      </div>
    </div>
  );
};

const VictoryBanner = ({ won, onContinue }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    background: 'rgba(8, 8, 14, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    animation: 'fadeIn 0.3s ease',
  }}>
    <div style={{
      background: 'var(--surface-1)',
      border: `1px solid ${won ? 'oklch(0.78 0.16 150 / 0.4)' : 'oklch(0.68 0.22 25 / 0.3)'}`,
      borderRadius: 'var(--r-xl)',
      padding: '40px 48px',
      textAlign: 'center',
      maxWidth: 440,
      boxShadow: won
        ? '0 0 0 1px oklch(0.78 0.16 150 / 0.2), 0 24px 80px oklch(0.78 0.16 150 / 0.18)'
        : 'var(--shadow-lg)',
    }} className="slide-up">
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.2em',
        color: won ? 'var(--success)' : 'var(--danger)',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}>{won ? 'Victory' : 'Defeat'}</div>
      <div style={{
        fontSize: 38,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        marginBottom: 14,
      }}>{won ? 'You won!' : 'You lost'}</div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--text-dim)',
        marginBottom: 28,
        lineHeight: 1.6,
      }}>
        {won
          ? 'All 3 tests passed in 4m 12s.'
          : 'Opponent submitted a passing solution first.'}
        <br/>
        <span style={{ color: won ? 'var(--success)' : 'var(--danger)' }}>
          ELO {won ? '+' : '−'}{won ? 24 : 18}
        </span>
        <span style={{ color: 'var(--text-faint)' }}> · new rating {won ? 1572 : 1530}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onContinue}>
          <Icon name="arena" size={14}/> Back to Arena
        </button>
        <button className="btn btn-secondary btn-lg" onClick={onContinue}>
          View match
        </button>
      </div>
    </div>
  </div>
);

const GameRoomScreen = ({ user, opponent, onExit }) => {
  const [code, setCode] = useState(STARTER);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(8 * 60 + 24);
  const [oppStatus, setOppStatus] = useState('coding');
  const [outcome, setOutcome] = useState(null); // 'win' | 'loss'
  const [activeTab, setActiveTab] = useState('task');

  useEffect(() => {
    if (outcome) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [outcome]);

  const submit = () => {
    setSubmitting(true);
    setResults(null);
    setTimeout(() => {
      const passed = code.includes('return') && code.length > 80;
      const r = SAMPLE_TASK.tests.map((t, i) => ({
        passed: passed,
        time: 12 + i * 6,
        actual: passed ? t.expected : 'None',
      }));
      setResults(r);
      setSubmitting(false);
      if (passed) {
        setTimeout(() => setOutcome('win'), 800);
      }
    }, 1100);
  };

  const linesOfCode = code.split('\n').length;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      position: 'relative',
    }}>
      {/* Header */}
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
          marginLeft: 6,
        }}>
          match #a3f9c2 · ranked
        </div>

        <PlayerCard name={user} rating={1548} side="left" status="coding"/>
        <Timer seconds={seconds}/>
        <PlayerCard name={opponent} rating={1602} side="right" status={oppStatus}/>

        <button className="btn btn-ghost btn-sm" onClick={onExit} style={{ marginLeft: 8 }}>
          <Icon name="x" size={13}/> Forfeit
        </button>
      </header>

      {/* Main 50/50 */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 0,
      }}>
        {/* Task panel */}
        <div style={{
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: 'var(--surface-0)',
        }}>
          <div style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {['task', 'tests'].map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: '5px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: activeTab === t ? 'var(--text)' : 'var(--text-muted)',
                  background: activeTab === t ? 'var(--surface-2)' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                }}>{t}</button>
              ))}
            </div>
            <span className="spacer"/>
            <span className="badge badge-success">{SAMPLE_TASK.difficulty}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              #{SAMPLE_TASK.id}
            </span>
          </div>

          <div style={{ overflow: 'auto', padding: '24px 28px', flex: 1 }}>
            {activeTab === 'task' ? (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                  {SAMPLE_TASK.title}
                </h2>
                <div style={{ color: 'var(--text-dim)', lineHeight: 1.7, fontSize: 13.5, whiteSpace: 'pre-wrap' }}>
                  {SAMPLE_TASK.description.split(/(`[^`]+`)/g).map((part, i) =>
                    part.startsWith('`')
                      ? <code key={i} style={{ background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-text)' }}>{part.slice(1, -1)}</code>
                      : <span key={i}>{part}</span>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>Constraints</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {SAMPLE_TASK.constraints.map((c, i) => (
                      <li key={i} style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text-dim)',
                        paddingLeft: 14,
                        position: 'relative',
                      }}>
                        <span style={{ position: 'absolute', left: 0, color: 'var(--text-faint)' }}>›</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ marginTop: 24 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>Examples</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {SAMPLE_TASK.tests.map((t, i) => (
                      <div key={i} style={{
                        background: 'var(--surface-1)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Example {i + 1}</div>
                        <div style={{ color: 'var(--text-dim)' }}>{t.input}</div>
                        <div style={{ color: 'var(--accent-text)' }}>→ {t.expected}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SAMPLE_TASK.tests.map((t, i) => (
                  <TestResult key={i} test={t} result={results?.[i]} idx={i} />
                ))}
                {!results && (
                  <div style={{
                    textAlign: 'center', padding: 40,
                    color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12,
                  }}>
                    submit your code to run tests →
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Editor panel */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: '#0c0c12',
        }}>
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'var(--surface-0)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: 'var(--accent-text)' }}>●</span>
              solution.py
            </div>
            <span className="spacer"/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-faint)' }}>
              {linesOfCode} lines · python 3.11
            </span>
          </div>

          {/* code editor */}
          <div style={{
            flex: 1,
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 8px 14px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--text-faint)',
              userSelect: 'none',
              textAlign: 'right',
              background: '#0a0a10',
              borderRight: '1px solid var(--border)',
              minWidth: 40,
            }}>
              {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                padding: '14px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                lineHeight: 1.7,
                color: 'var(--text)',
              }}
            />
          </div>

          {/* results strip */}
          {results && (
            <div style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--surface-0)',
              padding: '12px 20px',
              maxHeight: 220,
              overflow: 'auto',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Test results · {results.filter(r => r.passed).length}/{results.length} passed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SAMPLE_TASK.tests.map((t, i) => (
                  <TestResult key={i} test={t} result={results[i]} idx={i}/>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-0)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <button className="btn btn-secondary">
              <Icon name="play" size={11}/> Run
            </button>
            <span className="spacer"/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
              ⌘ + ↵ to submit
            </span>
            <button className="btn btn-primary" onClick={submit} disabled={submitting} style={{ minWidth: 120 }}>
              {submitting ? <><Spinner size={12}/> Running…</> : <>Submit <Icon name="send" size={12}/></>}
            </button>
          </div>
        </div>
      </div>

      {outcome && <VictoryBanner won={outcome === 'win'} onContinue={onExit}/>}
    </div>
  );
};

Object.assign(window, { GameRoomScreen });

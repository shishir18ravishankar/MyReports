import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── helpers ──────────────────────────────────────────────────────────────────

function generateUID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `MR-${suffix}`
}

function getPatientsDB() {
  try { return JSON.parse(localStorage.getItem('patientsDB')) || {} } catch { return {} }
}

function savePatientsDB(db) {
  localStorage.setItem('patientsDB', JSON.stringify(db))
}

// ── styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: '#1A1B30',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  backBtn: {
    position: 'fixed',
    top: '20px',
    left: '24px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  icon: { fontSize: '50px', marginBottom: '10px' },
  title: { fontSize: '26px', fontWeight: 700, marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#64748b', marginBottom: '32px' },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#252645',
    borderRadius: '20px',
    padding: '32px 28px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  // step indicator
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '28px',
  },
  stepDot: (active, done) => ({
    width: done ? '28px' : '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    background: done ? '#8B5CF6' : active ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)',
    border: active || done ? '2px solid #8B5CF6' : '2px solid rgba(255,255,255,0.1)',
    color: done || active ? '#fff' : '#64748b',
    transition: 'all 0.3s',
  }),
  stepLine: (done) => ({
    flex: 1,
    height: '2px',
    background: done ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
    transition: 'background 0.3s',
  }),
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#a5b4fc',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#fff',
    padding: '13px 14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    marginBottom: '6px',
  },
  hint: { fontSize: '12px', color: '#475569', marginBottom: '22px', lineHeight: '1.5' },
  primaryBtn: (disabled) => ({
    width: '100%',
    padding: '14px',
    background: disabled ? 'rgba(139,92,246,0.4)' : '#8B5CF6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    marginTop: '4px',
    transition: 'background 0.2s',
  }),
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    marginTop: '12px',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#fca5a5',
  },
  toggle: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
  },
  toggleLink: {
    color: '#a78bfa',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'underline',
    marginLeft: '4px',
  },
  successBox: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  uidDisplay: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#a78bfa',
    letterSpacing: '2px',
    margin: '6px 0 4px',
    fontFamily: 'monospace',
  },
  uidNote: { fontSize: '12px', color: '#64748b' },
  refreshBtn: {
    background: 'none',
    border: 'none',
    color: '#a78bfa',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '4px 0',
    textDecoration: 'underline',
  },
}

// ── component ─────────────────────────────────────────────────────────────────

export default function PatientLogin() {
  const navigate = useNavigate()

  // 'login' | 'signup'
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)

  // login fields
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // signup fields
  const [email, setEmail] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [uid, setUid] = useState(generateUID)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clearError = () => setError('')

  // ── LOGIN ──────────────────────────────────────────────────────────────────

  const handleLogin = () => {
    const id = loginId.trim()
    if (!id) return setError('Please enter your User ID.')
    if (!loginPassword) return setError('Please enter your password.')

    const db = getPatientsDB()
    const patient = db[id]
    if (!patient) return setError('User ID not found. Please sign up first.')
    if (patient.password !== loginPassword) return setError('Incorrect password.')

    localStorage.setItem('currentPatientId', id)
    navigate('/patient-dashboard')
  }

  // ── SIGNUP steps ───────────────────────────────────────────────────────────

  const handleStep1 = () => {
    const e = email.trim()
    if (!e) return setError('Please enter your email.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return setError('Please enter a valid email address.')
    clearError()
    setStep(2)
  }

  const handleStep2 = () => {
    const a = aadhaar.trim()
    if (!a) return setError('Please enter your Aadhaar ID.')
    if (!/^\d{12}$/.test(a)) return setError('Aadhaar must be exactly 12 digits (numbers only).')
    clearError()
    setStep(3)
  }

  const handleStep3 = () => {
    const id = uid.trim().toUpperCase()
    if (!id) return setError('User ID cannot be empty.')
    if (!/^[A-Z0-9\-]{4,12}$/.test(id)) return setError('User ID must be 4–12 alphanumeric characters (hyphens allowed).')
    if (!password) return setError('Please create a password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    const db = getPatientsDB()
    if (db[id]) return setError('This User ID is already taken. Try a different one.')

    db[id] = {
      email: email.trim(),
      aadhaar: aadhaar.trim(),
      password,
      inbox: [],
      records: [],
      createdAt: new Date().toISOString(),
    }
    savePatientsDB(db)

    localStorage.setItem('currentPatientId', id)
    navigate('/patient-dashboard')
  }

  // ── reset to login ─────────────────────────────────────────────────────────

  const switchMode = (m) => {
    setMode(m)
    setStep(1)
    setError('')
    setEmail('')
    setAadhaar('')
    setUid(generateUID())
    setPassword('')
    setConfirmPassword('')
    setLoginId('')
    setLoginPassword('')
  }

  // ── render ─────────────────────────────────────────────────────────────────

  const renderLogin = () => (
    <>
      <label style={S.label}>User ID</label>
      <input
        style={S.input}
        placeholder="e.g. MR-X9B21V"
        value={loginId}
        onChange={(e) => { setLoginId(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        autoFocus
      />
      <div style={S.hint}>Your unique ID was shown during signup.</div>

      <label style={S.label}>Password</label>
      <input
        style={S.input}
        type="password"
        placeholder="Enter your password"
        value={loginPassword}
        onChange={(e) => { setLoginPassword(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
      />
      <div style={{ marginBottom: '22px' }} />

      <button style={S.primaryBtn(false)} onClick={handleLogin}>Login</button>

      {error && <div style={S.error}>{error}</div>}

      <div style={S.toggle}>
        Don't have an account?
        <span style={S.toggleLink} onClick={() => switchMode('signup')}>Sign up</span>
      </div>
    </>
  )

  const StepIndicator = () => (
    <div style={S.stepRow}>
      {[1, 2, 3].map((n, i) => (
        <>
          <div key={n} style={S.stepDot(step === n, step > n)}>
            {step > n ? '✓' : n}
          </div>
          {i < 2 && <div style={S.stepLine(step > n + 0.5)} />}
        </>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>Email Address</label>
      <input
        style={S.input}
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep1()}
        autoFocus
      />
      <div style={S.hint}>Used to identify your account.</div>
      <button style={S.primaryBtn(false)} onClick={handleStep1}>Next →</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const renderStep2 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>Aadhaar ID</label>
      <input
        style={S.input}
        placeholder="12-digit Aadhaar number"
        value={aadhaar}
        maxLength={12}
        onChange={(e) => { setAadhaar(e.target.value.replace(/\D/g, '')); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep2()}
        autoFocus
      />
      <div style={S.hint}>Must be exactly 12 digits. Used for identity verification.</div>
      <button style={S.primaryBtn(false)} onClick={handleStep2}>Next →</button>
      <button style={S.secondaryBtn} onClick={() => { setStep(1); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const renderStep3 = () => (
    <>
      <StepIndicator />

      <label style={S.label}>Your Unique User ID</label>
      <input
        style={{ ...S.input, fontFamily: 'monospace', letterSpacing: '2px', fontSize: '17px', fontWeight: 700, color: '#a78bfa' }}
        value={uid}
        onChange={(e) => { setUid(e.target.value.toUpperCase()); clearError() }}
        maxLength={12}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={S.uidNote}>You can edit this or keep the generated one.</span>
        <button style={S.refreshBtn} onClick={() => { setUid(generateUID()); clearError() }}>
          ↻ Regenerate
        </button>
      </div>

      <label style={S.label}>Create Password</label>
      <input
        style={S.input}
        type="password"
        placeholder="Min. 6 characters"
        value={password}
        onChange={(e) => { setPassword(e.target.value); clearError() }}
        autoFocus
      />
      <div style={{ marginBottom: '14px' }} />

      <label style={S.label}>Confirm Password</label>
      <input
        style={S.input}
        type="password"
        placeholder="Re-enter password"
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep3()}
      />
      <div style={{ marginBottom: '22px' }} />

      <button style={S.primaryBtn(false)} onClick={handleStep3}>Create Account</button>
      <button style={S.secondaryBtn} onClick={() => { setStep(2); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate('/')}>← Back</button>

      <div style={S.icon}>🧑‍⚕️</div>
      <h1 style={S.title}>{mode === 'login' ? 'Patient Login' : 'Create Account'}</h1>
      <p style={S.subtitle}>
        {mode === 'login'
          ? 'Access your health records securely.'
          : `Step ${step} of 3 — ${['Enter your email', 'Verify your identity', 'Set your credentials'][step - 1]}`}
      </p>

      <div style={S.card}>
        {mode === 'login' && renderLogin()}
        {mode === 'signup' && step === 1 && renderStep1()}
        {mode === 'signup' && step === 2 && renderStep2()}
        {mode === 'signup' && step === 3 && renderStep3()}

        {mode === 'signup' && (
          <div style={S.toggle}>
            Already have an account?
            <span style={S.toggleLink} onClick={() => switchMode('login')}>Login</span>
          </div>
        )}
      </div>
    </div>
  )
}

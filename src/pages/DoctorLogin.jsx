import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── helpers ───────────────────────────────────────────────────────────────────

function generateDoctorId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `DR-${suffix}`
}

function getDoctorsDB() {
  try { return JSON.parse(localStorage.getItem('doctorsDB')) || {} } catch { return {} }
}

function saveDoctorsDB(db) {
  localStorage.setItem('doctorsDB', JSON.stringify(db))
}

// ── styles ────────────────────────────────────────────────────────────────────

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
  subtitle: { fontSize: '14px', color: '#64748b', marginBottom: '32px', textAlign: 'center' },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#252645',
    borderRadius: '20px',
    padding: '32px 28px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '28px',
  },
  stepDot: (active, done) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    background: done ? '#8B5CF6' : active ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.07)',
    border: active || done ? '2px solid #8B5CF6' : '2px solid rgba(255,255,255,0.1)',
    color: done || active ? '#fff' : '#64748b',
    transition: 'all 0.3s',
    flexShrink: 0,
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
  hint: { fontSize: '12px', color: '#475569', marginBottom: '20px', lineHeight: '1.5' },
  infoBox: {
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    color: '#c4b5fd',
    lineHeight: '1.5',
    marginBottom: '20px',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    background: '#8B5CF6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.2s',
  },
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

const STEP_LABELS = [
  'Enter your email',
  'Verify your identity',
  'Medical credentials',
  'Set your credentials',
]

// ── component ─────────────────────────────────────────────────────────────────

export default function DoctorLogin() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)

  // login fields
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // signup fields
  const [email, setEmail] = useState('')
  const [aadhaar, setAadhaar] = useState('')
  const [mciNumber, setMciNumber] = useState('')
  const [doctorId, setDoctorId] = useState(generateDoctorId)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')

  const clearError = () => setError('')

  // ── LOGIN ──────────────────────────────────────────────────────────────────

  const handleLogin = () => {
    const id = loginId.trim()
    if (!id) return setError('Please enter your Doctor ID.')
    if (!loginPassword) return setError('Please enter your password.')

    const db = getDoctorsDB()
    const doctor = db[id]
    if (!doctor) return setError('Doctor ID not found. Please sign up first.')
    if (doctor.password !== loginPassword) return setError('Incorrect password.')

    localStorage.setItem('currentDoctorId', id)
    navigate('/doctor-dashboard')
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
    const mci = mciNumber.trim().toUpperCase()
    if (!mci) return setError('Please enter your MCI Registration Number.')
    if (mci.length < 5 || mci.length > 10) return setError('MCI number must be between 5 and 10 characters.')
    clearError()
    setStep(4)
  }

  const handleStep4 = () => {
    const id = doctorId.trim().toUpperCase()
    if (!id) return setError('Doctor ID cannot be empty.')
    if (!/^[A-Z0-9\-]{4,12}$/.test(id)) return setError('Doctor ID must be 4–12 alphanumeric characters (hyphens allowed).')
    if (!password) return setError('Please create a password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    const db = getDoctorsDB()
    if (db[id]) return setError('This Doctor ID is already taken. Try a different one.')

    db[id] = {
      email: email.trim(),
      aadhaar: aadhaar.trim(),
      mciNumber: mciNumber.trim().toUpperCase(),
      doctorId: id,
      password,
      name: '',
      clinic: '',
      uploads: [],
      verified: false,
      createdAt: new Date().toISOString(),
    }
    saveDoctorsDB(db)

    localStorage.setItem('currentDoctorId', id)
    navigate('/doctor-dashboard')
  }

  // ── reset ──────────────────────────────────────────────────────────────────

  const switchMode = (m) => {
    setMode(m)
    setStep(1)
    setError('')
    setEmail('')
    setAadhaar('')
    setMciNumber('')
    setDoctorId(generateDoctorId())
    setPassword('')
    setConfirmPassword('')
    setLoginId('')
    setLoginPassword('')
  }

  // ── sub-renders ────────────────────────────────────────────────────────────

  const StepIndicator = () => (
    <div style={S.stepRow}>
      {[1, 2, 3, 4].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
          <div style={S.stepDot(step === n, step > n)}>
            {step > n ? '✓' : n}
          </div>
          {i < 3 && <div style={S.stepLine(step > n)} />}
        </div>
      ))}
    </div>
  )

  const renderLogin = () => (
    <>
      <label style={S.label}>Doctor ID</label>
      <input
        style={S.input}
        placeholder="e.g. DR-X9B21V"
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

      <button style={S.primaryBtn} onClick={handleLogin}>Login</button>
      {error && <div style={S.error}>{error}</div>}

      <div style={S.toggle}>
        New doctor?
        <span style={S.toggleLink} onClick={() => switchMode('signup')}>Sign up</span>
      </div>
    </>
  )

  const renderStep1 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>Email Address</label>
      <input
        style={S.input}
        type="email"
        placeholder="doctor@hospital.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep1()}
        autoFocus
      />
      <div style={S.hint}>Used to identify your account and receive notifications.</div>
      <button style={S.primaryBtn} onClick={handleStep1}>Next →</button>
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
      <button style={S.primaryBtn} onClick={handleStep2}>Next →</button>
      <button style={S.secondaryBtn} onClick={() => { setStep(1); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const renderStep3 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>MCI Registration Number</label>
      <input
        style={S.input}
        placeholder="e.g. MH12345"
        value={mciNumber}
        maxLength={10}
        onChange={(e) => { setMciNumber(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep3()}
        autoFocus
      />
      <div style={S.hint}>Must be 5–10 characters. Issued by the Medical Council of India.</div>
      <div style={S.infoBox}>
        🔒 Your MCI number will be verified before your account is activated.
      </div>
      <button style={S.primaryBtn} onClick={handleStep3}>Next →</button>
      <button style={S.secondaryBtn} onClick={() => { setStep(2); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const renderStep4 = () => (
    <>
      <StepIndicator />

      <label style={S.label}>Your Doctor ID</label>
      <input
        style={{ ...S.input, fontFamily: 'monospace', letterSpacing: '2px', fontSize: '17px', fontWeight: 700, color: '#a78bfa' }}
        value={doctorId}
        onChange={(e) => { setDoctorId(e.target.value.toUpperCase()); clearError() }}
        maxLength={12}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: '#475569' }}>You can edit this or keep the generated one.</span>
        <button style={S.refreshBtn} onClick={() => { setDoctorId(generateDoctorId()); clearError() }}>
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
        onKeyDown={(e) => e.key === 'Enter' && handleStep4()}
      />
      <div style={{ marginBottom: '22px' }} />

      <button style={S.primaryBtn} onClick={handleStep4}>Create Account</button>
      <button style={S.secondaryBtn} onClick={() => { setStep(3); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  // ── main render ────────────────────────────────────────────────────────────

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate('/')}>← Back</button>

      <div style={S.icon}>👨‍⚕️</div>
      <h1 style={S.title}>{mode === 'login' ? 'Doctor Login' : 'Doctor Sign Up'}</h1>
      <p style={S.subtitle}>
        {mode === 'login'
          ? 'Access your doctor portal securely.'
          : `Step ${step} of 4 — ${STEP_LABELS[step - 1]}`}
      </p>

      <div style={S.card}>
        {mode === 'login' && renderLogin()}
        {mode === 'signup' && step === 1 && renderStep1()}
        {mode === 'signup' && step === 2 && renderStep2()}
        {mode === 'signup' && step === 3 && renderStep3()}
        {mode === 'signup' && step === 4 && renderStep4()}

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

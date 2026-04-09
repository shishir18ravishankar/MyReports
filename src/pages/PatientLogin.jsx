import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

// ── helpers ───────────────────────────────────────────────────────────────────

function generateUID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `MR-${suffix}`
}

// patientsDB keeps only { password } per id — needed for local auth since Supabase
// patients table has no password column.
function getPatientsDB() {
  try { return JSON.parse(localStorage.getItem('patientsDB')) || {} } catch { return {} }
}
function savePatientsDB(db) {
  localStorage.setItem('patientsDB', JSON.stringify(db))
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
    color: '#A1A1AA',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  icon: { fontSize: '50px', marginBottom: '10px' },
  title: { fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: '#fff' },
  subtitle: { fontSize: '14px', color: '#A1A1AA', marginBottom: '28px', textAlign: 'center', maxWidth: '340px' },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#252645',
    borderRadius: '20px',
    padding: '32px 28px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
  },
  stepRow: { display: 'flex', alignItems: 'center', marginBottom: '28px' },
  stepDot: (active, done) => ({
    width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: 700,
    background: done ? '#8B5CF6' : active ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.06)',
    border: `2px solid ${done || active ? '#8B5CF6' : 'rgba(255,255,255,0.1)'}`,
    color: done || active ? '#fff' : '#A1A1AA',
    transition: 'all 0.3s',
  }),
  stepLine: (done) => ({
    flex: 1, height: '2px', margin: '0 4px',
    background: done ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
    transition: 'background 0.3s',
  }),
  label: {
    display: 'block', fontSize: '12px', fontWeight: 600, color: '#a5b4fc',
    letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px',
  },
  input: {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#fff', padding: '13px 14px', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '6px',
  },
  hint: { fontSize: '12px', color: '#A1A1AA', marginBottom: '20px', lineHeight: '1.5' },
  primaryBtn: (disabled) => ({
    width: '100%', padding: '13px',
    background: disabled ? 'rgba(139,92,246,0.35)' : '#8B5CF6',
    border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer', transition: 'background 0.2s', marginTop: '4px',
  }),
  secondaryBtn: {
    width: '100%', padding: '12px', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#A1A1AA', fontSize: '14px', cursor: 'pointer', marginTop: '10px',
  },
  error: {
    marginTop: '12px', padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px', fontSize: '13px', color: '#fca5a5',
  },
  toggle: { marginTop: '22px', textAlign: 'center', fontSize: '13px', color: '#A1A1AA' },
  toggleLink: { color: '#a78bfa', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline', marginLeft: '4px' },
  authChoiceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' },
  authChoiceBtn: (selected) => ({
    padding: '16px 12px', borderRadius: '12px',
    border: selected ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)',
    background: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
    color: selected ? '#c4b5fd' : '#A1A1AA', cursor: 'pointer',
    fontSize: '13px', fontWeight: selected ? 600 : 400, textAlign: 'center', lineHeight: '1.4',
  }),
  authIcon: { fontSize: '22px', display: 'block', marginBottom: '6px' },
  digilockerBtn: (loading) => ({
    width: '100%', padding: '13px',
    background: loading ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #059669, #10b981)',
    border: loading ? '1px solid rgba(16,185,129,0.4)' : 'none',
    borderRadius: '10px', color: loading ? '#6ee7b7' : '#fff', fontSize: '14px', fontWeight: 600,
    cursor: loading ? 'default' : 'pointer', transition: 'all 0.3s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
  }),
  successPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '20px', padding: '6px 14px', fontSize: '13px', color: '#86efac',
    marginBottom: '20px', fontWeight: 600,
  },
  uidInput: {
    width: '100%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '10px', color: '#a78bfa', padding: '13px 14px', fontSize: '18px',
    fontWeight: 700, letterSpacing: '2px', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'monospace', marginBottom: '6px', textAlign: 'center',
  },
  refreshBtn: {
    background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer',
    fontSize: '12px', padding: '4px 0', textDecoration: 'underline', display: 'block', marginBottom: '20px',
  },
}

const Spinner = () => (
  <>
    <style>{`@keyframes pl-spin{to{transform:rotate(360deg)}}`}</style>
    <span style={{
      display: 'inline-block', width: '14px', height: '14px',
      border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
      borderRadius: '50%', animation: 'pl-spin 0.7s linear infinite',
    }} />
  </>
)

// ── component ─────────────────────────────────────────────────────────────────

export default function PatientLogin() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [step, setStep] = useState(1)

  const [loginId, setLoginId]             = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [email, setEmail]                 = useState('')
  const [authMethod, setAuthMethod]       = useState(null)
  const [aadhaar, setAadhaar]             = useState('')
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [digiState, setDigiState]         = useState('idle')
  const [uid, setUid]                     = useState(generateUID)
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError]   = useState('')
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

  // ── SIGNUP ─────────────────────────────────────────────────────────────────

  const handleStep1 = () => {
    const e = email.trim()
    if (!e) return setError('Please enter your email.')
    if (!e.includes('@')) return setError('Please enter a valid email address.')
    clearError(); setStep(2)
  }

  const handleVerifyAadhaar = () => {
    if (!/^\d{12}$/.test(aadhaar)) return setError('Aadhaar must be exactly 12 digits.')
    clearError(); setAadhaarVerified(true)
    setTimeout(() => setStep(3), 600)
  }

  const handleDigiLocker = () => {
    if (digiState !== 'idle') return
    setDigiState('redirecting')
    setTimeout(() => {
      setDigiState('fetching')
      setTimeout(() => { setDigiState('done'); setTimeout(() => setStep(3), 500) }, 1500)
    }, 2000)
  }

  const handleStep3 = async () => {
    const id = uid.trim().toUpperCase()
    if (!id) return setError('User ID cannot be empty.')
    if (!/^[A-Z0-9\-]{4,12}$/.test(id)) return setError('User ID must be 4–12 alphanumeric characters.')
    if (!password) return setError('Please create a password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    const db = getPatientsDB()
    if (db[id]) return setError('This User ID is already taken. Try a different one.')

    setLoading(true)

    // Insert into Supabase
    const { error: sbErr } = await supabase
      .from('patients')
      .insert([{ id, name: email.trim(), phone: aadhaar || 'digilocker' }])
    if (sbErr && sbErr.code !== '23505') {
      setLoading(false)
      return setError(`Supabase error: ${sbErr.message}`)
    }

    // Save password locally (Supabase patients table has no password column)
    db[id] = { password }
    savePatientsDB(db)

    localStorage.setItem('currentPatientId', id)
    setLoading(false)
    navigate('/patient-dashboard')
  }

  const switchMode = (m) => {
    setMode(m); setStep(1); setError('')
    setEmail(''); setAadhaar(''); setAadhaarVerified(false)
    setDigiState('idle'); setAuthMethod(null)
    setUid(generateUID()); setPassword(''); setConfirmPassword('')
    setLoginId(''); setLoginPassword('')
  }

  // ── step indicator ─────────────────────────────────────────────────────────

  const StepIndicator = () => (
    <div style={S.stepRow}>
      {[1, 2, 3].map((n, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
          <div style={S.stepDot(step === n, step > n)}>{step > n ? '✓' : n}</div>
          {i < 2 && <div style={S.stepLine(step > n)} />}
        </div>
      ))}
    </div>
  )

  // ── renders ────────────────────────────────────────────────────────────────

  const renderLogin = () => (
    <>
      <label style={S.label}>User ID</label>
      <input style={S.input} placeholder="e.g. MR-X9B21V" value={loginId}
        onChange={(e) => { setLoginId(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()} autoFocus />
      <div style={S.hint}>Your unique ID was shown during signup.</div>

      <label style={S.label}>Password</label>
      <input style={S.input} type="password" placeholder="Enter your password" value={loginPassword}
        onChange={(e) => { setLoginPassword(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
      <div style={{ marginBottom: '20px' }} />

      <button style={S.primaryBtn(false)} onClick={handleLogin}>Login</button>
      {error && <div style={S.error}>{error}</div>}
      <div style={S.toggle}>
        Don't have an account?
        <span style={S.toggleLink} onClick={() => switchMode('signup')}>Sign up</span>
      </div>
    </>
  )

  const renderStep1 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>Email Address</label>
      <input style={S.input} type="email" placeholder="you@example.com" value={email}
        onChange={(e) => { setEmail(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep1()} autoFocus />
      <div style={S.hint}>Used to identify your account.</div>
      <button style={S.primaryBtn(false)} onClick={handleStep1}>Next →</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const renderStep2 = () => {
    const digiLabel = {
      idle: 'Authenticate with DigiLocker',
      redirecting: 'Redirecting to DigiLocker...',
      fetching: 'Fetching your details...',
      done: '✓ DigiLocker Verified',
    }[digiState]

    return (
      <>
        <StepIndicator />
        <div style={{ fontSize: '13px', color: '#A1A1AA', marginBottom: '16px' }}>
          Choose how to verify your identity:
        </div>
        <div style={S.authChoiceRow}>
          <button style={S.authChoiceBtn(authMethod === 'aadhaar')}
            onClick={() => { setAuthMethod('aadhaar'); clearError(); setDigiState('idle') }}>
            <span style={S.authIcon}>🪪</span>Enter Aadhaar Manually
          </button>
          <button style={S.authChoiceBtn(authMethod === 'digilocker')}
            onClick={() => { setAuthMethod('digilocker'); clearError(); setAadhaar(''); setAadhaarVerified(false) }}>
            <span style={S.authIcon}>🔐</span>Connect via DigiLocker
          </button>
        </div>

        {authMethod === 'aadhaar' && (
          aadhaarVerified ? (
            <div style={S.successPill}>✓ Aadhaar verified</div>
          ) : (
            <>
              <label style={S.label}>Aadhaar Number</label>
              <input style={S.input} placeholder="12-digit number" value={aadhaar} maxLength={12}
                onChange={(e) => { setAadhaar(e.target.value.replace(/\D/g, '')); clearError() }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyAadhaar()} autoFocus />
              <div style={S.hint}>Numbers only. Exactly 12 digits.</div>
              <button style={S.primaryBtn(false)} onClick={handleVerifyAadhaar}>Verify Aadhaar</button>
            </>
          )
        )}

        {authMethod === 'digilocker' && (
          <>
            <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '14px', lineHeight: '1.5' }}>
              You'll be securely redirected to DigiLocker to fetch your Aadhaar-linked identity.
            </div>
            <button style={S.digilockerBtn(digiState !== 'idle')} onClick={handleDigiLocker} disabled={digiState !== 'idle'}>
              {digiState !== 'idle' && digiState !== 'done' && <Spinner />}
              {digiLabel}
            </button>
          </>
        )}

        {error && <div style={S.error}>{error}</div>}
        <button style={S.secondaryBtn} onClick={() => { setStep(1); setAuthMethod(null); clearError() }}>← Back</button>
      </>
    )
  }

  const renderStep3 = () => (
    <>
      <StepIndicator />
      <label style={S.label}>Your Unique User ID</label>
      <input style={S.uidInput} value={uid} maxLength={12}
        onChange={(e) => { setUid(e.target.value.toUpperCase()); clearError() }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#A1A1AA' }}>Edit freely or keep the generated one.</span>
        <button style={S.refreshBtn} onClick={() => { setUid(generateUID()); clearError() }}>↻ Regenerate</button>
      </div>
      <label style={S.label}>Create Password</label>
      <input style={S.input} type="password" placeholder="Min. 6 characters" value={password}
        onChange={(e) => { setPassword(e.target.value); clearError() }} autoFocus />
      <div style={{ marginBottom: '14px' }} />
      <label style={S.label}>Confirm Password</label>
      <input style={S.input} type="password" placeholder="Re-enter password" value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); clearError() }}
        onKeyDown={(e) => e.key === 'Enter' && handleStep3()} />
      <div style={{ marginBottom: '20px' }} />
      <button style={S.primaryBtn(loading)} onClick={handleStep3} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <button style={S.secondaryBtn} onClick={() => { setStep(2); clearError() }}>← Back</button>
      {error && <div style={S.error}>{error}</div>}
    </>
  )

  const stepSubtitles = ['Enter your email', 'Verify your identity', 'Set your credentials']

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate('/')}>← Back</button>
      <div style={S.icon}>🧑‍⚕️</div>
      <h1 style={S.title}>{mode === 'login' ? 'Patient Login' : 'Create Account'}</h1>
      <p style={S.subtitle}>
        {mode === 'login' ? 'Access your health records securely.'
          : `Step ${step} of 3 — ${stepSubtitles[step - 1]}`}
      </p>
      <div style={S.card}>
        {mode === 'login'  && renderLogin()}
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

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

// ── helpers ───────────────────────────────────────────────────────────────────

function generateDoctorId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `DR-${suffix}`
}

// doctorsDB keeps only { password } per id — Supabase doctors table has no password column.
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
    color: '#A1A1AA',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  icon: { fontSize: '50px', marginBottom: '10px' },
  title: { fontSize: '26px', fontWeight: 700, marginBottom: '4px', color: '#fff' },
  subtitle: { fontSize: '14px', color: '#A1A1AA', marginBottom: '28px' },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#252645',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '28px',
  },
  tabs: {
    display: 'flex',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '4px',
    marginBottom: '24px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '8px',
    background: active ? '#8B5CF6' : 'transparent',
    color: active ? '#fff' : '#A1A1AA',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s',
  }),
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#A1A1AA',
    marginBottom: '6px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#fff',
    padding: '11px 13px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
    fontFamily: 'inherit',
  },
  primaryBtn: (disabled) => ({
    width: '100%',
    padding: '12px',
    background: disabled ? 'rgba(139,92,246,0.4)' : '#8B5CF6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
    marginTop: '4px',
  }),
  error: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px',
    padding: '10px 13px',
    marginBottom: '14px',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '22px',
  },
  stepDot: (state) => ({
    width: state === 'active' ? '28px' : '10px',
    height: '10px',
    borderRadius: '5px',
    background: state === 'done' ? '#8B5CF6' : state === 'active' ? '#8B5CF6' : 'rgba(255,255,255,0.15)',
    transition: 'all 0.3s',
  }),
  stepTitle: { fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#fff' },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '16px',
  },
  methodBtn: (selected) => ({
    padding: '14px 10px',
    borderRadius: '10px',
    border: selected ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)',
    background: selected ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
    color: selected ? '#c4b5fd' : '#A1A1AA',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: selected ? 600 : 400,
    textAlign: 'center',
  }),
  digiBox: {
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  digiIcon: { fontSize: '32px', marginBottom: '8px' },
  digiStatus: { fontSize: '14px', color: '#c4b5fd', fontWeight: 500 },
  idRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '16px',
  },
  idDisplay: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#a5b4fc',
    padding: '11px 13px',
    fontSize: '15px',
    fontWeight: 600,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  regenBtn: {
    padding: '11px 14px',
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '10px',
    color: '#c4b5fd',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  mciStatus: (ok) => ({
    fontSize: '12px',
    color: ok ? '#86efac' : '#fca5a5',
    marginTop: '-10px',
    marginBottom: '14px',
  }),
  switchRow: {
    textAlign: 'center',
    marginTop: '18px',
    fontSize: '13px',
    color: '#A1A1AA',
  },
  switchLink: {
    color: '#a5b4fc',
    cursor: 'pointer',
    fontWeight: 500,
    textDecoration: 'underline',
    background: 'none',
    border: 'none',
    fontSize: '13px',
    padding: 0,
  },
}

// ── StepIndicator ─────────────────────────────────────────────────────────────

function StepIndicator({ step, total }) {
  return (
    <div style={S.stepIndicator}>
      {Array.from({ length: total }).map((_, i) => {
        const state = i < step ? 'done' : i === step ? 'active' : 'idle'
        return <div key={i} style={S.stepDot(state)} />
      })}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <>
      <style>{`@keyframes dl-spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(196,181,253,0.3)',
        borderTop: '2px solid #c4b5fd',
        borderRadius: '50%',
        animation: 'dl-spin 0.8s linear infinite',
        verticalAlign: 'middle',
        marginRight: '7px',
      }} />
    </>
  )
}

// ── DigiLocker simulator ───────────────────────────────────────────────────────

function DigiLockerFlow({ onDone }) {
  const [phase, setPhase] = useState('idle') // idle | redirecting | fetching | done

  const start = () => {
    setPhase('redirecting')
    setTimeout(() => {
      setPhase('fetching')
      setTimeout(() => {
        setPhase('done')
        setTimeout(onDone, 500)
      }, 1500)
    }, 2000)
  }

  if (phase === 'idle') {
    return (
      <div style={S.digiBox}>
        <div style={S.digiIcon}>🔗</div>
        <div style={{ ...S.digiStatus, marginBottom: '12px', color: '#A1A1AA' }}>
          Connect your DigiLocker to verify your Aadhaar digitally.
        </div>
        <button style={{ ...S.primaryBtn(false), width: 'auto', padding: '10px 24px' }} onClick={start}>
          Connect DigiLocker
        </button>
      </div>
    )
  }
  if (phase === 'redirecting') {
    return (
      <div style={S.digiBox}>
        <div style={S.digiIcon}>🔄</div>
        <div style={S.digiStatus}><Spinner />Redirecting to DigiLocker…</div>
      </div>
    )
  }
  if (phase === 'fetching') {
    return (
      <div style={S.digiBox}>
        <div style={S.digiIcon}>📥</div>
        <div style={S.digiStatus}><Spinner />Fetching your Aadhaar details…</div>
      </div>
    )
  }
  return (
    <div style={{ ...S.digiBox, borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.08)' }}>
      <div style={S.digiIcon}>✅</div>
      <div style={{ ...S.digiStatus, color: '#86efac' }}>DigiLocker verified!</div>
    </div>
  )
}

// ── Login form ─────────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }) {
  const navigate = useNavigate()
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    const id = doctorId.trim().toUpperCase()
    if (!id || !password) return setError('Please fill in all fields.')
    setLoading(true)
    setError('')

    const db = getDoctorsDB()
    const entry = db[id]
    if (!entry) { setLoading(false); return setError('Doctor ID not found.') }
    if (entry.password !== password) { setLoading(false); return setError('Incorrect password.') }

    localStorage.setItem('currentDoctorId', id)
    navigate('/doctor-dashboard')
  }

  return (
    <>
      {error && <div style={S.error}>{error}</div>}
      <label style={S.label}>Doctor ID</label>
      <input style={S.input} placeholder="DR-XXXXXX" value={doctorId}
        onChange={(e) => setDoctorId(e.target.value)} />
      <label style={S.label}>Password</label>
      <input style={S.input} type="password" placeholder="Your password" value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
      <button style={S.primaryBtn(loading)} onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
      <div style={S.switchRow}>
        New doctor? <button style={S.switchLink} onClick={onSwitch}>Register here</button>
      </div>
    </>
  )
}

// ── Signup flow ────────────────────────────────────────────────────────────────

function SignupFlow({ onSwitch }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 0
  const [name, setName] = useState('')
  const [clinic, setClinic] = useState('')
  const [email, setEmail] = useState('')

  // Step 1
  const [aadhaarMethod, setAadhaarMethod] = useState('digilocker')
  const [aadhaar, setAadhaar] = useState('')

  // Step 2
  const [mci, setMci] = useState('')
  const [mciVerified, setMciVerified] = useState(false)
  const [mciChecking, setMciChecking] = useState(false)
  const [mciError, setMciError] = useState('')

  // Step 3
  const [doctorId, setDoctorId] = useState(generateDoctorId)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const goNext = () => { setError(''); setStep((s) => s + 1) }

  const handleStep0 = () => {
    if (!name.trim()) return setError('Please enter your full name.')
    if (!clinic.trim()) return setError('Please enter your clinic name.')
    if (!email.includes('@')) return setError('Please enter a valid email.')
    goNext()
  }

  const handleManualAadhaar = () => {
    if (!/^\d{12}$/.test(aadhaar)) return setError('Aadhaar must be exactly 12 digits.')
    goNext()
  }

  const handleMciChange = (val) => {
    setMci(val)
    setMciVerified(false)
    setMciError('')
  }

  const verifyMci = () => {
    if (!/^\d{5,7}$/.test(mci)) {
      setMciError('MCI number must be 5–7 digits.')
      return
    }
    setMciChecking(true)
    setMciError('')
    setTimeout(() => {
      setMciChecking(false)
      setMciVerified(true)
      setTimeout(() => goNext(), 600)
    }, 2000)
  }

  const handleFinish = async () => {
    if (!password) return setError('Please set a password.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    setError('')

    const { error: sbErr } = await supabase
      .from('doctors')
      .insert([{ id: doctorId, name: name.trim(), clinic: clinic.trim(), mci }])

    if (sbErr && sbErr.code !== '23505') {
      setLoading(false)
      return setError(`Registration failed: ${sbErr.message}`)
    }

    const db = getDoctorsDB()
    db[doctorId] = { password }
    saveDoctorsDB(db)

    localStorage.setItem('currentDoctorId', doctorId)
    navigate('/doctor-dashboard')
  }

  return (
    <>
      <StepIndicator step={step} total={4} />
      {error && <div style={S.error}>{error}</div>}

      {step === 0 && (
        <>
          <div style={S.stepTitle}>Your details</div>
          <label style={S.label}>Full Name</label>
          <input style={S.input} placeholder="Dr. Jane Smith" value={name}
            onChange={(e) => setName(e.target.value)} />
          <label style={S.label}>Clinic / Hospital</label>
          <input style={S.input} placeholder="City General Hospital" value={clinic}
            onChange={(e) => setClinic(e.target.value)} />
          <label style={S.label}>Email</label>
          <input style={S.input} placeholder="doctor@hospital.com" value={email}
            onChange={(e) => setEmail(e.target.value)} />
          <button style={S.primaryBtn(false)} onClick={handleStep0}>Continue</button>
        </>
      )}

      {step === 1 && (
        <>
          <div style={S.stepTitle}>Aadhaar Verification</div>
          <div style={S.methodGrid}>
            <button style={S.methodBtn(aadhaarMethod === 'digilocker')}
              onClick={() => { setAadhaarMethod('digilocker'); setError('') }}>
              🔗 DigiLocker
            </button>
            <button style={S.methodBtn(aadhaarMethod === 'manual')}
              onClick={() => { setAadhaarMethod('manual'); setError('') }}>
              🔢 Manual Entry
            </button>
          </div>
          {aadhaarMethod === 'digilocker' ? (
            <DigiLockerFlow onDone={() => goNext()} />
          ) : (
            <>
              <label style={S.label}>Aadhaar Number</label>
              <input style={S.input} placeholder="12-digit Aadhaar" maxLength={12}
                value={aadhaar} onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))} />
              <button style={S.primaryBtn(false)} onClick={handleManualAadhaar}>Verify & Continue</button>
            </>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <div style={S.stepTitle}>MCI Registration</div>
          <label style={S.label}>MCI Number (5–7 digits)</label>
          <input style={S.input} placeholder="e.g. 123456" maxLength={7}
            value={mci} onChange={(e) => handleMciChange(e.target.value.replace(/\D/g, ''))}
            disabled={mciChecking || mciVerified} />
          {mciError && <div style={S.mciStatus(false)}>{mciError}</div>}
          {mciChecking && (
            <div style={{ fontSize: '13px', color: '#c4b5fd', marginBottom: '14px' }}>
              <Spinner />Verifying with MCI registry…
            </div>
          )}
          {mciVerified && <div style={S.mciStatus(true)}>✓ MCI number verified</div>}
          {!mciChecking && !mciVerified && (
            <button style={S.primaryBtn(false)} onClick={verifyMci}>Verify MCI Number</button>
          )}
        </>
      )}

      {step === 3 && (
        <>
          <div style={S.stepTitle}>Your Doctor ID & Password</div>
          <label style={S.label}>Doctor ID</label>
          <div style={S.idRow}>
            <input style={S.idDisplay} value={doctorId}
              onChange={(e) => setDoctorId(e.target.value.toUpperCase())} />
            <button style={S.regenBtn} onClick={() => setDoctorId(generateDoctorId())}>New ID</button>
          </div>
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="Min. 6 characters" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <label style={S.label}>Confirm Password</label>
          <input style={S.input} type="password" placeholder="Repeat password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} />
          <button style={S.primaryBtn(loading)} onClick={handleFinish} disabled={loading}>
            {loading ? 'Registering…' : 'Complete Registration'}
          </button>
        </>
      )}

      <div style={S.switchRow}>
        Already registered? <button style={S.switchLink} onClick={onSwitch}>Sign in</button>
      </div>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DoctorLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate('/')}>← Back</button>
      <div style={S.icon}>🩺</div>
      <div style={S.title}>Doctor Portal</div>
      <div style={S.subtitle}>MyReports — Secure Medical Records</div>

      <div style={S.card}>
        <div style={S.tabs}>
          <button style={S.tab(mode === 'login')} onClick={() => setMode('login')}>Sign In</button>
          <button style={S.tab(mode === 'signup')} onClick={() => setMode('signup')}>Register</button>
        </div>
        {mode === 'login'
          ? <LoginForm onSwitch={() => setMode('signup')} />
          : <SignupFlow onSwitch={() => setMode('login')} />
        }
      </div>
    </div>
  )
}

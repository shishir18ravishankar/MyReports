import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
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
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  icon: { fontSize: '52px', marginBottom: '12px' },
  heading: { fontSize: '26px', fontWeight: 700, marginBottom: '6px' },
  subheading: { fontSize: '14px', color: '#64748b', marginBottom: '36px' },
  card: {
    width: '100%',
    maxWidth: '380px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '18px',
    padding: '32px 28px',
    backdropFilter: 'blur(12px)',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#93c5fd',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '13px 14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontFamily: 'inherit',
  },
  hint: { fontSize: '12px', color: '#475569', marginBottom: '24px' },
  loginBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    marginTop: '14px',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#fca5a5',
    textAlign: 'center',
  },
}

export default function DoctorLogin() {
  const navigate = useNavigate()
  const [doctorId, setDoctorId] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    const id = doctorId.trim()
    if (!id) return setError('Please enter your Doctor ID.')
    localStorage.setItem('currentDoctorId', id)
    navigate('/doctor-dashboard')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/')}>← Back</button>

      <div style={styles.icon}>👨‍⚕️</div>
      <h1 style={styles.heading}>Doctor Login</h1>
      <p style={styles.subheading}>Enter your Doctor ID to access the portal.</p>

      <div style={styles.card}>
        <label style={styles.label}>Doctor ID</label>
        <input
          style={styles.input}
          placeholder="e.g. DR-Smith"
          value={doctorId}
          onChange={(e) => { setDoctorId(e.target.value); setError('') }}
          onKeyDown={handleKey}
          autoFocus
        />
        <div style={styles.hint}>Use your registered clinic ID or name.</div>
        <button style={styles.loginBtn} onClick={handleLogin}>Login</button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  )
}

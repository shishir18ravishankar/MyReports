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
  logo: {
    fontSize: '36px',
    fontWeight: 800,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '60px',
    textAlign: 'center',
  },
  cardRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '220px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s, background 0.2s',
    backdropFilter: 'blur(12px)',
  },
  cardIcon: { fontSize: '48px', marginBottom: '16px' },
  cardTitle: { fontSize: '18px', fontWeight: 700, marginBottom: '8px' },
  cardDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' },
  cardBtn: (gradient) => ({
    display: 'block',
    width: '100%',
    padding: '11px',
    background: gradient,
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  }),
  footer: {
    marginTop: '60px',
    fontSize: '12px',
    color: '#334155',
  },
}

export default function Landing() {
  const navigate = useNavigate()

  const handleCardHover = (e, enter) => {
    e.currentTarget.style.transform = enter ? 'translateY(-4px)' : 'translateY(0)'
    e.currentTarget.style.borderColor = enter ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.1)'
    e.currentTarget.style.background = enter ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)'
  }

  return (
    <div style={styles.page}>
      <div style={styles.logo}>MyReports</div>
      <div style={styles.tagline}>Your medical records, simplified.</div>

      <div style={styles.cardRow}>
        <div
          style={styles.card}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
        >
          <div style={styles.cardIcon}>🧑‍⚕️</div>
          <div style={styles.cardTitle}>I'm a Patient</div>
          <div style={styles.cardDesc}>View your inbox, manage reports, and get AI explanations.</div>
          <button style={styles.cardBtn('linear-gradient(135deg, #6366f1, #8b5cf6)')} onClick={() => navigate('/patient-login')}>
            Patient Login
          </button>
        </div>

        <div
          style={styles.card}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
        >
          <div style={styles.cardIcon}>👨‍⚕️</div>
          <div style={styles.cardTitle}>I'm a Doctor</div>
          <div style={styles.cardDesc}>Send reports and test results directly to your patients.</div>
          <button style={styles.cardBtn('linear-gradient(135deg, #0ea5e9, #6366f1)')} onClick={() => navigate('/doctor-login')}>
            Doctor Login
          </button>
        </div>
      </div>

      <div style={styles.footer}>© 2025 MyReports · Secure · Private · Local</div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  navBrand: {
    fontSize: '20px',
    fontWeight: 700,
    background: 'linear-gradient(90deg, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: { display: 'flex', gap: '8px' },
  navBtn: (active) => ({
    background: active ? 'rgba(129,140,248,0.2)' : 'transparent',
    border: active ? '1px solid rgba(129,140,248,0.4)' : '1px solid transparent',
    color: active ? '#a5b4fc' : '#64748b',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
  }),
  logoutBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    marginLeft: '8px',
  },
  container: {
    maxWidth: '720px',
    margin: '52px auto',
    padding: '0 24px',
  },
  greeting: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '6px',
  },
  greetingSub: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '40px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '40px',
  },
  statCard: (gradient) => ({
    background: gradient,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '22px 20px',
    textAlign: 'center',
  }),
  statNum: { fontSize: '32px', fontWeight: 800, marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  actionCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '28px 24px',
    cursor: 'pointer',
    transition: 'transform 0.2s, border-color 0.2s',
    textDecoration: 'none',
    display: 'block',
  },
  actionIcon: { fontSize: '32px', marginBottom: '14px' },
  actionTitle: { fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: '#fff' },
  actionDesc: { fontSize: '13px', color: '#64748b', lineHeight: '1.5' },
  actionArrow: {
    marginTop: '18px',
    fontSize: '13px',
    color: '#a5b4fc',
    fontWeight: 600,
  },
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const patientId = localStorage.getItem('currentPatientId') || 'Patient'

  const [stats, setStats] = useState({ pending: '—', saved: '—', types: '—' })
  const [inboxCount, setInboxCount] = useState(0)

  useEffect(() => {
    if (!patientId || patientId === 'Patient') return
    const fetchStats = async () => {
      const [pendingRes, acceptedRes] = await Promise.all([
        supabase
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('patient_id', patientId)
          .eq('status', 'pending'),
        supabase
          .from('reports')
          .select('report_type')
          .eq('patient_id', patientId)
          .eq('status', 'accepted'),
      ])
      const pending = pendingRes.count ?? 0
      const saved   = acceptedRes.data?.length ?? 0
      const types   = new Set(
        (acceptedRes.data || []).map(r => r.report_type).filter(Boolean)
      ).size
      setStats({ pending, saved, types })
      setInboxCount(pending)
    }
    fetchStats()
  }, [patientId])

  const handleCardHover = (e, enter) => {
    e.currentTarget.style.transform = enter ? 'translateY(-3px)' : 'translateY(0)'
    e.currentTarget.style.borderColor = enter ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.1)'
  }

  const handleLogout = () => {
    localStorage.removeItem('currentPatientId')
    navigate('/')
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>MyReports</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={styles.navLinks}>
            <button style={styles.navBtn(true)} onClick={() => navigate('/patient-dashboard')}>Dashboard</button>
            <button style={styles.navBtn(false)} onClick={() => navigate('/inbox')}>Inbox</button>
            <button style={styles.navBtn(false)} onClick={() => navigate('/my-records')}>My Records</button>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.greeting}>Welcome back, {patientId} 👋</div>
        <div style={styles.greetingSub}>Here's an overview of your health records.</div>

        <div style={styles.statsRow}>
          <div style={styles.statCard('rgba(99,102,241,0.15)')}>
            <div style={styles.statNum}>{stats.pending}</div>
            <div style={styles.statLabel}>Pending Reports</div>
          </div>
          <div style={styles.statCard('rgba(34,197,94,0.12)')}>
            <div style={styles.statNum}>{stats.saved}</div>
            <div style={styles.statLabel}>Saved Records</div>
          </div>
          <div style={styles.statCard('rgba(168,85,247,0.12)')}>
            <div style={styles.statNum}>{stats.types}</div>
            <div style={styles.statLabel}>Record Types</div>
          </div>
        </div>

        <div style={styles.actionRow}>
          <div
            style={styles.actionCard}
            onClick={() => navigate('/inbox')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={styles.actionIcon}>📬</div>
            <div style={styles.actionTitle}>Inbox</div>
            <div style={styles.actionDesc}>
              Review and accept reports sent by your doctor.
              {inboxCount > 0 && (
                <span style={{ display: 'block', marginTop: '6px', color: '#fbbf24', fontWeight: 600 }}>
                  {inboxCount} new {inboxCount === 1 ? 'report' : 'reports'} waiting
                </span>
              )}
            </div>
            <div style={styles.actionArrow}>Go to Inbox →</div>
          </div>

          <div
            style={styles.actionCard}
            onClick={() => navigate('/my-records')}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={styles.actionIcon}>📂</div>
            <div style={styles.actionTitle}>My Records</div>
            <div style={styles.actionDesc}>
              Browse your accepted records by type and get AI-powered explanations.
            </div>
            <div style={styles.actionArrow}>View Records →</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const TYPE_COLORS = {
  'Blood Test': { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5', dot: '#ef4444' },
  'Scan':       { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd', dot: '#3b82f6' },
  'Prescription': { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#86efac', dot: '#22c55e' },
  'Other':      { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: '#d8b4fe', dot: '#a855f7' },
}

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
    maxWidth: '680px',
    margin: '48px auto',
    padding: '0 24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '28px',
  },
  heading: { fontSize: '28px', fontWeight: 700, margin: 0 },
  badge: {
    background: 'rgba(129,140,248,0.2)',
    border: '1px solid rgba(129,140,248,0.3)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    color: '#a5b4fc',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 24px',
    color: '#475569',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyText: { fontSize: '16px', marginBottom: '6px', color: '#64748b' },
  emptySubtext: { fontSize: '13px', color: '#475569' },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '22px 24px',
    marginBottom: '14px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  typePill: (type) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: TYPE_COLORS[type]?.bg || TYPE_COLORS['Other'].bg,
    border: `1px solid ${TYPE_COLORS[type]?.border || TYPE_COLORS['Other'].border}`,
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '12px',
    color: TYPE_COLORS[type]?.text || TYPE_COLORS['Other'].text,
    fontWeight: 600,
  }),
  typeDot: (type) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: TYPE_COLORS[type]?.dot || TYPE_COLORS['Other'].dot,
    flexShrink: 0,
  }),
  meta: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  content: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '12px 14px',
    marginBottom: '18px',
    whiteSpace: 'pre-wrap',
  },
  actions: { display: 'flex', gap: '10px' },
  acceptBtn: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    border: 'none',
    borderRadius: '9px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  discardBtn: {
    flex: 1,
    padding: '10px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '9px',
    color: '#fca5a5',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}

export default function Inbox() {
  const navigate = useNavigate()
  const patientId = localStorage.getItem('currentPatientId')

  const loadInbox = () => {
    try {
      return JSON.parse(localStorage.getItem(`inbox_${patientId}`)) || []
    } catch {
      return []
    }
  }

  const [reports, setReports] = useState(loadInbox)

  const saveInbox = (updated) => {
    localStorage.setItem(`inbox_${patientId}`, JSON.stringify(updated))
    setReports(updated)
  }

  const handleAccept = (report) => {
    // Move to records
    const recordsKey = `records_${patientId}`
    const records = JSON.parse(localStorage.getItem(recordsKey) || '[]')
    records.push({ ...report, acceptedAt: new Date().toISOString() })
    localStorage.setItem(recordsKey, JSON.stringify(records))

    // Remove from inbox
    saveInbox(reports.filter((r) => r.id !== report.id))
  }

  const handleDiscard = (id) => {
    saveInbox(reports.filter((r) => r.id !== id))
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
            <button style={styles.navBtn(false)} onClick={() => navigate('/patient-dashboard')}>
              Dashboard
            </button>
            <button style={styles.navBtn(true)} onClick={() => navigate('/inbox')}>
              Inbox
            </button>
            <button style={styles.navBtn(false)} onClick={() => navigate('/my-records')}>
              My Records
            </button>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h1 style={styles.heading}>Inbox</h1>
          {reports.length > 0 && (
            <span style={styles.badge}>{reports.length} pending</span>
          )}
        </div>

        {reports.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>Your inbox is empty</div>
            <div style={styles.emptySubtext}>New reports from your doctor will appear here.</div>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <span style={styles.typePill(report.type)}>
                    <span style={styles.typeDot(report.type)} />
                    {report.type}
                  </span>
                  <div style={styles.meta}>
                    From Dr. {report.doctorId} &nbsp;·&nbsp; {new Date(report.date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={styles.content}>{report.content}</div>

              <div style={styles.actions}>
                <button style={styles.acceptBtn} onClick={() => handleAccept(report)}>
                  Accept & Save
                </button>
                <button style={styles.discardBtn} onClick={() => handleDiscard(report.id)}>
                  Discard
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const REPORT_TYPES = ['Blood Test', 'Scan', 'Prescription', 'Other']

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
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  doctorBadge: {
    background: 'rgba(129,140,248,0.15)',
    border: '1px solid rgba(129,140,248,0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    color: '#a5b4fc',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  container: {
    maxWidth: '680px',
    margin: '48px auto',
    padding: '0 24px',
  },
  heading: { fontSize: '28px', fontWeight: 700, marginBottom: '8px' },
  subheading: { color: '#a5b4fc', fontSize: '15px', marginBottom: '36px' },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '28px',
    backdropFilter: 'blur(12px)',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#a5b4fc',
    marginBottom: '8px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '22px',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px 14px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '22px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '22px',
  },
  typeBtn: (selected) => ({
    padding: '12px',
    borderRadius: '10px',
    border: selected ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.15)',
    background: selected ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.04)',
    color: selected ? '#c7d2fe' : '#94a3b8',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.2s',
    textAlign: 'center',
  }),
  sendBtn: (loading) => ({
    width: '100%',
    padding: '14px',
    background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    cursor: loading ? 'default' : 'pointer',
  }),
  toast: (type) => ({
    marginTop: '16px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
    color: type === 'success' ? '#86efac' : '#fca5a5',
  }),
  sentList: { marginTop: '32px' },
  sentHeading: { fontSize: '16px', fontWeight: 600, color: '#a5b4fc', marginBottom: '14px' },
  sentCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentMeta: { fontSize: '13px', color: '#64748b' },
  typePill: {
    background: 'rgba(129,140,248,0.15)',
    border: '1px solid rgba(129,140,248,0.25)',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '12px',
    color: '#a5b4fc',
  },
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const doctorId = localStorage.getItem('currentDoctorId')
  const doctorMci = localStorage.getItem('currentDoctorMci') || 'Doctor'

  const [patientId, setPatientId] = useState('')
  const [reportContent, setReportContent] = useState('')
  const [reportType, setReportType] = useState('Blood Test')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [sentReports, setSentReports] = useState([])

  useEffect(() => {
    if (!doctorId) return
    supabase
      .from('reports')
      .select('id, patient_id, type, created_at')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setSentReports(data) })
  }, [doctorId])

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSend = async () => {
    const pid = patientId.trim()
    if (!pid) return showToast('Please enter a Patient ID.', 'error')
    if (!reportContent.trim()) return showToast('Report content cannot be empty.', 'error')

    setSending(true)
    const id = 'RPT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    const { data, error } = await supabase
      .from('reports')
      .insert({
        id,
        patient_id: pid,
        doctor_id: doctorId,
        type: reportType,
        content: reportContent.trim(),
        status: 'pending',
      })
      .select('id, patient_id, type, created_at')
      .single()

    setSending(false)

    if (error) return showToast(error.message, 'error')

    setSentReports((prev) => [data, ...prev])
    setPatientId('')
    setReportContent('')
    setReportType('Blood Test')
    showToast(`Report sent to Patient "${pid}" successfully.`, 'success')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentDoctorId')
    localStorage.removeItem('currentDoctorMci')
    navigate('/')
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navBrand}>MyReports</span>
        <div style={styles.navRight}>
          <span style={styles.doctorBadge}>MCI: {doctorMci}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <h1 style={styles.heading}>Send a Report</h1>
        <p style={styles.subheading}>Upload patient reports directly to their inbox.</p>

        <div style={styles.card}>
          <label style={styles.label}>Patient ID</label>
          <input
            style={styles.input}
            placeholder="e.g. PAT-001"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={sending}
          />

          <label style={styles.label}>Report Type</label>
          <div style={styles.typeGrid}>
            {REPORT_TYPES.map((t) => (
              <button
                key={t}
                style={styles.typeBtn(reportType === t)}
                onClick={() => setReportType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <label style={styles.label}>Report Content</label>
          <textarea
            style={styles.textarea}
            placeholder="Enter report details, findings, or notes..."
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            disabled={sending}
          />

          <button style={styles.sendBtn(sending)} onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send to Patient Inbox'}
          </button>

          {toast && <div style={styles.toast(toast.type)}>{toast.message}</div>}
        </div>

        {sentReports.length > 0 && (
          <div style={styles.sentList}>
            <div style={styles.sentHeading}>Recently Sent ({sentReports.length})</div>
            {sentReports.map((r) => (
              <div key={r.id} style={styles.sentCard}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                    Patient: {r.patient_id}
                  </div>
                  <div style={styles.sentMeta}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={styles.typePill}>{r.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

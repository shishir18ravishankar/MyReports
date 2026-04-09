import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const TYPE_COLORS = {
  'Blood Test':   { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#fca5a5', dot: '#ef4444' },
  'Scan':         { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd', dot: '#3b82f6' },
  'Prescription': { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', text: '#86efac', dot: '#22c55e' },
  'Other':        { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: '#d8b4fe', dot: '#a855f7' },
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#1A1B30',
    fontFamily: "'Segoe UI', sans-serif",
    color: '#fff',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
    background: '#252645',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
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
    background: active ? 'rgba(139,92,246,0.2)' : 'transparent',
    border: active ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
    color: active ? '#c4b5fd' : '#64748b',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
  }),
  logoutBtn: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    marginLeft: '8px',
  },
  container: {
    maxWidth: '640px',
    margin: '48px auto',
    padding: '0 24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '26px',
  },
  heading: { fontSize: '26px', fontWeight: 700, margin: 0 },
  badge: {
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    color: '#c4b5fd',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 24px',
    color: '#475569',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '14px' },
  emptyText: { fontSize: '16px', marginBottom: '6px', color: '#64748b' },
  emptySubtext: { fontSize: '13px', color: '#475569' },
  card: {
    background: '#252645',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px 22px',
    marginBottom: '12px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
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
  meta: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  content: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '11px 13px',
    marginBottom: '16px',
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

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patientId) { navigate('/patient-login'); return }
    supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setReports(data)
        setLoading(false)
      })
  }, [patientId])

  const updateStatus = async (id, status) => {
    await supabase.from('reports').update({ status }).eq('id', id)
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const handleLogout = () => {
    localStorage.removeItem('currentPatientId')
    navigate('/')
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.navBrand}>MyReports</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.navLinks}>
            <button style={S.navBtn(false)} onClick={() => navigate('/patient-dashboard')}>Dashboard</button>
            <button style={S.navBtn(true)} onClick={() => navigate('/inbox')}>Inbox</button>
            <button style={S.navBtn(false)} onClick={() => navigate('/my-records')}>My Records</button>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={S.container}>
        <div style={S.headerRow}>
          <h1 style={S.heading}>Inbox</h1>
          {reports.length > 0 && <span style={S.badge}>{reports.length} pending</span>}
        </div>

        {loading ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: '14px', color: '#475569' }}>Loading…</div>
          </div>
        ) : reports.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>📭</div>
            <div style={S.emptyText}>Your inbox is empty</div>
            <div style={S.emptySubtext}>New reports from your doctor will appear here.</div>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} style={S.card}>
              <div style={S.cardTop}>
                <div>
                  <span style={S.typePill(report.type)}>
                    <span style={S.typeDot(report.type)} />
                    {report.type}
                  </span>
                  <div style={S.meta}>
                    From Dr. {report.doctor_id} &nbsp;·&nbsp; {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={S.content}>{report.content}</div>
              <div style={S.actions}>
                <button style={S.acceptBtn} onClick={() => updateStatus(report.id, 'accepted')}>
                  Accept & Save
                </button>
                <button style={S.discardBtn} onClick={() => updateStatus(report.id, 'discarded')}>
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

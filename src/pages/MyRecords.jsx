import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const FOLDER_META = {
  'Blood Test':   { icon: '🩸', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  'Scan':         { icon: '🔬', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd' },
  'Prescription': { icon: '💊', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#86efac' },
  'Other':        { icon: '📄', color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: '#d8b4fe' },
}

const TYPES = Object.keys(FOLDER_META)

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
    maxWidth: '760px',
    margin: '48px auto',
    padding: '0 24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heading: { fontSize: '28px', fontWeight: 700, margin: 0 },
  summaryBtn: {
    padding: '11px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
  },
  summaryBox: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '14px',
    padding: '20px 24px',
    marginBottom: '32px',
  },
  summaryTitle: { fontSize: '15px', fontWeight: 600, color: '#a5b4fc', marginBottom: '10px' },
  summaryText: { fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#475569',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  folderSection: { marginBottom: '36px' },
  folderHeader: (meta) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
    padding: '10px 16px',
    background: meta.bg,
    border: `1px solid ${meta.border}`,
    borderRadius: '10px',
  }),
  folderIcon: { fontSize: '20px' },
  folderTitle: (meta) => ({
    fontSize: '15px',
    fontWeight: 700,
    color: meta.text,
    flex: 1,
  }),
  folderCount: (meta) => ({
    fontSize: '12px',
    color: meta.text,
    opacity: 0.7,
  }),
  recordCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '12px',
    padding: '18px 20px',
    marginBottom: '10px',
  },
  recordMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  recordDate: { fontSize: '12px', color: '#64748b' },
  recordDoctor: { fontSize: '12px', color: '#64748b' },
  recordContent: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: '1.6',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '14px',
    whiteSpace: 'pre-wrap',
  },
  explainBtn: (loading) => ({
    padding: '8px 16px',
    background: loading ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#a5b4fc',
    fontSize: '13px',
    fontWeight: 500,
    cursor: loading ? 'default' : 'pointer',
    opacity: loading ? 0.7 : 1,
  }),
  explanationBox: {
    marginTop: '14px',
    background: 'rgba(129,140,248,0.08)',
    border: '1px solid rgba(129,140,248,0.2)',
    borderRadius: '10px',
    padding: '14px 16px',
  },
  explanationLabel: { fontSize: '11px', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' },
  explanationText: { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(165,180,252,0.3)',
    borderTop: '2px solid #a5b4fc',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginRight: '6px',
    verticalAlign: 'middle',
  },
}

async function callGroq(prompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set in your .env file.')

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

function RecordCard({ record }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExplain = async () => {
    if (loading || explanation) return
    setLoading(true)
    setError(null)
    try {
      const prompt = `You are a friendly medical assistant explaining a medical report to a patient in plain, simple English. Be clear, reassuring, and avoid jargon. Keep your response under 150 words.

Report type: ${record.type}
Report content:
${record.content}

Explain what this means for the patient.`
      const result = await callGroq(prompt)
      setExplanation(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.recordCard}>
      <div style={styles.recordMeta}>
        <span style={styles.recordDate}>{new Date(record.acceptedAt || record.date).toLocaleString()}</span>
        <span style={styles.recordDoctor}>Dr. {record.doctorId}</span>
      </div>
      <div style={styles.recordContent}>{record.content}</div>
      <button style={styles.explainBtn(loading || !!explanation)} onClick={handleExplain} disabled={loading}>
        {loading ? (
          <>
            <span style={styles.spinner} />
            Explaining...
          </>
        ) : explanation ? 'Explained' : 'Explain in Plain English'}
      </button>
      {error && (
        <div style={{ marginTop: '10px', fontSize: '13px', color: '#fca5a5' }}>Error: {error}</div>
      )}
      {explanation && (
        <div style={styles.explanationBox}>
          <div style={styles.explanationLabel}>AI Explanation</div>
          <div style={styles.explanationText}>{explanation}</div>
        </div>
      )}
    </div>
  )
}

export default function MyRecords() {
  const navigate = useNavigate()
  const patientId = localStorage.getItem('currentPatientId')

  const allRecords = (() => {
    try {
      return JSON.parse(localStorage.getItem(`records_${patientId}`)) || []
    } catch {
      return []
    }
  })()

  const grouped = TYPES.reduce((acc, type) => {
    acc[type] = allRecords.filter((r) => r.type === type)
    return acc
  }, {})

  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  const handleSummary = async () => {
    if (summaryLoading) return
    if (allRecords.length === 0) return
    setSummaryLoading(true)
    setSummaryError(null)
    setSummary(null)
    try {
      const recordsText = allRecords
        .map((r, i) => `Record ${i + 1} (${r.type}):\n${r.content}`)
        .join('\n\n')
      const prompt = `You are a helpful medical AI assistant. A patient has provided all their medical records below. Give an overall health summary in plain English, highlight any notable patterns, and offer gentle wellness advice. Keep it concise (under 200 words) and reassuring — no alarmist language.

Patient's records:
${recordsText}

Provide a clear, friendly health summary.`
      const result = await callGroq(prompt)
      setSummary(result)
    } catch (e) {
      setSummaryError(e.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentPatientId')
    navigate('/')
  }

  const hasRecords = allRecords.length > 0

  return (
    <div style={styles.page}>
      {/* Spinner keyframe via a style tag */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={styles.nav}>
        <span style={styles.navBrand}>MyReports</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={styles.navLinks}>
            <button style={styles.navBtn(false)} onClick={() => navigate('/patient-dashboard')}>
              Dashboard
            </button>
            <button style={styles.navBtn(false)} onClick={() => navigate('/inbox')}>
              Inbox
            </button>
            <button style={styles.navBtn(true)} onClick={() => navigate('/my-records')}>
              My Records
            </button>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h1 style={styles.heading}>My Records</h1>
          {hasRecords && (
            <button style={styles.summaryBtn} onClick={handleSummary} disabled={summaryLoading}>
              {summaryLoading ? (
                <>
                  <span style={styles.spinner} />
                  Analysing...
                </>
              ) : (
                <>✨ AI Health Summary</>
              )}
            </button>
          )}
        </div>

        {summaryError && (
          <div style={{ ...styles.summaryBox, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', color: '#fca5a5' }}>Error: {summaryError}</div>
          </div>
        )}

        {summary && (
          <div style={styles.summaryBox}>
            <div style={styles.summaryTitle}>✨ AI Health Summary</div>
            <div style={styles.summaryText}>{summary}</div>
          </div>
        )}

        {!hasRecords ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📂</div>
            <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '6px' }}>No records yet</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              Accept reports from your Inbox to see them here.
            </div>
          </div>
        ) : (
          TYPES.map((type) => {
            const records = grouped[type]
            if (records.length === 0) return null
            const meta = FOLDER_META[type]
            return (
              <div key={type} style={styles.folderSection}>
                <div style={styles.folderHeader(meta)}>
                  <span style={styles.folderIcon}>{meta.icon}</span>
                  <span style={styles.folderTitle(meta)}>{type}</span>
                  <span style={styles.folderCount(meta)}>{records.length} record{records.length !== 1 ? 's' : ''}</span>
                </div>
                {records.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

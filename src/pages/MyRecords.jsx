import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const FOLDER_META = {
  'Blood Test':   { icon: '🩸', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  text: '#fca5a5' },
  'Scan':         { icon: '🔬', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#93c5fd' },
  'Prescription': { icon: '💊', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#86efac' },
  'Other':        { icon: '📄', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', text: '#d8b4fe' },
}

const TYPES = Object.keys(FOLDER_META)

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
    maxWidth: '720px',
    margin: '48px auto',
    padding: '0 24px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '14px',
  },
  heading: { fontSize: '26px', fontWeight: 700, margin: 0 },
  summaryBtn: {
    padding: '10px 18px',
    background: '#8B5CF6',
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
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '14px',
    padding: '18px 22px',
    marginBottom: '28px',
  },
  summaryTitle: { fontSize: '14px', fontWeight: 600, color: '#c4b5fd', marginBottom: '8px' },
  summaryText: { fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  emptyState: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#475569',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '14px' },
  folderSection: { marginBottom: '32px' },
  folderHeader: (meta) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    padding: '10px 14px',
    background: meta.bg,
    border: `1px solid ${meta.border}`,
    borderRadius: '10px',
  }),
  folderIcon: { fontSize: '18px' },
  folderTitle: (meta) => ({
    fontSize: '14px',
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
    background: '#252645',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '16px 18px',
    marginBottom: '8px',
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
    marginBottom: '12px',
    whiteSpace: 'pre-wrap',
  },
  fileSection: {
    marginBottom: '12px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  viewFileBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 15px',
    background: 'rgba(59,130,246,0.15)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '8px',
    color: '#93c5fd',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: '12px',
    textDecoration: 'none',
  },
  inlineImage: {
    width: '100%',
    maxHeight: '420px',
    objectFit: 'contain',
    borderRadius: '8px',
    background: '#000',
    display: 'block',
    marginBottom: '12px',
  },
  actionsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  explainBtn: (done) => ({
    padding: '8px 15px',
    background: done ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '8px',
    color: '#c4b5fd',
    fontSize: '13px',
    fontWeight: 500,
    cursor: done ? 'default' : 'pointer',
    opacity: done ? 0.7 : 1,
  }),
  explanationBox: {
    marginTop: '12px',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  explanationLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#8B5CF6',
    letterSpacing: '0.08em',
    marginBottom: '7px',
    textTransform: 'uppercase',
  },
  explanationText: { fontSize: '14px', color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(196,181,253,0.3)',
    borderTop: '2px solid #c4b5fd',
    borderRadius: '50%',
    animation: 'mr-spin 0.8s linear infinite',
    marginRight: '6px',
    verticalAlign: 'middle',
  },
}

async function callGroq(prompt) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set in your .env file.')
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
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

function isImage(url) {
  return /\.(jpg|jpeg|png)(\?|$)/i.test(url)
}

function isPdf(url) {
  return /\.pdf(\?|$)/i.test(url)
}

function RecordCard({ record }) {
  const [explanation, setExplanation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showImage, setShowImage] = useState(false)

  const hasFile = !!record.file_url
  const fileIsImage = hasFile && isImage(record.file_url)
  const fileIsPdf = hasFile && isPdf(record.file_url)

  const handleExplain = async () => {
    if (loading || explanation) return
    if (!record.content) return
    setLoading(true)
    setError(null)
    try {
      const prompt = `You are a friendly medical assistant explaining a medical report to a patient in plain, simple English. Be clear, reassuring, and avoid jargon. Keep your response under 150 words.

Report type: ${record.type}
Report content:
${record.content}

Explain what this means for the patient.`
      setExplanation(await callGroq(prompt))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.recordCard}>
      <div style={S.recordMeta}>
        <span style={S.recordDate}>{new Date(record.created_at).toLocaleString()}</span>
        <span style={S.recordDoctor}>Dr. {record.doctor_id}</span>
      </div>

      {record.content && (
        <div style={S.recordContent}>{record.content}</div>
      )}

      {hasFile && (
        <div style={{ marginBottom: '12px' }}>
          {fileIsPdf && (
            <a
              href={record.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={S.viewFileBtn}
            >
              📄 View PDF
            </a>
          )}
          {fileIsImage && (
            <>
              <button
                style={S.viewFileBtn}
                onClick={() => setShowImage((v) => !v)}
              >
                🖼 {showImage ? 'Hide Image' : 'View Image'}
              </button>
              {showImage && (
                <img
                  src={record.file_url}
                  alt="Report attachment"
                  style={S.inlineImage}
                />
              )}
            </>
          )}
          {!fileIsPdf && !fileIsImage && (
            <a
              href={record.file_url}
              target="_blank"
              rel="noopener noreferrer"
              style={S.viewFileBtn}
            >
              📎 View File
            </a>
          )}
        </div>
      )}

      <div style={S.actionsRow}>
        {record.content && (
          <button style={S.explainBtn(loading || !!explanation)} onClick={handleExplain} disabled={loading}>
            {loading
              ? <><span style={S.spinner} />Explaining…</>
              : explanation ? 'Explained' : 'Explain in Plain English'}
          </button>
        )}
      </div>

      {error && <div style={{ marginTop: '8px', fontSize: '13px', color: '#fca5a5' }}>Error: {error}</div>}
      {explanation && (
        <div style={S.explanationBox}>
          <div style={S.explanationLabel}>AI Explanation</div>
          <div style={S.explanationText}>{explanation}</div>
        </div>
      )}
    </div>
  )
}

export default function MyRecords() {
  const navigate = useNavigate()
  const patientId = localStorage.getItem('currentPatientId')

  const [allRecords, setAllRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState(null)

  useEffect(() => {
    if (!patientId) { navigate('/patient-login'); return }
    supabase
      .from('reports')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAllRecords(data)
        setLoadingRecords(false)
      })
  }, [patientId])

  const grouped = TYPES.reduce((acc, type) => {
    acc[type] = allRecords.filter((r) => r.type === type)
    return acc
  }, {})

  const handleSummary = async () => {
    if (summaryLoading || allRecords.length === 0) return
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
      setSummary(await callGroq(prompt))
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
    <div style={S.page}>
      <style>{`@keyframes mr-spin { to { transform: rotate(360deg); } }`}</style>

      <nav style={S.nav}>
        <span style={S.navBrand}>MyReports</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={S.navLinks}>
            <button style={S.navBtn(false)} onClick={() => navigate('/patient-dashboard')}>Dashboard</button>
            <button style={S.navBtn(false)} onClick={() => navigate('/inbox')}>Inbox</button>
            <button style={S.navBtn(true)} onClick={() => navigate('/my-records')}>My Records</button>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={S.container}>
        <div style={S.headerRow}>
          <h1 style={S.heading}>My Records</h1>
          {hasRecords && (
            <button style={S.summaryBtn} onClick={handleSummary} disabled={summaryLoading}>
              {summaryLoading ? <><span style={S.spinner} />Analysing…</> : <>✨ AI Health Summary</>}
            </button>
          )}
        </div>

        {summaryError && (
          <div style={{ ...S.summaryBox, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '22px' }}>
            <div style={{ fontSize: '13px', color: '#fca5a5' }}>Error: {summaryError}</div>
          </div>
        )}

        {summary && (
          <div style={S.summaryBox}>
            <div style={S.summaryTitle}>✨ AI Health Summary</div>
            <div style={S.summaryText}>{summary}</div>
          </div>
        )}

        {loadingRecords ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: '14px', color: '#475569' }}>Loading records…</div>
          </div>
        ) : !hasRecords ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}>📂</div>
            <div style={{ fontSize: '15px', color: '#64748b', marginBottom: '6px' }}>No records yet</div>
            <div style={{ fontSize: '13px', color: '#475569' }}>Accept reports from your Inbox to see them here.</div>
          </div>
        ) : (
          TYPES.map((type) => {
            const records = grouped[type]
            if (records.length === 0) return null
            const meta = FOLDER_META[type]
            return (
              <div key={type} style={S.folderSection}>
                <div style={S.folderHeader(meta)}>
                  <span style={S.folderIcon}>{meta.icon}</span>
                  <span style={S.folderTitle(meta)}>{type}</span>
                  <span style={S.folderCount(meta)}>{records.length} record{records.length !== 1 ? 's' : ''}</span>
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

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const REPORT_TYPES = ['Blood Test', 'Scan', 'Prescription', 'Other']

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
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  doctorBadge: {
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    color: '#c4b5fd',
  },
  logoutBtn: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#fca5a5',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  container: {
    maxWidth: '640px',
    margin: '48px auto',
    padding: '0 24px',
  },
  heading: { fontSize: '26px', fontWeight: 700, marginBottom: '6px' },
  subheading: { color: '#A1A1AA', fontSize: '14px', marginBottom: '32px' },
  card: {
    background: '#252645',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '26px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: '#A1A1AA',
    marginBottom: '7px',
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
    marginBottom: '20px',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    color: '#fff',
    padding: '11px 13px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '20px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  typeBtn: (selected) => ({
    padding: '11px',
    borderRadius: '10px',
    border: selected ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.12)',
    background: selected ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.04)',
    color: selected ? '#c4b5fd' : '#A1A1AA',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.2s',
    textAlign: 'center',
  }),
  sendBtn: (loading) => ({
    width: '100%',
    padding: '13px',
    background: loading ? 'rgba(139,92,246,0.4)' : '#8B5CF6',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 600,
    cursor: loading ? 'default' : 'pointer',
  }),
  toast: (type) => ({
    marginTop: '14px',
    padding: '11px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    background: type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
    border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`,
    color: type === 'success' ? '#86efac' : '#fca5a5',
  }),
  sentList: { marginTop: '28px' },
  sentHeading: { fontSize: '15px', fontWeight: 600, color: '#A1A1AA', marginBottom: '12px' },
  sentCard: {
    background: '#252645',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '13px 16px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sentMeta: { fontSize: '12px', color: '#64748b', marginTop: '3px' },
  typePill: {
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.25)',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '12px',
    color: '#c4b5fd',
  },
  fileZone: {
    border: '1.5px dashed rgba(139,92,246,0.4)',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '20px',
    background: 'rgba(139,92,246,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filePickBtn: {
    padding: '8px 16px',
    background: 'rgba(139,92,246,0.2)',
    border: '1px solid rgba(139,92,246,0.4)',
    borderRadius: '8px',
    color: '#c4b5fd',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  fileName: {
    fontSize: '13px',
    color: '#a5b4fc',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clearFileBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 2px',
    lineHeight: 1,
    flexShrink: 0,
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: '#8B5CF6',
    borderRadius: '2px',
    transition: 'width 0.2s',
  }),
  optionalTag: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 400,
    textTransform: 'none',
    letterSpacing: 0,
    marginLeft: '6px',
  },
  sentFileIcon: {
    fontSize: '11px',
    color: '#818cf8',
    marginLeft: '6px',
  },
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const doctorId = localStorage.getItem('currentDoctorId')

  const fileInputRef = useRef(null)

  const [patientId, setPatientId] = useState('')
  const [reportContent, setReportContent] = useState('')
  const [reportType, setReportType] = useState('Blood Test')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [sentReports, setSentReports] = useState([])
  const [doctorName, setDoctorName] = useState('')

  useEffect(() => {
    if (!doctorId) { navigate('/doctor-login'); return }

    // Fetch doctor details from Supabase
    supabase
      .from('doctors')
      .select('name, clinic')
      .eq('id', doctorId)
      .single()
      .then(({ data }) => { if (data) setDoctorName(data.name || doctorId) })

    // Fetch recently sent reports
    supabase
      .from('reports')
      .select('id, patient_id, type, created_at, file_url')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setSentReports(data) })
  }, [doctorId])

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      showToast('Only PDF, JPG, and PNG files are allowed.', 'error')
      e.target.value = ''
      return
    }
    setSelectedFile(file)
    setUploadProgress(0)
  }

  const handleSend = async () => {
    const pid = patientId.trim().toUpperCase()
    if (!pid) return showToast('Please enter a Patient ID.', 'error')
    if (!reportContent.trim() && !selectedFile) {
      return showToast('Add report content or attach a file.', 'error')
    }

    setSending(true)
    setUploadProgress(0)

    // Verify patient exists in Supabase before inserting
    const { data: patient, error: patientErr } = await supabase
      .from('patients')
      .select('id')
      .eq('id', pid)
      .single()

    if (patientErr || !patient) {
      setSending(false)
      return showToast(`Patient "${pid}" not found. Please check the ID.`, 'error')
    }

    const id = 'RPT-' + Math.random().toString(36).substring(2, 10).toUpperCase()

    // Upload file to Supabase Storage if one was selected
    let fileUrl = null
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()
      const filePath = `${doctorId}/${id}.${ext}`

      // Simulate progress during upload (Supabase JS v2 doesn't expose XHR progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 10 : p))
      }, 150)

      const { error: uploadError } = await supabase.storage
        .from('reports')
        .upload(filePath, selectedFile, { upsert: false })

      clearInterval(progressInterval)

      if (uploadError) {
        setSending(false)
        setUploadProgress(0)
        return showToast(`File upload failed: ${uploadError.message}`, 'error')
      }

      setUploadProgress(100)
      const { data: urlData } = supabase.storage.from('reports').getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        id,
        patient_id: pid,
        doctor_id: doctorId,
        type: reportType,
        content: reportContent.trim() || null,
        file_url: fileUrl,
        status: 'pending',
      })
      .select('id, patient_id, type, created_at, file_url')
      .single()

    setSending(false)
    setUploadProgress(0)

    if (error) return showToast(error.message, 'error')

    setSentReports((prev) => [data, ...prev])
    setPatientId('')
    setReportContent('')
    setReportType('Blood Test')
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast(`Report sent to patient "${pid}" successfully.`, 'success')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentDoctorId')
    navigate('/')
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.navBrand}>MyReports</span>
        <div style={S.navRight}>
          <span style={S.doctorBadge}>{doctorName || doctorId}</span>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={S.container}>
        <h1 style={S.heading}>Send a Report</h1>
        <p style={S.subheading}>Upload patient reports directly to their inbox.</p>

        <div style={S.card}>
          <label style={S.label}>Patient ID</label>
          <input
            style={S.input}
            placeholder="e.g. MR-ABC123"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={sending}
          />

          <label style={S.label}>Report Type</label>
          <div style={S.typeGrid}>
            {REPORT_TYPES.map((t) => (
              <button key={t} style={S.typeBtn(reportType === t)} onClick={() => setReportType(t)}>
                {t}
              </button>
            ))}
          </div>

          <label style={S.label}>
            Attach File
            <span style={S.optionalTag}>(PDF, JPG, PNG)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={sending}
          />
          <div style={S.fileZone}>
            <button
              style={S.filePickBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
            >
              {selectedFile ? '📎 Change File' : '📎 Choose File'}
            </button>
            {selectedFile ? (
              <>
                <span style={S.fileName}>{selectedFile.name}</span>
                <button
                  style={S.clearFileBtn}
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  title="Remove file"
                >
                  ✕
                </button>
              </>
            ) : (
              <span style={{ fontSize: '13px', color: '#475569' }}>No file chosen</span>
            )}
            {sending && selectedFile && uploadProgress > 0 && (
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '4px' }}>
                  Uploading… {uploadProgress}%
                </div>
                <div style={S.progressBar}>
                  <div style={S.progressFill(uploadProgress)} />
                </div>
              </div>
            )}
          </div>

          <label style={S.label}>
            Report Content
            {selectedFile && <span style={S.optionalTag}>(optional if file attached)</span>}
          </label>
          <textarea
            style={S.textarea}
            placeholder={selectedFile ? 'Add notes or leave blank…' : 'Enter report details, findings, or notes...'}
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            disabled={sending}
          />

          <button style={S.sendBtn(sending)} onClick={handleSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send to Patient Inbox'}
          </button>

          {toast && <div style={S.toast(toast.type)}>{toast.message}</div>}
        </div>

        {sentReports.length > 0 && (
          <div style={S.sentList}>
            <div style={S.sentHeading}>Recently Sent ({sentReports.length})</div>
            {sentReports.map((r) => (
              <div key={r.id} style={S.sentCard}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '3px' }}>
                    Patient: {r.patient_id}
                    {r.file_url && <span style={S.sentFileIcon}>📎</span>}
                  </div>
                  <div style={S.sentMeta}>{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <span style={S.typePill}>{r.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

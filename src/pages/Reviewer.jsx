import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../App'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import ScoreRing from '../components/ScoreRing'
import IssueCard from '../components/IssueCard'
import SuggestionLine from '../components/SuggestionLine'
import PaywallModal from '../components/PaywallModal'

const FREE_REVIEWS = 1

export default function Reviewer() {
  const { user, isPro } = useAuth()
  const [step, setStep] = useState('input')
  const [inputMode, setInputMode] = useState('upload')
  const [resumeText, setResumeText] = useState('')
  const [pdfBase64, setPdfBase64] = useState(null)
  const [pdfName, setPdfName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [showJobField, setShowJobField] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [dots, setDots] = useState('')
  const [reviewsUsed, setReviewsUsed] = useState(0)
  const [showPaywall, setShowPaywall] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const fileRef = useRef(null)

  // Load review count from localStorage (or DB for logged-in users)
  useEffect(() => {
    const stored = parseInt(localStorage.getItem('resumark_reviews') || '0')
    setReviewsUsed(stored)
  }, [])

  // Load history from Supabase for logged-in users
  useEffect(() => {
    if (!user) return
    supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setHistory(data) })
  }, [user])

  useEffect(() => {
    if (step !== 'loading') return
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(i)
  }, [step])

  const handleFile = useCallback((file) => {
    if (!file) return
    if (file.type === 'application/pdf') {
      const reader = new FileReader()
      reader.onload = () => { setPdfBase64(reader.result.split(',')[1]); setPdfName(file.name); setResumeText(''); setError(null) }
      reader.readAsDataURL(file)
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = () => { setResumeText(reader.result); setPdfBase64(null); setPdfName(''); setError(null) }
      reader.readAsText(file)
    } else {
      setError('Please upload a PDF or TXT file.')
    }
  }, [])

  const onDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])
  const hasResume = resumeText.trim() || pdfBase64

  const analyzeResume = async () => {
    if (!hasResume) return
    if (!isPro && reviewsUsed >= FREE_REVIEWS) { setShowPaywall(true); return }
    setStep('loading'); setError(null)

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText || null,
          pdfBase64: pdfBase64 || null,
          jobDescription: jobDescription.trim() || null,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Server error ${res.status}: ${errBody.substring(0, 200)}`)
      }

      const parsed = await res.json()
      setResults(parsed)
      setStep('results')

      // Track usage
      const newCount = reviewsUsed + 1
      setReviewsUsed(newCount)
      localStorage.setItem('resumark_reviews', String(newCount))

      // Save to history
      const entry = { ...parsed, date: new Date().toISOString(), fileName: pdfName || 'Pasted text' }
      setHistory(h => [entry, ...h])

      // Save to DB if logged in
      if (user) {
        supabase.from('reviews').insert({
          user_id: user.id,
          score: parsed.score,
          summary: parsed.summary,
          results: parsed,
          file_name: pdfName || 'Pasted text',
        })
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
      setStep('input')
    }
  }

  const reset = () => {
    setStep('input'); setResults(null); setResumeText(''); setPdfBase64(null)
    setPdfName(''); setJobDescription(''); setShowJobField(false); setError(null)
  }

  const exportResults = () => {
    if (!results) return
    let text = `RESUME REVIEW — Score: ${results.score}/100\n\n`
    text += `Summary: ${results.summary}\n\n`
    text += `STRENGTHS:\n${results.strengths?.map(s => `  ✓ ${s}`).join('\n')}\n\n`
    text += `ISSUES:\n${results.issues?.map(i => `  [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`).join('\n')}\n\n`
    text += `SUGGESTED REWRITES:\n${results.suggestions?.map((s, i) => `  ${i + 1}. Original: "${s.original}"\n     Suggested: "${s.suggestion}"`).join('\n\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'resume-review.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const label = { fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', display: 'block', marginBottom: 8 }
  const sectionTitle = { fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Header
        showActions={step === 'results'}
        onReset={reset}
        onExport={exportResults}
        historyCount={history.length}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* History Panel */}
      {showHistory && (
        <div style={{ width: '100%', maxWidth: 640, padding: '0 24px' }} className="fade-in">
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 16, marginTop: 16 }}>
            <div style={label}>Review History</div>
            {history.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-ghost)' }}>No reviews yet.</p>}
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < history.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div>
                  <span style={{ fontSize: 13, color: '#e0e0e0' }}>{h.fileName || h.file_name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-ghost)', marginLeft: 10 }}>{new Date(h.date || h.created_at).toLocaleDateString()}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: h.score >= 75 ? 'var(--green)' : h.score >= 50 ? 'var(--yellow)' : 'var(--red)' }}>{h.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── INPUT ─── */}
      {step === 'input' && (
        <div style={{ width: '100%', maxWidth: 620, padding: '48px 24px 40px' }} className="fade-in">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, margin: '0 0 10px', lineHeight: 1.1, background: 'linear-gradient(to right, #f0f0f0, rgba(255,255,255,0.6))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Review your resume
            </h1>
            <p style={{ color: 'var(--text-faint)', margin: 0, fontSize: 15 }}>
              {isPro ? 'Unlimited reviews — Pro plan active.' : reviewsUsed === 0 ? 'Your first review is free.' : `${reviewsUsed} review${reviewsUsed > 1 ? 's' : ''} used — subscribe for €1/mo for unlimited.`}
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 3 }}>
            {['upload', 'paste'].map(mode => (
              <button key={mode} onClick={() => setInputMode(mode)} style={{
                flex: 1, padding: '8px 0', borderRadius: 6, border: 'none',
                background: inputMode === mode ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: inputMode === mode ? '#e0e0e0' : 'rgba(255,255,255,0.3)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                {mode === 'upload' ? '📄  Upload PDF' : '✏️  Paste text'}
              </button>
            ))}
          </div>

          {/* Upload zone */}
          {inputMode === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'rgba(34,197,94,0.5)' : pdfBase64 ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(34,197,94,0.04)' : pdfBase64 ? 'rgba(34,197,94,0.02)' : 'var(--surface)',
                transition: 'all 0.2s', marginBottom: 16
              }}
            >
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              {pdfBase64 ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>{pdfName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-ghost)', marginTop: 6 }}>Click or drop to replace</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>Drop your resume PDF here</div>
                  <div style={{ fontSize: 12, color: 'var(--text-ghost)', marginTop: 6 }}>or click to browse — PDF or TXT</div>
                </>
              )}
            </div>
          )}

          {/* Paste zone */}
          {inputMode === 'paste' && (
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Paste your resume</label>
              <textarea
                value={resumeText}
                onChange={e => { setResumeText(e.target.value); setPdfBase64(null); setPdfName('') }}
                placeholder="Paste the text content of your resume here..."
                style={{ minHeight: 200 }}
              />
            </div>
          )}

          {/* Job description */}
          {!showJobField ? (
            <button onClick={() => setShowJobField(true)} style={{ background: 'none', border: 'none', color: 'var(--green-text)', fontSize: 13, cursor: 'pointer', padding: '4px 0', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>+</span> Add job description to match against
            </button>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <label style={label}>Job description <span style={{ color: 'var(--text-ghost)' }}>(optional)</span></label>
              <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job description you're targeting..." style={{ minHeight: 120 }} />
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--red)', maxHeight: 120, overflowY: 'auto', wordBreak: 'break-word', fontFamily: 'monospace' }}>{error}</div>
          )}

          <button onClick={analyzeResume} disabled={!hasResume} style={{
            width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600, cursor: hasResume ? 'pointer' : 'not-allowed',
            background: hasResume ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)',
            color: hasResume ? '#fff' : 'var(--text-ghost)',
            boxShadow: hasResume ? '0 4px 24px rgba(34,197,94,0.25)' : 'none',
            transition: 'all 0.2s'
          }}>
            {isPro ? 'Review My Resume' : reviewsUsed === 0 ? 'Review My Resume — Free' : 'Review My Resume'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-ghost)', marginTop: 14 }}>Your resume is analyzed in real-time and never stored.</p>
        </div>
      )}

      {/* ─── LOADING ─── */}
      {step === 'loading' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, minHeight: 400 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 24, color: '#fff', fontWeight: 700, animation: 'pulse 1.5s ease-in-out infinite' }}>R</div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Analyzing your resume{dots}</p>
          <p style={{ fontSize: 13, color: 'var(--text-ghost)', marginTop: 8 }}>Checking structure, impact, and ATS readiness</p>
        </div>
      )}

      {/* ─── RESULTS ─── */}
      {step === 'results' && results && (
        <div style={{ width: '100%', maxWidth: 640, padding: '40px 24px 60px' }} className="fade-in">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40, textAlign: 'center' }}>
            <ScoreRing score={results.score} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'rgba(255,255,255,0.8)', margin: '20px 0 8px', lineHeight: 1.4, maxWidth: 420 }}>{results.summary}</p>
          </div>

          {results.strengths?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ ...sectionTitle, color: 'rgba(34,197,94,0.6)' }}>What's working</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {results.strengths.map((s, i) => (
                  <span key={i} style={{ background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'var(--green-text)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {results.issues?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ ...sectionTitle, color: 'var(--text-faint)' }}>Issues found</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.issues.map((issue, i) => <IssueCard key={i} {...issue} />)}
              </div>
            </div>
          )}

          {results.suggestions?.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ ...sectionTitle, color: 'var(--text-faint)' }}>Suggested rewrites</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.suggestions.map((s, i) => <SuggestionLine key={i} {...s} />)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={exportResults} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: '#ccc', padding: '12px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>📋 Export Review</button>
            <button onClick={reset} style={{ flex: 1, background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', padding: '12px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Review Again</button>
          </div>
        </div>
      )}
    </div>
  )
}

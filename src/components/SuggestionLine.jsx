import { useState } from 'react'

export default function SuggestionLine({ original, suggestion }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(suggestion)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 6, fontWeight: 500, letterSpacing: '0.05em' }}>ORIGINAL</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 12, paddingLeft: 12, borderLeft: '2px solid rgba(239,68,68,0.3)' }}>{original}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: 'rgba(34,197,94,0.7)', fontWeight: 500, letterSpacing: '0.05em' }}>SUGGESTED</div>
        <button onClick={copy} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 10px', fontSize: 11, color: copied ? 'var(--green)' : 'var(--text-faint)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, paddingLeft: 12, borderLeft: '2px solid rgba(34,197,94,0.4)' }}>{suggestion}</div>
    </div>
  )
}

const colors = { critical: 'var(--red)', warning: 'var(--yellow)', tip: 'var(--green)' }
const labels = { critical: 'Critical', warning: 'Needs Work', tip: 'Tip' }
const bgs = { critical: 'rgba(239,68,68,0.08)', warning: 'rgba(234,179,8,0.06)', tip: 'rgba(34,197,94,0.06)' }

export default function IssueCard({ icon, title, description, severity }) {
  return (
    <div style={{ background: bgs[severity], border: `1px solid ${colors[severity]}22`, borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${colors[severity]}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{title}</span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: colors[severity], background: `${colors[severity]}15`, padding: '2px 7px', borderRadius: 4 }}>{labels[severity]}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{description}</p>
      </div>
    </div>
  )
}

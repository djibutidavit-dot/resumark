import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'

function FeatureCard({ icon, title, desc }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '22px 20px', flex: '1 1 200px' }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-faint)', lineHeight: 1.5 }}>{desc}</div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const go = () => navigate('/review')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Header />

      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: 640, padding: '80px 24px 40px' }}>
        <div style={{ display: 'inline-block', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 20, padding: '5px 16px', fontSize: 12, color: 'var(--green)', fontWeight: 500, marginBottom: 24 }}>
          First review free — no signup required
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 52, margin: '0 0 18px', lineHeight: 1.08, background: 'linear-gradient(to right, #f0f0f0, rgba(255,255,255,0.5))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your resume,<br />brutally reviewed
        </h1>
        <p style={{ color: 'var(--text-faint)', fontSize: 17, maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Upload your resume and get an honest AI-powered review with a score, specific issues, and rewritten bullet points — in under 30 seconds.
        </p>
        <button onClick={go} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', padding: '14px 40px', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 24px rgba(34,197,94,0.25)' }}>
          Get Your Free Review
        </button>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 720, padding: '40px 24px 20px', width: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-ghost)', textAlign: 'center', marginBottom: 24 }}>How it works</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <FeatureCard icon="📄" title="Upload or paste" desc="Drop your PDF or paste your resume text. Add a job description to match against." />
          <FeatureCard icon="🔍" title="AI analysis" desc="Your resume is scored on impact, clarity, ATS readiness, and specificity in seconds." />
          <FeatureCard icon="✏️" title="Get rewrites" desc="Line-by-line suggestions you can copy directly into your resume." />
        </div>
      </div>

      {/* What you get */}
      <div style={{ maxWidth: 720, padding: '40px 24px 20px', width: '100%' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-ghost)', textAlign: 'center', marginBottom: 24 }}>What you get</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <FeatureCard icon="💯" title="Resume score" desc="A 0-100 score based on how your resume stacks up against hiring standards." />
          <FeatureCard icon="🎯" title="Job matching" desc="Paste a job description and see how well your resume aligns with the role." />
          <FeatureCard icon="📋" title="Export results" desc="Download your full review as a file to reference while editing." />
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 720, padding: '60px 24px 80px', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: 32 }}>Simple pricing</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '28px 32px', flex: '1 1 240px', maxWidth: 300, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Free</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text)', marginBottom: 4 }}>€0</div>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 20 }}>1 review included</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              ✓ Full resume analysis<br/>✓ Score & issues<br/>✓ Line-by-line rewrites<br/>✓ Export results
            </div>
          </div>
          <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '28px 32px', flex: '1 1 240px', maxWidth: 300, textAlign: 'left', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, right: 16, background: 'var(--green)', color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, letterSpacing: '0.05em' }}>POPULAR</div>
            <div style={{ fontSize: 12, color: 'var(--green-text)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Pro</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--text)', marginBottom: 4 }}>€1<span style={{ fontSize: 16, color: 'var(--text-faint)' }}>/mo</span></div>
            <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 20 }}>cancel anytime</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              ✓ Everything in Free<br/>✓ Job description matching<br/>✓ Unlimited reviews<br/>✓ Review history
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', padding: '20px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-ghost)' }}>Resumark — Your resume is analyzed in real-time and never stored.</span>
      </div>
    </div>
  )
}

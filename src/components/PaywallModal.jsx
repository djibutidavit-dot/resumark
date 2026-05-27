import { useAuth } from '../App'

const STRIPE_LINK = 'https://buy.stripe.com/test_14AeV67oP0Qp2Uo7Iw4ko00'

export default function PaywallModal({ onClose }) {
  const { user, signInWithGoogle } = useAuth()

  function handleSubscribe() {
    if (!user) {
      signInWithGoogle()
      return
    }
    window.open(STRIPE_LINK + '?prefilled_email=' + encodeURIComponent(user.email), '_self')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }} onClick={onClose}>
      <div style={{ background: '#141416', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '36px 32px', maxWidth: 400, width: '100%', textAlign: 'center', animation: 'fadeIn 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, margin: '0 0 8px', color: 'var(--text)' }}>Free review used</h2>
        <p style={{ color: 'var(--text-faint)', fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 }}>
          Unlock unlimited reviews for just €1/month. Cancel anytime.
        </p>
        <button onClick={handleSubscribe} style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', width: '100%', padding: '14px 0', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', boxShadow: '0 4px 20px rgba(34,197,94,0.2)' }}>
          {user ? 'Subscribe — €1/month' : 'Sign in to subscribe'}
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 12 }}>
          Maybe later
        </button>
      </div>
    </div>
  )
}

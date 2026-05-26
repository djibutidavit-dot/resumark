import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'

const S = {
  header: { width: '100%', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', boxSizing: 'border-box' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  logoIcon: { width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' },
  logoText: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 },
  btn: { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: '#ccc', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  btnPrimary: { background: 'linear-gradient(135deg,#22c55e,#16a34a)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--green)', fontWeight: 600 },
}

export default function Header({ showActions, onReset, onExport, historyCount, onToggleHistory }) {
  const navigate = useNavigate()
  const { user, isPro, signInWithGoogle, signOut } = useAuth()

  return (
    <div style={S.header}>
      <div style={S.logo} onClick={() => navigate('/')}>
        <div style={S.logoIcon}>R</div>
        <span style={S.logoText}>Resumark</span>
        {isPro && (
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--green)', background: 'var(--green-bg)', border: '1px solid var(--green-border)', padding: '2px 7px', borderRadius: 4 }}>PRO</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {historyCount > 0 && onToggleHistory && (
          <button onClick={onToggleHistory} style={S.btn}>History ({historyCount})</button>
        )}
        {showActions && (
          <>
            {onExport && <button onClick={onExport} style={S.btn}>Export</button>}
            {onReset && <button onClick={onReset} style={S.btnPrimary}>New Review</button>}
          </>
        )}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={S.avatar}>{user.email?.[0]?.toUpperCase() || '?'}</div>
            <button onClick={signOut} style={{ ...S.btn, fontSize: 12, padding: '5px 12px' }}>Sign out</button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} style={S.btn}>Sign in</button>
        )}
      </div>
    </div>
  )
}

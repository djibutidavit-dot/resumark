import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Landing from './pages/Landing'
import Reviewer from './pages/Reviewer'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export default function App() {
  const [user, setUser] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchSubscription(session.user.id)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchSubscription(session.user.id)
        else setSubscription(null)
      }
    )

    return () => authSub.unsubscribe()
  }, [])

  async function fetchSubscription(userId) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()
    setSubscription(data)
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/review' }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSubscription(null)
  }

  const isPro = !!subscription

  return (
    <AuthContext.Provider value={{ user, isPro, subscription, loading, signInWithGoogle, signOut, fetchSubscription }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/review" element={<Reviewer />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'Almeno 8 caratteri' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Almeno una lettera maiuscola' },
  { test: (p: string) => /[0-9]/.test(p), label: 'Almeno un numero' },
]

function SetPassword() {
  const { profile, clearPasswordSet } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(password))
  const passwordsMatch = password === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRulesPass || !passwordsMatch) return

    setLoading(true)
    setError('')

    const { error: updateErr } = await supabase.auth.updateUser({
      password,
    })

    if (updateErr) {
      setError(updateErr.message)
      setLoading(false)
      return
    }

    if (profile?.status === 'pending') {
      await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', profile.id)
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      clearPasswordSet()
    }, 2000)
  }

  const isInvite = profile?.status === 'pending'

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Password impostata!</h2>
            <p className="text-sm text-slate-500">Reindirizzamento alla dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Gestionale</h1>
          <p className="text-slate-400 text-sm mt-1">Studio Tecnico</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            {isInvite ? 'Imposta la tua password' : 'Reimposta la password'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isInvite
              ? 'Benvenuto! Scegli una password per accedere al gestionale.'
              : 'Scegli una nuova password per il tuo account.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nuova password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Conferma password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-500 mt-1">Le password non coincidono</p>
              )}
            </div>
          </div>

          <div className="mb-6 space-y-1.5">
            {PASSWORD_RULES.map((rule) => {
              const passes = rule.test(password)
              return (
                <div key={rule.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passes ? 'bg-green-100' : 'bg-slate-100'}`}>
                    {passes ? (
                      <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    )}
                  </div>
                  <span className={`text-xs ${passes ? 'text-green-700' : 'text-slate-500'}`}>
                    {rule.label}
                  </span>
                </div>
              )
            })}
          </div>

          <button
            type="submit"
            disabled={loading || !allRulesPass || !passwordsMatch}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvataggio...' : 'Imposta password'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Gestionale Studio Tecnico v1.0
        </p>
      </div>
    </div>
  )
}

export default SetPassword

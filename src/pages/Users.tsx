import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'operatore'
  status: 'pending' | 'active' | 'disabled'
  created_at: string
}

function Users() {
  const { isAdmin, profile: currentProfile } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmAction, setConfirmAction] = useState<{
    type: 'disable' | 'reactivate'
    profile: Profile
    practiceCount?: number
  } | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setProfiles(data as Profile[])
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !inviteName.trim()) return
    setLoading(true)
    setError('')
    setMessage('')

    const { error: invErr } = await supabase.functions.invoke('invite-user', {
      body: { email: inviteEmail.trim(), fullName: inviteName.trim() },
    })

    if (invErr) {
      setError('Errore nell\'invio dell\'invito. Riprova.')
    } else {
      setMessage(`Invito inviato a ${inviteEmail}`)
      setInviteEmail('')
      setInviteName('')
      setShowInvite(false)
      loadProfiles()
    }
    setLoading(false)
  }

  const handleDisable = async (profile: Profile) => {
    const { count } = await supabase
      .from('practices')
      .select('*', { count: 'exact', head: true })
      .eq('operator', profile.full_name)

    setConfirmAction({
      type: 'disable',
      profile,
      practiceCount: count ?? 0,
    })
  }

  const handleConfirmDisable = async () => {
    if (!confirmAction || confirmAction.type !== 'disable') return

    const activeAdmins = profiles.filter(
      (p) => p.role === 'admin' && p.status === 'active'
    )
    if (
      confirmAction.profile.role === 'admin' &&
      activeAdmins.length <= 1
    ) {
      setError('Non puoi disattivare l\'ultimo amministratore.')
      setConfirmAction(null)
      return
    }

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ status: 'disabled' })
      .eq('id', confirmAction.profile.id)

    if (updErr) {
      setError('Errore durante la disattivazione.')
    } else {
      setMessage(`${confirmAction.profile.full_name} è stato disattivato.`)
      loadProfiles()
    }
    setConfirmAction(null)
  }

  const handleReactivate = (profile: Profile) => {
    setConfirmAction({ type: 'reactivate', profile })
  }

  const handleConfirmReactivate = async () => {
    if (!confirmAction || confirmAction.type !== 'reactivate') return

    const { error: updErr } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', confirmAction.profile.id)

    if (updErr) {
      setError('Errore durante la riattivazione.')
    } else {
      setMessage(`${confirmAction.profile.full_name} è stato riattivato.`)
      loadProfiles()
    }
    setConfirmAction(null)
  }

  const handleResendInvite = async (profile: Profile) => {
    setError('')
    setMessage('')

    const { error: invErr } = await supabase.functions.invoke('invite-user', {
      body: { email: profile.email, fullName: profile.full_name },
    })

    if (invErr) {
      setError('Errore nel reinvio dell\'invito. Riprova.')
    } else {
      setMessage(`Invito reinviato a ${profile.email}`)
    }
  }

  function ActionMenu({ profile }: { profile: Profile }) {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (profile.id === currentProfile?.id) return null

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[160px]">
            {profile.status === 'pending' && (
              <button
                onClick={() => {
                  setOpen(false)
                  handleResendInvite(profile)
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Rinvia invito
              </button>
            )}
            {profile.status === 'active' && (
              <button
                onClick={() => {
                  setOpen(false)
                  handleDisable(profile)
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Disattiva
              </button>
            )}
            {profile.status === 'disabled' && (
              <button
                onClick={() => {
                  setOpen(false)
                  handleReactivate(profile)
                }}
                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50"
              >
                Riattiva
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Non hai i permessi per accedere a questa pagina.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utenti</h1>
          <p className="text-sm text-slate-500 mt-1">
            {profiles.length} utenti registrati
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Invita operatore
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruolo</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stato</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registrato il</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Azioni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {p.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${p.status === 'disabled' ? 'text-slate-400' : 'text-slate-900'}`}>
                      {p.full_name}
                    </span>
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm ${p.status === 'disabled' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {p.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {p.role === 'admin' ? 'Admin' : 'Operatore'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.status === 'active'
                      ? 'Attivo'
                      : p.status === 'pending'
                        ? 'In attesa'
                        : 'Disattivato'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(p.created_at).toLocaleDateString('it-IT')}
                </td>
                <td className="px-6 py-4">
                  <ActionMenu profile={p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {confirmAction.type === 'disable' ? (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Disattiva utente</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Sei sicuro di voler disattivare {confirmAction.profile.full_name}? Non potrà più accedere al sistema.
                </p>
                {(confirmAction.practiceCount ?? 0) > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    Questo utente ha {confirmAction.practiceCount} pratiche assegnate. Dopo la disattivazione le pratiche resteranno assegnate ma potrai riassegnarle.
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleConfirmDisable}
                    className="px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disattiva
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Riattiva utente</h2>
                <p className="text-sm text-slate-600 mb-4">
                  Vuoi riattivare {confirmAction.profile.full_name}? Potrà accedere di nuovo al sistema.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleConfirmReactivate}
                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Riattiva
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleInvite}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-6">Invita nuovo operatore</h2>
            <p className="text-sm text-slate-500 mb-4">
              L'operatore riceverà un'email con il link per impostare la password.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Es. Noemi Rossi"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="noemi@studio.it"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || !inviteEmail.trim() || !inviteName.trim()}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Invio...' : 'Invia invito'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Users

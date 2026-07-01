import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { mockPractices, mockProjects, mockActivities, mockInvoices } from '../data/mockData'
import {
  getBalanceDue,
  getDaysRemaining,
  getDeadlineColor,
  getPriorityColor,
} from '../types'

function PracticeDetail() {
  const { id } = useParams()
  const practice = mockPractices.find((p) => p.id === id)
  const [activities, setActivities] = useState(
    mockActivities.filter((a) => a.practiceId === id),
  )
  const [newActivity, setNewActivity] = useState('')
  const invoices = mockInvoices.filter((i) => i.practiceId === id)

  if (!practice) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Pratica non trovata</p>
      </div>
    )
  }

  const project = mockProjects.find((p) => p.id === practice.projectId)
  const days = getDaysRemaining(practice.expiryDate)
  const balance = getBalanceDue(practice)
  const completedActivities = activities.filter((a) => a.isCompleted).length

  const toggleActivity = (actId: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === actId
          ? {
              ...a,
              isCompleted: !a.isCompleted,
              completedAt: !a.isCompleted ? new Date().toISOString().split('T')[0] : null,
            }
          : a,
      ),
    )
  }

  const addActivity = () => {
    if (!newActivity.trim()) return
    setActivities((prev) => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        practiceId: id!,
        description: newActivity.trim(),
        isCompleted: false,
        completedAt: null,
        sortOrder: prev.length,
      },
    ])
    setNewActivity('')
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <Link to="/practices" className="hover:text-slate-600">Pratiche</Link>
          <span>/</span>
          {project && (
            <>
              <Link to={`/projects/${project.id}`} className="hover:text-slate-600">{project.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-600">{practice.practiceCode}</span>
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{practice.clientName}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(practice.priority)}`}>
            {practice.priority}
          </span>
          {days !== null && (
            <span className={`px-3 py-1 rounded-md text-sm font-semibold ${getDeadlineColor(days)}`}>
              {days < 0 ? `Scaduta ${Math.abs(days)}gg fa` : `${days} giorni alla scadenza`}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Dettagli pratica</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Progetto</p>
                {project ? (
                  <Link to={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                    {project.name}
                  </Link>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nessun progetto</p>
                )}
              </div>
              {[
                ['Codice', practice.practiceCode],
                ['Tipologia', practice.practiceType],
                ['Comune', practice.municipality],
                ['Indirizzo', practice.address],
                ['Catastale', practice.cadastralRef || '—'],
                ['Operatore', practice.operator],
                ['Status', practice.status],
                ['Stato Ente', practice.paStatus || '—'],
                ['Pericolosità', practice.hazardLevel || '—'],
                ['Data invio', practice.submissionDate || '—'],
                ['Scadenza', practice.expiryDate || '—'],
                ['Data chiusura', practice.closingDate || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Attività ({completedActivities}/{activities.length})
              </h2>
              {activities.length > 0 && (
                <div className="w-32 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(completedActivities / activities.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2 mb-4">
              {activities.map((activity) => (
                <label
                  key={activity.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={activity.isCompleted}
                    onChange={() => toggleActivity(activity.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm flex-1 ${activity.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {activity.description}
                  </span>
                  {activity.completedAt && (
                    <span className="text-xs text-slate-300">{activity.completedAt}</span>
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Aggiungi attività..."
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addActivity()}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addActivity}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Fatturazione</h2>
            <div className="space-y-3">
              {[
                ['Importo contratto', practice.contractAmount],
                ['Prestazioni aggiunte', practice.additionalServicesAmount],
                ['Spese sostenute', practice.expenses],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <span className="text-sm text-slate-500">{label as string}</span>
                  <span className="text-sm font-medium text-slate-700">
                    €{(value as number).toLocaleString('it-IT')}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Totale fatturato</span>
                  <span className="text-sm font-medium">€{practice.totalInvoiced.toLocaleString('it-IT')}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-slate-500">Incassato</span>
                  <span className="text-sm font-medium">€{practice.totalPaymentsReceived.toLocaleString('it-IT')}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-slate-900">Saldo da incassare</span>
                  <span className={`text-lg font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    €{balance.toLocaleString('it-IT')}
                  </span>
                </div>
              </div>
              {practice.invoiceStatus && (
                <div className="pt-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {practice.invoiceStatus}
                  </span>
                </div>
              )}
              {practice.paymentNotes && (
                <p className="text-xs text-slate-400 italic">{practice.paymentNotes}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Fatture emesse</h2>
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nessuna fattura</p>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{inv.invoiceNumber}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(inv.invoiceDate).toLocaleDateString('it-IT')} ·{' '}
                        {inv.type === 'advance' ? 'Acconto' : 'Saldo'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      €{inv.amount.toLocaleString('it-IT')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full mt-4 px-4 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              + Aggiungi fattura
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Allegati</h2>
            <p className="text-sm text-slate-400 text-center py-4">Nessun allegato</p>
            <button className="w-full mt-2 px-4 py-2 border border-slate-200 text-sm text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              + Carica documento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticeDetail

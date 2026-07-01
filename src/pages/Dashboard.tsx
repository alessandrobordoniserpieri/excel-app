import { useStore } from '../hooks/useStore'
import { getBalanceDue, getDaysRemaining, getDeadlineColor, getPriorityColor } from '../types'
import type { Practice, Project } from '../types'
import { Link } from 'react-router-dom'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function PracticeRow({ practice, projects }: { practice: Practice; projects: Project[] }) {
  const days = getDaysRemaining(practice.expiryDate)
  const balance = getBalanceDue(practice)
  const project = projects.find((p) => p.id === practice.projectId)

  return (
    <Link
      to={`/practices/${practice.id}`}
      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {practice.clientName}
          </p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(practice.priority)}`}>
            {practice.priority}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-slate-400">{practice.practiceCode}</span>
          {project && (
            <span className="text-xs text-slate-400">· {project.name}</span>
          )}
          <span className="text-xs text-slate-400">· {practice.operator}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {days !== null && (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getDeadlineColor(days)}`}>
            {days < 0 ? `Scaduta ${Math.abs(days)}gg fa` : `${days}gg`}
          </span>
        )}
        {balance > 0 && (
          <span className="text-sm font-semibold text-red-600">
            €{balance.toLocaleString('it-IT')}
          </span>
        )}
      </div>
    </Link>
  )
}

function Dashboard() {
  const { practices: allPractices, projects } = useStore()
  const activePractices = allPractices.filter(
    (p) => !p.status.startsWith('DONE') && p.paStatus !== 'Chiusa',
  )
  const closedPractices = allPractices.filter(
    (p) => p.status.startsWith('DONE') || p.paStatus === 'Chiusa',
  )

  const practicesWithDeadline = activePractices
    .filter((p) => {
      const days = getDaysRemaining(p.expiryDate)
      return days !== null && days <= 30
    })
    .sort((a, b) => {
      const da = getDaysRemaining(a.expiryDate) ?? Infinity
      const db = getDaysRemaining(b.expiryDate) ?? Infinity
      return da - db
    })

  const unpaidPractices = allPractices
    .filter((p) => getBalanceDue(p) > 0)
    .sort((a, b) => getBalanceDue(b) - getBalanceDue(a))

  const toInvoice = activePractices.filter(
    (p) =>
      p.invoiceStatus === 'Da fatturare acconto' ||
      p.invoiceStatus === 'Da fatturare saldo',
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Panoramica dello studio · {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pratiche attive" value={activePractices.length} color="text-blue-600" />
        <StatCard label="In scadenza (30gg)" value={practicesWithDeadline.length} color="text-orange-600" />
        <StatCard label="Da fatturare" value={toInvoice.length} color="text-yellow-600" />
        <StatCard label="Chiuse" value={closedPractices.length} color="text-green-600" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              ⚠ Pratiche in scadenza
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Prossimi 30 giorni</p>
          </div>
          <div className="p-2">
            {practicesWithDeadline.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Nessuna pratica in scadenza
              </p>
            ) : (
              practicesWithDeadline.map((p) => (
                <PracticeRow key={p.id} practice={p} projects={projects} />
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              💰 Pratiche non pagate
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Saldo da incassare &gt; 0</p>
          </div>
          <div className="p-2">
            {unpaidPractices.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400">
                Tutto pagato!
              </p>
            ) : (
              unpaidPractices.map((p) => (
                <PracticeRow key={p.id} practice={p} projects={projects} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

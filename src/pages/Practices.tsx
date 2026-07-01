import { Link } from 'react-router-dom'
import { useState } from 'react'
import { mockPractices, mockProjects } from '../data/mockData'
import {
  getBalanceDue,
  getDaysRemaining,
  getDeadlineColor,
  getPriorityColor,
} from '../types'
import { OPERATORS, PRIORITIES } from '../data/dropdowns'

function Practices() {
  const [search, setSearch] = useState('')
  const [filterOperator, setFilterOperator] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState<'active' | 'closed' | 'all'>('active')

  const filtered = mockPractices
    .filter((p) => {
      if (search && !p.clientName.toLowerCase().includes(search.toLowerCase())) return false
      if (filterOperator && p.operator !== filterOperator) return false
      if (filterPriority && p.priority !== filterPriority) return false
      if (filterStatus === 'active' && (p.status.startsWith('DONE') || p.paStatus === 'Chiusa')) return false
      if (filterStatus === 'closed' && !p.status.startsWith('DONE') && p.paStatus !== 'Chiusa') return false
      return true
    })
    .sort((a, b) => a.priorityOrder - b.priorityOrder)

  const resetFilters = () => {
    setSearch('')
    setFilterOperator('')
    setFilterPriority('')
    setFilterStatus('active')
  }

  const hasFilters = search || filterOperator || filterPriority || filterStatus !== 'active'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pratiche</h1>
          <p className="text-sm text-slate-500 mt-1">
            {filtered.length} pratiche
            {filterStatus === 'active' ? ' attive' : filterStatus === 'closed' ? ' chiuse' : ' totali'}
          </p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Nuova pratica
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="p-4 flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Cerca per cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterOperator}
            onChange={(e) => setFilterOperator(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutti gli operatori</option>
            {OPERATORS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tutte le priorità</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(['active', 'closed', 'all'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s === 'active' ? 'Attive' : s === 'closed' ? 'Chiuse' : 'Tutte'}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Codice</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipologia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Operatore</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priorità</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Scadenza</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((practice) => {
              const days = getDaysRemaining(practice.expiryDate)
              const balance = getBalanceDue(practice)
              const project = mockProjects.find((pr) => pr.id === practice.projectId)

              return (
                <tr key={practice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`/practices/${practice.id}`}
                      className="text-sm font-mono text-blue-600 hover:underline"
                    >
                      {practice.practiceCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{practice.clientName}</p>
                    {project ? (
                      <Link to={`/projects/${project.id}`} className="text-xs text-blue-500 hover:underline">
                        {project.name}
                      </Link>
                    ) : (
                      <p className="text-xs text-slate-300 italic">Senza progetto</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {practice.practiceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{practice.operator}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(practice.priority)}`}>
                      {practice.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {days !== null ? (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDeadlineColor(days)}`}>
                        {days < 0 ? `Scaduta ${Math.abs(days)}gg` : `${days}gg`}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-600">{practice.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {balance > 0 ? (
                      <span className="text-sm font-semibold text-red-600">
                        €{balance.toLocaleString('it-IT')}
                      </span>
                    ) : balance === 0 && practice.contractAmount > 0 ? (
                      <span className="text-sm text-green-600">✓ Saldato</span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Practices

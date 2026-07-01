import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { getBalanceDue, getDaysRemaining, getDeadlineColor, getPriorityColor } from '../types'
import ProjectForm from '../components/ProjectForm'
import PracticeForm from '../components/PracticeForm'
import { useOperators } from '../hooks/useOperators'

function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, practices: allPractices, updateProject, deleteProject, addPractice } = useStore()
  const { formatOperator } = useOperators()
  const [showEditProject, setShowEditProject] = useState(false)
  const [showNewPractice, setShowNewPractice] = useState(false)
  const project = projects.find((p) => p.id === id)
  const practices = allPractices.filter((p) => p.projectId === id)

  if (!project) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Progetto non trovato</p>
      </div>
    )
  }

  const totalContract = practices.reduce(
    (sum, p) => sum + p.contractAmount + p.additionalServicesAmount + p.expenses,
    0,
  )
  const totalInvoiced = practices.reduce((sum, p) => sum + p.totalInvoiced, 0)
  const totalReceived = practices.reduce((sum, p) => sum + p.totalPaymentsReceived, 0)
  const totalBalance = practices.reduce((sum, p) => sum + getBalanceDue(p), 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <Link to="/projects" className="hover:text-slate-600">Progetti</Link>
          <span>/</span>
          <span className="text-slate-600">{project.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          <button
            onClick={() => setShowEditProject(true)}
            className="px-3 py-1 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Modifica
          </button>
          <button
            onClick={() => {
              if (confirm('Eliminare questo progetto? Le pratiche non verranno eliminate.')) {
                deleteProject(id!)
                navigate('/projects')
              }
            }}
            className="px-3 py-1 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Elimina
          </button>
        </div>
        <p className="text-sm text-slate-500">{project.clientName}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Valore totale</p>
          <p className="text-xl font-bold text-slate-900">€{totalContract.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Fatturato</p>
          <p className="text-xl font-bold text-blue-600">€{totalInvoiced.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Incassato</p>
          <p className="text-xl font-bold text-green-600">€{totalReceived.toLocaleString('it-IT')}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Da incassare</p>
          <p className={`text-xl font-bold ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
            €{totalBalance.toLocaleString('it-IT')}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Pratiche ({practices.length})
          </h2>
          <button
            onClick={() => setShowNewPractice(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nuova pratica
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Codice</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tipologia</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Operatore</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Priorità</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scadenza</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {practices.map((practice) => {
              const days = getDaysRemaining(practice.expiryDate)
              const balance = getBalanceDue(practice)

              return (
                <tr key={practice.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/practices/${practice.id}`} className="text-sm font-mono text-blue-600 hover:underline">
                      {practice.practiceCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {practice.practiceType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatOperator(practice.operator)}</td>
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
                  <td className="px-4 py-3 text-xs text-slate-600">{practice.status}</td>
                  <td className="px-4 py-3 text-right">
                    {balance > 0 ? (
                      <span className="text-sm font-semibold text-red-600">€{balance.toLocaleString('it-IT')}</span>
                    ) : balance === 0 && practice.contractAmount > 0 ? (
                      <span className="text-sm text-green-600">✓</span>
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

      {showEditProject && (
        <ProjectForm
          project={project}
          onSave={(data) => {
            updateProject(id!, data)
            setShowEditProject(false)
          }}
          onCancel={() => setShowEditProject(false)}
        />
      )}

      {showNewPractice && (
        <PracticeForm
          defaultProjectId={id}
          onSave={(data) => {
            addPractice(data)
            setShowNewPractice(false)
          }}
          onCancel={() => setShowNewPractice(false)}
        />
      )}
    </div>
  )
}

export default ProjectDetail

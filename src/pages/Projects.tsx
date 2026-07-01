import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { getBalanceDue } from '../types'
import ProjectForm from '../components/ProjectForm'

function Projects() {
  const { projects, practices, addProject } = useStore()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Progetti</h1>
          <p className="text-sm text-slate-500 mt-1">
            {projects.length} progetti totali
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuovo progetto
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {projects.map((project) => {
          const projectPractices = practices.filter(
            (p) => p.projectId === project.id,
          )
          const totalContract = projectPractices.reduce(
            (sum, p) => sum + p.contractAmount + p.additionalServicesAmount,
            0,
          )
          const totalBalance = projectPractices.reduce(
            (sum, p) => sum + getBalanceDue(p),
            0,
          )
          const activePractices = projectPractices.filter(
            (p) => !p.status.startsWith('DONE') && p.paStatus !== 'Chiusa',
          )

          return (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500">{project.clientName}</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {projectPractices.length} pratiche
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Attive</span>
                  <span className="font-medium text-slate-900">
                    {activePractices.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Valore contratti</span>
                  <span className="font-medium text-slate-900">
                    €{totalContract.toLocaleString('it-IT')}
                  </span>
                </div>
                {totalBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Da incassare</span>
                    <span className="font-semibold text-red-600">
                      €{totalBalance.toLocaleString('it-IT')}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {showForm && (
        <ProjectForm
          onSave={(data) => {
            addProject(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default Projects

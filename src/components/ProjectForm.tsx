import { useState } from 'react'
import type { Project } from '../types'

interface ProjectFormProps {
  project?: Project
  onSave: (data: { name: string; clientName: string }) => void
  onCancel: () => void
}

function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(project?.name ?? '')
  const [clientName, setClientName] = useState(project?.clientName ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !clientName.trim()) return
    onSave({ name: name.trim(), clientName: clientName.trim() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {project ? 'Modifica progetto' : 'Nuovo progetto'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome progetto *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Hotel Azzurra"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome cliente *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Es. Hotel Azzurra Srl"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={!name.trim() || !clientName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {project ? 'Salva modifiche' : 'Crea progetto'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm

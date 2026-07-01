import { createContext, useContext, useState, useCallback } from 'react'
import type { Project, Practice, Invoice } from '../types'
import {
  mockProjects as initialProjects,
  mockPractices as initialPractices,
  mockActivities as initialActivities,
  mockInvoices as initialInvoices,
} from '../data/mockData'
import type { PracticeActivity } from '../types'

interface Store {
  projects: Project[]
  practices: Practice[]
  activities: PracticeActivity[]
  invoices: Invoice[]
  addProject: (data: { name: string; clientName: string }) => Project
  updateProject: (id: string, data: { name: string; clientName: string }) => void
  deleteProject: (id: string) => void
  addPractice: (data: Partial<Practice>) => Practice
  updatePractice: (id: string, data: Partial<Practice>) => void
  deletePractice: (id: string) => void
  addActivity: (practiceId: string, description: string) => void
  toggleActivity: (id: string) => void
}

const StoreContext = createContext<Store | null>(null)

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function generatePracticeCode(practices: Practice[]) {
  const year = new Date().getFullYear()
  const existing = practices
    .map((p) => {
      const match = p.practiceCode.match(/PR-\d{4}-(\d{3})/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter(Boolean)
  const next = Math.max(0, ...existing) + 1
  return `PR-${year}-${String(next).padStart(3, '0')}`
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [practices, setPractices] = useState<Practice[]>(initialPractices)
  const [activities, setActivities] = useState<PracticeActivity[]>(initialActivities)
  const [invoices] = useState<Invoice[]>(initialInvoices)

  const addProject = useCallback((data: { name: string; clientName: string }) => {
    const now = new Date().toISOString().split('T')[0]
    const project: Project = {
      id: generateId('proj'),
      name: data.name,
      clientName: data.clientName,
      createdAt: now,
      updatedAt: now,
    }
    setProjects((prev) => [...prev, project])
    return project
  }, [])

  const updateProject = useCallback((id: string, data: { name: string; clientName: string }) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : p,
      ),
    )
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    setPractices((prev) =>
      prev.map((p) => (p.projectId === id ? { ...p, projectId: null } : p)),
    )
  }, [])

  const addPractice = useCallback(
    (data: Partial<Practice>) => {
      const now = new Date().toISOString().split('T')[0]
      const practice: Practice = {
        id: generateId('pr'),
        projectId: data.projectId ?? null,
        practiceCode: generatePracticeCode(practices),
        clientName: data.clientName ?? '',
        municipality: data.municipality ?? '',
        address: data.address ?? '',
        cadastralRef: data.cadastralRef ?? '',
        operator: data.operator ?? '',
        priority: data.priority ?? 'Media',
        priorityOrder: practices.length,
        submissionDeadline: data.submissionDeadline ?? null,
        contractStartDate: data.contractStartDate ?? null,
        paStatus: data.paStatus ?? '',
        submissionDate: data.submissionDate ?? null,
        expiryDate: data.expiryDate ?? null,
        hazardLevel: data.hazardLevel ?? '',
        closingDate: data.closingDate ?? null,
        practiceType: data.practiceType ?? '',
        status: data.status ?? '',
        invoiceStatus: data.invoiceStatus ?? '',
        paymentNotes: data.paymentNotes ?? '',
        contractAmount: data.contractAmount ?? 0,
        additionalServicesAmount: data.additionalServicesAmount ?? 0,
        expenses: data.expenses ?? 0,
        totalInvoiced: 0,
        totalPaymentsReceived: 0,
        createdAt: now,
        updatedAt: now,
      }
      setPractices((prev) => [...prev, practice])
      return practice
    },
    [practices],
  )

  const updatePractice = useCallback((id: string, data: Partial<Practice>) => {
    setPractices((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : p,
      ),
    )
  }, [])

  const deletePractice = useCallback((id: string) => {
    setPractices((prev) => prev.filter((p) => p.id !== id))
    setActivities((prev) => prev.filter((a) => a.practiceId !== id))
  }, [])

  const addActivity = useCallback((practiceId: string, description: string) => {
    setActivities((prev) => [
      ...prev,
      {
        id: generateId('act'),
        practiceId,
        description,
        isCompleted: false,
        completedAt: null,
        sortOrder: prev.filter((a) => a.practiceId === practiceId).length,
      },
    ])
  }, [])

  const toggleActivity = useCallback((id: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isCompleted: !a.isCompleted,
              completedAt: !a.isCompleted
                ? new Date().toISOString().split('T')[0]
                : null,
            }
          : a,
      ),
    )
  }, [])

  return (
    <StoreContext.Provider
      value={{
        projects,
        practices,
        activities,
        invoices,
        addProject,
        updateProject,
        deleteProject,
        addPractice,
        updatePractice,
        deletePractice,
        addActivity,
        toggleActivity,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}

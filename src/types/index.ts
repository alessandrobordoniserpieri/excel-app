export type Priority = 'Bassissima' | 'Bassa' | 'Media' | 'Alta' | 'Molto alta' | 'Urgente' | 'Sospesa'

export type PaStatus =
  | 'In redazione'
  | 'Inviata'
  | 'Integrazioni richieste 30gg'
  | 'Integrazioni richieste 45gg'
  | 'Integrazioni richieste 60gg'
  | 'Integrazioni richieste 90gg'
  | 'Integrazioni richieste 120gg'
  | 'Approvata 3 anni'
  | 'Approvata 5 anni'
  | 'Variante'
  | 'Fine lavori'
  | 'Chiusa'
  | 'Richiesta proroga 30gg'
  | 'Richiesta proroga 45gg'
  | 'Richiesta proroga 60gg'
  | 'Richiesta proroga 90gg'
  | 'Richiesta proroga 120gg'
  | 'Richiesta proroga 3 anni'
  | 'Richiesta proroga 5 anni'
  | 'Cassata'

export type InvoiceStatus =
  | 'Da fatturare acconto'
  | 'Da fatturare saldo'
  | 'Fatturato acconto'
  | 'Fatturato saldo'
  | 'Saldato'

export type PaymentNote =
  | 'Attesa acconto'
  | 'Attesa saldo'
  | 'Pratica sospesa per mancato pagamento'
  | 'In regola con pagamenti'
  | 'Saldato'

export type AttachmentCategory = 'contract' | 'report' | 'photo' | 'pec' | 'other'

export type InvoiceType = 'advance' | 'balance'

export interface Project {
  id: string
  name: string
  clientName: string
  createdAt: string
  updatedAt: string
}

export interface Practice {
  id: string
  projectId: string | null
  practiceCode: string
  clientName: string
  municipality: string
  address: string
  cadastralRef: string
  operator: string
  priority: Priority
  priorityOrder: number
  submissionDeadline: string | null
  contractStartDate: string | null
  paStatus: PaStatus | ''
  submissionDate: string | null
  expiryDate: string | null
  hazardLevel: Priority | ''
  closingDate: string | null
  practiceType: string
  status: string
  invoiceStatus: InvoiceStatus | ''
  paymentNotes: PaymentNote | ''
  contractAmount: number
  additionalServicesAmount: number
  expenses: number
  totalInvoiced: number
  totalPaymentsReceived: number
  createdAt: string
  updatedAt: string
}

export interface PracticeActivity {
  id: string
  practiceId: string
  description: string
  isCompleted: boolean
  completedAt: string | null
  sortOrder: number
}

export interface Invoice {
  id: string
  practiceId: string
  invoiceNumber: string
  invoiceDate: string
  amount: number
  type: InvoiceType
  filePath: string | null
  fileName: string | null
  matchedAutomatically: boolean
  createdAt: string
}

export interface Attachment {
  id: string
  practiceId: string
  fileName: string
  filePath: string
  category: AttachmentCategory
  createdAt: string
}

export function getBalanceDue(practice: Practice): number {
  return (
    practice.contractAmount +
    practice.additionalServicesAmount +
    practice.expenses -
    practice.totalPaymentsReceived
  )
}

export function getDaysRemaining(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getDeadlineColor(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'text-gray-400'
  if (daysRemaining < 0) return 'text-red-700 bg-red-50'
  if (daysRemaining <= 7) return 'text-red-600 bg-red-50'
  if (daysRemaining <= 15) return 'text-orange-600 bg-orange-50'
  if (daysRemaining <= 30) return 'text-yellow-600 bg-yellow-50'
  return 'text-green-600 bg-green-50'
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    Bassissima: 'bg-gray-100 text-gray-700',
    Bassa: 'bg-blue-100 text-blue-700',
    Media: 'bg-yellow-100 text-yellow-800',
    Alta: 'bg-orange-100 text-orange-700',
    'Molto alta': 'bg-red-100 text-red-700',
    Urgente: 'bg-red-200 text-red-900',
    Sospesa: 'bg-purple-100 text-purple-700',
  }
  return colors[priority]
}

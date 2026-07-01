import { useState } from 'react'
import type { Practice, Priority, PaStatus, InvoiceStatus, PaymentNote } from '../types'
import {
  PRACTICE_TYPES,
  STATUSES,
  PA_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_NOTES,
  PRIORITIES,
  OPERATORS,
} from '../data/dropdowns'
import { useStore } from '../hooks/useStore'

interface PracticeFormProps {
  practice?: Practice
  defaultProjectId?: string | null
  onSave: (data: Partial<Practice>) => void
  onCancel: () => void
}

function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty = true,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  allowEmpty?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {allowEmpty && <option value="">—</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">€</span>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}

function PracticeForm({ practice, defaultProjectId, onSave, onCancel }: PracticeFormProps) {
  const { projects } = useStore()
  const [form, setForm] = useState({
    projectId: practice?.projectId ?? defaultProjectId ?? '',
    clientName: practice?.clientName ?? '',
    municipality: practice?.municipality ?? '',
    address: practice?.address ?? '',
    cadastralRef: practice?.cadastralRef ?? '',
    operator: practice?.operator ?? '',
    priority: practice?.priority ?? ('Media' as Priority),
    submissionDeadline: practice?.submissionDeadline ?? '',
    contractStartDate: practice?.contractStartDate ?? '',
    paStatus: practice?.paStatus ?? '',
    submissionDate: practice?.submissionDate ?? '',
    expiryDate: practice?.expiryDate ?? '',
    hazardLevel: practice?.hazardLevel ?? '',
    closingDate: practice?.closingDate ?? '',
    practiceType: practice?.practiceType ?? '',
    status: practice?.status ?? '',
    invoiceStatus: practice?.invoiceStatus ?? '',
    paymentNotes: practice?.paymentNotes ?? '',
    contractAmount: practice?.contractAmount ?? 0,
    additionalServicesAmount: practice?.additionalServicesAmount ?? 0,
    expenses: practice?.expenses ?? 0,
  })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientName.trim()) return
    onSave({
      ...form,
      projectId: form.projectId || null,
      submissionDeadline: form.submissionDeadline || null,
      contractStartDate: form.contractStartDate || null,
      submissionDate: form.submissionDate || null,
      expiryDate: form.expiryDate || null,
      closingDate: form.closingDate || null,
      paStatus: (form.paStatus as PaStatus) || '',
      invoiceStatus: (form.invoiceStatus as InvoiceStatus) || '',
      paymentNotes: (form.paymentNotes as PaymentNote) || '',
      hazardLevel: (form.hazardLevel as Priority) || '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 my-auto"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          {practice ? 'Modifica pratica' : 'Nuova pratica'}
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Informazioni generali
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Cliente *"
                value={form.clientName}
                onChange={(v) => set('clientName', v)}
                placeholder="Nome cliente"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Progetto</label>
                <select
                  value={form.projectId}
                  onChange={(e) => set('projectId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nessun progetto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <TextField
                label="Comune"
                value={form.municipality}
                onChange={(v) => set('municipality', v)}
                placeholder="Es. Rimini"
              />
              <TextField
                label="Indirizzo"
                value={form.address}
                onChange={(v) => set('address', v)}
                placeholder="Es. Via Roma 15"
              />
              <TextField
                label="Catastale"
                value={form.cadastralRef}
                onChange={(v) => set('cadastralRef', v)}
                placeholder="Es. A/2"
              />
              <SelectField
                label="Operatore"
                value={form.operator}
                onChange={(v) => set('operator', v)}
                options={OPERATORS}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tipologia e stato
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Tipologia pratica"
                value={form.practiceType}
                onChange={(v) => set('practiceType', v)}
                options={PRACTICE_TYPES}
              />
              <SelectField
                label="Status"
                value={form.status}
                onChange={(v) => set('status', v)}
                options={STATUSES}
              />
              <SelectField
                label="Priorità"
                value={form.priority}
                onChange={(v) => set('priority', v as Priority)}
                options={PRIORITIES}
                allowEmpty={false}
              />
              <SelectField
                label="Pericolosità"
                value={form.hazardLevel}
                onChange={(v) => set('hazardLevel', v as Priority | '')}
                options={PRIORITIES}
              />
              <SelectField
                label="Stato pratica ente"
                value={form.paStatus}
                onChange={(v) => set('paStatus', v as PaStatus | '')}
                options={PA_STATUSES}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Date
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Inizio / firma contratto"
                value={form.contractStartDate}
                onChange={(v) => set('contractStartDate', v)}
                type="date"
              />
              <TextField
                label="Termine invio"
                value={form.submissionDeadline}
                onChange={(v) => set('submissionDeadline', v)}
                type="date"
              />
              <TextField
                label="Data invio"
                value={form.submissionDate}
                onChange={(v) => set('submissionDate', v)}
                type="date"
              />
              <TextField
                label="Scadenza"
                value={form.expiryDate}
                onChange={(v) => set('expiryDate', v)}
                type="date"
              />
              <TextField
                label="Data chiusura"
                value={form.closingDate}
                onChange={(v) => set('closingDate', v)}
                type="date"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Fatturazione
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Importo contratto"
                value={form.contractAmount}
                onChange={(v) => set('contractAmount', v)}
              />
              <NumberField
                label="Prestazioni aggiunte"
                value={form.additionalServicesAmount}
                onChange={(v) => set('additionalServicesAmount', v)}
              />
              <NumberField
                label="Spese sostenute"
                value={form.expenses}
                onChange={(v) => set('expenses', v)}
              />
              <SelectField
                label="Stato fatturazione"
                value={form.invoiceStatus}
                onChange={(v) => set('invoiceStatus', v as InvoiceStatus | '')}
                options={INVOICE_STATUSES}
              />
              <SelectField
                label="Note pagamenti"
                value={form.paymentNotes}
                onChange={(v) => set('paymentNotes', v as PaymentNote | '')}
                options={PAYMENT_NOTES}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={!form.clientName.trim()}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {practice ? 'Salva modifiche' : 'Crea pratica'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PracticeForm

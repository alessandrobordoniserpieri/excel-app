import { useStore } from '../hooks/useStore'

function Invoices() {
  const { invoices: allInvoices, practices } = useStore()
  const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Registro fatture</h1>
          <p className="text-sm text-slate-500 mt-1">
            {allInvoices.length} fatture · Totale €{totalAmount.toLocaleString('it-IT')}
          </p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Nuova fattura
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pratica</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Importo</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allInvoices.map((invoice) => {
              const practice = practices.find((p) => p.id === invoice.practiceId)
              return (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(invoice.invoiceDate).toLocaleDateString('it-IT')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono text-blue-600">
                      {practice?.practiceCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {practice?.clientName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      invoice.type === 'advance'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {invoice.type === 'advance' ? 'Acconto' : 'Saldo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    €{invoice.amount.toLocaleString('it-IT')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {invoice.filePath ? (
                      <span className="text-blue-600 text-sm">📄</span>
                    ) : (
                      <span className="text-slate-300 text-sm">—</span>
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

export default Invoices

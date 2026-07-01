import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/projects', label: 'Progetti', icon: '▦' },
  { to: '/practices', label: 'Pratiche', icon: '▤' },
  { to: '/invoices', label: 'Fatture', icon: '▧' },
]

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">Gestionale</h1>
          <p className="text-sm text-slate-400 mt-1">Studio Tecnico</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium">Utente</p>
              <p className="text-xs text-slate-400">Studio Lepri</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

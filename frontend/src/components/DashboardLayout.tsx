import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from '@/stores/auth'

const NAV_ITEMS: Record<string, { label: string; icon: string; path: string; roles: string[] }[]> = {
  all: [
    { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['owner', 'contractor', 'mandor'] },
    { label: 'Proyek', icon: '🏗️', path: '/projects', roles: ['owner', 'contractor', 'mandor'] },
  ],
  owner: [
    { label: 'RAB AI', icon: '🤖', path: '/rab', roles: ['owner', 'contractor'] },
    { label: 'WhatsApp', icon: '📱', path: '/whatsapp', roles: ['owner'] },
  ],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const role = user?.role || ''
  const items = [
    ...NAV_ITEMS.all.filter((i) => i.roles.includes(role)),
    ...(NAV_ITEMS.owner.filter((i) => i.roles.includes(role))),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b">
          <Link to="/dashboard" className="text-lg font-bold text-green-700">Uyuhan Jaya</Link>
        </div>
        <nav className="p-3 space-y-1">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${role ? ROLE_COLORS[role] || 'bg-gray-100' : 'bg-gray-100'}`}>
                  {role ? ROLE_LABELS[role] || role : '-'}
                </span>
              </div>
              <button onClick={logout} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                Keluar
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

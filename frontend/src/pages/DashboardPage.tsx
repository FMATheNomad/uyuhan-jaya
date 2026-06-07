import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, ROLE_LABELS, ROLE_COLORS } from '@/stores/auth'
import api from '@/services/api'

interface Project {
  id: string; name: string; status: string; location: string; created_at: string
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => { api.get('/projects').then(({ data }) => setProjects(data)) }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-xl font-bold text-green-700">Uyuhan Jaya</Link>
            {user?.role !== 'mandor' && <Link to="/rab" className="text-sm text-purple-600 hover:text-purple-800">RAB AI</Link>}
            {user?.role === 'owner' && <Link to="/whatsapp" className="text-sm text-green-600 hover:text-green-800">WhatsApp</Link>}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${user?.role ? ROLE_COLORS[user.role] || 'bg-gray-100' : 'bg-gray-100'}`}>
                {user?.role ? (ROLE_LABELS[user.role] || user.role) : '-'}
              </span>
            </div>
            <button onClick={logout} className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Dashboard</h2>
            <p className="text-sm text-gray-400">{projects.length} proyek</p>
          </div>
          <Link to="/projects" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            + Proyek Baru
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-400">Belum ada proyek</p>
            <Link to="/projects" className="text-sm text-green-600 hover:underline mt-1 inline-block">
              Buat proyek pertama
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg group-hover:text-green-700">{p.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{p.location || 'Lokasi tidak diisi'}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{p.status}</span>
                  <span className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

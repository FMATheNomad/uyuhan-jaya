import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

interface Project { id: string; name: string; status: string; location: string; created_at: string }

export default function ProjectsPage() {
  const user = useAuthStore((s) => s.user)
  const isMandor = user?.role === 'mandor'
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => api.get('/projects').then(({ data }) => setProjects(data))
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await api.post('/projects', { name, location })
    setShowForm(false)
    setName(''); setLocation('')
    navigate(`/projects/${data.id}`)
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proyek</h1>
          <p className="text-sm text-gray-500">{filtered.length} proyek</p>
        </div>
        {!isMandor && (
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
            + Proyek Baru
          </button>
        )}
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari proyek..."
        className="w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none" />

      {/* Create Form */}
      {showForm && (
        <form onSubmit={create} className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-semibold">Proyek Baru</h3>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nama Proyek" className="w-full px-4 py-2 border rounded-lg" required />
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="Lokasi" className="w-full px-4 py-2 border rounded-lg" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Simpan</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Batal</button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏗️</p>
          <p className="text-lg">Belum ada proyek</p>
          {!isMandor && (
            <button onClick={() => setShowForm(true)} className="text-green-600 hover:underline text-sm mt-2">
              Buat proyek pertama
            </button>
          )}
        </div>
      )}

      {/* Project Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`}
            className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold group-hover:text-green-700">{p.name}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 shrink-0">{p.status}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{p.location || 'Lokasi tidak diisi'}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{new Date(p.created_at).toLocaleDateString('id-ID')}</span>
              <span className="text-green-600 group-hover:translate-x-1 transition">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@/services/api'

interface Project {
  id: string
  name: string
  status: string
  location: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const load = () => api.get('/projects').then(({ data }) => setProjects(data))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data } = await api.post('/projects', { name, location })
    setShowForm(false)
    setName('')
    setLocation('')
    navigate(`/projects/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-green-700">
            Uyuhan Jaya
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold">Proyek</h2>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            + Proyek Baru
          </button>
        </div>

        {showForm && (
          <form onSubmit={create} className="bg-white p-6 rounded-xl shadow-sm border mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Proyek</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lokasi</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                Simpan
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">
                Batal
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{p.location || '-'}</p>
              <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
                {p.status}
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, ROLE_LABELS } from '@/stores/auth'
import api from '@/services/api'
import { BudgetPie, AttendanceChart } from '@/components/Charts'

interface Project { id: string; name: string; status: string; location: string; created_at: string }
interface Report { project_name: string; total_workers: number; today_attendance: number; total_material_cost: number; progress_percent: number; budget: number; budget_used: number; budget_remaining: number; budget_used_pct: number; weekly_attendance: { date: string; total: number }[]; materials_by_category: { category: string; total: number }[] }

const rp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role || ''
  const isMandor = role === 'mandor'
  const [projects, setProjects] = useState<Project[]>([])
  const [reports, setReports] = useState<Record<string, Report>>({})

  useEffect(() => {
    api.get('/projects').then(async ({ data: projs }) => {
      setProjects(projs)
      const reps: Record<string, Report> = {}
      for (const p of projs.slice(0, isMandor ? 1 : 3)) {
        try {
          const { data } = await api.get(`/reports/project/${p.id}`)
          reps[p.id] = data
        } catch {}
      }
      setReports(reps)
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Halo, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isMandor ? 'Ringkasan aktivitas hari ini' : 'Ringkasan semua proyek'}
        </p>
      </div>

      {/* Owner/Contractor Dashboard */}
      {!isMandor && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Proyek</p>
              <p className="text-2xl font-bold mt-1">{projects.length}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tukang</p>
              <p className="text-2xl font-bold mt-1">
                {Object.values(reports).reduce((s, r) => s + r.total_workers, 0)}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Biaya Material</p>
              <p className="text-lg font-bold mt-1">
                {rp(Object.values(reports).reduce((s, r) => s + r.total_material_cost, 0))}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Rata-rata Progres</p>
              <p className="text-2xl font-bold mt-1">
                {Object.values(reports).length > 0
                  ? Math.round(Object.values(reports).reduce((s, r) => s + r.progress_percent, 0) / Object.values(reports).length)
                  : 0}%
              </p>
            </div>
          </div>

          {/* Projects Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Proyek Aktif</h2>
              <Link to="/projects" className="text-sm text-green-600 hover:underline">Lihat Semua</Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => {
                const rep = reports[p.id]
                return (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold group-hover:text-green-700">{p.name}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 shrink-0">{p.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{p.location || '—'}</p>
                    {rep && (
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>👷 {rep.today_attendance} hadir</span>
                          <span>📦 {rp(rep.total_material_cost)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min(rep.progress_percent, 100)}%` }} />
                        </div>
                        <div className="flex justify-between">
                          <span>Progres</span>
                          <span className="font-medium">{rep.progress_percent}%</span>
                        </div>
                      </div>
                    )}
                  </Link>
                )
              })}
              <Link to="/projects"
                className="bg-white p-5 rounded-xl shadow-sm border-dashed border-2 hover:border-green-400 transition flex items-center justify-center text-gray-400 hover:text-green-600">
                <div className="text-center">
                  <p className="text-2xl mb-1">+</p>
                  <p className="text-sm">Proyek Baru</p>
                </div>
              </Link>
            </div>
          </div>

          {/* AI Quick Actions */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-white">
            <h2 className="font-semibold text-lg mb-1">🤖 AI RAB Generator</h2>
            <p className="text-purple-200 text-sm mb-4">Generate RAB otomatis pake AI — tinggal deskripsi proyek, langsung jadi.</p>
            <Link to="/rab" className="inline-block px-4 py-2 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50">
              Buat RAB →
            </Link>
          </div>
        </>
      )}

      {/* Mandor Dashboard */}
      {isMandor && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Hadir Hari Ini</p>
              <p className="text-2xl font-bold mt-1">{Object.values(reports)[0]?.today_attendance || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Tukang</p>
              <p className="text-2xl font-bold mt-1">{Object.values(reports)[0]?.total_workers || 0}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Progres</p>
              <p className="text-2xl font-bold mt-1">{Object.values(reports)[0]?.progress_percent || 0}%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link to={projects[0] ? `/projects/${projects[0].id}` : '/projects'}
              className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition text-center">
              <p className="text-3xl mb-2">📸</p>
              <p className="font-medium text-sm">Foto Progres</p>
            </Link>
            <Link to={projects[0] ? `/projects/${projects[0].id}` : '/projects'}
              className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition text-center">
              <p className="text-3xl mb-2">👷</p>
              <p className="font-medium text-sm">Absen Tukang</p>
            </Link>
          </div>

          {/* Attendance Chart */}
          {Object.values(reports)[0]?.weekly_attendance && (
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <AttendanceChart data={Object.values(reports)[0].weekly_attendance} />
            </div>
          )}

          {/* Projects */}
          <div>
            <h2 className="font-semibold text-lg mb-4">Proyek Saya</h2>
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="block bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-xs text-gray-400">{p.location || '—'}</p>
                  </div>
                  <span className="text-green-600 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

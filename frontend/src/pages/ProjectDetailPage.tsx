import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '@/services/api'
import CameraUpload from '@/components/CameraUpload'
import { BudgetPie, AttendanceChart, MaterialPie } from '@/components/Charts'
import { useAuthStore, ROLE_LABELS } from '@/stores/auth'

interface Report {
  project_name: string; status: string; total_workers: number; today_attendance: number
  total_material_cost: number; total_photos: number; progress_percent: number
  budget: number; budget_used: number; budget_remaining: number; budget_used_pct: number
  weekly_attendance: { date: string; total: number }[]
  materials_by_category: { category: string; total: number }[]
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const user = useAuthStore((s) => s.user)
  const isMandor = user?.role === 'mandor'
  const isOwnerOrKontraktor = !isMandor
  const [report, setReport] = useState<Report | null>(null)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    if (id) api.get(`/reports/project/${id}`).then(({ data }) => setReport(data))
  }, [id])

  const rp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  if (!report) return <div className="p-8 text-center text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-green-700">Uyuhan Jaya</Link>
          <div className="flex gap-3">
            {isOwnerOrKontraktor && <Link to="/rab" className="text-sm text-purple-600 hover:text-purple-800">RAB AI</Link>}
            <Link to="/projects" className="text-sm text-gray-500 hover:text-gray-700">Proyek</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-semibold">{report.project_name}</h2>
          <img
            src={`/api/v1/qr/project/${id}`}
            alt="QR Absensi"
            className="w-16 h-16 cursor-pointer"
            title="Scan untuk absen"
            onClick={() => window.open(`/api/v1/qr/project/${id}`, '_blank')}
          />
        </div>
        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 mb-6">{report.status}</span>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Tukang</p>
            <p className="text-2xl font-bold">{report.total_workers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Hadir Hari Ini</p>
            <p className="text-2xl font-bold">{report.today_attendance}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Biaya Material</p>
            <p className="text-lg font-bold">{rp(report.total_material_cost)}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-sm text-gray-500">Progres</p>
            <p className="text-2xl font-bold">{report.progress_percent}%</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['dashboard','attendance','materials','progress', ...(isOwnerOrKontraktor ? ['rab'] : [])].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm ${tab === t ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
              {t === 'dashboard' ? 'Ringkasan' : t === 'attendance' ? 'Absensi' : t === 'materials' ? 'Material' : t === 'progress' ? 'Progres' : 'RAB AI'}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && <DashboardTab report={report} id={id!} rp={rp} isMandor={isMandor} />}
        {tab === 'attendance' && <AttendanceTab projectId={id!} />}
        {tab === 'materials' && <MaterialsTab projectId={id!} />}
        {tab === 'progress' && <ProgressTab projectId={id!} />}
        {tab === 'rab' && <RABTab projectId={id!} />}
      </main>
    </div>
  )
}

function DashboardTab({ report, id, rp, isMandor }: { report: Report; id: string; rp: (n: number) => string; isMandor: boolean }) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const aiAction = async (endpoint: string, label: string) => {
    setLoading(label)
    const { data } = await api.post(`/ai/${endpoint}/${id}`)
    setInsight(data.result)
    setLoading(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {!isMandor && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <BudgetPie used={report.budget_used} remaining={report.budget_remaining} budget={report.budget} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Budget</span><span className="font-medium">{rp(report.budget)}</span></div>
            <div className="flex justify-between"><span>Terpakai</span><span className="font-medium">{rp(report.budget_used)}</span></div>
            <div className="flex justify-between"><span>Sisa</span><span className="font-medium">{rp(report.budget_remaining)}</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min(report.budget_used_pct, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400">{report.budget_used_pct}% terpakai</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <AttendanceChart data={report.weekly_attendance} />
      </div>

      {report.materials_by_category.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <MaterialPie data={report.materials_by_category} />
        </div>
      )}

      {!isMandor && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">AI Insight</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => aiAction('analyze', 'analisis')} disabled={loading !== null}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
              {loading === 'analisis' ? '...' : 'Analisis Progres'}
            </button>
            <button onClick={() => aiAction('cashflow', 'cashflow')} disabled={loading !== null}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm">
              {loading === 'cashflow' ? '...' : 'Prediksi Cash Flow'}
            </button>
          </div>
          {insight && (
            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
              {insight}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AttendanceTab({ projectId }: { projectId: string }) {
  const [records, setRecords] = useState<any[]>([])
  const [name, setName] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)

  useEffect(() => { api.get(`/attendance/project/${projectId}`).then(({ data }) => setRecords(data)) }, [projectId])

  const checkIn = async () => {
    if (!name.trim()) return
    await api.post('/attendance/check-in', { project_id: projectId, worker_name: name, photo_url: photoUrl })
    setName(''); setPhotoUrl(null)
    const { data } = await api.get(`/attendance/project/${projectId}`)
    setRecords(data)
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <h3 className="font-semibold mb-3">Check In Tukang</h3>
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Nama tukang" className="px-4 py-2 border rounded-lg" />
          <CameraUpload onUploaded={(url) => setPhotoUrl(url)} label="Foto Selfie" />
          <button onClick={checkIn}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm self-start">
            Check In
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {records.map((r: any) => (
          <div key={r.id} className="bg-white p-4 rounded-xl border text-sm flex items-center gap-3">
            {r.photo_url && <img src={r.photo_url} className="w-10 h-10 rounded-full object-cover" />}
            <div className="flex-1">
              <p className="font-medium">{r.worker_name}</p>
              <p className="text-gray-400 text-xs">
                {new Date(r.check_in_time).toLocaleString('id-ID')}
                {r.check_out_time && ` - ${new Date(r.check_out_time).toLocaleTimeString('id-ID')}`}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MaterialsTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<any[]>([])
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [cat, setCat] = useState('')

  useEffect(() => { api.get(`/materials/project/${projectId}`).then(({ data }) => setItems(data)) }, [projectId])

  const add = async () => {
    await api.post('/materials', {
      project_id: projectId, name, category: cat || null,
      quantity: parseFloat(qty) || 0, unit: 'pcs', price_per_unit: parseFloat(price) || 0,
    })
    setName(''); setQty(''); setPrice(''); setCat('')
    const { data } = await api.get(`/materials/project/${projectId}`)
    setItems(data)
  }

  const total = items.reduce((s: number, m: any) => s + m.total_price, 0)
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <h3 className="font-semibold mb-3">Tambah Material</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="px-3 py-2 border rounded-lg text-sm" />
          <input value={cat} onChange={(e) => setCat(e.target.value)} placeholder="Kategori" className="px-3 py-2 border rounded-lg text-sm" />
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Jumlah" type="number" className="px-3 py-2 border rounded-lg text-sm" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Harga/unit" type="number" className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={add} className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Tambah</button>
      </div>

      <p className="text-sm text-gray-500 mb-2">Total Material: {fmt(total)}</p>
      <div className="space-y-2">
        {items.map((m: any) => (
          <div key={m.id} className="bg-white p-4 rounded-xl border text-sm flex justify-between items-center">
            <div>
              <span className="font-medium">{m.name}</span>
              {m.category && <span className="ml-2 text-xs text-gray-400">({m.category})</span>}
            </div>
            <span className="text-gray-500">{m.quantity} {m.unit} x {fmt(m.price_per_unit)} = {fmt(m.total_price)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressTab({ projectId }: { projectId: string }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [caption, setCaption] = useState('')
  const [percent, setPercent] = useState('')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  useEffect(() => { api.get(`/progress/project/${projectId}`).then(({ data }) => setPhotos(data)) }, [projectId])

  const add = async () => {
    if (!uploadedUrl) return alert('Upload foto dulu')
    await api.post('/progress', {
      project_id: projectId, photo_url: uploadedUrl,
      caption, progress_percent: parseFloat(percent) || null,
    })
    setCaption(''); setPercent(''); setUploadedUrl(null)
    const { data } = await api.get(`/progress/project/${projectId}`)
    setPhotos(data)
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
        <h3 className="font-semibold mb-3">Tambah Progres</h3>
        <div className="flex flex-col gap-3">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Keterangan" className="px-4 py-2 border rounded-lg" />
          <div className="flex gap-3 items-center">
            <input value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="Progres %" type="number" className="px-4 py-2 border rounded-lg w-32" />
            <CameraUpload onUploaded={(url) => setUploadedUrl(url)} label="Foto Progres" />
          </div>
          <button onClick={add} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 self-start">Simpan</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border overflow-hidden">
            {p.photo_url && !p.photo_url.startsWith('https://via.placeholder.com') && (
              <img src={p.photo_url} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <p className="font-medium text-sm">{p.caption || '-'}</p>
              {p.progress_percent !== null && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${p.progress_percent}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{p.progress_percent}%</p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{new Date(p.created_at).toLocaleDateString('id-ID')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface RABItem { description: string; volume: number; unit: string; unit_price: number; total: number }
interface RABSection { name: string; items: RABItem[]; subtotal: number }
interface RABData { project_name?: string; description?: string; sections?: RABSection[]; total_direct_cost?: number; contingency_pct?: number; contingency?: number; grand_total?: number; price_per_m2?: number; parse_error?: boolean; raw_text?: string }

const rpRab = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function RABTable({ data }: { data: RABData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-2 border text-center w-10">No</th>
            <th className="p-2 border text-left">Uraian Pekerjaan</th>
            <th className="p-2 border text-center w-16">Vol.</th>
            <th className="p-2 border text-center w-14">Satuan</th>
            <th className="p-2 border text-right w-28">Harga Satuan</th>
            <th className="p-2 border text-right w-28">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {data.sections?.map((section, si) => (
            <React.Fragment key={si}>
              <tr className="bg-blue-900 text-white font-semibold">
                <td colSpan={6} className="p-2 border">{section.name}</td>
              </tr>
              {section.items.map((item, ii) => (
                <tr key={`${si}-${ii}`} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">{ii + 1}</td>
                  <td className="p-2 border">{item.description}</td>
                  <td className="p-2 border text-center">{item.volume}</td>
                  <td className="p-2 border text-center">{item.unit}</td>
                  <td className="p-2 border text-right">{rpRab(item.unit_price)}</td>
                  <td className="p-2 border text-right font-medium">{rpRab(item.total)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={4} className="p-2 border text-right">Subtotal</td>
                <td colSpan={2} className="p-2 border text-right">{rpRab(section.subtotal)}</td>
              </tr>
            </React.Fragment>
          ))}
          <tr className="font-bold">
            <td colSpan={4} className="p-2 border text-right">TOTAL BIAYA LANGSUNG</td>
            <td colSpan={2} className="p-2 border text-right text-green-700">{rpRab(data.total_direct_cost || 0)}</td>
          </tr>
          <tr className="font-semibold">
            <td colSpan={4} className="p-2 border text-right">Biaya Tak Terduga ({data.contingency_pct || 10}%)</td>
            <td colSpan={2} className="p-2 border text-right text-orange-600">{rpRab(data.contingency || 0)}</td>
          </tr>
          <tr className="font-bold text-base bg-green-50">
            <td colSpan={4} className="p-3 border text-right text-lg">TOTAL ANGGARAN</td>
            <td colSpan={2} className="p-3 border text-right text-lg text-green-700">{rpRab(data.grand_total || 0)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function RABTab({ projectId }: { projectId: string }) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [rabData, setRabData] = useState<RABData | null>(null)
  const [excelLoading, setExcelLoading] = useState(false)

  const generate = async () => {
    if (!description.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/rab', { prompt: description })
      setRabData(data)
    } catch { alert('Gagal generate RAB') }
    setLoading(false)
  }

  const downloadExcel = async () => {
    if (!rabData) return
    setExcelLoading(true)
    try {
      const resp = await api.post('/ai/rab-excel', rabData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/json' },
      })
      const url = URL.createObjectURL(resp.data)
      const a = document.createElement('a')
      a.href = url; a.download = `RAB-${(rabData.project_name || 'proyek').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
      a.click(); URL.revokeObjectURL(url)
    } catch { alert('Gagal download Excel') }
    setExcelLoading(false)
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-4">
        <h3 className="font-semibold mb-3">Generate RAB dengan AI</h3>
        <p className="text-sm text-gray-500 mb-3">Deskripsikan proyek, AI buat RAB + download Excel</p>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Rumah 2 lantai, luas tanah 120m2, luas bangunan 150m2, 3 kamar tidur, 2 kamar mandi, garasi..."
          className="w-full px-4 py-3 border rounded-lg text-sm h-32" />
        <div className="flex gap-3 mt-3">
          <button onClick={generate} disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
            {loading ? 'Memproses...' : 'Generate RAB'}
          </button>
          {rabData && !rabData.parse_error && (
            <button onClick={downloadExcel} disabled={excelLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1">
              {excelLoading ? '...' : '⬇ Excel'}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-400">AI menyusun RAB...</p>
        </div>
      )}

      {rabData?.parse_error && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-3">Hasil RAB</h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
            {rabData.raw_text}
          </div>
        </div>
      )}

      {rabData && !rabData.parse_error && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-semibold mb-4">{rabData.project_name || 'RAB Proyek'}</h3>
          <RABTable data={rabData} />
        </div>
      )}
    </div>
  )
}

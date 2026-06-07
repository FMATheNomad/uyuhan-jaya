import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

interface RABItem {
  description: string; volume: number; unit: string; unit_price: number; total: number
}

interface RABSection {
  name: string; items: RABItem[]; subtotal: number
}

interface RABData {
  project_name?: string; description?: string; location?: string
  total_area_m2?: number; price_per_m2?: number
  sections?: RABSection[]
  total_direct_cost?: number; contingency_pct?: number
  contingency?: number; grand_total?: number
  parse_error?: boolean; raw_text?: string
}

const rp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

function RABTable({ data }: { data: RABData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-2 border text-center w-10">No</th>
            <th className="p-2 border text-left">Uraian Pekerjaan</th>
            <th className="p-2 border text-center w-16">Volume</th>
            <th className="p-2 border text-center w-16">Satuan</th>
            <th className="p-2 border text-right w-32">Harga Satuan</th>
            <th className="p-2 border text-right w-32">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {data.sections?.map((section, si) => (
            <>
              <tr key={`s-${si}`} className="bg-blue-900 text-white font-semibold">
                <td colSpan={6} className="p-2 border">{section.name}</td>
              </tr>
              {section.items.map((item, ii) => (
                <tr key={`i-${si}-${ii}`} className="hover:bg-gray-50">
                  <td className="p-2 border text-center">{ii + 1}</td>
                  <td className="p-2 border">{item.description}</td>
                  <td className="p-2 border text-center">{item.volume}</td>
                  <td className="p-2 border text-center">{item.unit}</td>
                  <td className="p-2 border text-right">{rp(item.unit_price)}</td>
                  <td className="p-2 border text-right font-medium">{rp(item.total)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-semibold">
                <td colSpan={4} className="p-2 border text-right">Subtotal {section.name}</td>
                <td colSpan={2} className="p-2 border text-right">{rp(section.subtotal)}</td>
              </tr>
            </>
          ))}
          {data.total_direct_cost !== undefined && (
            <tr className="font-bold">
              <td colSpan={4} className="p-2 border text-right">TOTAL BIAYA LANGSUNG</td>
              <td colSpan={2} className="p-2 border text-right text-green-700">{rp(data.total_direct_cost)}</td>
            </tr>
          )}
          {data.contingency !== undefined && (
            <tr className="font-semibold">
              <td colSpan={4} className="p-2 border text-right">Biaya Tak Terduga ({data.contingency_pct || 10}%)</td>
              <td colSpan={2} className="p-2 border text-right text-orange-600">{rp(data.contingency)}</td>
            </tr>
          )}
          {data.grand_total !== undefined && (
            <tr className="font-bold text-base bg-green-50">
              <td colSpan={4} className="p-3 border text-right text-lg">TOTAL ANGGARAN</td>
              <td colSpan={2} className="p-3 border text-right text-lg text-green-700">{rp(data.grand_total)}</td>
            </tr>
          )}
        </tbody>
      </table>
      {data.price_per_m2 && (
        <p className="text-sm text-gray-400 mt-2">
          Harga per meter persegi: <span className="font-medium">{rp(data.price_per_m2)} / m²</span>
        </p>
      )}
    </div>
  )
}

export default function RABPage() {
  const user = useAuthStore((s) => s.user)
  const [description, setDescription] = useState('')
  const [rabData, setRabData] = useState<RABData | null>(null)
  const [loading, setLoading] = useState(false)
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
      const { data } = await api.post('/ai/rab-excel', rabData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/json' },
      })
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `RAB-${(rabData.project_name || 'proyek').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Gagal download Excel') }
    setExcelLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-green-700">Uyuhan Jaya</Link>
          <span className="text-sm text-gray-500">{user?.name}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-2">RAB AI Generator</h2>
        <p className="text-gray-500 mb-6">Deskripsikan proyek konstruksi kamu, AI akan menyusun RAB otomatis dalam bentuk tabel + export Excel</p>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <label className="block font-medium mb-2">Deskripsi Proyek</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Rumah tinggal 2 lantai, luas tanah 120m2, luas bangunan 200m2. Terdiri dari 4 kamar tidur, 3 kamar mandi, ruang tamu, ruang keluarga, dapur, garasi. Spesifikasi: lantai granit, dinding bata ringan, atap genteng beton."
            className="w-full px-4 py-3 border rounded-lg text-sm h-32 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
          <div className="flex gap-3 mt-4">
            <button onClick={generate} disabled={loading}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium">
              {loading ? 'AI sedang bekerja...' : 'Generate RAB'}
            </button>
            {rabData && !rabData.parse_error && (
              <button onClick={downloadExcel} disabled={excelLoading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2">
                {excelLoading ? '...' : '⬇ Download Excel'}
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-gray-400">AI sedang menyusun RAB...</p>
          </div>
        )}

        {rabData?.parse_error && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-3">Hasil RAB (teks)</h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {rabData.raw_text}
            </div>
          </div>
        )}

        {rabData && !rabData.parse_error && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{rabData.project_name || 'RAB Proyek'}</h3>
                {rabData.description && <p className="text-sm text-gray-500">{rabData.description}</p>}
              </div>
            </div>
            <RABTable data={rabData} />
          </div>
        )}
      </main>
    </div>
  )
}

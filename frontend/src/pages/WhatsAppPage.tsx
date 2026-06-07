import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

export default function WhatsAppPage() {
  const user = useAuthStore((s) => s.user)
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState('')
  const [testMsg, setTestMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/whatsapp/status')
      setStatus(data)
    } catch { setStatus({ status: 'unavailable' }) }
    setLoading(false)
  }

  useEffect(() => {
    checkStatus()
    if (user?.phone) setPhone(user.phone)
    const i = setInterval(checkStatus, 5000)
    return () => clearInterval(i)
  }, [])

  const savePhone = async () => {
    setSaving(true)
    try {
      await api.post('/whatsapp/set-phone', { phone })
      setTestMsg('Nomor WA tersimpan!')
    } catch { setTestMsg('Gagal simpan nomor') }
    setSaving(false)
  }

  const testWa = async () => {
    setTestMsg('Mengirim...')
    try {
      await api.post('/whatsapp/test', { to: phone })
      setTestMsg('✅ WA terkirim! Cek HP kamu.')
    } catch { setTestMsg('❌ Gagal. Cek koneksi WhatsApp.') }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      connected: 'bg-green-100 text-green-700',
      awaiting_scan: 'bg-yellow-100 text-yellow-700',
      disconnected: 'bg-red-100 text-red-700',
      unavailable: 'bg-gray-100 text-gray-500',
    }
    const label: Record<string, string> = {
      connected: 'Terhubung',
      awaiting_scan: 'Menunggu Scan',
      disconnected: 'Terputus',
      unavailable: 'Tidak Tersedia',
    }
    return <span className={`px-2 py-0.5 text-xs rounded-full ${map[s] || 'bg-gray-100'}`}>{label[s] || s}</span>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-green-700">Uyuhan Jaya</Link>
          <span className="text-sm text-gray-500">{user?.name}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-2">WhatsApp Integration</h2>
        <p className="text-gray-500 mb-6">Notifikasi otomatis ke WhatsApp setiap ada absensi & update progres</p>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Status Koneksi</h3>
            {status && statusBadge(status.status)}
          </div>
          {status?.number && (
            <p className="text-sm text-gray-500">Nomor bot: <span className="font-medium">{status.number}</span></p>
          )}
          {status?.status === 'connected' && (
            <p className="text-sm text-green-600 mt-2">✅ WhatsApp siap, tinggal set nomor tujuan notifikasi</p>
          )}
        </div>

        {status?.status === 'connected' && (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
              <h3 className="font-semibold mb-4">Nomor Tujuan Notifikasi</h3>
              <p className="text-sm text-gray-500 mb-3">Nomor WA yang bakal nerima notifikasi absen & progres</p>
              <div className="flex gap-3">
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="6281234567890" className="flex-1 px-4 py-2 border rounded-lg" />
                <button onClick={savePhone} disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                  {saving ? '...' : 'Simpan'}
                </button>
              </div>
              <button onClick={testWa}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                📤 Kirim WA Test
              </button>
              {testMsg && <p className="text-sm mt-2 text-gray-500">{testMsg}</p>}
            </div>

            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Notifikasi Aktif</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✅ Absensi tukang check-in → WA otomatis</li>
                <li>✅ Update progres (foto + %) → WA otomatis</li>
                <li>✅ Kirim ke nomor yang didaftarkan di atas</li>
              </ul>
            </div>
          </>
        )}

        {(status?.status === 'awaiting_scan' || status?.status === 'disconnected') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="font-semibold mb-4">Scan QR Code</h3>
            <p className="text-sm text-gray-500 mb-4">
              Buka WhatsApp di HP → Titik Tiga → Perangkat Tertaut → Tautkan Perangkat
            </p>
            <div className="flex justify-center">
              <img
                src={`http://localhost:3001/qr-image?t=${Date.now()}`}
                alt="WhatsApp QR"
                className="border-2 border-dashed border-gray-300 rounded-xl p-2"
                style={{ width: 300, height: 300 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtc2l6ZT0iMTYiPnNjYW4gUVIgY29kZTwvdGV4dD48L3N2Zz4='
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Halaman auto-refresh tiap 5 detik</p>
          </div>
        )}

        {status?.status === 'unavailable' && (
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">WhatsApp Service Tidak Berjalan</h3>
            <pre className="mt-2 p-3 bg-yellow-100 rounded-lg text-xs font-mono">
              cd whatsapp-service && npm start
            </pre>
          </div>
        )}

        {loading && <p className="text-center text-gray-400 py-8">Loading...</p>}
      </main>
    </div>
  )
}

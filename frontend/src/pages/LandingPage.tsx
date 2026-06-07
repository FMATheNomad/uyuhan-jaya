import { Link } from 'react-router-dom'

const features = [
  { icon: '👷', title: 'Absensi Tukang', desc: 'Check-in dengan QR Code & selfie kamera. Gak ada lagi "titip absen".' },
  { icon: '📦', title: 'Material Log', desc: 'Catat pemakaian material per kategori. Tau persis berapa habisnya.' },
  { icon: '📸', title: 'Progres Proyek', desc: 'Foto timeline progres + persentase. Owner bisa lihat tanpa datang ke lokasi.' },
  { icon: '🤖', title: 'RAB AI Generator', desc: 'Deskripsi proyek → AI bikin RAB + export Excel. Gak perlu pusing ngitung manual.' },
  { icon: '📊', title: 'Dashboard Visual', desc: 'Chart anggaran, absensi, material. Semua real-time.' },
  { icon: '📱', title: 'Notifikasi WhatsApp', desc: 'Tiap absen & update progres auto-kirim ke WA kontraktor.' },
]

const roles = [
  { title: '👑 Owner', desc: 'Pantau semua proyek, approve RAB, lihat laporan real-time dari mana aja.' },
  { title: '🔧 Kontraktor', desc: 'Kelola proyek, atur budget, generate RAB AI, export Excel.' },
  { title: '👷 Mandor', desc: 'Absen tukang, foto progres, catat material — cukup dari WhatsApp, gak perlu buka web.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-green-700">Uyuhan Jaya</div>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Masuk</Link>
            <Link to="/register" className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full mb-6">
          🏗️ Untuk Kontraktor Indonesia
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Kelola Proyek Konstruksi
          <br />
          <span className="text-green-600">Dari WhatsApp</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Uyuhan Jaya bantu kontraktor Indonesia manajemen proyek — dari absensi tukang, 
          material, progres, sampai RAB — semuanya bisa lewat WhatsApp + Web Dashboard.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register"
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-lg shadow-lg shadow-green-200">
            Coba Gratis
          </Link>
          <Link to="/login"
            className="px-8 py-3 bg-white border rounded-xl hover:bg-gray-50 font-medium text-lg">
            Masuk
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">Gak perlu kartu kredit. Langsung bisa dipake.</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '3', label: 'Role User' },
            { n: '6', label: 'Fitur Inti' },
            { n: 'AI', label: 'RAB Generator' },
            { n: 'WA', label: 'Bot Notifikasi' },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border">
              <p className="text-3xl font-bold text-green-600">{s.n}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Kenapa Uyuhan Jaya?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-3xl mb-3">{f.icon}</p>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-green-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Tiga Role, Satu Platform</h2>
          <p className="text-green-200 text-center mb-12 max-w-xl mx-auto">
            Setiap role punya akses yang sesuai — dari yang lihat aja sampe yang full kontrol.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.title} className="bg-green-800/50 p-6 rounded-2xl border border-green-700">
                <h3 className="text-xl font-bold mb-2">{r.title}</h3>
                <p className="text-sm text-green-200">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border">
          <p className="text-4xl mb-4">📱</p>
          <h2 className="text-3xl font-bold mb-4">Mandor Cukup Chat WhatsApp</h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            Mandor di lapangan kirim pesan "absen Asep" atau "progres 50%" 
            ke nomor bot — otomatis tercatat di sistem. Gak perlu training, 
            gak perlu buka web.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl text-left text-sm font-mono max-w-md mx-auto space-y-2">
            <p className="text-green-600">{'>'} absen Asep</p>
            <p className="text-gray-500">✅ Asep check-in di Rumah Pak RT</p>
            <p className="text-green-600 mt-2">{'>'} progres 50 cor pondasi</p>
            <p className="text-gray-500">📸 Progres: 50% — cor pondasi</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-16 text-center">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 md:p-12 rounded-3xl text-white">
          <h2 className="text-3xl font-bold mb-4">Siap Cobain?</h2>
          <p className="text-green-100 mb-6 max-w-md mx-auto">
            Gratis. Langsung bisa dipake. Tinggal daftar dan buat proyek pertama.
          </p>
          <Link to="/register"
            className="inline-block px-8 py-3 bg-white text-green-700 rounded-xl hover:bg-green-50 font-medium text-lg shadow-lg">
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="text-white font-semibold mb-2">Uyuhan Jaya</p>
          <p>© {new Date().getFullYear()} — Untuk kontraktor Indonesia</p>
          <p className="text-xs mt-2">
            <Link to="/login" className="hover:text-white">Masuk</Link>
            {' · '}
            <Link to="/register" className="hover:text-white">Daftar</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

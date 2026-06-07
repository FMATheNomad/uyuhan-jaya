import { useState } from 'react'
import { Link } from 'react-router-dom'

const roles = [
  { id: 'owner', label: '👑 Owner Proyek', desc: 'Pantau semua proyek, approve RAB, lihat laporan real-time tanpa harus datang ke lokasi.', bg: 'bg-purple-600' },
  { id: 'kontraktor', label: '🔧 Kontraktor', desc: 'Kelola proyek, atur budget, generate RAB AI, export Excel, kirim notifikasi WA ke owner.', bg: 'bg-blue-600' },
  { id: 'mandor', label: '👷 Mandor', desc: 'Absen tukang via WA, foto progres, catat material — cukup chat, gak perlu buka web.', bg: 'bg-green-600' },
  { id: 'tukang', label: '🛠️ Tukang', desc: 'Check-in cukup scan QR Code di proyek atau diabsenin sama mandor. Gak perlu pegang HP.', bg: 'bg-orange-600' },
]

const steps = [
  { n: '1', icon: '📝', title: 'Buat Proyek', desc: 'Buat proyek baru, set budget, dan lokasi. Semua tim langsung bisa akses.' },
  { n: '2', icon: '👷', title: 'Kelola Harian', desc: 'Absen tukang via QR/WA, catat material, foto progres — semua dari HP.' },
  { n: '3', icon: '📊', title: 'Pantau & Laporkan', desc: 'Dashboard real-time, RAB AI, notifikasi WA otomatis ke owner.' },
]

export default function LandingPage() {
  const [activeRole, setActiveRole] = useState('owner')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-lg font-bold text-green-700">Uyuhan Jaya</div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">Masuk</Link>
            <Link to="/register" className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Coba Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO — Inspirasi Procore + Mastt */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm text-green-200 mb-6">
              <span>🏗️</span> Untuk Kontraktor Indonesia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Kelola Proyek Konstruksi
              <br />
              <span className="text-green-300">Dari WhatsApp</span>
            </h1>
            <p className="text-lg text-green-100/80 max-w-xl mb-8 leading-relaxed">
              Uyuhan Jaya bantu kontraktor Indonesia manajemen proyek — dari absensi tukang, 
              material, progres, sampai RAB — semuanya bisa lewat WhatsApp + Dashboard Web.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register"
                className="px-6 py-3 bg-white text-green-800 rounded-xl hover:bg-green-50 font-semibold shadow-lg shadow-green-900/20">
                Coba Gratis
              </Link>
              <Link to="/login"
                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 font-medium border border-white/20">
                Masuk
              </Link>
            </div>
            <p className="text-sm text-green-300/60 mt-4">Gak perlu kartu kredit. Langsung bisa dipake.</p>
          </div>

          {/* Social proof — Inspirasi Procore */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10">
            {[
              { n: '3', label: 'Role User' },
              { n: '6', label: 'Fitur Inti' },
              { n: 'AI', label: 'RAB Generator' },
              { n: 'WA', label: 'Bot Notifikasi' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-green-300">{s.n}</p>
                <p className="text-sm text-green-100/60 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIAPA YANG PAKAI — Inspirasi Buildertrend (4 actor tabs) */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Dibuat untuk Semua yang Terlibat</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Setiap peran punya tampilan dan akses yang sesuai — dari owner sampai tukang di lapangan.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {roles.map((r) => (
            <button key={r.id} onClick={() => setActiveRole(r.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                activeRole === r.id ? `${r.bg} text-white shadow-lg` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
          {roles.filter(r => r.id === activeRole).map(r => (
            <div key={r.id} className="md:flex items-center gap-10">
              <div className="flex-1 mb-6 md:mb-0">
                <p className="text-5xl mb-4">{r.label.split(' ')[0]}</p>
                <h3 className="text-2xl font-bold mb-3">{r.label}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{r.desc}</p>
                <Link to="/register"
                  className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  Coba Gratis →
                </Link>
              </div>
              <div className="flex-1">
                <div className={`${r.bg} rounded-2xl p-8 text-white`}>
                  <p className="text-3xl font-bold mb-2">
                    {r.id === 'owner' && '📊 Lihat Semua Proyek'}
                    {r.id === 'kontraktor' && '📋 Kelola Proyek'}
                    {r.id === 'mandor' && '📱 Cukup Chat WA'}
                    {r.id === 'tukang' && '📲 Scan QR Doang'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {r.id === 'owner' && 'Dashboard multi-proyek, approval RAB, notifikasi WA tiap update.'}
                    {r.id === 'kontraktor' && 'Buat RAB pake AI, atur budget, export Excel, pantau progres real-time.'}
                    {r.id === 'mandor' && 'Kirim "absen Asep" ke bot WA — auto tercatat. Foto progres, catat material, semua dari HP.'}
                    {r.id === 'tukang' && 'Tinggal scan QR Code di proyek — auto check-in. Gak perlu instal app apa-apa.'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — Inspirasi Raken (3 langkah) */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Cara Kerjanya</h2>
            <p className="text-gray-500 max-w-xl mx-auto">3 langkah aja. Dari buat proyek sampai laporan ke owner.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="bg-white p-8 rounded-2xl shadow-sm border relative">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl font-bold text-green-700 mb-4">
                  {s.n}
                </div>
                <p className="text-3xl mb-3">{s.icon}</p>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITUR — Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Semua Fitur yang Kamu Butuh</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Dari absensi sampai RAB, dari web sampai WhatsApp.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '👷', title: 'Absensi QR & Selfie', desc: 'Check-in pake QR Code + foto selfie. Anti "titip absen".' },
            { icon: '📦', title: 'Material Log', desc: 'Catat pemakaian material per kategori. Tau persis stok & biaya.' },
            { icon: '📸', title: 'Progres Timeline', desc: 'Foto progres + persentase. Owner bisa lihat dari rumah.' },
            { icon: '🤖', title: 'RAB AI + Excel', desc: 'Deskripsi proyek → AI bikin RAB + export Excel profesional.' },
            { icon: '📊', title: 'Dashboard Visual', desc: 'Chart anggaran, absensi, material. Real-time.' },
            { icon: '📱', title: 'Notifikasi WhatsApp', desc: 'Tiap absen & update progres auto-terkirim ke WA.' },
          ].map((f) => (
            <div key={f.title} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
              <p className="text-3xl mb-3">{f.icon}</p>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-gradient-to-r from-green-800 to-emerald-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-5xl mb-6">💬</p>
          <blockquote className="text-xl md:text-2xl font-medium italic leading-relaxed mb-6">
            "Dulu saya harus bolak-balik ke proyek buat liat progres. Sekarang tinggal buka HP, 
            semua real-time — dari absensi sampe RAB."
          </blockquote>
          <p className="text-green-200 font-semibold">— Asep, Kontraktor Cimahi</p>
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xl">★</span>)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Siap Mulai?</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Gratis. Langsung bisa dipake. Tinggal daftar dan buat proyek pertama kamu.
        </p>
        <Link to="/register"
          className="inline-block px-8 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-lg shadow-lg shadow-green-200">
          Daftar Gratis
        </Link>
        <p className="text-sm text-gray-400 mt-4">Gak perlu kartu kredit. Gak perlu download app.</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p className="text-white font-bold text-lg mb-1">Uyuhan Jaya</p>
          <p className="text-green-400 text-xs mb-3">by FMA Software Labs</p>
          <p>© {new Date().getFullYear()} FMA Software Labs. All rights reserved.</p>
          <p className="text-xs mt-1">Untuk kontraktor Indonesia</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link to="/login" className="hover:text-white">Masuk</Link>
            <Link to="/register" className="hover:text-white">Daftar</Link>
            <a href="https://github.com/FMATheNomad/uyuhan-jaya" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch {
      setError('Gagal daftar, coba lagi')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 -left-20 w-96 h-96 bg-green-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white">MiniCrane</Link>
          <p className="text-green-200/60 text-sm mt-1">by FMA Software Labs</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Daftar Akun</h1>
          <p className="text-sm text-gray-500 mb-6">Mulai kelola proyek konstruksi kamu</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition"
                required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none focus:border-transparent transition"
                required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium transition shadow-lg shadow-green-200 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Daftar Gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Masuk</Link>
          </p>
        </div>

        <p className="text-center text-xs text-green-200/50 mt-4">
          Gratis. Gak perlu kartu kredit. Langsung bisa dipake.
        </p>
      </div>
    </div>
  )
}

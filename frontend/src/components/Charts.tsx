import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']

export function BudgetPie({ used, remaining, budget }: { used: number; remaining: number; budget: number }) {
  const data = [
    { name: 'Terpakai', value: Math.max(used, 0) },
    { name: 'Sisa', value: Math.max(remaining, 0) },
  ]
  return (
    <div>
      <h3 className="font-semibold mb-2">Anggaran</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString('id-ID')}`} />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-sm text-gray-500">
        Total: Rp {budget.toLocaleString('id-ID')}
      </p>
    </div>
  )
}

export function AttendanceChart({ data }: { data: { date: string; total: number }[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Absensi 7 Hari</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MaterialPie({ data }: { data: { category: string; total: number }[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Material per Kategori</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="total" cx="50%" cy="50%" outerRadius={80} label={({ category }) => category}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `Rp ${v.toLocaleString('id-ID')}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

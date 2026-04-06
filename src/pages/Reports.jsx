import { useState, useMemo } from 'react'
import { useTransactions, useCategories } from '../hooks/useData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'
import { format, startOfWeek, startOfMonth, startOfYear, subWeeks, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameMonth, isSameWeek, isSameYear, isWithinInterval } from 'date-fns'
import { TrendingUp, TrendingDown, Target, Award, AlertCircle } from 'lucide-react'

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16']

export const Reports = () => {
  const { transactions } = useTransactions()
  const { categories } = useCategories()
  const [period, setPeriod] = useState('monthly')

  const dateRange = useMemo(() => {
    const now = new Date()
    let startDate, endDate
    
    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now)
        endDate = now
        break
      case 'yearly':
        startDate = startOfYear(now)
        endDate = now
        break
      case 'monthly':
      default:
        startDate = startOfMonth(now)
        endDate = now
        break
    }
    
    return { start: startDate, end: endDate, now }
  }, [period])

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date)
      return isWithinInterval(date, { start: dateRange.start, end: dateRange.end }) && t.type === 'expense'
    })
  }, [transactions, dateRange])

  const categoryData = useMemo(() => {
    const grouped = filteredData.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    const data = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
    return data
  }, [filteredData])

  const spendingTrend = useMemo(() => {
    let intervals, formatter
    
    if (period === 'weekly') {
      intervals = eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
      formatter = (d) => format(d, 'EEE')
    } else if (period === 'monthly') {
      intervals = eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
      formatter = (d) => format(d, 'MMM d')
    } else {
      intervals = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end })
      formatter = (d) => format(d, 'MMM')
    }
    
    return intervals.map(date => {
      const periodData = filteredData.filter(t => {
        const tDate = new Date(t.date)
        if (period === 'weekly') return isSameDay(tDate, date)
        if (period === 'monthly') return isSameWeek(tDate, date, { weekStartsOn: 1 })
        return isSameMonth(tDate, date)
      })
      
      return {
        name: formatter(date),
        amount: periodData.reduce((sum, t) => sum + t.amount, 0)
      }
    })
  }, [filteredData, period, dateRange])

  const getCategoryData = (catName) => {
    if (!categories?.all) return null
    return categories.all.find(c => c.name === catName)
  }

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()

  const totalExpense = filteredData.reduce((sum, t) => sum + t.amount, 0)
  const topCategory = categoryData[0]?.name || 'N/A'
  const topCategoryAmount = categoryData[0]?.value || 0
  
  const previousPeriodStart = period === 'weekly' 
    ? subWeeks(dateRange.start, 1) 
    : period === 'monthly' 
    ? subMonths(dateRange.start, 1) 
    : subYears(dateRange.start, 1)
  
  const previousData = transactions.filter(t => {
    const date = new Date(t.date)
    return t.type === 'expense' && isWithinInterval(date, { start: previousPeriodStart, end: dateRange.start })
  })
  
  const previousTotal = previousData.reduce((sum, t) => sum + t.amount, 0)
  const percentChange = previousTotal > 0 ? ((totalExpense - previousTotal) / previousTotal) * 100 : 0

  const averageMonthlyExpense = useMemo(() => {
    if (period === 'yearly') {
      const months = 12
      return totalExpense / months
    } else if (period === 'monthly') {
      return totalExpense
    } else {
      const weeks = 4
      return totalExpense / weeks
    }
  }, [totalExpense, period])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ fontWeight: 'bold' }}>{payload[0].payload.name}</p>
          <p>₱{payload[0].value?.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes']
    const rows = transactions
      .filter(t => {
        const date = new Date(t.date)
        return isWithinInterval(date, { start: dateRange.start, end: dateRange.end })
      })
      .map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.type,
        t.category,
        t.amount,
        t.notes || ''
      ])
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `antledger-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['weekly', 'monthly', 'yearly'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: period === p ? '#f59e0b' : '#f1f5f9',
              color: period === p ? '#fff' : '#64748b',
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
              <TrendingDown size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Total Expenses</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>₱{totalExpense.toLocaleString()}</div>
          {percentChange !== 0 && (
            <div style={{ 
              fontSize: '13px', 
              color: percentChange > 0 ? '#ef4444' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange).toFixed(1)}% vs previous {period}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
              <Award size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Top Category</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{topCategory}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>₱{topCategoryAmount.toLocaleString()}</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px', color: '#3b82f6' }}>
              <Target size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Avg {period === 'weekly' ? 'Weekly' : period === 'monthly' ? 'Monthly' : 'Yearly'}</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>₱{averageMonthlyExpense.toLocaleString()}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>per {period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '8px', color: '#10b981' }}>
              <AlertCircle size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Categories</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b' }}>{categoryData.length}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>with spending</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Spending Trend</h3>
          {spendingTrend.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={spendingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₱${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Category Distribution</h3>
          {categoryData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No expenses for this period</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                {categoryData.slice(0, 5).map((entry, index) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Category Breakdown</h3>
        {categoryData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No expenses for this period</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryData.map((cat, index) => {
              const percentage = (cat.value / totalExpense) * 100
              const catData = getCategoryData(cat.name)
              return (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '4px', background: COLORS[index % COLORS.length] }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{cat.name}</span>
                      <span style={{ color: '#64748b' }}>₱{cat.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, background: COLORS[index % COLORS.length], borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
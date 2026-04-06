import { useState, useMemo } from 'react'
import { useTransactions } from '../hooks/useData'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, startOfWeek, startOfMonth, startOfYear, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameMonth, isSameWeek, isSameYear } from 'date-fns'

const COLORS = ['#FDCB6E', '#00B894', '#D63031', '#6C5CE7', '#74B9FF', '#A29BFE', '#FD79A8', '#00CEC9']

export const Reports = () => {
  const { transactions } = useTransactions()
  const [period, setPeriod] = useState('monthly')

  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate
    
    switch (period) {
      case 'weekly':
        startDate = startOfWeek(now)
        break
      case 'monthly':
        startDate = startOfMonth(now)
        break
      case 'yearly':
        startDate = startOfYear(now)
        break
      default:
        startDate = startOfMonth(now)
    }

    return transactions.filter(t => new Date(t.date) >= startDate)
  }, [transactions, period])

  const lineChartData = useMemo(() => {
    const now = new Date()
    let intervals, formatter

    if (period === 'weekly') {
      intervals = eachDayOfInterval({ start: startOfWeek(now), end: now })
      formatter = (d) => format(d, 'EEE')
    } else if (period === 'monthly') {
      intervals = eachWeekOfInterval({ start: startOfMonth(now), end: now })
      formatter = (d) => format(d, 'MMM d')
    } else {
      intervals = eachMonthOfInterval({ start: startOfYear(now), end: now })
      formatter = (d) => format(d, 'MMM')
    }

    return intervals.map(date => {
      const dayData = filteredData.filter(t => {
        const tDate = new Date(t.date)
        if (period === 'weekly') return isSameDay(tDate, date)
        if (period === 'monthly') return isSameWeek(tDate, date, { weekStartsOn: 1 })
        return isSameMonth(tDate, date)
      })

      const income = dayData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expense = dayData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

      return {
        name: formatter(date),
        income,
        expense
      }
    })
  }, [filteredData, period])

  const pieData = useMemo(() => {
    const expenses = filteredData.filter(t => t.type === 'expense')
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const totals = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expense = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { income, expense, net: income - expense }
  }, [filteredData])

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes']
    const rows = filteredData.map(t => [
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
    a.download = `antledger-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const isSameDay = (d1, d2) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <button className="btn btn-secondary" onClick={exportToCSV}>
          Export CSV
        </button>
      </div>

      <div className="tabs">
        <button className={`tab ${period === 'weekly' ? 'active' : ''}`} onClick={() => setPeriod('weekly')}>Weekly</button>
        <button className={`tab ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>Monthly</button>
        <button className={`tab ${period === 'yearly' ? 'active' : ''}`} onClick={() => setPeriod('yearly')}>Yearly</button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-label">Total Income</div>
          <div className="stat-value positive">+${totals.income.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value negative">-${totals.expense.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Savings</div>
          <div className={`stat-value ${totals.net >= 0 ? 'positive' : 'negative'}`}>
            ${totals.net.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="report-grid">
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Income vs Expenses</h3>
          {lineChartData.length === 0 ? (
            <div className="empty-state"><p>No data for this period</p></div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#00B894" strokeWidth={2} />
                  <Line type="monotone" dataKey="expense" stroke="#D63031" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Spending by Category</h3>
          {pieData.length === 0 ? (
            <div className="empty-state"><p>No expenses for this period</p></div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
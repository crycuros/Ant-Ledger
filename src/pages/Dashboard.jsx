import { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { IoAdd } from 'react-icons/io5'
import { useTransactions } from '../hooks/useData'
import { useSettings } from '../context/SettingsContext'
import { format } from 'date-fns'
import { BiSolidStopwatch } from 'react-icons/bi'

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16']

export const Dashboard = () => {
  const { transactions } = useTransactions()
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyData = transactions.filter(t => {
    const date = new Date(t.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const totalIncome = monthlyData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = monthlyData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const categoryData = (() => {
    const expenses = monthlyData.filter(t => t.type === 'expense')
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  })()

  const recentTransactions = transactions.slice(0, 5)

  const getCategoryIcon = (cat) => {
    const icons = { Food: '🍔', Bills: '📄', Transport: '🚗', Housing: '🏠', Misc: '📦', Salary: '💰', Freelance: '💼', Gift: '🎁', Other: '💵' }
    return icons[cat] || '📦'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => setShowIncomeModal(true)}>
            <IoAdd /> Income
          </button>
          <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
            <IoAdd /> Expense
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Balance</div>
          <div className={`stat-value ${balance >= 0 ? 'positive' : 'negative'}`}>
            ${balance.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Income</div>
          <div className="stat-value positive">+${totalIncome.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value negative">-${totalExpense.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <ClockWidget />
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Spending by Category</h3>
          {categoryData.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px' }}>
              <p>No expenses this month</p>
            </div>
          ) : (
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
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

      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="transaction-list">
            {recentTransactions.map(t => (
              <div key={t.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-icon">{getCategoryIcon(t.category)}</span>
                  <div className="transaction-details">
                    <h4>{t.category}</h4>
                    <p>{format(new Date(t.date), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className={`transaction-amount ${t.type}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showExpenseModal && (
        <TransactionModal type="expense" onClose={() => setShowExpenseModal(false)} />
      )}
      {showIncomeModal && (
        <TransactionModal type="income" onClose={() => setShowIncomeModal(false)} />
      )}
    </div>
  )
}

const ClockWidget = () => {
  const [time, setTime] = useState(new Date())
  const [showDigital, setShowDigital] = useState(false)
  const cardRef = useRef(null)
  const { timeFormat } = useSettings()

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = time.getSeconds() + time.getMilliseconds() / 1000
  const minutes = time.getMinutes() + seconds / 60
  const hours = timeFormat === '12hr' 
    ? (time.getHours() % 12 || 12) + minutes / 60 
    : (time.getHours() % 24) + minutes / 60

  const secDeg = seconds * 6
  const minDeg = minutes * 6
  const hourDeg = hours * 30

  const toggleView = () => setShowDigital(!showDigital)

  const timeString = timeFormat === '12hr' 
    ? format(time, 'hh:mm:ss a')
    : format(time, 'HH:mm:ss')

  return (
    <div style={{ 
      padding: '24px', 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      cursor: 'pointer',
      position: 'relative'
    }} onClick={toggleView}>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
        }
      `}</style>
      
      {!showDigital ? (
        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
              <line key={i} x1="100" y1="15" x2="100" y2={i % 5 === 0 ? 25 : 20} 
                transform={`rotate(${deg} 100 100)`} stroke="rgba(255,255,255,0.4)" strokeWidth={i % 3 === 0 ? 2 : 1} />
            ))}
            <line x1="100" y1="100" x2="100" y2="55" transform={`rotate(${hourDeg} 100 100)`} 
              stroke="#fff" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <line x1="100" y1="100" x2="100" y2="35" transform={`rotate(${minDeg} 100 100)`} 
              stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <line x1="100" y1="100" x2="100" y2="25" transform={`rotate(${secDeg} 100 100)`} 
              stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="#fff" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
          </svg>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #fff 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.3))'
          }}>
            {timeString}
          </div>
          <div style={{ 
            color: '#f59e0b', 
            fontSize: '14px', 
            letterSpacing: '3px',
            marginTop: '8px'
          }}>
            {format(time, 'MMM dd').toUpperCase()}
          </div>
        </div>
      )}
      
      <div style={{ 
        position: 'absolute', 
        bottom: '12px', 
        fontSize: '11px', 
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '1px'
      }}>
        Tap to {showDigital ? 'analog' : 'digital'}
      </div>
    </div>
  )
}

const TransactionModal = ({ type, onClose }) => {
  const { addTransaction } = useTransactions()
  const [formData, setFormData] = useState({
    amount: '',
    category: type === 'expense' ? 'Food' : 'Salary',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  const expenseCategories = ['Food', 'Bills', 'Transport', 'Housing', 'Misc']
  const incomeSources = ['Salary', 'Freelance', 'Gift', 'Other']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        type
      })
      onClose()
    } catch (err) {
      alert(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add {type === 'expense' ? 'Expense' : 'Income'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label className="form-label">{type === 'expense' ? 'Category' : 'Source'}</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {(type === 'expense' ? expenseCategories : incomeSources).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add a note..."
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving...' : `Add ${type === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
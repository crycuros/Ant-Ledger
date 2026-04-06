import { useState, useEffect, useRef, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { IoAdd } from 'react-icons/io5'
import { useTransactions, useCategories, useBudgets, useSubscriptions } from '../hooks/useData'
import { useSettings } from '../context/SettingsContext'
import { format, startOfDay, startOfWeek, startOfMonth, endOfWeek, endOfMonth, subMonths, isWithinInterval } from 'date-fns'
import { BiSolidStopwatch } from 'react-icons/bi'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target } from 'lucide-react'
import { 
  Utensils, FileText, Car, Home, Heart, 
  PlayCircle, Briefcase, ShoppingCart, Book, 
  MoreHorizontal, Wallet as WalletIcon
} from 'lucide-react'

const ICONS = {
  Food: Utensils,
  Bills: FileText,
  Transport: Car,
  Housing: Home,
  Misc: MoreHorizontal,
  Salary: WalletIcon,
  Freelance: Briefcase,
  Business: WalletIcon,
  Others: MoreHorizontal
}

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#84cc16']

export const Dashboard = () => {
  const { transactions, loading: txLoading } = useTransactions()
  const { categories } = useCategories()
  const { budgets } = useBudgets()
  const { subscriptions } = useSubscriptions()
  const [timeFilter, setTimeFilter] = useState('month')

  const filteredData = useMemo(() => {
    const now = new Date()
    let start, end

    switch (timeFilter) {
      case 'today':
        start = startOfDay(now)
        end = now
        break
      case 'week':
        start = startOfWeek(now)
        end = endOfWeek(now)
        break
      case 'month':
      default:
        start = startOfMonth(now)
        end = endOfMonth(now)
        break
    }

    return transactions.filter(t => {
      const date = new Date(t.date)
      return isWithinInterval(date, { start, end })
    })
  }, [transactions, timeFilter])

  const totalIncome = filteredData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyBudget = budgets.find(b => {
    const bMonth = parseInt(b.month.split('-')[1]) - 1
    const bYear = parseInt(b.month.split('-')[0])
    return bMonth === currentMonth && bYear === currentYear
  })
  const monthlyExpenseTotal = transactions.filter(t => {
    const date = new Date(t.date)
    return t.type === 'expense' && date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).reduce((sum, t) => sum + t.amount, 0)
  
  const remainingBudget = monthlyBudget ? monthlyBudget.monthly_limit - monthlyExpenseTotal : 0

  const activeSubscriptionsTotal = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.billing_cycle === 'weekly') return sum + (s.amount * 4.33)
      if (s.billing_cycle === 'yearly') return sum + (s.amount / 12)
      return sum + s.amount
    }, 0)

  const categoryData = useMemo(() => {
    const expenses = filteredData.filter(t => t.type === 'expense')
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filteredData])

  const monthlySpendingData = useMemo(() => {
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i)
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date)
        return t.type === 'expense' && date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear()
      })
      last6Months.push({
        month: format(d, 'MMM'),
        amount: monthTransactions.reduce((sum, t) => sum + t.amount, 0)
      })
    }
    return last6Months
  }, [transactions])

  const recentTransactions = transactions.slice(0, 5)

  const getCategoryData = (catName) => {
    if (!categories?.all) return null
    return categories.all.find(c => c.name === catName)
  }

  const renderIcon = (catName, size = 20, color = 'currentColor') => {
    const catData = getCategoryData(catName)
    const iconName = catData?.icon || catName
    const IconComponent = ICONS[iconName] || MoreHorizontal
    return <IconComponent size={size} color={catData?.color || color} />
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ fontWeight: 'bold' }}>{payload[0].payload.name}</p>
          <p>₱{payload[0].value.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select 
            value={timeFilter} 
            onChange={e => setTimeFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#d1fae5', borderRadius: '8px', color: '#10b981' }}>
              <Wallet size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Total Income</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₱{totalIncome.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
              <TrendingDown size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Total Expenses</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>₱{totalExpense.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#dbeafe', borderRadius: '8px', color: '#3b82f6' }}>
              <PiggyBank size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Balance</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: balance >= 0 ? '#3b82f6' : '#ef4444' }}>₱{balance.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Income - Expenses</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ padding: '10px', background: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
              <Target size={20} />
            </div>
            <span style={{ color: '#64748b', fontSize: '14px' }}>Remaining Budget</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: remainingBudget >= 0 ? '#10b981' : '#ef4444' }}>₱{remainingBudget.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {monthlyBudget ? `of ₱${monthlyBudget.monthly_limit.toLocaleString()}` : 'No budget set'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Expense by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
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
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No expenses yet</div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            {categoryData.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Monthly Spending</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySpendingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={v => `₱${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No transactions yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTransactions.map(t => (
              <div key={t.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex' }}>{renderIcon(t.category)}</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>{t.category}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{format(new Date(t.date), 'MMM d, yyyy')}</div>
                  </div>
                </div>
                <div className={`transaction-amount ${t.type}`} style={{ fontWeight: '600' }}>
                  {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeSubscriptionsTotal > 0 && (
        <div className="card" style={{ padding: '20px', marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px', color: '#1e293b' }}>Monthly Subscriptions</h3>
          <p style={{ color: '#64748b' }}>Estimated monthly recurring: <strong style={{ color: '#ef4444' }}>₱{activeSubscriptionsTotal.toLocaleString()}</strong></p>
        </div>
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
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { format, addDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { AlertTriangle, Bell, X, Check, CreditCard, Target, TrendingUp } from 'lucide-react'

export const useAlerts = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const [budgetRes, txRes, subRes] = await Promise.all([
        supabase.from('budgets').select('*').eq('user_id', user.id),
        supabase.from('transactions').select('*').eq('user_id', user.id),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active')
      ])

      if (!budgetRes.error) setBudgets(budgetRes.data || [])
      if (!txRes.error) setTransactions(txRes.data || [])
      if (!subRes.error) setSubscriptions(subRes.data || [])
    }

    fetchData()
  }, [user])

  useEffect(() => {
    const newAlerts = []
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthExpenses = transactions.filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && date >= monthStart
    })

    budgets.forEach(budget => {
      const spent = monthExpenses
        .filter(e => e.category === budget.category)
        .reduce((sum, e) => sum + e.amount, 0)
      
      const percent = (spent / budget.monthly_limit) * 100
      
      if (percent >= 100) {
        newAlerts.push({
          id: `budget-exceed-${budget.id}`,
          type: 'danger',
          title: 'Budget Exceeded',
          message: `You've exceeded your ${budget.category} budget (₱${spent.toLocaleString()} / ₱${budget.monthly_limit.toLocaleString()})`,
          icon: TrendingUp
        })
      } else if (percent >= 80) {
        newAlerts.push({
          id: `budget-warning-${budget.id}`,
          type: 'warning',
          title: 'Budget Near Limit',
          message: `You are near your ${budget.category} budget (₱${spent.toLocaleString()} / ₱${budget.monthly_limit.toLocaleString()})`,
          icon: Target
        })
      }
    })

    subscriptions.forEach(sub => {
      const nextDate = new Date(sub.next_billing_date)
      const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 0) {
        newAlerts.push({
          id: `sub-today-${sub.id}`,
          type: 'info',
          title: 'Subscription Due Today',
          message: `${sub.name} (₱${sub.amount.toLocaleString()}) will be charged today`,
          icon: CreditCard
        })
      } else if (daysUntil <= 2) {
        newAlerts.push({
          id: `sub-soon-${sub.id}`,
          type: 'info',
          title: 'Subscription Due Soon',
          message: `${sub.name} (₱${sub.amount.toLocaleString()}) will be charged in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
          icon: CreditCard
        })
      }
    })

    setAlerts(newAlerts)
  }, [budgets, transactions, subscriptions])

  return { alerts }
}

export const AlertsDropdown = () => {
  const { alerts } = useAlerts()
  const [isOpen, setIsOpen] = useState(false)
  const [dismissed, setDismissed] = useState([])

  const activeAlerts = alerts.filter(a => !dismissed.includes(a.id))

  const dismiss = (id) => {
    setDismissed([...dismissed, id])
  }

  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return { bg: '#fef2f2', border: '#fecaca', icon: '#ef4444' }
      case 'warning':
        return { bg: '#fffbeb', border: '#fde68a', icon: '#f59e0b' }
      case 'info':
        return { bg: '#dbeafe', border: '#bfdbfe', icon: '#3b82f6' }
      default:
        return { bg: '#f8fafc', border: '#e2e8f0', icon: '#64748b' }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          position: 'relative'
        }}
      >
        <Bell size={20} />
        {activeAlerts.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeAlerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          width: '320px',
          background: '#1e293b',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontWeight: '600', color: '#fff' }}>Notifications</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              No alerts
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {activeAlerts.map(alert => {
                const styles = getAlertStyles(alert.type)
                const Icon = alert.icon
                return (
                  <div
                    key={alert.id}
                    style={{
                      padding: '12px',
                      background: styles.bg,
                      borderRadius: '8px',
                      marginBottom: '8px',
                      border: `1px solid ${styles.border}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <Icon size={18} color={styles.icon} style={{ marginTop: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>{alert.title}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{alert.message}</div>
                      </div>
                      <button
                        onClick={() => dismiss(alert.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
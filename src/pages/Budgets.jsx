import { useState, useMemo } from 'react'
import { useBudgets, useTransactions } from '../hooks/useData'
import { format, startOfMonth } from 'date-fns'

export const Budgets = () => {
  const { budgets, setBudget } = useBudgets()
  const { transactions } = useTransactions()
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)

  const currentMonth = format(new Date(), 'yyyy-MM')

  const budgetData = useMemo(() => {
    const monthStart = startOfMonth(new Date())
    const expenses = transactions.filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && date >= monthStart
    })

    return budgets.map(b => {
      const spent = expenses
        .filter(e => e.category === b.category)
        .reduce((sum, e) => sum + e.amount, 0)
      const percent = (spent / b.monthly_limit) * 100
      return { ...b, spent, percent }
    })
  }, [budgets, transactions])

  const getProgressClass = (percent) => {
    if (percent >= 100) return 'danger'
    if (percent >= 80) return 'warning'
    return 'safe'
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <button className="btn btn-primary" onClick={() => { setEditingBudget(null); setShowModal(true) }}>
          Set Budget
        </button>
      </div>

      <div className="card">
        {budgetData.length === 0 ? (
          <div className="empty-state">
            <h3>No budgets set</h3>
            <p>Set monthly spending limits for your categories</p>
          </div>
        ) : (
          budgetData.map(b => (
            <div key={b.id} className="budget-item">
              <div className="budget-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{b.category}</h4>
                  <span style={{ fontWeight: 600 }}>
                    ${b.spent.toLocaleString()} / ${b.monthly_limit.toLocaleString()}
                  </span>
                </div>
                <div className="budget-progress">
                  <div
                    className={`budget-progress-fill ${getProgressClass(b.percent)}`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {b.percent.toFixed(0)}% used
                  {b.percent >= 100 && <span style={{ color: 'var(--danger)', marginLeft: '8px' }}>⚠️ Over budget!</span>}
                  {b.percent >= 80 && b.percent < 100 && <span style={{ color: '#FDCB6E', marginLeft: '8px' }}>⚠️ Near limit</span>}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await setBudget({ ...data, month: currentMonth })
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}

const BudgetModal = ({ budget, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || 'Food',
    monthly_limit: budget?.monthly_limit || ''
  })
  const [saving, setSaving] = useState(false)

  const categories = ['Food', 'Bills', 'Transport', 'Housing', 'Misc']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        category: formData.category,
        monthly_limit: parseFloat(formData.monthly_limit)
      })
    } catch (err) {
      alert(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Set Budget</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit</label>
            <input
              type="number"
              className="form-input"
              value={formData.monthly_limit}
              onChange={e => setFormData({ ...formData, monthly_limit: e.target.value })}
              required
              min="0"
              step="1"
              placeholder="0.00"
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Budget'}
          </button>
        </form>
      </div>
    </div>
  )
}
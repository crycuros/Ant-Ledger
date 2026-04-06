import { useState, useMemo } from 'react'
import { useBudgets, useTransactions, useCategories } from '../hooks/useData'
import { format, startOfMonth } from 'date-fns'
import { IoAdd, IoTrash, IoWarning } from 'react-icons/io5'
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

export const Budgets = () => {
  const { budgets, setBudget, fetchBudgets } = useBudgets()
  const { transactions } = useTransactions()
  const { categories } = useCategories()
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
      const percent = b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0
      const remaining = b.monthly_limit - spent
      return { ...b, spent, percent, remaining }
    })
  }, [budgets, transactions])

  const expenseCategories = categories?.expense || ['Food', 'Bills', 'Transport', 'Housing', 'Misc']

  const totalBudget = budgets.reduce((sum, b) => sum + b.monthly_limit, 0)
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  const exceededBudgets = budgetData.filter(b => b.percent >= 100)
  const warningBudgets = budgetData.filter(b => b.percent >= 80 && b.percent < 100)

  const getProgressColor = (percent) => {
    if (percent >= 100) return '#ef4444'
    if (percent >= 80) return '#f59e0b'
    return '#10b981'
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this budget?')) {
      const { supabase } = await import('../lib/supabase')
      await supabase.from('budgets').delete().eq('id', id)
      await fetchBudgets()
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Budget Limits</h1>
        <button className="btn btn-primary" onClick={() => { setEditingBudget(null); setShowModal(true) }}>
          <IoAdd /> Set Budget
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Target size={18} color="#3b82f6" />
            <span style={{ color: '#64748b', fontSize: '13px' }}>Total Budget</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>₱{totalBudget.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>This month</div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={18} color="#ef4444" />
            <span style={{ color: '#64748b', fontSize: '13px' }}>Total Spent</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ef4444' }}>₱{totalSpent.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{totalBudget > 0 ? ((totalSpent/totalBudget)*100).toFixed(0) : 0}% used</div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={18} color="#10b981" />
            <span style={{ color: '#64748b', fontSize: '13px' }}>Remaining</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: totalRemaining >= 0 ? '#10b981' : '#ef4444' }}>₱{totalRemaining.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Available</div>
        </div>

        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span style={{ color: '#64748b', fontSize: '13px' }}>Categories</span>
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>{budgets.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>With budgets</div>
        </div>
      </div>

      {exceededBudgets.length > 0 && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <IoWarning size={24} color="#ef4444" />
          <div>
            <strong style={{ color: '#dc2626' }}>Budget Exceeded!</strong>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              {exceededBudgets.map(b => b.category).join(', ')} 
            </div>
          </div>
        </div>
      )}

      {warningBudgets.length > 0 && (
        <div style={{ 
          background: '#fef3c7', 
          border: '1px solid #fde68a', 
          borderRadius: '8px', 
          padding: '16px', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle size={24} color="#f59e0b" />
          <div>
            <strong style={{ color: '#d97706' }}>Warning: Near Limit</strong>
            <div style={{ color: '#64748b', fontSize: '14px' }}>
              {warningBudgets.map(b => `${b.category} (${b.percent.toFixed(0)}%)`).join(', ')}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {budgetData.length === 0 ? (
          <div className="empty-state">
            <h3>No budgets set</h3>
            <p>Set monthly spending limits for your categories</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {budgetData.map(b => (
              <div 
                key={b.id} 
                style={{ 
                  padding: '16px', 
                  background: b.percent >= 100 ? '#fef2f2' : b.percent >= 80 ? '#fffbeb' : '#f8fafc',
                  borderRadius: '8px',
                  border: `1px solid ${b.percent >= 100 ? '#fecaca' : b.percent >= 80 ? '#fde68a' : '#e2e8f0'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{b.category}</h4>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      ₱{b.spent.toLocaleString()} spent of ₱{b.monthly_limit.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: b.remaining >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        ₱{b.remaining.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>remaining</div>
                    </div>
                    <button 
                      onClick={() => handleDelete(b.id)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#94a3b8',
                        padding: '8px'
                      }}
                    >
                      <IoTrash size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ 
                  height: '12px', 
                  background: '#e2e8f0', 
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${Math.min(b.percent, 100)}%`,
                      background: getProgressColor(b.percent),
                      borderRadius: '6px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#64748b' }}>{b.percent.toFixed(0)}% used</span>
                  {b.percent >= 80 && b.percent < 100 && (
                    <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} /> Near limit
                    </span>
                  )}
                  {b.percent >= 100 && (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IoWarning size={14} /> Exceeded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <BudgetModal
          budget={editingBudget}
          categories={expenseCategories}
          existingBudgets={budgets.map(b => b.category)}
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

const BudgetModal = ({ budget, categories, existingBudgets, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: budget?.category || (categories.find(c => !existingBudgets.includes(c)) || categories[0]),
    monthly_limit: budget?.monthly_limit || ''
  })
  const [saving, setSaving] = useState(false)

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
          <h2 className="modal-title">Set Budget Limit</h2>
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
                <option key={c} value={c} disabled={existingBudgets.includes(c)}>
                  {c} {existingBudgets.includes(c) ? '(already set)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Monthly Limit (₱)</label>
            <input
              type="number"
              className="form-input"
              value={formData.monthly_limit}
              onChange={e => setFormData({ ...formData, monthly_limit: e.target.value })}
              required
              min="0"
              step="100"
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
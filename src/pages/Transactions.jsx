import { useState } from 'react'
import { useTransactions, useCategories } from '../hooks/useData'
import { format } from 'date-fns'
import { IoAdd, IoTrash } from 'react-icons/io5'
import { 
  Utensils, FileText, Car, Home, Heart, 
  PlayCircle, Briefcase, ShoppingCart, Book, 
  MoreHorizontal, Wallet
} from 'lucide-react'

const ICONS = {
  Food: Utensils,
  Bills: FileText,
  Transport: Car,
  Housing: Home,
  Misc: MoreHorizontal,
  Salary: Wallet,
  Freelance: Briefcase,
  Business: Wallet,
  Others: MoreHorizontal
}

export const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions()
  const { categories } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('expense')

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

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => { setType('expense'); setShowModal(true) }}>
            <IoAdd /> Add Expense
          </button>
          <button className="btn btn-primary" onClick={() => { setType('income'); setShowModal(true) }}>
            <IoAdd /> Add Income
          </button>
        </div>
      </div>

      <div className="card">
        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions yet</h3>
            <p>Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map(t => (
              <div key={t.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-icon" style={{ display: 'flex' }}>{renderIcon(t.category)}</span>
                  <div className="transaction-details">
                    <h4>{t.category}{t.expense_type === 'recurring' && <span style={{ fontSize: '10px', background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Recurring</span>}</h4>
                    <p>{format(new Date(t.date), 'MMM d, yyyy')}{t.notes && ` • ${t.notes}`}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`transaction-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleDelete(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D63031', padding: '8px' }}
                  >
                    <IoTrash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal type={type} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}

const TransactionModal = ({ type, onClose }) => {
  const { addTransaction } = useTransactions()
  const { categories, addCategory } = useCategories()
  const [formData, setFormData] = useState({
    amount: '',
    category: type === 'expense' ? 'Food' : 'Salary',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    expense_type: 'one-time'
  })
  const [saving, setSaving] = useState(false)
  const [customSource, setCustomSource] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customCategory, setCustomCategory] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)

  const expenseCategories = categories?.expense || ['Food', 'Bills', 'Transport', 'Housing', 'Misc']
  const incomeSources = categories?.income || ['Salary', 'Freelance', 'Business', 'Others']

  const handleAddCustomSource = async () => {
    if (customSource.trim()) {
      setFormData({ ...formData, category: customSource.trim() })
      try {
        await addCategory(customSource.trim(), 'income')
      } catch (e) {}
      setCustomSource('')
      setShowCustomInput(false)
    }
  }

  const handleAddCustomCategory = async () => {
    if (customCategory.trim()) {
      setFormData({ ...formData, category: customCategory.trim() })
      try {
        await addCategory(customCategory.trim(), 'expense')
      } catch (e) {}
      setCustomCategory('')
      setShowCustomCategory(false)
    }
  }

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
            {type === 'income' ? (
              <>
                <select
                  className="form-select"
                  value={incomeSources.includes(formData.category) ? formData.category : (showCustomInput ? '__custom__' : formData.category)}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setShowCustomInput(true)
                    } else {
                      setFormData({ ...formData, category: e.target.value })
                      setShowCustomInput(false)
                    }
                  }}
                >
                  <option value="" disabled>Select source</option>
                  {incomeSources.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Add Custom Source</option>
                </select>
                {showCustomInput && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={customSource}
                      onChange={e => setCustomSource(e.target.value)}
                      placeholder="Enter custom source"
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddCustomSource}>Add</button>
                  </div>
                )}
                {!incomeSources.includes(formData.category) && formData.category && !showCustomInput && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#10b981' }}>
                    Custom: {formData.category} <button type="button" onClick={() => setFormData({ ...formData, category: 'Salary' })} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <select
                  className="form-select"
                  value={expenseCategories.includes(formData.category) ? formData.category : (showCustomCategory ? '__custom__' : formData.category)}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setShowCustomCategory(true)
                    } else {
                      setFormData({ ...formData, category: e.target.value })
                      setShowCustomCategory(false)
                    }
                  }}
                >
                  <option value="" disabled>Select category</option>
                  {expenseCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__custom__">+ Add Custom Category</option>
                </select>
                {showCustomCategory && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                    />
                    <button type="button" className="btn btn-secondary" onClick={handleAddCustomCategory}>Add</button>
                  </div>
                )}
                {!expenseCategories.includes(formData.category) && formData.category && !showCustomCategory && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#10b981' }}>
                    Custom: {formData.category} <button type="button" onClick={() => setFormData({ ...formData, category: 'Food' })} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>×</button>
                  </div>
                )}
              </>
            )}
          </div>
          {type === 'expense' && (
            <div className="form-group">
              <label className="form-label">Type</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="expense_type"
                    value="one-time"
                    checked={formData.expense_type === 'one-time'}
                    onChange={e => setFormData({ ...formData, expense_type: e.target.value })}
                  />
                  One-time
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="expense_type"
                    value="recurring"
                    checked={formData.expense_type === 'recurring'}
                    onChange={e => setFormData({ ...formData, expense_type: e.target.value })}
                  />
                  Recurring
                </label>
              </div>
            </div>
          )}
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
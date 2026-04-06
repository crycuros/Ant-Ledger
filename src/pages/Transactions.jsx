import { useState, useMemo } from 'react'
import { useTransactions, useCategories } from '../hooks/useData'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { IoAdd, IoTrash, IoPencil, IoFilter, IoClose } from 'react-icons/io5'
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
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    category: '',
    type: ''
  })
  const [editingTransaction, setEditingTransaction] = useState(null)

  const expenseCategories = categories?.expense || ['Food', 'Bills', 'Transport', 'Housing', 'Misc']
  const incomeSources = categories?.income || ['Salary', 'Freelance', 'Business', 'Others']
  const allCategories = [...expenseCategories, ...incomeSources]

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date)
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null
      
      if (fromDate && date < fromDate) return false
      if (toDate && date > toDate) return false
      if (filters.category && t.category !== filters.category) return false
      if (filters.type && t.type !== filters.type) return false
      
      return true
    })
  }, [transactions, filters])

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

  const handleEdit = (t) => {
    setEditingTransaction(t)
    setType(t.type)
    setShowModal(true)
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      dateTo: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      category: '',
      type: ''
    })
  }

  const hasActiveFilters = filters.category || filters.type || filters.dateFrom !== format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
            <IoFilter /> Filters {hasActiveFilters && <span style={{ background: '#ef4444', borderRadius: '50%', width: '8px', height: '8px', display: 'inline-block', marginLeft: '4px' }} />}
          </button>
          <button className="btn btn-primary" onClick={() => { setType('expense'); setEditingTransaction(null); setShowModal(true) }}>
            <IoAdd /> Add Expense
          </button>
          <button className="btn btn-primary" onClick={() => { setType('income'); setEditingTransaction(null); setShowModal(true) }}>
            <IoAdd /> Add Income
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'end' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Date From</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateFrom}
                onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Date To</label>
              <input
                type="date"
                className="form-input"
                value={filters.dateTo}
                onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {allCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', display: 'block' }}>Type</label>
              <select
                className="form-select"
                value={filters.type}
                onChange={e => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                style={{ 
                  padding: '8px 16px', 
                  background: '#f1f5f9', 
                  border: 'none', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <IoClose size={16} /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Income</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₱{totalIncome.toLocaleString()}</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Expenses</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>₱{totalExpense.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Try adjusting your filters or add a new transaction</p>
          </div>
        ) : (
          <div className="transaction-list">
            {filteredTransactions.map(t => (
              <div key={t.id} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-icon" style={{ display: 'flex' }}>{renderIcon(t.category)}</span>
                  <div className="transaction-details">
                    <h4>
                      {t.category}
                      {t.expense_type === 'recurring' && (
                        <span style={{ 
                          fontSize: '10px', 
                          background: '#8b5cf6', 
                          color: '#fff', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          marginLeft: '6px',
                          fontWeight: 'normal'
                        }}>
                          Recurring
                        </span>
                      )}
                    </h4>
                    <p>
                      {format(new Date(t.date), 'MMM d, yyyy')}
                      {t.notes && ` • ${t.notes}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className={`transaction-amount ${t.type}`}>
                    {t.type === 'income' ? '+' : '-'}₱{t.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleEdit(t)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px' }}
                  >
                    <IoPencil size={18} />
                  </button>
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
        <TransactionModal 
          type={type} 
          onClose={() => { setShowModal(false); setEditingTransaction(null) }}
          editData={editingTransaction}
        />
      )}
    </div>
  )
}

const TransactionModal = ({ type, onClose, editData }) => {
  const { addTransaction, updateTransaction } = useTransactions()
  const { categories, addCategory } = useCategories()
  const [formData, setFormData] = useState({
    amount: editData?.amount?.toString() || '',
    category: editData?.category || (type === 'expense' ? 'Food' : 'Salary'),
    date: editData?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: editData?.notes || '',
    expense_type: editData?.expense_type || 'one-time'
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
      if (editData) {
        await updateTransaction(editData.id, {
          ...formData,
          amount: parseFloat(formData.amount),
          type
        })
      } else {
        await addTransaction({
          ...formData,
          amount: parseFloat(formData.amount),
          type
        })
      }
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
          <h2 className="modal-title">{editData ? 'Edit' : 'Add'} {type === 'expense' ? 'Expense' : 'Income'}</h2>
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
            {saving ? 'Saving...' : (editData ? 'Update' : 'Add')} Transaction
          </button>
        </form>
      </div>
    </div>
  )
}
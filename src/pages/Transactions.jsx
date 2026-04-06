import { useState } from 'react'
import { useTransactions } from '../hooks/useData'
import { format } from 'date-fns'
import { IoAdd, IoTrash } from 'react-icons/io5'

export const Transactions = () => {
  const { transactions, deleteTransaction } = useTransactions()
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState('expense')

  const getCategoryIcon = (cat) => {
    const icons = { Food: '🍔', Bills: '📄', Transport: '🚗', Housing: '🏠', Misc: '📦', Salary: '💰', Freelance: '💼', Gift: '🎁', Other: '💵' }
    return icons[cat] || '📦'
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
                  <span className="transaction-icon">{getCategoryIcon(t.category)}</span>
                  <div className="transaction-details">
                    <h4>{t.category}</h4>
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
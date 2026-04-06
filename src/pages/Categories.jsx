import { useState } from 'react'
import { useCategories } from '../hooks/useData'
import { IoAdd, IoTrash, IoPencil } from 'react-icons/io5'
import { 
  Utensils, FileText, Car, Home, Heart, 
  PlayCircle, Briefcase, ShoppingCart, Book, 
  MoreHorizontal, Zap, Gift, Wallet, Plane, 
  Dumbbell, Scissors, Laptop, Coffee
} from 'lucide-react'

const ICONS = {
  Food: Utensils,
  Bills: FileText,
  Transport: Car,
  Housing: Home,
  Health: Heart,
  Entertainment: PlayCircle,
  Work: Briefcase,
  Shopping: ShoppingCart,
  Education: Book,
  Misc: MoreHorizontal,
  Salary: Wallet,
  Freelance: Briefcase,
  Business: Wallet,
  Others: MoreHorizontal,
  Pets: Heart,
  School: Book,
  Groceries: ShoppingCart,
  Coffee: Coffee,
  Transport: Car,
  Entertainment: PlayCircle,
  Subscription: PlayCircle,
  Gifts: Gift,
  Travel: Plane,
  Fitness: Dumbbell,
  Beauty: Scissors,
  Tech: Laptop,
  Utilities: Zap
}

const ICON_KEYS = Object.keys(ICONS)

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export const Categories = () => {
  const { categories, addCategory, deleteCategory, fetchCategories } = useCategories()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categoryType, setCategoryType] = useState('expense')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editName, setEditName] = useState('')
  const [newIcon, setNewIcon] = useState('Utensils')
  const [newColor, setNewColor] = useState('#f59e0b')
  const [editIcon, setEditIcon] = useState('')
  const [editColor, setEditColor] = useState('')

  const defaultExpenseCategories = ['Food', 'Bills', 'Transport', 'Housing', 'Misc']
  const defaultIncomeSources = ['Salary', 'Freelance', 'Business', 'Others']

  const customExpenseCategories = categories?.expense?.filter(c => !defaultExpenseCategories.includes(c)) || []
  const customIncomeCategories = categories?.income?.filter(c => !defaultIncomeSources.includes(c)) || []

  const getCategoryData = (name, type) => {
    if (!categories?.all) return null
    return categories.all.find(c => c.name === name && c.type === type)
  }

  const renderIcon = (iconName, size = 18, color = 'currentColor') => {
    const IconComponent = ICONS[iconName] || MoreHorizontal
    return <IconComponent size={size} color={color} />
  }

  const handleAdd = async () => {
    if (!newCategory.trim()) return
    try {
      await addCategory(newCategory.trim(), categoryType, newIcon, newColor)
      setNewCategory('')
      setNewIcon('Utensils')
      setNewColor('#f59e0b')
      setShowAddModal(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEdit = async (id) => {
    if (!editName.trim()) return
    try {
      const { supabase } = await import('../lib/supabase')
      await supabase.from('categories').update({ 
        name: editName.trim(),
        icon: editIcon || 'Utensils',
        color: editColor || '#f59e0b'
      }).eq('id', id)
      await fetchCategories()
      setEditingCategory(null)
      setEditName('')
      setEditIcon('')
      setEditColor('')
    } catch (err) {
      alert(err.message)
    }
  }

  const startEdit = (cat, type) => {
    const data = getCategoryData(cat, type)
    setEditingCategory(cat)
    setEditName(cat)
    setEditIcon(data?.icon || 'Utensils')
    setEditColor(data?.color || '#f59e0b')
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this category? Existing transactions will keep this category name.')) {
      try {
        await deleteCategory(id)
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const renderCustomCategories = (customList, type) => {
    if (!customList || customList.length === 0) {
      return <p style={{ color: '#94a3b8', fontSize: '14px' }}>No custom categories</p>
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {customList.map(cat => {
          const catData = getCategoryData(cat, type)
          return (
            <div key={cat} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '6px'
            }}>
              {editingCategory === cat ? (
                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={editIcon} onChange={e => setEditIcon(e.target.value)} style={{ padding: '4px' }}>
                    {ICON_KEYS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ padding: '4px 8px', width: 'auto', flex: 1 }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setEditColor(c)} style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', background: c, 
                        border: editColor === c ? '2px solid #000' : '1px solid #ddd', cursor: 'pointer' 
                      }} />
                    ))}
                  </div>
                  <button className="btn btn-secondary" onClick={() => handleEdit(catData?.id)} style={{ padding: '4px 8px' }}>Save</button>
                  <button onClick={() => { setEditingCategory(null); setEditName(''); setEditIcon(''); setEditColor('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>×</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', color: catData?.color || '#64748b' }}>
                      {renderIcon(catData?.icon || 'Utensils', 20)}
                    </span>
                    <span>{cat}</span>
                    {catData?.color && (
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: catData.color }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEdit(cat, type)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }}>
                      <IoPencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(catData?.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                      <IoTrash size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <IoAdd /> Add Category
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#10b981' }}>Expense Categories</h3>
          
          <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>BUILT-IN</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {defaultExpenseCategories.map(cat => (
              <span key={cat} style={{ 
                padding: '6px 12px', 
                background: '#f1f5f9', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {renderIcon(cat, 16, '#64748b')}
                {cat}
              </span>
            ))}
          </div>

          <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>CUSTOM</h4>
          {renderCustomCategories(customExpenseCategories, 'expense')}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '16px', color: '#f59e0b' }}>Income Sources</h3>
          
          <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>BUILT-IN</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {defaultIncomeSources.map(cat => (
              <span key={cat} style={{ 
                padding: '6px 12px', 
                background: '#f1f5f9', 
                borderRadius: '6px',
                fontSize: '14px',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {renderIcon(cat, 16, '#64748b')}
                {cat}
              </span>
            ))}
          </div>

          <h4 style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>CUSTOM</h4>
          {renderCustomCategories(customIncomeCategories, 'income')}
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Category</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={categoryType} onChange={e => setCategoryType(e.target.value)}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                className="form-input"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="e.g., Groceries"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                {ICON_KEYS.map(i => {
                  const IconComp = ICONS[i]
                  return (
                    <button 
                      key={i} 
                      onClick={() => setNewIcon(i)}
                      style={{ 
                        padding: '8px', 
                        borderRadius: '6px', 
                        border: newIcon === i ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        background: newIcon === i ? '#fef3c7' : '#fff',
                        cursor: 'pointer',
                        display: 'flex'
                      }}
                    >
                      <IconComp size={20} />
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{ 
                    width: '28px', height: '28px', borderRadius: '50%', background: c, 
                    border: newColor === c ? '3px solid #000' : '1px solid #ddd', cursor: 'pointer' 
                  }} />
                ))}
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
              Add Category
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
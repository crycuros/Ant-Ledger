import { useState, useEffect } from 'react'
import { useSubscriptions, useCategories } from '../hooks/useData'
import { format } from 'date-fns'
import { IoAdd, IoTrash, IoPencil, IoPlay, IoPause, IoSearch } from 'react-icons/io5'
import { CreditCard, Zap, Film, Headphones, ShoppingBag, Car, Home, Utensils, Dumbbell, Sparkles, Cloud, Globe, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'

const POPULAR_APPS = [
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'YouTube Premium', domain: 'youtube.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'HBO Max', domain: 'hbomax.com' },
  { name: 'Amazon Prime', domain: 'amazon.com' },
  { name: 'Apple Music', domain: 'apple.com' },
  { name: 'Google One', domain: 'google.com' },
  { name: 'iCloud', domain: 'icloud.com' },
  { name: 'Dropbox', domain: 'dropbox.com' },
  { name: 'Microsoft 365', domain: 'microsoft.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Zoom', domain: 'zoom.us' },
  { name: 'PlayStation Plus', domain: 'playstation.com' },
  { name: 'Xbox Game Pass', domain: 'xbox.com' },
  { name: 'Gym Membership', domain: null },
  { name: 'VPN Service', domain: null },
  { name: 'Mobile Data', domain: null },
  { name: 'Internet', domain: null },
  { name: 'Electric', domain: null },
  { name: 'Rent', domain: null },
]

const LOGO_DEV_KEY = 'pk_A3K1-sYYT3eQr3wWo6H-MA'

const getCachedIconUrl = async (appName, domain) => {
  if (!domain) return null
  
  const { data: existing } = await supabase
    .from('app_icons')
    .select('icon_url')
    .eq('name', appName)
    .maybeSingle()
  
  if (existing?.icon_url) {
    return existing.icon_url
  }
  
  const logoUrl = `https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=128&format=png&fit=true`
  
  await supabase
    .from('app_icons')
    .insert([{ name: appName, domain, icon_url: logoUrl }])
    .onConflict('name')
    .ignoreDuplicates()
  
  return logoUrl
}

const FALLBACK_ICONS = {
  Netflix: Film,
  Spotify: Headphones,
  YouTube: Film,
  Disney: Film,
  HBO: Film,
  Prime: ShoppingBag,
  AppleMusic: Headphones,
  Google: Cloud,
  iCloud: Cloud,
  Dropbox: Cloud,
  Microsoft: Smartphone,
  Notion: Globe,
  Slack: Globe,
  Zoom: Smartphone,
  PlayStation: Dumbbell,
  Xbox: Dumbbell,
  Gym: Dumbbell,
  VPN: Globe,
  Mobile: Smartphone,
  Internet: Globe,
  Electric: Zap,
  Rent: Home,
  Food: Utensils,
  AppleTV: Film,
  Hulu: Film,
  Paramount: Film,
  Default: CreditCard
}

const LogoImg = ({ appName, domain, size = 32, style = {} }) => {
  const [iconUrl, setIconUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!domain) return
    setLoading(true)
    getCachedIconUrl(appName, domain).then(url => {
      setIconUrl(url?.replace('size=128', `size=${size}`))
      setLoading(false)
    })
  }, [appName, domain, size])

  if (!domain) return null
  if (loading) return <div style={{ width: size, height: size, ...style }} />
  
  return (
    <img 
      src={iconUrl} 
      alt={appName}
      style={{ ...style, width: size, height: size, borderRadius: 6 }}
      onError={(e) => { e.target.style.display = 'none' }}
    />
  )
}

const FALLBACK_COLORS = {
  Netflix: '#E50914',
  Spotify: '#1DB954',
  YouTube: '#FF0000',
  Disney: '#113CCF',
  HBO: '#5822B4',
  Prime: '#00A8E1',
  AppleMusic: '#FA243C',
  Google: '#4285F4',
  iCloud: '#3693F3',
  Dropbox: '#0061FF',
  Microsoft: '#00A4EF',
  Notion: '#000000',
  Slack: '#4A154B',
  Zoom: '#2D8CFF',
  PlayStation: '#003791',
  Xbox: '#107C10',
  Gym: '#FF6B00',
  VPN: '#C53030',
  Mobile: '#38B2AC',
  Internet: '#3182CE',
  Electric: '#ECC94B',
  Rent: '#38A169',
  Food: '#ED8936',
  Default: '#6B7280'
}

export const Subscriptions = () => {
  const { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, processSubscriptions } = useSubscriptions()
  const { categories } = useCategories()
  const [showModal, setShowModal] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Default',
    iconColor: '#6B7280',
    iconUrl: '',
    amount: '',
    category: 'Bills',
    billing_cycle: 'monthly',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })

  const expenseCategories = categories?.expense || ['Food', 'Bills', 'Transport', 'Housing', 'Misc']

  const filteredApps = searchQuery.length > 0
    ? POPULAR_APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : POPULAR_APPS.slice(0, 12)

  const selectApp = async (app) => {
    const iconName = app.name.split(' ')[0]
    const iconUrl = app.domain ? await getCachedIconUrl(app.name, app.domain) : ''
    setFormData(prev => ({
      ...prev,
      name: app.name,
      icon: iconName,
      iconColor: FALLBACK_COLORS[iconName] || FALLBACK_COLORS['Default'],
      iconUrl
    }))
    setSearchQuery('')
  }

  const getAppIcon = (iconName, size = 20) => {
    const IconComp = FALLBACK_ICONS[iconName] || FALLBACK_ICONS['Default']
    return <IconComp size={size} />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSub) {
        await updateSubscription(editingSub.id, formData)
      } else {
        await addSubscription(formData)
      }
      setShowModal(false)
      resetForm()
    } catch (err) {
      alert(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      icon: 'Default',
      iconColor: '#6B7280',
      iconUrl: '',
      amount: '',
      category: 'Bills',
      billing_cycle: 'monthly',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      notes: ''
    })
    setSearchQuery('')
    setEditingSub(null)
  }

  const handleEdit = (sub) => {
    setEditingSub(sub)
    setFormData({
      name: sub.name,
      icon: sub.icon || 'Default',
      iconColor: sub.icon_color || '#6B7280',
      iconUrl: sub.icon_url || '',
      amount: sub.amount.toString(),
      category: sub.category,
      billing_cycle: sub.billing_cycle,
      start_date: sub.start_date,
      notes: sub.notes || ''
    })
    setShowModal(true)
  }

  const handleToggleStatus = async (sub) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active'
    await updateSubscription(sub.id, { status: newStatus })
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this subscription?')) {
      await deleteSubscription(id)
    }
  }

  const handleProcessNow = async () => {
    const processed = await processSubscriptions()
    if (processed && processed.length > 0) {
      alert(`Created expenses for: ${processed.join(', ')}`)
    } else {
      alert('No subscriptions due for billing today')
    }
  }

  const getCycleLabel = (cycle) => {
    const labels = { weekly: '/week', monthly: '/month', yearly: '/year' }
    return labels[cycle] || '/month'
  }

  const activeCount = subscriptions.filter(s => s.status === 'active').length
  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.billing_cycle === 'weekly') return sum + (s.amount * 4.33)
      if (s.billing_cycle === 'yearly') return sum + (s.amount / 12)
      return sum + s.amount
    }, 0)

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscriptions</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={handleProcessNow}>
            <Zap size={18} /> Process Due
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <IoAdd /> Add Subscription
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{subscriptions.length}</div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Total Subscriptions</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{activeCount}</div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Active</div>
        </div>
        <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>₱{totalMonthly.toLocaleString()}</div>
          <div style={{ color: '#64748b', fontSize: '14px' }}>Est. Monthly</div>
        </div>
      </div>

      <div className="card">
        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <h3>No subscriptions yet</h3>
            <p>Add your first recurring expense</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subscriptions.map(sub => (
              <div key={sub.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                borderLeft: `4px solid ${sub.status === 'active' ? '#10b981' : '#f59e0b'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sub.icon_url ? (
                    <img 
                      src={sub.icon_url} 
                      alt={sub.name}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px',
                        objectFit: 'contain',
                        background: '#fff',
                        padding: '4px'
                      }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '40px',
                      height: '40px',
                      padding: '8px', 
                      background: sub.icon_color || '#6B7280', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      {getAppIcon(sub.icon, 20)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{sub.name}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {sub.category} • Next: {format(new Date(sub.next_billing_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>₱{sub.amount.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{getCycleLabel(sub.billing_cycle)}</div>
                  </div>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    background: sub.status === 'active' ? '#d1fae5' : '#fef3c7',
                    color: sub.status === 'active' ? '#065f46' : '#92400e'
                  }}>
                    {sub.status}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleToggleStatus(sub)} style={{ 
                      background: 'none', border: 'none', cursor: 'pointer', 
                      color: sub.status === 'active' ? '#f59e0b' : '#10b981',
                      padding: '8px'
                    }}>
                      {sub.status === 'active' ? <IoPause size={18} /> : <IoPlay size={18} />}
                    </button>
                    <button onClick={() => handleEdit(sub)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '8px' }}>
                      <IoPencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px' }}>
                      <IoTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm() }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingSub ? 'Edit Subscription' : 'Add Subscription'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm() }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ position: 'relative', zIndex: 50 }}>
                <label className="form-label">Search App (auto-fetches logo)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Type to search apps..."
                    autoComplete="off"
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8' }}>
                    <IoSearch size={18} />
                  </div>
                </div>
                
                {searchQuery.length > 0 && filteredApps.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '280px',
                    overflowY: 'auto',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginTop: '4px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                  }}>
                    {filteredApps.map(app => {
                      const iconName = app.name.split(' ')[0]
                      return (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => selectApp(app)}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <LogoImg appName={app.name} domain={app.domain} size={32} />
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '6px', 
                            background: FALLBACK_COLORS[iconName] || FALLBACK_COLORS['Default'],
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}>
                            {getAppIcon(iconName, 16)}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>{app.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Selected Icon</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                  {formData.iconUrl ? (
                    <img 
                      src={formData.iconUrl} 
                      alt="Selected"
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'contain', background: '#fff' }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '8px', 
                      background: formData.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}>
                      {getAppIcon(formData.icon, 24)}
                    </div>
                  )}
                  <span style={{ fontSize: '14px', color: '#64748b' }}>{formData.name || 'No app selected'}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Billing Cycle</label>
                <select
                  className="form-select"
                  value={formData.billing_cycle}
                  onChange={e => setFormData({ ...formData, billing_cycle: e.target.value })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
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
                  placeholder="Additional notes..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingSub ? 'Update' : 'Add'} Subscription
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
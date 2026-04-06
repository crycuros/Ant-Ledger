import { useState, useEffect } from 'react'
import { useSubscriptions, useCategories } from '../hooks/useData'
import { format } from 'date-fns'
import { IoAdd, IoTrash, IoPencil, IoPlay, IoPause, IoSearch } from 'react-icons/io5'
import { CreditCard, Zap, Film, Headphones, ShoppingBag, Car, Home, Utensils, Dumbbell, Sparkles, Cloud, Globe, Smartphone } from 'lucide-react'
import { supabase } from '../lib/supabase'

const POPULAR_APPS = [
  // Streaming & Entertainment
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Amazon Prime Video', domain: 'amazon.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'HBO Max', domain: 'hbomax.com' },
  { name: 'Hulu', domain: 'hulu.com' },
  { name: 'Paramount+', domain: 'paramountplus.com' },
  { name: 'Peacock', domain: 'peacocktv.com' },
  { name: 'Apple TV+', domain: 'apple.com' },
  { name: 'YouTube Premium', domain: 'youtube.com' },
  { name: 'Crunchyroll', domain: 'crunchyroll.com' },
  { name: 'DAZN', domain: 'dazn.com' },
  { name: 'ESPN+', domain: 'espn.com' },
  { name: 'Discovery+', domain: 'discoveryplus.com' },
  { name: 'Sling TV', domain: 'sling.com' },
  { name: 'Tubi', domain: 'tubi.tv' },
  { name: 'Roku Channel', domain: 'roku.com' },
  { name: 'Starz', domain: 'starz.com' },
  { name: 'Showtime', domain: 'showtime.com' },
  { name: 'Hayu', domain: 'hayu.com' },
  { name: 'Pluto TV', domain: 'plutotv.com' },
  { name: 'Mubi', domain: 'mubi.com' },
  { name: 'Acorn TV', domain: 'acorn.tv' },
  { name: 'Curiosity Stream', domain: 'curiositystream.com' },
  { name: 'Shudder', domain: 'shudder.com' },
  { name: 'BritBox', domain: 'britbox.com' },
  { name: 'FuboTV', domain: 'fubo.tv' },
  
  // Music & Audio
  { name: 'Spotify Premium', domain: 'spotify.com' },
  { name: 'Apple Music', domain: 'apple.com' },
  { name: 'Amazon Music', domain: 'amazon.com' },
  { name: 'Deezer', domain: 'deezer.com' },
  { name: 'Tidal', domain: 'tidal.com' },
  { name: 'YouTube Music', domain: 'music.youtube.com' },
  { name: 'SoundCloud Go+', domain: 'soundcloud.com' },
  { name: 'Pandora Premium', domain: 'pandora.com' },
  { name: 'Audible', domain: 'audible.com' },
  
  // Productivity & SaaS
  { name: 'Microsoft 365', domain: 'microsoft.com' },
  { name: 'Google Workspace', domain: 'workspace.google.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Zoom Pro', domain: 'zoom.us' },
  { name: 'Asana Premium', domain: 'asana.com' },
  { name: 'Trello Premium', domain: 'trello.com' },
  { name: 'Evernote', domain: 'evernote.com' },
  { name: 'Dropbox', domain: 'dropbox.com' },
  { name: 'Adobe Creative Cloud', domain: 'adobe.com' },
  { name: 'Canva Pro', domain: 'canva.com' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'GitHub Pro', domain: 'github.com' },
  { name: 'Salesforce', domain: 'salesforce.com' },
  { name: 'HubSpot', domain: 'hubspot.com' },
  { name: 'Jira', domain: 'atlassian.com' },
  { name: 'Confluence', domain: 'atlassian.com' },
  { name: 'Monday.com', domain: 'monday.com' },
  { name: 'Webflow', domain: 'webflow.com' },
  
  // Cloud Storage & Backup
  { name: 'Google One', domain: 'google.com' },
  { name: 'iCloud+', domain: 'icloud.com' },
  { name: 'OneDrive', domain: 'microsoft.com' },
  { name: 'Backblaze', domain: 'backblaze.com' },
  { name: 'pCloud', domain: 'pcloud.com' },
  { name: 'Box', domain: 'box.com' },
  { name: 'Sync.com', domain: 'sync.com' },
  
  // AI & Developer Tools
  { name: 'ChatGPT Plus', domain: 'openai.com' },
  { name: 'GitHub Copilot', domain: 'github.com' },
  { name: 'Replit', domain: 'replit.com' },
  
  // Mobile App Premiums
  { name: 'Telegram Premium', domain: 'telegram.org' },
  { name: 'Snapchat+', domain: 'snapchat.com' },
  { name: 'Reddit Premium', domain: 'reddit.com' },
  { name: 'LinkedIn Premium', domain: 'linkedin.com' },
  { name: 'Strava Premium', domain: 'strava.com' },
  { name: 'Calm', domain: 'calm.com' },
  { name: 'Headspace', domain: 'headspace.com' },
  { name: 'MyFitnessPal Premium', domain: 'myfitnesspal.com' },
  { name: 'Duolingo Plus', domain: 'duolingo.com' },
  { name: 'Tinder Plus', domain: 'tinder.com' },
  { name: 'Bumble Boost', domain: 'bumble.com' },
  { name: 'Fitbod', domain: 'fitbod.me' },
  { name: 'Peloton', domain: 'peloton.com' },
  
  // Shopping & Delivery
  { name: 'Amazon Subscribe & Save', domain: 'amazon.com' },
  { name: 'Instacart+', domain: 'instacart.com' },
  { name: 'HelloFresh', domain: 'hellofresh.com' },
  { name: 'Blue Apron', domain: 'blueapron.com' },
  { name: 'Dollar Shave Club', domain: 'dollarshaveclub.com' },
  { name: 'Birchbox', domain: 'birchbox.com' },
  
  // Security & Privacy
  { name: 'NordVPN', domain: 'nordvpn.com' },
  { name: 'ExpressVPN', domain: 'expressvpn.com' },
  { name: 'Surfshark', domain: 'surfshark.com' },
  { name: 'Proton VPN', domain: 'protonvpn.com' },
  { name: '1Password', domain: '1password.com' },
  { name: 'LastPass', domain: 'lastpass.com' },
  { name: 'Dashlane', domain: 'dashlane.com' },
  { name: 'Bitdefender', domain: 'bitdefender.com' },
  { name: 'McAfee', domain: 'mcafee.com' },
  { name: 'Norton', domain: 'norton.com' },
  
  // News & Content
  { name: 'New York Times', domain: 'nytimes.com' },
  { name: 'Washington Post', domain: 'washingtonpost.com' },
  { name: 'The Guardian', domain: 'theguardian.com' },
  { name: 'Wall Street Journal', domain: 'wsj.com' },
  { name: 'The Economist', domain: 'economist.com' },
  { name: 'Medium', domain: 'medium.com' },
  { name: 'Bloomberg', domain: 'bloomberg.com' },
  
  // Gaming
  { name: 'Xbox Game Pass', domain: 'xbox.com' },
  { name: 'PlayStation Plus', domain: 'playstation.com' },
  { name: 'Nintendo Switch Online', domain: 'nintendo.com' },
  { name: 'EA Play', domain: 'ea.com' },
  { name: 'GeForce Now', domain: 'nvidia.com' },
  { name: 'Apple Arcade', domain: 'apple.com' },
  { name: 'Google Play Pass', domain: 'play.google.com' },
  
  // Other
  { name: 'Gym Membership', domain: null },
  { name: 'VPN Service', domain: null },
  { name: 'Mobile Data', domain: null },
  { name: 'Internet', domain: null },
  { name: 'Electric', domain: null },
  { name: 'Rent', domain: null },
]

const LOGO_DEV_KEY = import.meta.env.VITE_LOGO_DEV_KEY || 'pk_A3K1-sYYT3eQr3wWo6H-MA'

const getLogoUrl = (domain, size = 128) => {
  if (!domain) return null
  return `https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=${size}&format=png`
}

const FALLBACK_ICONS = {
  // Streaming
  Netflix: Film, Hulu: Film, Disney: Film, HBO: Film, Paramount: Film,
  Peacock: Film, AppleTV: Film, Crunchyroll: Film, Starz: Film,
  Showtime: Film, Mubi: Film, Shudder: Film, Tubi: Film,
  PlutoTV: Film, Hayu: Film, BritBox: Film, AcornTV: Film,
  CuriosityStream: Film, FuboTV: Film, SlingTV: Film, DAZN: Film,
  ESPN: Film, Discovery: Film,
  
  // Music
  Spotify: Headphones, AppleMusic: Headphones, AmazonMusic: Headphones,
  Deezer: Headphones, Tidal: Headphones, YouTubeMusic: Headphones,
  SoundCloud: Headphones, Pandora: Headphones, Audible: Headphones,
  
  // Productivity
  Notion: Globe, Slack: Globe, Zoom: Smartphone, Asana: Globe,
  Trello: Globe, Evernote: Globe, Microsoft: Smartphone,
  Google: Cloud, Dropbox: Cloud, Adobe: Globe, Canva: Globe,
  Figma: Globe, GitHub: Globe, Salesforce: Globe, HubSpot: Globe,
  Jira: Globe, Confluence: Globe, Monday: Globe, Webflow: Globe,
  
  // Cloud
  GoogleOne: Cloud, iCloud: Cloud, OneDrive: Cloud, Backblaze: Cloud,
  pCloud: Cloud, Box: Cloud, Sync: Cloud,
  
  // Mobile
  Telegram: Smartphone, Snapchat: Smartphone, Reddit: Globe,
  LinkedIn: Globe, Strava: Dumbbell, Calm: Dumbbell, Headspace: Dumbbell,
  MyFitnessPal: Dumbbell, Duolingo: Globe, Tinder: Globe,
  Bumble: Globe, Fitbod: Dumbbell, Peloton: Dumbbell,
  
  // Shopping
  Amazon: ShoppingBag, Instacart: ShoppingBag, HelloFresh: Utensils,
  BlueApron: Utensils, DollarShaveClub: ShoppingBag, Birchbox: ShoppingBag,
  
  // Security
  NordVPN: Globe, ExpressVPN: Globe, Surfshark: Globe, ProtonVPN: Globe,
  OnePassword: Globe, LastPass: Globe, Dashlane: Globe,
  Bitdefender: Globe, McAfee: Globe, Norton: Globe,
  
  // News
  NYT: Globe, WashingtonPost: Globe, Guardian: Globe, WSJ: Globe,
  Economist: Globe, Medium: Globe, Bloomberg: Globe,
  
  // Gaming
  PlayStation: Dumbbell, Xbox: Dumbbell, Nintendo: Dumbbell,
  EA: Dumbbell, GeForceNow: Dumbbell, AppleArcade: Dumbbell,
  
  // Others
  Gym: Dumbbell, VPN: Globe, Mobile: Smartphone, Internet: Globe,
  Electric: Zap, Rent: Home, Food: Utensils, Default: CreditCard
}

const getAppIconKey = (name) => name.replace(/\s+/g, '')

const LogoImg = ({ appName, domain, size = 32, style = {} }) => {
  const iconKey = getAppIconKey(appName)
  const fallbackIcon = FALLBACK_ICONS[iconKey] || FALLBACK_ICONS['Default']
  const fallbackColor = FALLBACK_COLORS[iconKey] || FALLBACK_COLORS['Default']
  const [imgError, setImgError] = useState(false)

  if (!domain || imgError) {
    return (
      <div style={{ 
        width: size, height: size, 
        borderRadius: 6, background: fallbackColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...style 
      }}>
        {fallbackIcon && <fallbackIcon size={size * 0.6} color="#fff" />}
      </div>
    )
  }

  return (
    <img 
      src={getLogoUrl(domain, size)} 
      alt={appName}
      style={{ ...style, width: size, height: size, borderRadius: 6 }}
      onError={() => setImgError(true)}
    />
  )
}

const FALLBACK_COLORS = {
  // Streaming
  Netflix: '#E50914', Hulu: '#1CE783', Disney: '#113CCF', HBO: '#5822B4',
  Paramount: '#0064FF', Peacock: '#000000', AppleTV: '#000000', Crunchyroll: '#F47521',
  Starz: '#8B5CF6', Showtime: '#E60000', Mubi: '#8B5CF6', Shudder: '#8B5CF6',
  Tubi: '#FF6F3C', PlutoTV: '#FF6F3C', Hayu: '#8B5CF6', BritBox: '#8B5CF6',
  AcornTV: '#8B5CF6', FuboTV: '#FF6F3C', SlingTV: '#FF6F3C', DAZN: '#FF6F3C',
  ESPN: '#D40000', Discovery: '#FF6F3C',
  
  // Music
  Spotify: '#1DB954', AppleMusic: '#FA243C', AmazonMusic: '#00A8E1',
  Deezer: '#FEAA2D', Tidal: '#000000', YouTubeMusic: '#FF0000',
  SoundCloud: '#FF5500', Pandora: '#224099', Audible: '#F79232',
  
  // Productivity
  Notion: '#000000', Slack: '#4A154B', Zoom: '#2D8CFF', Asana: '#F06A6A',
  Trello: '#0079BF', Evernote: '#2DBC60', Microsoft: '#00A4EF',
  Google: '#4285F4', Dropbox: '#0061FF', Adobe: '#FF0000',
  Canva: '#00C4CC', Figma: '#F24E1E', GitHub: '#181717',
  Salesforce: '#00A1E0', HubSpot: '#FF7A59', Jira: '#0052CC',
  Confluence: '#0052CC', Monday: '#FF3D57', Webflow: '#4353FF',
  
  // Cloud
  GoogleOne: '#4285F4', iCloud: '#3693F3', OneDrive: '#0078D4',
  Backblaze: '#E53935', pCloud: '#4A90D9', Box: '#0061D5', Sync: '#0078D4',
  
  // Mobile
  Telegram: '#229ED9', Snapchat: '#FFFC00', Reddit: '#FF4500',
  LinkedIn: '#0A66C2', Strava: '#FC4C02', Calm: '#7F72F7',
  Headspace: '#F47D31', MyFitnessPal: '#0066CC', Duolingo: '#58CC02',
  Tinder: '#FE3C72', Bumble: '#FFBE0B', Fitbod: '#FF6B00', Peloton: '#D60017',
  
  // Shopping
  Amazon: '#FF9900', Instacart: '#43B02A', HelloFresh: '#06C167',
  BlueApron: '#0795E8', DollarShaveClub: '#FF6F3C', Birchbox: '#FF6F3C',
  
  // Security
  NordVPN: '#4687FF', ExpressVPN: '#DA3940', Surfshark: '#2A628F',
  ProtonVPN: '#6D4AFF', OnePassword: '#0094F5', LastPass: '#D32D27',
  Dashlane: '#007C97', Bitdefender: '#E53935', McAfee: '#D83B01', Norton: '#FF6B00',
  
  // News
  NYT: '#000000', WashingtonPost: '#231F20', Guardian: '#052962',
  WSJ: '#0080C3', Economist: '#E3120B', Medium: '#000000', Bloomberg: '#2800FF',
  
  // Gaming
  PlayStation: '#003791', Xbox: '#107C10', Nintendo: '#E60012',
  EA: '#000000', GeForceNow: '#76B900', AppleArcade: '#000000',
  
  // Others
  Gym: '#FF6B00', VPN: '#C53030', Mobile: '#38B2AC', Internet: '#3182CE',
  Electric: '#ECC94B', Rent: '#38A169', Food: '#ED8936', Default: '#6B7280'
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

  const selectApp = (app) => {
    const iconKey = app.name.replace(/\s+/g, '')
    const iconUrl = app.domain ? getLogoUrl(app.domain, 128) : ''
    setFormData(prev => ({
      ...prev,
      name: app.name,
      icon: iconKey,
      iconColor: FALLBACK_COLORS[iconKey] || FALLBACK_COLORS['Default'],
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
                      const iconKey = getAppIconKey(app.name)
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
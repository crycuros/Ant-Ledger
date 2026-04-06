import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IoWallet, IoPieChart, IoNotifications, IoDownload, IoTrendingUp, IoShield, IoClose, IoFlashlight } from 'react-icons/io5'
import { GiAnt } from 'react-icons/gi'

const featureTips = {
  'Track Expenses & Income': [
    "Record every purchase immediately - memory fades but data stays",
    "Use consistent categories to track spending patterns",
    "Add notes to transactions for context (e.g., 'Business lunch with client')",
    "Review weekly to catch unexpected expenses early"
  ],
  'Visual Reports': [
    "Check weekly trends to spot unusual spending",
    "Compare month-to-month to measure progress",
    "Pie charts reveal where most money goes",
    "Line charts help predict future expenses"
  ],
  'Budget Goals': [
    "Start with 50/30/20 rule: 50% needs, 30% wants, 20% savings",
    "Set realistic limits based on past spending",
    "Review and adjust budgets monthly",
    "Allocate extra income to savings before spending"
  ],
  'Smart Alerts': [
    "Set alerts at 80% of budget - early warning beats overspending",
    "Low balance alerts help avoid declined payments",
    "Bill reminders prevent late fees and interest",
    "Customize alert thresholds to your comfort level"
  ],
  'Export Data': [
    "Export monthly for tax documentation",
    "Keep backups of annual summaries",
    "CSV works with Excel, Google Sheets, and more",
    "Export before making major financial decisions"
  ],
  'Secure & Private': [
    "Your data is encrypted at rest and in transit",
    "Only you can see your financial information",
    "Supabase uses enterprise-grade security",
    "No ads or data selling - ever"
  ]
}

export const Landing = () => {
  const [selectedTip, setSelectedTip] = useState(null)

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">
          <GiAnt style={{ fontSize: '28px', color: '#f59e0b' }} />
          AntLedger
        </div>
        <Link to="/auth" className="btn btn-primary">Get Started</Link>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Track Your Finances with <span className="highlight">Ant Precision</span></h1>
          <p>Monitor income, expenses, budgets and savings. Make smarter financial decisions with clear insights and powerful reports.</p>
          <Link to="/auth" className="btn btn-primary btn-lg">Start Free Now</Link>
        </div>
        
        <div className="hero-clock-wrapper">
          <div className="hero-clock-label">Time is Money</div>
          <ClockWidget />
        </div>
      </section>

      <section className="features">
        <h2>Everything You Need to Manage Money</h2>
        <div className="features-grid">
          {Object.entries(featureTips).map(([title, tips], index) => {
            const icons = [IoWallet, IoPieChart, IoTrendingUp, IoNotifications, IoDownload, IoShield]
            const Icon = icons[index]
            return (
              <div 
                key={title} 
                className="feature-card"
                onClick={() => setSelectedTip({ title, tips })}
              >
                <Icon className="feature-icon" />
                <h3>{title}</h3>
                <p>Click for tips →</p>
              </div>
            )
          })}
        </div>
      </section>

      {selectedTip && (
        <TipModal title={selectedTip.title} tips={selectedTip.tips} onClose={() => setSelectedTip(null)} />
      )}

      <footer className="landing-footer">
        <p><GiAnt style={{ marginRight: '8px', color: '#f59e0b' }} />AntLedger - Smart Personal Finance Tracker</p>
      </footer>
    </div>
  )
}

const TipModal = ({ title, tips, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoFlashlight style={{ color: 'var(--secondary)' }} /> {title}
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tips.map((tip, i) => (
            <li key={i} style={{ 
              padding: '14px 16px', 
              background: 'var(--background-alt)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              lineHeight: '1.5',
              borderLeft: '3px solid var(--secondary)'
            }}>
              {tip}
            </li>
          ))}
        </ul>
        <button 
          onClick={onClose} 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '20px' }}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

const ClockWidget = () => {
  const [time, setTime] = useState(new Date())
  const [showDigital, setShowDigital] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = time.getSeconds() + time.getMilliseconds() / 1000
  const minutes = time.getMinutes() + seconds / 60
  const hours = (time.getHours() % 12) + minutes / 60

  const secDeg = seconds * 6
  const minDeg = minutes * 6
  const hourDeg = hours * 30

  const formatTime = (d) => {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    const s = d.getSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  return (
    <div 
      className="hero-clock"
      onClick={() => setShowDigital(!showDigital)}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '50%',
        width: '200px',
        height: '200px',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.7); }
        }
      `}</style>
      
      {!showDigital ? (
        <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', position: 'absolute' }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <line key={i} x1="100" y1="20" x2="100" y2={i % 3 === 0 ? 35 : 28} 
              transform={`rotate(${deg} 100 100)`} stroke="rgba(255,255,255,0.5)" strokeWidth={i % 3 === 0 ? 2 : 1} />
          ))}
          <line x1="100" y1="100" x2="100" y2="55" transform={`rotate(${hourDeg} 100 100)`} 
            stroke="#fff" strokeWidth="5" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
          <line x1="100" y1="100" x2="100" y2="35" transform={`rotate(${minDeg} 100 100)`} 
            stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
          <line x1="100" y1="100" x2="100" y2="28" transform={`rotate(${secDeg} 100 100)`} 
            stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
          <circle cx="100" cy="100" r="8" fill="#fff" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
        </svg>
      ) : (
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #fff 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))'
          }}>
            {formatTime(time)}
          </div>
          <div style={{ 
            color: '#f59e0b', 
            fontSize: '12px', 
            letterSpacing: '2px',
            marginTop: '6px'
          }}>
            {formatDate(time)}
          </div>
        </div>
      )}
    </div>
  )
}
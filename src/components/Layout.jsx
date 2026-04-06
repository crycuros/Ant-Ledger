import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { IoHome, IoReceipt, IoPieChart, IoWallet, IoSettings, IoLogOut, IoTime, IoList } from 'react-icons/io5'
import { GiAnt } from 'react-icons/gi'

export const Layout = () => {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const { timeFormat, updateTimeFormat } = useSettings()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const toggleTimeFormat = () => {
    updateTimeFormat(timeFormat === '12hr' ? '24hr' : '12hr')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <GiAnt style={{ fontSize: '28px', color: '#f59e0b' }} />
          AntLedger
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IoHome size={20} /> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IoReceipt size={20} /> Transactions
          </NavLink>
          <NavLink to="/budgets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IoWallet size={20} /> Budgets
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IoPieChart size={20} /> Reports
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <IoList size={20} /> Categories
          </NavLink>
          <button onClick={toggleTimeFormat} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <IoTime size={20} /> {timeFormat === '12hr' ? '12 Hour' : '24 Hour'}
          </button>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
          <button onClick={handleSignOut} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
            <IoLogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
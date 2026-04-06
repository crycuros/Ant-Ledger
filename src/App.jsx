import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { ToastProvider } from './components/Toast'
import { Auth } from './pages/Auth'
import { Landing } from './pages/Landing'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Budgets } from './pages/Budgets'
import { Reports } from './pages/Reports'
import { Categories } from './pages/Categories'
import { Subscriptions } from './pages/Subscriptions'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/landing" />
  }
  
  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="reports" element={<Reports />} />
        <Route path="categories" element={<Categories />} />
        <Route path="subscriptions" element={<Subscriptions />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
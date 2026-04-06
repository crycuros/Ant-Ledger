import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SettingsContext = createContext({})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth()
  const [timeFormat, setTimeFormat] = useState('24hr')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setTimeFormat('24hr')
        setLoading(false)
        return
      }
      
      setLoading(true)
      const { data, error } = await supabase
        .from('user_settings')
        .select('time_format')
        .eq('user_id', user.id)
        .single()
      
      if (!error && data) {
        setTimeFormat(data.time_format || '24hr')
      }
      setLoading(false)
    }

    fetchSettings()
  }, [user])

  const updateTimeFormat = async (newFormat) => {
    if (!user) return
    
    setTimeFormat(newFormat)
    const { error } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, time_format: newFormat }, { onConflict: 'user_id' })
    
    if (error) {
      console.error('Error updating settings:', error)
    }
  }

  return (
    <SettingsContext.Provider value={{ timeFormat, updateTimeFormat, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}
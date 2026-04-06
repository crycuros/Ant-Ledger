import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SettingsContext = createContext({})

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth()
  const [timeFormat, setTimeFormat] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('timeFormat') || '24hr'
    }
    return '24hr'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setTimeFormat(localStorage.getItem('timeFormat') || '24hr')
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('time_format')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (!error && data) {
          setTimeFormat(data.time_format || '24hr')
          localStorage.setItem('timeFormat', data.time_format || '24hr')
        }
      } catch (err) {
        console.log('Settings fetch error (using localStorage fallback):', err)
      }
      setLoading(false)
    }

    fetchSettings()
  }, [user])

  const updateTimeFormat = async (newFormat) => {
    setTimeFormat(newFormat)
    localStorage.setItem('timeFormat', newFormat)
    
    if (!user) return
    
    try {
      await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, time_format: newFormat }, { onConflict: 'user_id' })
    } catch (err) {
      console.log('Settings update error (local only):', err)
    }
  }

  return (
    <SettingsContext.Provider value={{ timeFormat, updateTimeFormat, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}
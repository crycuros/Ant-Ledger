import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { addDays, addMonths, addWeeks, addYears, format } from 'date-fns'

export const useTransactions = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    
    if (!error) setTransactions(data)
    setLoading(false)
  }

  const addTransaction = async (transaction) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, user_id: user.id }])
      .select()
    
    if (error) throw error
    setTransactions(prev => [data[0], ...prev])
    return data[0]
  }

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    await fetchTransactions()
    return data[0]
  }

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  useEffect(() => {
    fetchTransactions()
  }, [user])

  return { transactions, loading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction }
}

export const useBudgets = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])

  const fetchBudgets = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
    
    if (!error) setBudgets(data)
  }

  const setBudget = async (budget) => {
    const { data, error } = await supabase
      .from('budgets')
      .upsert([{ ...budget, user_id: user.id }], { onConflict: 'user_id,category,month' })
      .select()
    
    if (error) throw error
    await fetchBudgets()
    return data
  }

  useEffect(() => {
    fetchBudgets()
  }, [user])

  return { budgets, fetchBudgets, setBudget }
}

export const useCategories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState({ expense: [], income: [] })

  const defaultExpenseCategories = ['Food', 'Bills', 'Transport', 'Housing', 'Misc']
  const defaultIncomeSources = ['Salary', 'Freelance', 'Business', 'Others']

  const fetchCategories = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
    
    if (!error) {
      const customCats = data || []
      setCategories({
        expense: [...defaultExpenseCategories, ...customCats.filter(c => c.type === 'expense').map(c => c.name)],
        income: [...defaultIncomeSources, ...customCats.filter(c => c.type === 'income').map(c => c.name)],
        all: customCats
      })
    }
  }

  const addCategory = async (name, type, icon = 'Utensils', color = '#f59e0b') => {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, icon, color, user_id: user.id, is_custom: true, type }])
      .select()
    
    if (error) throw error
    await fetchCategories()
    return data[0]
  }

  const deleteCategory = async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    await fetchCategories()
  }

  useEffect(() => {
    fetchCategories()
  }, [user])

  return { categories, addCategory, deleteCategory, fetchCategories }
}

export const useSubscriptions = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  const calculateNextBillingDate = (currentDate, cycle) => {
    const date = new Date(currentDate)
    switch (cycle) {
      case 'weekly': return addWeeks(date, 1)
      case 'monthly': return addMonths(date, 1)
      case 'yearly': return addYears(date, 1)
      default: return addMonths(date, 1)
    }
  }

  const fetchSubscriptions = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('next_billing_date', { ascending: true })
    
    if (!error) setSubscriptions(data)
    setLoading(false)
  }

  const addSubscription = async (subscription) => {
    const nextBilling = calculateNextBillingDate(subscription.start_date || new Date(), subscription.billing_cycle)
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{ 
        ...subscription, 
        user_id: user.id,
        next_billing_date: format(nextBilling, 'yyyy-MM-dd'),
        status: 'active'
      }])
      .select()
    
    if (error) throw error
    setSubscriptions(prev => [...prev, data[0]])
    return data[0]
  }

  const updateSubscription = async (id, updates) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    await fetchSubscriptions()
    return data[0]
  }

  const deleteSubscription = async (id) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    setSubscriptions(prev => prev.filter(s => s.id !== id))
  }

  const processSubscriptions = async () => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const activeSubs = subscriptions.filter(s => s.status === 'active')
    const expenses = []
    
    for (const sub of activeSubs) {
      const billingDate = new Date(sub.next_billing_date)
      billingDate.setHours(0, 0, 0, 0)
      
      if (billingDate <= today) {
        await addTransaction({
          type: 'expense',
          amount: sub.amount,
          category: sub.category,
          date: format(new Date(), 'yyyy-MM-dd'),
          notes: `Auto-generated: ${sub.name}`,
          expense_type: 'recurring'
        })
        
        const nextDate = calculateNextBillingDate(sub.next_billing_date, sub.billing_cycle)
        await updateSubscription(sub.id, {
          next_billing_date: format(nextDate, 'yyyy-MM-dd')
        })
        
        expenses.push(sub.name)
      }
    }
    
    return expenses
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [user])

  return { subscriptions, loading, fetchSubscriptions, addSubscription, updateSubscription, deleteSubscription, processSubscriptions }
}
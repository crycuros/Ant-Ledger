import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

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

  return { transactions, loading, fetchTransactions, addTransaction, deleteTransaction }
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
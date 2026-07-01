import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useOperators() {
  const [activeOperators, setActiveOperators] = useState<string[]>([])

  useEffect(() => {
    const fetchOperators = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, status')
        .in('status', ['active', 'pending'])
        .order('full_name')
      if (data) setActiveOperators(data.map((d) => d.full_name))
    }
    fetchOperators()
  }, [])

  const formatOperator = (name: string) => {
    if (!name) return ''
    return activeOperators.length > 0 && !activeOperators.includes(name)
      ? `${name} (disattivato)`
      : name
  }

  return { activeOperators, formatOperator }
}

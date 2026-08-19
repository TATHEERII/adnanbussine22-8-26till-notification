import { useState, useEffect } from 'react'

export function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [key, state])

  return [state, setState]
}

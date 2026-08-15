import { useState, useEffect, useRef } from 'react'

// Shared count-up animation hook — used by Dashboard, Expense Tracker and
// Wealth Analytics so all "0 → value" number animations behave identically.
export default function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!target) {
      setCount(0)
      return
    }
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(ease * target))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => raf.current && cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

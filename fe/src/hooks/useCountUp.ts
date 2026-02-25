import { useState, useEffect, useRef } from 'react'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export const useCountUp = (end: number, duration = 1200): number => {
  const [value, setValue] = useState(0)
  const prevEnd = useRef(0)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (end === prevEnd.current) return
    const startValue = prevEnd.current
    prevEnd.current = end
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(startValue + (end - startValue) * easeOut(progress)))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameRef.current)
  }, [end, duration])

  return value
}

import { useState, useEffect, useRef, useCallback } from 'react'

let _show = null
export function useToast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = useCallback((text) => {
    setMsg(text)
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 2200)
  }, [])

  useEffect(() => { _show = show }, [show])

  return { msg, visible }
}

export function showToast(text) { _show?.(text) }

export default function Toast({ msg, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
}

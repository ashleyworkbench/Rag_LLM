import { useEffect, useState } from 'react'

let toastFn = null
export const showToast = (msg, type = 'error') => toastFn?.(msg, type)

export default function Toast() {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    toastFn = (msg, type) => {
      setToast({ msg, type })
      setTimeout(() => setToast(null), 4000)
    }
  }, [])

  if (!toast) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50
      px-4 py-3 rounded-xl text-sm font-medium shadow-xl
      animate-fadeIn border
      ${toast.type === 'error'
        ? 'bg-red-500/20 border-red-500/40 text-red-300'
        : 'bg-green-500/20 border-green-500/40 text-green-300'}`}>
      {toast.msg}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Переиспользуемый оверлей (как в панели учителя)
 */
export default function OverlayPortal({ open, onClose, children, zIndex = 20000 }) {
  const [visible, setVisible] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setClosing(false)
    } else if (visible) {
      setClosing(true)
      const timer = setTimeout(() => {
        setVisible(false)
        setClosing(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [open, visible])

  if (!visible) return null

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overlay-anim ${closing ? 'overlay-anim-exit' : ''}`}
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        className={`modal-anim ${closing ? 'modal-anim-exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}


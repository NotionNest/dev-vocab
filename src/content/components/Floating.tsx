import Logo from '@/assets/crx.svg'
import type { RefObject } from 'react'
import { useMemo } from 'react'

type FloatingProps = {
  show: boolean
  positionY: number
  onToggle: () => void
  buttonRef?: RefObject<HTMLButtonElement | null>
}

export default function Floating({ show, positionY, onToggle, buttonRef }: FloatingProps) {
  const containerClassName = useMemo(() => {
    const visibility = show
      ? 'translate-x-0 opacity-60 hover:opacity-100'
      : 'translate-x-1 opacity-100'
    return `fixed right-4 z-[2147483646] transition-all duration-300 ${visibility}`
  }, [show])

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onToggle}
      className={`${containerClassName} flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 shadow-lg shadow-black/20 transition-colors hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300`}
      style={{ top: `${positionY}px` }}
    >
      <img src={Logo} alt="DevVocab logo" className="h-6 w-6" />
    </button>
  )
}
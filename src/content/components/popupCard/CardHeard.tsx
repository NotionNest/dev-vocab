import { Settings, X } from 'lucide-react'

interface CardHeardProps {
  setShow: (show: boolean) => void
  classification?: 'word' | 'sentence' | 'empty'
}

export default function CardHeard({ setShow, classification }: CardHeardProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {classification === 'word' ? 'Word Selection' : 'Sentence Selection'}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition"
          aria-label="Settings"
          onClick={() => {
            chrome.runtime.sendMessage({ action: 'openOptionsPage' })
          }}
        >
          <Settings size={16} />
        </button>
        <button
          type="button"
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition"
          onClick={() => setShow(false)}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

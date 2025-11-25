import { Button } from '@/components/ui/button'
import { Brain, X } from 'lucide-react'
import { useState } from 'react'

export default function ReviewModal2() {
  const [showModal, setShowModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowModal(false)
      setIsClosing(false)
    }, 300) // 匹配动画持续时间
  }

  return (
    <>
      <div onClick={() => setShowModal(true)} className="flex items-center justify-center cursor-pointer mx-4 mt-4 border rounded-sm border-gray-200 dark:border-gray-700 p-2 text-center text-blue-400 dark:text-blue-500 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <Brain size={16} />
        <p>开始复习（还有 2 个待复习）</p>
      </div>

      {showModal && (
        <div 
          className={`fixed top-0 left-0 w-full h-full bg-black/50 dark:bg-black/70 z-50 ${
            isClosing 
              ? 'animate-out fade-out duration-300' 
              : 'animate-in fade-in duration-200'
          }`}
          onClick={handleClose}
        >
          <div 
            className={`w-full bg-white dark:bg-gray-800 rounded-t-2xl absolute bottom-0 ${
              isClosing
                ? 'animate-out slide-out-to-bottom duration-300'
                : 'animate-in slide-in-from-bottom duration-300'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <h2 className="text-md text-gray-900 dark:text-gray-100">Reviewing 1/3</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* content */}
            <div className="px-4">
              <div className='text-sm text-blue-500 dark:text-blue-400 text-center mt-4'>What does this mean?</div>
              {/* title */}
              <p className="text-2xl font-semibold text-center mt-4 text-gray-900 dark:text-gray-100">
                Idempotent
              </p>
              <div className='text-xs text-gray-500 dark:text-gray-400 text-center mt-2 mb-4'>You've seen this word 1 times.</div>
              {/* meaning */}
              <div className="group rounded-md bg-gray-100 dark:bg-gray-700 p-4 min-h-20 flex items-center justify-center">
                <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Click to reveal meaning
                </p>
              </div>
              {/* button */}
              <div className="my-4 flex items-center justify-center gap-2">
                <Button
                  className="flex-1 cursor-pointer text-red-500 dark:text-red-400 border-red-500 dark:border-red-600 hover:bg-red-500/10 dark:hover:bg-red-600/20 hover:text-red-500 dark:hover:text-red-400"
                  variant="outline"
                >
                  Forgotten
                </Button>
                <Button
                  className="flex-1 cursor-pointer text-white bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-500/90 dark:hover:bg-emerald-600/90"
                  variant="default"
                >
                  Got it
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

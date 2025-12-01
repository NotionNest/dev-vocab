import { Button } from '@/components/ui/button'
import { WordPopupPayload } from '@/types'
import { CornerDownLeft } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function WordReview({
  payload,
}: {
  payload: WordPopupPayload | null
}) {
  const [checkText, setCheckText] = useState('')
  const [isShowMeaning, setIsShowMeaning] = useState(false)
  let checkType = 'audio' as 'text' | 'audio'

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (checkText === '') return

        console.log('cccc')
      }

      if (event.key === 'F' || event.key === 'f') {
        console.log('cadfdsafa')
      }

      event.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [payload, checkText])

  return (
    <div className="px-4 pb-4">
      <div className="text-center mb-4">
        <p className="text-2xl mb-2 font-bold">{payload?.original}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          你已经遇到这个词{payload?.count}次了
        </p>
      </div>
      {checkType === 'text' ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            你还记得它的意思吗？
          </p>
          <input
            type="text"
            value={checkText}
            onChange={e => setCheckText(e.target.value)}
            placeholder="请输入中文含义..."
            className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white
         text-sm text-gray-700
         placeholder:text-gray-400
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
         disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
         aria-invalid:border-red-500 aria-invalid:ring-red-500"
          />

          <button
            disabled={checkText === ''}
            className="w-full flex items-center justify-center gap-2 mt-2 rounded-md bg-sky-600 dark:bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-500 dark:hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 dark:focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="">验证</span>
            <CornerDownLeft size={14} />
          </button>
        </div>
      ) : (
        <div className="group rounded-md bg-gray-100 dark:bg-gray-700 p-4 min-h-20 flex items-center justify-center">
          {isShowMeaning ? (
            <div className="text-sm text-center text-gray-700 dark:text-gray-300">
              {payload?.definitions?.map((item, index) => (
                <div key={index} className="mb-2">
                  <p>{item.partOfSpeech}</p>
                  <p>{item.meanings.join('；')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p
              onClick={() => setIsShowMeaning(true)}
              className="text-xs cursor-pointer text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            >
              点击揭示含义
            </p>
          )}
        </div>
      )}

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
  )
}

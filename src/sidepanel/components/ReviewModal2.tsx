import { MESSAGE } from '@/background/constants/message'
import { WordItem } from '@/background/utils/database'
import { Button } from '@/components/ui/button'
import { Brain, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ReviewModal2({
  getAllWords,
}: {
  getAllWords: () => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [wordsDueForReview, setWordsDueForReview] = useState<WordItem[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isShowMeaning, setIsShowMeaning] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setShowModal(false)
      setIsClosing(false)
    }, 300) // 匹配动画持续时间

    getAllWords()
    getWordsDueForReview()
  }

  const getWordsDueForReview = async () => {
    const { data } = await chrome.runtime.sendMessage({
      action: MESSAGE.GET_WORDS_DUE_FOR_REVIEW,
    })
    setWordsDueForReview(data)
  }

  useEffect(() => {
    // 监听 storage 变化，接收复习通知
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.reviewDueNotification) {
        const notification = changes.reviewDueNotification.newValue as
          | {
              timestamp?: number
              count?: number
              words?: WordItem[]
            }
          | undefined
        if (notification && notification.words) {
          console.log('收到复习通知', notification)
          setWordsDueForReview(notification.words)
        }
      }
    }

    // 初始化加载待复习单词
    getWordsDueForReview()

    // 注册 storage 监听器
    chrome.storage.onChanged.addListener(handleStorageChange)

    // 清理函数：移除监听器
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const handleApplyReviewAction = async (
    id: string,
    result: 'correct' | 'incorrect'
  ) => {
    const { ok } = await chrome.runtime.sendMessage({
      action: MESSAGE.APPLY_REVIEW_ACTION,
      payload: { id, result },
    })
    if (ok) {
      setIsShowMeaning(false)
      if (currentWordIndex < wordsDueForReview.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1)
      } else {
        handleClose()
      }
    }
  }

  const revealMeaning = () => {
    setIsShowMeaning(true)
  }

  if (wordsDueForReview.length === 0) return null
  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center cursor-pointer mx-4 mt-4 border rounded-sm border-gray-200 dark:border-gray-700 p-2 text-center text-blue-400 dark:text-blue-500 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <Brain size={16} />
        <p>开始复习（还有 {wordsDueForReview.length} 个待复习）</p>
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
            onClick={e => e.stopPropagation()}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-2">
              <h2 className="text-md text-gray-900 dark:text-gray-100">
                Reviewing {currentWordIndex + 1}/{wordsDueForReview.length}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* content */}
            <div className="px-4">
              <div className="text-sm text-blue-500 dark:text-blue-400 text-center mt-4">
                {/* What does this mean? */}
                这个词是什么意思？
              </div>
              {/* title */}
              <p className="text-2xl font-semibold text-center mt-4 text-gray-900 dark:text-gray-100">
                {wordsDueForReview[currentWordIndex].originalText}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 mb-4">
                {/* You've seen this word 1 times. */}
                你已经遇到这个词{wordsDueForReview[currentWordIndex].count}次了
              </div>
              {/* meaning */}
              {isShowMeaning ? (
                <div className="group rounded-md bg-gray-100 dark:bg-gray-700 p-4 min-h-20 flex items-center justify-center">
                  <div className="text-xs text-center text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {wordsDueForReview[currentWordIndex].definitions?.map(
                      (item, index) => (
                        <div key={index}>
                          <p>{item.partOfSpeech}</p>
                          <p>{item.meanings.join('；')}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className="group rounded-md bg-gray-100 dark:bg-gray-700 p-4 min-h-20 flex items-center justify-center">
                  <p
                    onClick={revealMeaning}
                    className="text-xs cursor-pointer text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
                  >
                    {/* Click to reveal meaning */}
                    点击揭示含义
                  </p>
                </div>
              )}
              {/* button */}
              <div className="my-4 flex items-center justify-center gap-2">
                <Button
                  className="flex-1 cursor-pointer text-red-500 dark:text-red-400 border-red-500 dark:border-red-600 hover:bg-red-500/10 dark:hover:bg-red-600/20 hover:text-red-500 dark:hover:text-red-400"
                  variant="outline"
                  onClick={() =>
                    handleApplyReviewAction(
                      wordsDueForReview[currentWordIndex].id,
                      'incorrect'
                    )
                  }
                >
                  {/* Forgotten */}
                  忘记了
                </Button>
                {!isShowMeaning && (
                  <Button
                    className="flex-1 cursor-pointer text-white bg-emerald-500 dark:bg-emerald-600 hover:bg-emerald-500/90 dark:hover:bg-emerald-600/90"
                    variant="default"
                    onClick={() =>
                      handleApplyReviewAction(
                        wordsDueForReview[currentWordIndex].id,
                        'correct'
                      )
                    }
                  >
                    {/* Got it */}
                    记住了
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

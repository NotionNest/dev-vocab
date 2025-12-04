import { WordItem } from "@/background/utils/database"
import { MemoryStateColor } from "@/background/utils/memoryState"
import dayjs from "dayjs"
import { ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function WordListItem({word}: {word: WordItem}) {
  const navigate = useNavigate()

  return (
    <div
      key={word.id}
      className="flex group items-center justify-between gap-5 hover:border-gray-200 dark:hover:border-gray-700 border border-transparent rounded-md py-3 px-2 cursor-pointer transition-colors"
      onClick={() => navigate(`/detail-word/${word.id}`)}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
            {word.originalText}
          </span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>遇到: {word.count} 次</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
          <span>
            上次遇到: {dayjs(word.lastEncounteredAt).format('YYYY-MM-DD')}
          </span>
        </div>
      </div>

      {/* status */}
      <div className="items-center gap-2 hidden group-hover:flex text-gray-700 dark:text-gray-300">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MemoryStateColor[word.state] }}></div>
        <ChevronRight size={16} />
      </div>
    </div>
  )
}

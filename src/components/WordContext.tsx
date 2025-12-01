import { cn } from '@/lib/utils'
import dayjs from 'dayjs'
import { Link } from 'lucide-react'
import { useRef, useState } from 'react'

export default function WordContext({
  context,
  source,
  original,
  createdAt,
}: {
  context: string
  source: string
  original: string
  createdAt?: string
}) {
  const contextRef = useRef<HTMLDivElement>(null)
  const [isContextExpanded, setIsContextExpanded] = useState(false)

  return (
    <div className="text-sm bg-gray-100 overflow-hidden dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 pl-3 relative group mb-2">
      <div className="absolute top-0 left-0 w-1 h-full bg-sky-600 dark:bg-sky-400"></div>
      <div
        ref={contextRef}
        className={`wrap-break-word transition-all duration-200 ${
          !isContextExpanded ? 'line-clamp-3 overflow-hidden' : ''
        }`}
        onClick={() => setIsContextExpanded(!isContextExpanded)}
      >
        <div className="text-xs italic text-gray-700 dark:text-gray-300">
          {context.split(' ').map((item, index) => (
            <span
              key={`context-${index}-${item}`}
              className={cn(
                item.toLowerCase() === original?.toLowerCase()
                  ? 'text-sky-600 dark:text-sky-400'
                  : ''
              )}
            >
              {item}{' '}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <Link size={12} />
          <p className="text-xs text-gray-500 dark:text-gray-400">{source}</p>
        </div>
        <div>
          {
            createdAt && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {dayjs(createdAt).format('YYYY/MM/DD HH:mm:ss')}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

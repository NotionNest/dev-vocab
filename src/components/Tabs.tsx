import { ReactNode } from 'react'

export type TabOption<T extends string> = {
  id: T
  name: string
}

type TabsProps<T extends string> = {
  options: readonly TabOption<T>[]
  activeId: T
  onChange: (id: T) => void
  className?: string
}

export function Tabs<T extends string>({
  options,
  activeId,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {options.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 border-b-2 px-3 py-1 transition-colors cursor-pointer text-sm ${
            activeId === tab.id
              ? 'text-sky-600 dark:text-sky-400 font-medium border-sky-600 dark:border-sky-400'
              : 'text-gray-600 dark:text-gray-400 border-transparent'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
}

type TabsContentProps<T extends string> = {
  value: T
  activeId: T
  children: ReactNode
  className?: string
}

export function TabsContent<T extends string>({
  value,
  activeId,
  children,
  className = '',
}: TabsContentProps<T>) {
  if (value !== activeId) {
    return null
  }

  return <div className={className}>{children}</div>
}


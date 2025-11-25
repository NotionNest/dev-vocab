import { cn } from "@/lib/utils"

interface SettingCardProps {
  title: string
  className?: string
  children: React.ReactNode
}
export default function SettingCard({ title, className, children}: SettingCardProps) {
  const classes = cn('border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-panel dark:bg-gray-800 p-4 text-gray-500 dark:text-gray-400', className)

  return <div className="flex flex-col gap-2 mb-4">
    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</div>
    <div className={classes}>{children}</div>
  </div>
}
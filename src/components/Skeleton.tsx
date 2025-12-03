import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 行数（text variant） */
  lines?: number
  /** 是否显示头像占位 */
  avatar?: boolean
  /** 宽度，可以是任何 CSS 单位字符串或数字（像素） */
  width?: string | number
  /** 高度 */
  height?: string | number
  /** 变体：text（多行文本），rect（矩形），circle（圆形/头像） */
  variant?: 'text' | 'rect' | 'circle'
  /** 是否启用动画（pulse / shimmer） */
  animated?: boolean
}

const toSize = (v?: string | number) => {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

/**
 * 通用 Skeleton 骨架组件
 * - 使用 Tailwind CSS（无需在组件里导入）
 * - 可配置为文本多行、矩形或圆形（常用于头像）
 * - 简洁可扩展，适合在列表 / 卡片 / 表单加载态中复用
 * - 支持暗色模式
 */
export default function Skeleton({
  lines = 3,
  avatar = false,
  width,
  height,
  variant = 'text',
  animated = true,
  className,
  ...props
}: SkeletonProps) {
  const base = cn(
    'bg-gray-200 dark:bg-gray-700',
    animated && 'animate-pulse',
    'overflow-hidden',
    className
  )

  // 头像样式（circle 也可直接用作单独占位）
  if (variant === 'circle' || avatar) {
    const size = toSize(height ?? width ?? 40)
    return (
      <div
        className={base}
        style={{
          width: size,
          height: size,
          borderRadius: '9999px',
        }}
        aria-hidden
        {...props}
      />
    )
  }

  // 矩形占位
  if (variant === 'rect') {
    return (
      <div
        className={base}
        style={{ width: toSize(width ?? '100%'), height: toSize(height ?? 12) }}
        aria-hidden
        {...props}
      />
    )
  }

  // 文本多行占位（默认）
  const lineEls = Array.from({ length: Math.max(1, lines) }).map((_, i) => {
    const isLast = i === lines - 1
    const lineWidth = isLast ? '60%' : '100%'
    return (
      <div
        key={i}
        className={cn('bg-inherit', !isLast && 'mb-2', base)}
        style={{ width: lineWidth, height: toSize(12) }}
      />
    )
  })

  return (
    <div style={{ width: toSize(width ?? '100%') }} aria-hidden {...props}>
      <div className="flex flex-col">{lineEls}</div>
    </div>
  )
}

/*
使用示例：

// 单个圆形头像骨架
<Skeleton variant="circle" width={48} height={48} />

// 列表项：带头像和文字占位（组合使用）
<div className="flex items-center gap-3">
  <Skeleton variant="circle" width={40} height={40} />
  <div className="flex-1">
    <Skeleton lines={2} />
  </div>
</div>

// 矩形卡片占位
<Skeleton variant="rect" width="100%" height={120} />
*/

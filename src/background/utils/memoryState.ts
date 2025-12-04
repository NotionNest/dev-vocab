export type MemoryState =
  | 'new'
  | 'learning'
  | 'review1'
  | 'review2'
  | 'review3'
  | 'mastered'

export const MemoryStateColor: Record<MemoryState, string> = {
  new: '#9CA3AF', // 灰色，代表未接触
  learning: '#3B82F6', // 蓝色，正在学习
  review1: '#F59E0B', // 橙色偏浅
  review2: '#D97706', // 更深的橙色
  review3: '#B45309', // 再深一点，过渡到棕
  mastered: '#10B981', // 绿色，掌握
}

export const reviewPlan = {
  new: { next: 'learning', interval: 0 },
  learning: { next: 'review1', interval: 10 * 60 * 1000 }, // 10min
  review1: { next: 'review2', interval: 1 * 24 * 60 * 60 * 1000 }, // 1 day
  review2: { next: 'review3', interval: 3 * 24 * 60 * 60 * 1000 }, // 3 days
  review3: { next: 'mastered', interval: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  mastered: { next: 'mastered', interval: 30 * 24 * 60 * 60 * 1000 }, // 30 days
} as const

export type ReviewLog = {
  timestamp: number // 复习时间戳
  result: 'correct' | 'incorrect' // 复习结果
  fromState: MemoryState
  toState: MemoryState
}

export function updateMemory(
  currentState: MemoryState,
  result: 'correct' | 'incorrect'
): MemoryState {
  if (result === 'correct') {
    return reviewPlan[currentState].next
  }

  // 失败 → 退级逻辑
  const fallback: Record<MemoryState, MemoryState> = {
    new: 'new',
    learning: 'new',
    review1: 'learning',
    review2: 'review1',
    review3: 'review2',
    mastered: 'review3',
  }

  return fallback[currentState]
}

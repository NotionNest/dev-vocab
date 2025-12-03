/**
 * 消息和事件相关类型定义
 */

import { Classification } from '@/lib/utils/word'
import { TranslationResult } from './translation'

/**
 * 单词弹窗事件 Payload
 * 包含翻译结果的所有详细信息
 */
export interface WordPopupPayload extends TranslationResult {
  classification: Classification
  context: string
  position?: { x: number; y: number } // 弹窗位置
  source: string
  count?: number
  status: 'reviewing' | 'capture' | 'loading' | 'error'
}

/**
 * 消息和事件相关类型定义
 */

import { Classification } from '@/lib/utils/word'
import { TranslationResult } from './translation'

// ==================== Chrome 消息类型 ====================

/**
 * 消息动作类型
 */
export type MessageAction =
  | 'translate'
  | 'openOptionsPage'
  | 'getLocalState'
  | 'openTab'
  | 'ping'

/**
 * 基础消息接口
 */
export interface ChromeMessage {
  action: MessageAction
  [key: string]: any
}

/**
 * 消息响应接口
 */
export interface MessageResponse<T = any> {
  success: boolean
  result?: T
  error?: string
}

// ==================== 具体消息类型 ====================
export type PingMessage = {
  action: 'ping'
}

export type TranslateMessage = {
  action: 'translate'
  text: string
  detailed?: boolean
}

export type ExtensionMessage = PingMessage | TranslateMessage

// ==================== 翻译响应 ====================

/**
 * 翻译请求
 */
export interface TranslateRequest extends ChromeMessage {
  action: 'translate'
  text: string
  detailed?: boolean
}

/**
 * 翻译响应
 */
export interface TranslateResponse extends MessageResponse<string> {
  result?: string
}

// ==================== 弹窗事件 ====================

/**
 * 单词弹窗事件 Payload
 * 包含翻译结果的所有详细信息
 */
export interface WordPopupPayload extends TranslationResult {
  classification: Classification
  context: string
  position?: { x: number; y: number } // 弹窗位置
  source: string
  error?: string
  count?: number
}

/**
 * 单词弹窗事件名称
 */
export const WORD_POPUP_EVENT = 'devvocab:showPopup'

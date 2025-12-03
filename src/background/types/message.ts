import { WordPopupPayload } from '@/types'
import { MESSAGE } from '../constants/message'

export type MessagePayloadMap = {
  [MESSAGE.GET_SETTINGS]: void
  [MESSAGE.OPEN_OPTIONS_PAGE]: void
  [MESSAGE.TRANSLATE]: { text: string }
  [MESSAGE.GET_WORD_BY_ORIGINAL]: { original: string }
  [MESSAGE.INCREASE_COUNT]: { id: string; context: string; source: string }
  [MESSAGE.SAVE_WORD]: WordPopupPayload
  [MESSAGE.GET_ALL_WORDS]: void
  [MESSAGE.GET_WORD_BY_ID]: { id: string }
}

/**
 * message 处理函数类型
 * @param payload - 消息内容
 * @param sender - 发送方信息
 */
export type MessageHandler<T> = (
  payload: T,
  sender: chrome.runtime.MessageSender
) => any | Promise<any>

import { MESSAGE } from '@/background/constants/message'
import {
  applyReviewAction,
  clearAllWords,
  getAllWords,
  getWordById,
  getWordByOriginal,
  getWordsDueForReview,
  importWord,
  increaseCount,
  saveWord,
  translate,
} from './service'
import { registerHandler } from '@/background/core/message-router'

/**
 * 划词与词条管理模块
 */
export function registerWordController() {
  registerHandler(MESSAGE.SAVE_WORD, async payload => {
    return saveWord(payload)
  })

  registerHandler(MESSAGE.TRANSLATE, async payload => {
    const { text } = payload
    const result = await translate(text)

    return result
  })

  registerHandler(MESSAGE.GET_WORD_BY_ORIGINAL, async payload => {
    const { original } = payload
    return getWordByOriginal(original)
  })

  registerHandler(MESSAGE.GET_ALL_WORDS, () => {
    return getAllWords()
  })

  registerHandler(MESSAGE.INCREASE_COUNT, async payload => {
    const { id, context, source } = payload
    await increaseCount(id, context, source)
    // 通知侧边栏触发更新
    chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })
    return { ok: true }
  })

  registerHandler(MESSAGE.GET_WORD_BY_ID, async payload => {
    const { id } = payload
    return getWordById(id)
  })

  registerHandler(MESSAGE.APPLY_REVIEW_ACTION, payload => {
    return applyReviewAction(payload)
  })

  registerHandler(MESSAGE.GET_WORDS_DUE_FOR_REVIEW, () => {
    return getWordsDueForReview()
  })

  registerHandler(MESSAGE.IMPORT_WORD as any, async (payload: any) => {
    const result = await importWord(payload)
    if (result.ok) {
      // 通知侧边栏触发更新
      chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })
    }
    return result
  })

  registerHandler(MESSAGE.CLEAR_ALL_WORDS as any, () => {
    return clearAllWords()
  })
}

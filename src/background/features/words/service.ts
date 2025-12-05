import {
  translateDetailed,
  translate as translateText,
} from '@/background/utils/translate'
import { v4 as uuidv4 } from 'uuid'
import { WordPopupPayload } from '@/types'
import {
  vocabDB,
  dbOperations,
  WordItem,
} from '@/background/utils/database'
import { reviewPlan, updateMemory } from '@/background/utils/memoryState'

export async function saveWord(word: WordPopupPayload) {
  try {
    const now = Date.now()

    await vocabDB.addWord({
      id: uuidv4(),
      count: 1,
      lastEncounteredAt: now,
      createdAt: now,

      state: 'learning',
      nextReviewAt: now + reviewPlan.learning.interval, // 当前时间（立即可学习）
      interval: reviewPlan.new.interval,
      history: [],
      ...word,
      contexts: [
        {
          id: uuidv4(),
          source: word.source,
          content: `${word.context} - ${await translateText(
            word.context,
            'zh-CN'
          )}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })
    chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })
    return { ok: true }
    // 通知侧边栏触发更新
  } catch (error) {
    console.error('保存单词失败:', error)
    return { ok: false, error: (error as Error).message }
  }
}

export async function translate(text: string) {
  try {
    // 获取目标语言设置
    const storageData = await chrome.storage.local.get('targetLanguage')
    const targetLang = (storageData.targetLanguage as string) || 'zh-CN'

    // 返回详细的翻译结果（包含音标、定义等）
    const detailedResult = await translateDetailed(text, targetLang)
    return detailedResult
  } catch (error) {}
}

export async function getWordByOriginal(original: string) {
  // const word = await
  return dbOperations.getWordByOriginal(original)
}

export async function getWordById(id: string) {
  return await vocabDB.getWordById(id)
}

export async function increaseCount(
  id: string,
  context: string,
  source: string
) {
  await dbOperations.increaseCount(id, context, source)
  return { ok: true }
}

export async function getAllWords() {
  return await vocabDB.getAllWords()
}

export async function applyReviewAction(payload: {
  id: string
  result: 'correct' | 'incorrect'
}) {
  const { id, result } = payload
  const word = await vocabDB.getWordById(id)
  if (!word) return { ok: false, error: 'Word not found' }

  const newState = updateMemory(word.state, result)

  await vocabDB.updateWord(id, {
    state: newState,
    nextReviewAt: Date.now() + reviewPlan[newState].interval,
    interval: reviewPlan[newState].interval,
    history: [
      ...word.history,
      {
        timestamp: Date.now(),
        result,
        fromState: word.state,
        toState: newState,
      },
    ],
  })

  return { ok: true }
}

/**
 * 获取所有应该复习的单词
 * @returns {Promise<WordItem[]>} 应该复习的单词列表
 */
export async function getWordsDueForReview() {
  const words = await vocabDB.getAllWords()
  const now = Date.now()

  const wordsDueForReview = words.filter(word => {
    return word.nextReviewAt <= now
  })
  return wordsDueForReview
}

/**
 * 导入单词到数据库
 * @param word 要导入的单词数据
 */
export async function importWord(word: WordItem) {
  try {
    await vocabDB.addWord(word)
    return { ok: true }
  } catch (error) {
    console.error('导入单词失败:', error)
    return { ok: false, error: (error as Error).message }
  }
}

/**
 * 清除所有单词数据
 */
export async function clearAllWords() {
  try {
    await vocabDB.clearAllWords()
    // 通知侧边栏触发更新
    chrome.runtime.sendMessage({ action: 'UPDATE_VOCABULARY' })
    return { ok: true }
  } catch (error) {
    console.error('清除所有单词失败:', error)
    return { ok: false, error: (error as Error).message }
  }
}

import {
  translateDetailed,
  translate as translateText,
} from '@/background/utils/translate'
import { v4 as uuidv4 } from 'uuid'
import { WordPopupPayload } from '@/types'
import { vocabDB, dbOperations } from '@/background/utils/database'

export async function saveWord(word: WordPopupPayload) {
  try {
    await vocabDB.addWord({
      id: uuidv4(),
      count: 1,
      lastEncounteredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
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
    // chrome.runtime.sendMessage({ action: 'updateVocabulary' })
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
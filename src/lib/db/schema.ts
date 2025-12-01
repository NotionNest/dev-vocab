type Definition = {
  examples?: string[] // 例句
  meanings: string[] // 释义
  partOfSpeech: string // 词性
}

export interface WordItem {
  id: string // 唯一标识
  original: string // 原文
  text: string // 翻译
  phonetic?: string // 音标
  alternativeTranslations: string[] // 其他可能的翻译
  contexts: { id: string; source: string; content: string, createdAt: string }[] // 上下文
  definitions: Definition[] | undefined // 释义
  examples: string[] | undefined // 例句
  count: number // 遇到次数
  lastEncounteredAt: string // 最后遇到时间
  createdAt: string // 创建时间
}

export type DBSchema = {
  words: WordItem
}

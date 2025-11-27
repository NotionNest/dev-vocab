/**
 * 翻译相关类型定义
 */

// ==================== 词性定义 ====================

/**
 * 标准词性缩写枚举
 */
export enum PartOfSpeech {
  NOUN = 'n.', // 名词
  VERB = 'v.', // 动词
  ADJECTIVE = 'adj.', // 形容词
  ADVERB = 'adv.', // 副词
  PRONOUN = 'pron.', // 代词
  PREPOSITION = 'prep.', // 介词
  CONJUNCTION = 'conj.', // 连词
  INTERJECTION = 'interj.', // 感叹词
  ARTICLE = 'art.', // 冠词
  NUMERAL = 'num.', // 数词
  AUXILIARY = 'aux.', // 助动词
  MODAL = 'modal', // 情态动词
  PHRASE = 'phrase', // 短语
  IDIOM = 'idiom', // 习语
}

/**
 * 词性完整名称映射（中英文）
 */
export const PART_OF_SPEECH_NAMES: Record<string, { en: string; zh: string }> =
  {
    [PartOfSpeech.NOUN]: { en: 'noun', zh: '名词' },
    [PartOfSpeech.VERB]: { en: 'verb', zh: '动词' },
    [PartOfSpeech.ADJECTIVE]: { en: 'adjective', zh: '形容词' },
    [PartOfSpeech.ADVERB]: { en: 'adverb', zh: '副词' },
    [PartOfSpeech.PRONOUN]: { en: 'pronoun', zh: '代词' },
    [PartOfSpeech.PREPOSITION]: { en: 'preposition', zh: '介词' },
    [PartOfSpeech.CONJUNCTION]: { en: 'conjunction', zh: '连词' },
    [PartOfSpeech.INTERJECTION]: { en: 'interjection', zh: '感叹词' },
    [PartOfSpeech.ARTICLE]: { en: 'article', zh: '冠词' },
    [PartOfSpeech.NUMERAL]: { en: 'numeral', zh: '数词' },
    [PartOfSpeech.AUXILIARY]: { en: 'auxiliary', zh: '助动词' },
    [PartOfSpeech.MODAL]: { en: 'modal', zh: '情态动词' },
    [PartOfSpeech.PHRASE]: { en: 'phrase', zh: '短语' },
    [PartOfSpeech.IDIOM]: { en: 'idiom', zh: '习语' },
  }

/**
 * 获取词性的完整名称
 * @param pos 词性缩写
 * @param lang 语言（'en' 或 'zh'）
 * @returns 词性完整名称
 */
export function getPartOfSpeechName(
  pos: string,
  lang: 'en' | 'zh' = 'zh'
): string {
  const name = PART_OF_SPEECH_NAMES[pos]
  return name ? name[lang] : pos
}

// ==================== 翻译结果定义 ====================

/**
 * 词典释义定义
 */
export interface Definition {
  partOfSpeech: string // 词性（n. v. adj.等）
  meanings: string[] // 该词性下的多个含义
  examples?: string[] // 例句
}

/**
 * 详细的翻译结果
 */
export interface TranslationResult {
  original: string // 原文
  text: string // 翻译文本（主要翻译）
  alternativeTranslations?: string[] // 其他可能的翻译
  definitions?: Definition[] // 多个释义（按词性分类）
  examples?: string[] // 例句
  phonetic?: string // 音标
  sourceLanguage?: string // 源语言
  targetLanguage?: string // 目标语言
  synonyms?: string[] // 同义词
}

// ==================== 翻译服务定义 ====================

/**
 * 翻译服务类型
 */
export enum TranslationServiceType {
  FREE = 'free', // 免费服务
  LLM = 'llm', // LLM API 服务
  CUSTOM = 'custom', // 自定义服务
}

/**
 * 翻译服务提供商 ID
 */
export enum TranslationProviderId {
  // 免费服务
  GOOGLE = 'google',
  DEEPL = 'deepl',
  YOUDAO = 'youdao',
  BAIDU = 'baidu',

  // LLM 服务
  OPENAI = 'openai',
  CLAUDE = 'claude',
  GEMINI = 'gemini',
  CUSTOM_OPENAI = 'custom-openai',
}

/**
 * API 配置接口
 */
export interface APIConfig {
  apiKey?: string
  apiEndpoint?: string
  model?: string
  // 其他可选配置
  appId?: string // 百度、有道等需要
  appSecret?: string // 百度、有道等需要
  [key: string]: any
}

/**
 * 翻译服务提供商接口
 */
export interface TranslationService {
  id: string // 唯一标识符
  name: string // 显示名称
  type: TranslationServiceType // 服务类型
  providerId?: TranslationProviderId // 内置提供商ID（自定义服务为空）
  enabled: boolean // 是否启用
  priority: number // 优先级（数字越小优先级越高）
  configured: boolean // 是否已配置（是否有必需的API凭证）
  config: APIConfig // API 配置
  isBuiltIn: boolean // 是否为内置服务
  description?: string // 描述
  icon?: string // 图标
}

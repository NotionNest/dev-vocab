// src/utils/translate.ts

import {
  TranslationServiceType,
  TranslationProviderId,
  TranslationService,
  TranslationResult,
  Definition,
  APIConfig,
  PartOfSpeech,
  PART_OF_SPEECH_NAMES,
  getPartOfSpeechName,
} from '@/types/translation'

// 重新导出供外部使用
export type {
  TranslationService,
  TranslationResult,
  Definition,
  APIConfig,
}
export {
  TranslationServiceType,
  TranslationProviderId,
  PartOfSpeech,
  PART_OF_SPEECH_NAMES,
  getPartOfSpeechName,
}

// ==================== 词性标准化工具 ====================

/**
 * 词性映射表（将 Google Translate 返回的词性转换为标准缩写）
 */
const PART_OF_SPEECH_MAP: Record<string, string> = {
  // 英文完整形式
  noun: PartOfSpeech.NOUN,
  verb: PartOfSpeech.VERB,
  adjective: PartOfSpeech.ADJECTIVE,
  adverb: PartOfSpeech.ADVERB,
  pronoun: PartOfSpeech.PRONOUN,
  preposition: PartOfSpeech.PREPOSITION,
  conjunction: PartOfSpeech.CONJUNCTION,
  interjection: PartOfSpeech.INTERJECTION,
  article: PartOfSpeech.ARTICLE,
  numeral: PartOfSpeech.NUMERAL,

  // Google Translate 可能返回的形式
  Noun: PartOfSpeech.NOUN,
  Verb: PartOfSpeech.VERB,
  Adjective: PartOfSpeech.ADJECTIVE,
  Adverb: PartOfSpeech.ADVERB,

  // 中文形式
  名词: PartOfSpeech.NOUN,
  动词: PartOfSpeech.VERB,
  形容词: PartOfSpeech.ADJECTIVE,
  副词: PartOfSpeech.ADVERB,
  代词: PartOfSpeech.PRONOUN,
  介词: PartOfSpeech.PREPOSITION,
  连词: PartOfSpeech.CONJUNCTION,
  感叹词: PartOfSpeech.INTERJECTION,
  冠词: PartOfSpeech.ARTICLE,
}

/**
 * 标准化词性
 * @param pos 原始词性字符串
 * @returns 标准化的词性缩写
 */
function normalizePartOfSpeech(pos: string): string {
  if (!pos) return ''

  // 移除空格并转换为小写进行匹配
  const normalized = pos.trim().toLowerCase()

  // 如果已经是标准缩写形式，直接返回
  if (Object.values(PartOfSpeech).includes(pos as PartOfSpeech)) {
    return pos
  }

  // 尝试从映射表查找
  const mapped =
    PART_OF_SPEECH_MAP[normalized] || PART_OF_SPEECH_MAP[pos.trim()]
  if (mapped) {
    return mapped
  }

  // 如果映射表中没有，尝试智能匹配
  if (normalized.includes('noun') || normalized.includes('名词')) {
    return PartOfSpeech.NOUN
  }
  if (normalized.includes('verb') || normalized.includes('动词')) {
    return PartOfSpeech.VERB
  }
  if (normalized.includes('adj') || normalized.includes('形容词')) {
    return PartOfSpeech.ADJECTIVE
  }
  if (normalized.includes('adv') || normalized.includes('副词')) {
    return PartOfSpeech.ADVERB
  }

  // 如果都不匹配，返回原始值
  return pos
}

// ==================== 内置服务定义 ====================

/**
 * 内置翻译服务列表
 */
export const BUILT_IN_SERVICES: Omit<TranslationService, 'configured'>[] = [
  // 免费服务
  {
    id: TranslationProviderId.GOOGLE,
    name: 'Google Translate',
    type: TranslationServiceType.FREE,
    providerId: TranslationProviderId.GOOGLE,
    enabled: true,
    priority: 1,
    config: {},
    isBuiltIn: true,
    description: 'Google 免费翻译服务',
    icon: '🌐',
  },
  {
    id: TranslationProviderId.DEEPL,
    name: 'DeepL',
    type: TranslationServiceType.FREE,
    providerId: TranslationProviderId.DEEPL,
    enabled: false,
    priority: 2,
    config: {
      apiKey: '',
    },
    isBuiltIn: true,
    description: 'DeepL 翻译服务（需要 API Key）',
    icon: '🔷',
  },
  {
    id: TranslationProviderId.YOUDAO,
    name: '有道翻译',
    type: TranslationServiceType.FREE,
    providerId: TranslationProviderId.YOUDAO,
    enabled: false,
    priority: 3,
    config: {
      appId: '',
      appSecret: '',
    },
    isBuiltIn: true,
    description: '有道智云翻译 API',
    icon: '📖',
  },
  {
    id: TranslationProviderId.BAIDU,
    name: '百度翻译',
    type: TranslationServiceType.FREE,
    providerId: TranslationProviderId.BAIDU,
    enabled: false,
    priority: 4,
    config: {
      appId: '',
      appSecret: '',
    },
    isBuiltIn: true,
    description: '百度翻译 API',
    icon: '🐻',
  },

  // LLM 服务
  {
    id: TranslationProviderId.OPENAI,
    name: 'OpenAI',
    type: TranslationServiceType.LLM,
    providerId: TranslationProviderId.OPENAI,
    enabled: false,
    priority: 5,
    config: {
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
    },
    isBuiltIn: true,
    description: 'OpenAI GPT 翻译',
    icon: '🤖',
  },
  {
    id: TranslationProviderId.CLAUDE,
    name: 'Claude',
    type: TranslationServiceType.LLM,
    providerId: TranslationProviderId.CLAUDE,
    enabled: false,
    priority: 6,
    config: {
      apiKey: '',
      apiEndpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-3-haiku-20240307',
    },
    isBuiltIn: true,
    description: 'Anthropic Claude 翻译',
    icon: '🧠',
  },
  {
    id: TranslationProviderId.GEMINI,
    name: 'Gemini',
    type: TranslationServiceType.LLM,
    providerId: TranslationProviderId.GEMINI,
    enabled: false,
    priority: 7,
    config: {
      apiKey: '',
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      model: 'gemini-pro',
    },
    isBuiltIn: true,
    description: 'Google Gemini 翻译',
    icon: '✨',
  },
  {
    id: TranslationProviderId.CUSTOM_OPENAI,
    name: '自定义 OpenAI 兼容',
    type: TranslationServiceType.LLM,
    providerId: TranslationProviderId.CUSTOM_OPENAI,
    enabled: false,
    priority: 8,
    config: {
      apiKey: '',
      apiEndpoint: '',
      model: 'gpt-3.5-turbo',
    },
    isBuiltIn: true,
    description: '兼容 OpenAI API 的自定义服务',
    icon: '⚙️',
  },
]

// ==================== 翻译服务实现 ====================

/**
 * Google Translate 翻译（增强版，获取详细信息）
 * @param text - 要翻译的文本
 * @param targetLang - 目标语言
 * @param _config - 配置
 * @returns Promise<TranslationResult> - 翻译结果
 */
async function translateWithGoogleDetailed(
  text: string,
  targetLang: string,
  _config: APIConfig
): Promise<TranslationResult> {
  // 使用 Google Translate 免费 API，添加多个 dt 参数获取详细信息
  // dt=t: 翻译, dt=rm: 音标, dt=bd: 词典定义, dt=at: 备选翻译, dt=ex: 例句, dt=ss: 同义词
  // 手动构建 URL，因为需要多个同名 dt 参数
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&dt=rm&dt=bd&dt=at&dt=ex&dt=ss&q=${encodeURIComponent(
    text
  )}`

  const response = await fetch(url)
  const data = await response.json()

  // 解析返回的数据结构
  // data[0]: 翻译文本数组
  // data[1]: 词典定义
  // data[2]: 源语言
  // data[5]: 备选翻译
  // data[12]: 同义词
  // data[13]: 例句

  const result: TranslationResult = {
    originalText: text,
    translatedText: '',
    sourceLanguage: data[2] || 'auto',
    targetLanguage: targetLang,
    definitions: [],
  }

  // 1. 提取主要翻译
  if (data[0] && Array.isArray(data[0])) {
    result.translatedText = data[0]
      .filter((item: any) => item && item[0])
      .map((item: any) => item[0])
      .join('')
  }

  // 2. 提取音标（如果有）
  if (data[0] && data[0][1] && data[0][1][3]) {
    result.pronunciation = data[0][1][3]
  }

  // 3. 提取词典定义（按词性分类）
  if (data[1] && Array.isArray(data[1])) {
    result.definitions = data[1].map((def: any) => ({
      partOfSpeech: normalizePartOfSpeech(def[0] || ''),
      meanings: def[1] || [],
      examples: [],
    }))
  }

  // 4. 提取备选翻译
  if (
    data[5] &&
    Array.isArray(data[5]) &&
    data[5][0] &&
    Array.isArray(data[5][0][2])
  ) {
    result.alternativeTranslations = data[5][0][2]
      .filter((item: any) => item && item[0])
      .map((item: any) => item[0])
      .slice(0, 5) // 只取前5个
  }

  // 5. 提取同义词
  if (data[11] && Array.isArray(data[11])) {
    result.synonyms = data[11]
      .flatMap((group: any) => group[1] || [])
      .filter((word: string) => word && word !== text)
      .slice(0, 10) // 只取前10个
  }

  // 6. 提取例句
  if (
    data[13] &&
    Array.isArray(data[13]) &&
    data[13][0] &&
    Array.isArray(data[13][0])
  ) {
    result.examples = data[13][0]
      .map((example: any) => example[0])
      .filter((ex: string) => ex)
      .slice(0, 3) // 只取前3个
  }

  console.log('Google Translate 结果:', result)

  if (!result.translatedText) {
    throw new Error('Google Translate 返回数据格式错误')
  }

  return result
}

/**
 * Google Translate 翻译（简化版，仅返回文本）
 */
async function translateWithGoogle(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  const result = await translateWithGoogleDetailed(text, targetLang, config)
  return result.translatedText
}

/**
 * DeepL 翻译
 */
async function translateWithDeepL(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('DeepL API Key 未配置')
  }

  const url = 'https://api-free.deepl.com/v2/translate'

  const formData = new URLSearchParams()
  formData.append('text', text)
  formData.append('target_lang', targetLang.toUpperCase())
  formData.append('auth_key', config.apiKey)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })

  const data = await response.json()

  if (data.translations && data.translations[0]) {
    return data.translations[0].text
  }

  throw new Error('DeepL 翻译失败')
}

/**
 * 有道翻译
 */
async function translateWithYoudao(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.appId || !config.appSecret) {
    throw new Error('有道翻译 App ID 或 App Secret 未配置')
  }

  const salt = Date.now().toString()
  const curtime = Math.round(Date.now() / 1000).toString()
  const input =
    text.length <= 20
      ? text
      : text.substring(0, 10) + text.length + text.substring(text.length - 10)

  // 生成签名
  const sign = await generateYoudaoSign(
    config.appId,
    input,
    salt,
    curtime,
    config.appSecret
  )

  const url = 'https://openapi.youdao.com/api'
  const formData = new URLSearchParams()
  formData.append('q', text)
  formData.append('from', 'auto')
  formData.append('to', targetLang)
  formData.append('appKey', config.appId)
  formData.append('salt', salt)
  formData.append('sign', sign)
  formData.append('signType', 'v3')
  formData.append('curtime', curtime)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })

  const data = await response.json()

  if (data.translation && data.translation[0]) {
    return data.translation[0]
  }

  throw new Error(`有道翻译失败: ${data.errorCode || 'Unknown error'}`)
}

/**
 * 生成有道翻译签名
 */
async function generateYoudaoSign(
  appId: string,
  input: string,
  salt: string,
  curtime: string,
  appSecret: string
): Promise<string> {
  const signStr = appId + input + salt + curtime + appSecret
  const encoder = new TextEncoder()
  const data = encoder.encode(signStr)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 百度翻译
 */
async function translateWithBaidu(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.appId || !config.appSecret) {
    throw new Error('百度翻译 App ID 或 App Secret 未配置')
  }

  const salt = Date.now().toString()
  const sign = generateBaiduSign(config.appId, text, salt, config.appSecret)

  const url = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
  const params = new URLSearchParams()
  params.append('q', text)
  params.append('from', 'auto')
  params.append('to', targetLang)
  params.append('appid', config.appId)
  params.append('salt', salt)
  params.append('sign', sign)

  const response = await fetch(`${url}?${params.toString()}`)
  const data = await response.json()

  if (data.trans_result && data.trans_result[0]) {
    return data.trans_result[0].dst
  }

  throw new Error(`百度翻译失败: ${data.error_code || 'Unknown error'}`)
}

/**
 * 简单的 MD5 实现（用于百度翻译签名）
 */
function md5(str: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift))
  }

  function addUnsigned(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  function md5F(x: number, y: number, z: number): number {
    return (x & y) | (~x & z)
  }

  function md5G(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z)
  }

  function md5H(x: number, y: number, z: number): number {
    return x ^ y ^ z
  }

  function md5I(x: number, y: number, z: number): number {
    return y ^ (x | ~z)
  }

  function md5Transform(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number[],
    s: number[],
    t: number[]
  ): number[] {
    let aa = a
    let bb = b
    let cc = c
    let dd = d

    for (let i = 0; i < 64; i++) {
      let f: number, g: number
      if (i < 16) {
        f = md5F(bb, cc, dd)
        g = i
      } else if (i < 32) {
        f = md5G(bb, cc, dd)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        f = md5H(bb, cc, dd)
        g = (3 * i + 5) % 16
      } else {
        f = md5I(bb, cc, dd)
        g = (7 * i) % 16
      }

      const temp = dd
      dd = cc
      cc = bb
      bb = addUnsigned(
        bb,
        rotateLeft(
          addUnsigned(addUnsigned(aa, f), addUnsigned(x[g], t[i])),
          s[i % 4]
        )
      )
      aa = temp
    }

    return [
      addUnsigned(a, aa),
      addUnsigned(b, bb),
      addUnsigned(c, cc),
      addUnsigned(d, dd),
    ]
  }

  // 转换字符串为字节数组
  const msgBytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    msgBytes.push(code & 0xff)
    if (code > 0xff) {
      msgBytes.push((code >>> 8) & 0xff)
    }
  }

  // 填充
  const msgLen = msgBytes.length
  const paddedLen = ((msgLen + 8) >>> 6) + 1
  const blocks: number[] = new Array(paddedLen * 16).fill(0)

  for (let i = 0; i < msgLen; i++) {
    blocks[i >>> 2] |= msgBytes[i] << ((i % 4) * 8)
  }

  blocks[msgLen >>> 2] |= 0x80 << ((msgLen % 4) * 8)
  blocks[paddedLen * 16 - 2] = msgLen * 8

  // MD5 常量
  const s = [7, 12, 17, 22]
  const t: number[] = []
  for (let i = 0; i < 64; i++) {
    t[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000)
  }

  // 初始化变量
  let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476]

  // 处理每个 512 位块
  for (let i = 0; i < paddedLen; i++) {
    const chunk = blocks.slice(i * 16, (i + 1) * 16)
    ;[a, b, c, d] = md5Transform(a, b, c, d, chunk, s, t)
  }

  // 转换为十六进制字符串
  const result = [a, b, c, d]
    .map(n => {
      return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
    })
    .join('')

  return result
}

/**
 * 生成百度翻译签名
 */
function generateBaiduSign(
  appId: string,
  query: string,
  salt: string,
  appSecret: string
): string {
  const signStr = appId + query + salt + appSecret
  return md5(signStr)
}

/**
 * OpenAI 翻译
 */
async function translateWithOpenAI(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('OpenAI API Key 未配置')
  }

  const endpoint =
    config.apiEndpoint || 'https://api.openai.com/v1/chat/completions'
  const model = config.model || 'gpt-4o-mini'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional translator. Translate the given text accurately and naturally.',
        },
        {
          role: 'user',
          content: `Translate the following text to ${targetLang}:\n\n${text}`,
        },
      ],
      temperature: 0.3,
    }),
  })

  const data = await response.json()

  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content.trim()
  }

  throw new Error('OpenAI 翻译失败')
}

/**
 * Claude 翻译
 */
async function translateWithClaude(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Claude API Key 未配置')
  }

  const endpoint = config.apiEndpoint || 'https://api.anthropic.com/v1/messages'
  const model = config.model || 'claude-3-haiku-20240307'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Translate the following text to ${targetLang}:\n\n${text}`,
        },
      ],
    }),
  })

  const data = await response.json()

  if (data.content && data.content[0] && data.content[0].text) {
    return data.content[0].text.trim()
  }

  throw new Error('Claude 翻译失败')
}

/**
 * Gemini 翻译
 */
async function translateWithGemini(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.apiKey) {
    throw new Error('Gemini API Key 未配置')
  }

  const model = config.model || 'gemini-pro'
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `Translate the following text to ${targetLang}:\n\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    }),
  })

  const data = await response.json()

  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text.trim()
  }

  throw new Error('Gemini 翻译失败')
}

/**
 * 自定义 OpenAI 兼容 API 翻译
 */
async function translateWithCustomOpenAI(
  text: string,
  targetLang: string,
  config: APIConfig
): Promise<string> {
  if (!config.apiKey || !config.apiEndpoint) {
    throw new Error('自定义 API 配置不完整')
  }

  const model = config.model || 'gpt-3.5-turbo'

  const response = await fetch(config.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a professional translator.' },
        { role: 'user', content: `Translate to ${targetLang}:\n\n${text}` },
      ],
    }),
  })

  const data = await response.json()

  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content.trim()
  }

  throw new Error('自定义 API 翻译失败')
}

// ==================== 统一翻译接口 ====================

/**
 * 使用指定服务进行翻译（详细版）
 * @returns TranslationResult 包含音标、定义等详细信息
 */
export async function translateWithServiceDetailed(
  service: TranslationService,
  text: string,
  targetLang: string
): Promise<TranslationResult> {
  // 目前只有 Google Translate 支持详细信息
  if (service.providerId === TranslationProviderId.GOOGLE) {
    return translateWithGoogleDetailed(text, targetLang, service.config)
  }

  // 其他服务降级为简单翻译，包装成 TranslationResult
  const translatedText = await translateWithService(service, text, targetLang)
  return {
    translatedText: translatedText,
    originalText: text,
    targetLanguage: targetLang,
    definitions: [],
  }
}

/**
 * 使用指定服务进行翻译（简化版，仅返回文本）
 */
export async function translateWithService(
  service: TranslationService,
  text: string,
  targetLang: string
): Promise<string> {
  switch (service.providerId) {
    case TranslationProviderId.GOOGLE:
      return translateWithGoogle(text, targetLang, service.config)

    case TranslationProviderId.DEEPL:
      return translateWithDeepL(text, targetLang, service.config)

    case TranslationProviderId.YOUDAO:
      return translateWithYoudao(text, targetLang, service.config)

    case TranslationProviderId.BAIDU:
      return translateWithBaidu(text, targetLang, service.config)

    case TranslationProviderId.OPENAI:
      return translateWithOpenAI(text, targetLang, service.config)

    case TranslationProviderId.CLAUDE:
      return translateWithClaude(text, targetLang, service.config)

    case TranslationProviderId.GEMINI:
      return translateWithGemini(text, targetLang, service.config)

    case TranslationProviderId.CUSTOM_OPENAI:
      return translateWithCustomOpenAI(text, targetLang, service.config)

    default:
      // 自定义服务，默认使用 OpenAI 兼容方式
      return translateWithCustomOpenAI(text, targetLang, service.config)
  }
}

/**
 * 获取已启用的翻译服务（直接从 storage 获取，避免循环依赖）
 */
async function getEnabledServices(): Promise<TranslationService[]> {
  const TRANSLATION_SERVICES_KEY = 'translationServices'

  return new Promise(resolve => {
    chrome.storage.local.get([TRANSLATION_SERVICES_KEY], result => {
      const services = result[TRANSLATION_SERVICES_KEY]
      if (services && Array.isArray(services)) {
        // 筛选已启用且已配置的服务，按优先级排序
        const enabled = (services as TranslationService[])
          .filter(s => s.enabled && s.configured)
          .sort((a, b) => a.priority - b.priority)
        resolve(enabled)
      } else {
        // 如果没有配置，使用默认的 Google Translate
        resolve([
          {
            ...BUILT_IN_SERVICES[0], // Google Translate
            configured: true,
          },
        ])
      }
    })
  })
}

/**
 * 使用优先级和回退机制进行翻译（详细版）
 * @returns TranslationResult 包含音标、定义等详细信息
 */
export async function translateDetailed(
  text: string,
  targetLang: string = 'zh-CN'
): Promise<TranslationResult> {
  const services = await getEnabledServices()

  if (services.length === 0) {
    throw new Error('没有可用的翻译服务，请在设置中配置')
  }

  let lastError: Error | null = null

  // 按优先级依次尝试
  for (const service of services) {
    try {
      console.log(`尝试使用 ${service.name} 进行详细翻译...`)
      const result = await translateWithServiceDetailed(
        service,
        text,
        targetLang
      )
      console.log(`${service.name} 翻译成功，获取到详细信息`)
      return result
    } catch (error) {
      console.warn(`${service.name} 翻译失败:`, error)
      lastError = error as Error
      // 继续尝试下一个服务
    }
  }

  // 所有服务都失败
  throw new Error(
    `所有翻译服务都失败了。最后的错误: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * 使用优先级和回退机制进行翻译（简化版，仅返回文本）
 */
export async function translate(
  text: string,
  targetLang: string = 'zh-CN'
): Promise<string> {
  const services = await getEnabledServices()

  if (services.length === 0) {
    throw new Error('没有可用的翻译服务，请在设置中配置')
  }

  let lastError: Error | null = null

  // 按优先级依次尝试
  for (const service of services) {
    try {
      console.log(`尝试使用 ${service.name} 进行翻译...`)
      const result = await translateWithService(service, text, targetLang)
      console.log(`${service.name} 翻译成功`)
      return result
    } catch (error) {
      console.warn(`${service.name} 翻译失败:`, error)
      lastError = error as Error
      // 继续尝试下一个服务
    }
  }

  // 所有服务都失败
  throw new Error(
    `所有翻译服务都失败了。最后的错误: ${lastError?.message || 'Unknown error'}`
  )
}

/**
 * 测试翻译服务连接
 */
export async function testTranslationService(
  service: TranslationService,
  targetLang: string = 'zh-CN'
): Promise<{ success: boolean; message: string; result?: string }> {
  const testText = 'Hello'

  try {
    const result = await translateWithService(service, testText, targetLang)
    return {
      success: true,
      message: '连接测试成功',
      result,
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || '连接测试失败',
    }
  }
}

// ==================== 旧版兼容 ====================

/**
 * @deprecated 使用新的 translate() 函数
 */
export async function aiTranslate(text: string) {
  return translate(text, 'zh-CN')
}

/**
 * 所有 message action 定义
 */
export const MESSAGE = {
  /**
   * 获取设置消息
   * 用于获取扩展的本地状态和同步配置
   */
  GET_SETTINGS: 'GET_SETTINGS',

  /**
   * 打开选项页面消息
   * 用于打开扩展的设置选项页面
   */
  OPEN_OPTIONS_PAGE: 'OPEN_OPTIONS_PAGE',

  /**
   * 翻译消息
   * 用于请求翻译指定的文本内容
   */
  TRANSLATE: 'TRANSLATE',

  /**
   * 根据原文获取单词消息
   * 用于从本地数据库查询指定原文的单词信息
   */
  GET_WORD_BY_ORIGINAL: 'GET_WORD_BY_ORIGINAL',

  /**
   * 根据 id 获取单词消息
   * 用于从本地数据库查询指定 id 的单词信息
   */
  GET_WORD_BY_ID: 'GET_WORD_BY_ID',

  /**
   * 获取所有单词消息
   * 用于从本地数据库查询所有单词信息
   */
  GET_ALL_WORDS: 'GET_ALL_WORDS',

  /**
   * 保存单词消息
   * 当用户保存一个新单词时触发此消息
   */
  SAVE_WORD: 'SAVE_WORD',

  /**
   * 增加单词统计消息
   * 当用户增加单词统计时触发此消息
   */
  INCREASE_COUNT: 'INCREASE_COUNT',

  /**
   * 应用复习动作消息
   * 当用户应用复习动作时触发此消息
   */
  APPLY_REVIEW_ACTION: 'APPLY_REVIEW_ACTION',

  /**
   * 获取所有应该复习的单词消息
   * 用于从本地数据库查询所有应该复习的单词信息
   */
  GET_WORDS_DUE_FOR_REVIEW: 'GET_WORDS_DUE_FOR_REVIEW',

  /**
   * 导入单词消息
   * 用于批量导入单词到数据库
   */
  IMPORT_WORD: 'IMPORT_WORD',

  /**
   * 清除所有单词消息
   * 用于删除所有单词和统计数据
   */
  CLEAR_ALL_WORDS: 'CLEAR_ALL_WORDS',
} as const

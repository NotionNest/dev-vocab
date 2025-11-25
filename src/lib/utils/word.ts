export type Classification = 'word' | 'sentence' | 'empty'

/**
 * 根据文本内容分类为单词、句子或空内容。
 * @param text - 要分类的文本。
 * @returns 分类结果：'word' | 'sentence' | 'empty'。
 */
export function classifySelection(text: string): 'word' | 'sentence' | 'empty' {
  const cleaned = text.trim();

  // 空内容
  if (!cleaned) return "empty";

  const sentencePunctuation = /[.!?;:，。！？]/;
  const hasPunc = sentencePunctuation.test(cleaned);

  const parts = cleaned.split(/\s+/);
  const wordCount = parts.length;

  const isWordLike = /^[a-zA-Z-]+$/.test(cleaned);

  // 三段判定策略
  if (wordCount === 1 && isWordLike && !hasPunc) {
    return "word"; // 单词
  }

  if (wordCount > 1 || hasPunc) {
    return "sentence"; // 句子
  }

  // 默认 fallback：按句子处理
  return "sentence";
}

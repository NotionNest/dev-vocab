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

/**
 * 获取选中文本的上下文，优先获取包含内联元素的完整段落文本。
 * @param selection - 要提取上下文的 selection 对象。
 * @returns 上下文字符串。
 */
export const getContextFromSelection = (selection: Selection): string => {
  if (!selection || selection.rangeCount === 0) {
    return ''
  }

  const range = selection.getRangeAt(0)
  
  // 策略1: 优先查找最近的块级元素（如 P、DIV 等），获取完整文本内容
  // 这样可以包含所有内联元素（如 <a> 标签）的文本
  const blockElements = [
    'P',
    'DIV',
    'ARTICLE',
    'SECTION',
    'LI',
    'BLOCKQUOTE',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'TD',
    'TH',
  ]

  let node: Node | null = range.commonAncestorContainer

  // 向上查找最近的块级元素
  while (node && node.nodeType !== Node.DOCUMENT_NODE) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      if (blockElements.includes(element.tagName)) {
        const fullText = element.textContent?.trim()
        if (fullText && fullText.length > 0) {
          // 如果块级元素文本较长，尝试提取包含选中位置的句子
          const selectedText = selection.toString().trim()
          if (selectedText && fullText.length > selectedText.length * 2) {
            // 计算选中文本在完整文本中的位置
            const startOffset = fullText.indexOf(selectedText)
            if (startOffset !== -1) {
              const endOffset = startOffset + selectedText.length
              const sentence = extractSentenceFromText(
                fullText,
                startOffset,
                endOffset
              )
              // 如果提取到句子，返回句子；否则返回完整文本
              return sentence || fullText
            }
          }
          return fullText
        }
      }
    }
    node = node.parentNode
  }

  // 策略2: 如果没找到块级元素，尝试从 commonAncestorContainer 获取完整文本
  const commonAncestor = range.commonAncestorContainer
  if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
    const elementText = (commonAncestor as Element).textContent?.trim()
    if (elementText && elementText.length > 0) {
      return elementText
    }
  }

  // 策略3: 尝试从当前文本节点提取完整句子
  const container = range.startContainer
  if (container.nodeType === Node.TEXT_NODE || container.nodeType === Node.ELEMENT_NODE) {
    const textContent = container.textContent ?? ''
    if (textContent) {
      const selectedText = selection.toString().trim()
      const startOffset = textContent.indexOf(selectedText)
      if (startOffset !== -1) {
        const endOffset = startOffset + selectedText.length
        const sentence = extractSentenceFromText(
          textContent,
          startOffset,
          endOffset
        )
        if (sentence) {
          return sentence
        }
      }
      return textContent.trim()
    }
  }

  // 策略4: 降级到 anchorNode 的文本内容
  const anchorText = selection.anchorNode?.textContent?.trim()
  if (anchorText && anchorText.length > 0) {
    return anchorText
  }

  // 策略5: 尝试获取 startContainer 的文本内容
  const startText = range.startContainer.textContent?.trim()
  if (startText && startText.length > 0) {
    return startText
  }

  return ''
}


/**
 * 从文本中提取包含选中位置的完整句子。
 * @param text - 完整的文本内容。
 * @param startOffset - 选中文本的起始位置。
 * @param endOffset - 选中文本的结束位置。
 * @returns 提取的句子字符串。
 */
const extractSentenceFromText = (
  text: string,
  startOffset: number,
  endOffset: number
): string => {
  if (!text) {
    return ''
  }

  // 查找句子边界（句号、问号、感叹号等）
  const sentenceEndings = /[.!?。！？；;]/
  
  // 从选中位置向前查找句子开始位置
  let startBoundary = 0
  for (let i = Math.min(startOffset, text.length - 1); i >= 0; i--) {
    if (sentenceEndings.test(text[i])) {
      startBoundary = i + 1
      break
    }
    if (i === 0) {
      startBoundary = 0
    }
  }

  // 从选中位置向后查找句子结束位置
  let endBoundary = text.length
  for (let i = endOffset; i < text.length; i++) {
    if (sentenceEndings.test(text[i])) {
      endBoundary = i + 1
      break
    }
  }

  return text.slice(startBoundary, endBoundary).trim()
}

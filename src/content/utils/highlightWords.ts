/**
 * 页面单词高亮功能
 * 扫描页面文本，高亮单词本中的单词
 */

const HIGHLIGHT_CLASS = 'devvocab-highlight'
const HIGHLIGHT_ATTRIBUTE = 'data-devvocab-highlight'

/**
 * 检查元素是否应该被跳过（不进行高亮处理）
 */
function shouldSkipElement(element: Element): boolean {
  // 跳过已高亮的元素
  if (
    element.hasAttribute(HIGHLIGHT_ATTRIBUTE) ||
    element.classList.contains(HIGHLIGHT_CLASS)
  ) {
    return true
  }

  // 如果父元素已经被高亮，则跳过
  if (element.closest(`.${HIGHLIGHT_CLASS}`)) {
    return true
  }

  // 跳过脚本、样式、noscript等标签
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED']
  if (skipTags.includes(element.tagName)) {
    return true
  }

  // 跳过扩展自己的容器
  if (
    element.id === 'devvocab-extension-root' ||
    element.closest('#devvocab-extension-root')
  ) {
    return true
  }

  // 跳过input、textarea等表单元素
  const skipInputTypes = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']
  if (skipInputTypes.includes(element.tagName)) {
    return true
  }

  return false
}

/**
 * 创建单词匹配的正则表达式
 * 使用单词边界确保精确匹配
 */
function createWordRegex(words: string[]): RegExp {
  // 按长度降序排序，优先匹配长单词
  const sortedWords = [...words].sort((a, b) => b.length - a.length)

  // 转义特殊字符并创建正则表达式
  const escapedWords = sortedWords.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )

  // 使用单词边界匹配，不区分大小写
  const pattern = `\\b(${escapedWords.join('|')})\\b`
  return new RegExp(pattern, 'gi')
}

/**
 * 高亮文本节点中的单词
 */
function highlightTextNode(
  textNode: Text,
  regex: RegExp,
  wordsSet: Set<string>
): void {
  const text = textNode.textContent
  if (!text) return

  // 检查是否包含匹配的单词
  if (!regex.test(text)) return

  // 重置正则表达式（因为test会改变lastIndex）
  regex.lastIndex = 0

  const parent = textNode.parentNode
  if (!parent) return

  // 如果父元素已经被标记为跳过，则不处理
  if (parent.nodeType === Node.ELEMENT_NODE) {
    const element = parent as Element
    if (shouldSkipElement(element)) return
  }

  const matches: Array<{ word: string; index: number; length: number }> = []
  let match: RegExpExecArray | null

  // 收集所有匹配项
  while ((match = regex.exec(text)) !== null) {
    const matchedWord = match[1]
    // 验证匹配的单词是否在单词本中（不区分大小写）
    const lowerMatched = matchedWord.toLowerCase()
    if (wordsSet.has(lowerMatched)) {
      matches.push({
        word: matchedWord,
        index: match.index,
        length: matchedWord.length,
      })
    }
  }

  // 如果没有匹配项，直接返回
  if (matches.length === 0) return

  // 按索引排序
  matches.sort((a, b) => a.index - b.index)

  // 创建文档片段来存储新的节点
  const fragment = document.createDocumentFragment()
  let lastIndex = 0

  // 从前向后处理匹配项
  for (const match of matches) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index)
      fragment.appendChild(document.createTextNode(beforeText))
    }

    // 添加高亮的单词
    const highlightSpan = document.createElement('span')
    highlightSpan.className = HIGHLIGHT_CLASS
    highlightSpan.setAttribute(HIGHLIGHT_ATTRIBUTE, 'true')
    highlightSpan.textContent = match.word
    highlightSpan.onclick = () => {}
    fragment.appendChild(highlightSpan)

    lastIndex = match.index + match.length
  }

  // 添加最后剩余的文本
  if (lastIndex < text.length) {
    const afterText = text.substring(lastIndex)
    fragment.appendChild(document.createTextNode(afterText))
  }

  // 替换原始文本节点
  parent.replaceChild(fragment, textNode)
}

/**
 * 高亮页面中的所有单词本单词
 */
export async function highlightWordsInPage(words: string[]): Promise<void> {
  if (words.length === 0) return

  // 创建单词集合用于快速查找（不区分大小写）
  const wordsSet = new Set(
    words.map(w => w.toLowerCase().trim()).filter(Boolean)
  )

  if (wordsSet.size === 0) return

  // 创建匹配正则表达式（使用原始单词列表，但需要过滤空值）
  const validWords = words.filter(w => w && w.trim().length > 0)
  const regex = createWordRegex(validWords)

  // 使用TreeWalker遍历所有文本节点
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node: Node): number {
        const textNode = node as Text
        const parent = textNode.parentNode

        // 跳过空文本节点
        if (!textNode.textContent || textNode.textContent.trim().length === 0) {
          return NodeFilter.FILTER_REJECT
        }

        // 如果父元素应该被跳过，则跳过
        if (parent && parent.nodeType === Node.ELEMENT_NODE) {
          const element = parent as Element
          if (shouldSkipElement(element)) {
            return NodeFilter.FILTER_REJECT
          }
        }

        // 如果文本节点已经在高亮元素内，则跳过
        let checkParent: Node | null = parent
        while (checkParent) {
          if (checkParent.nodeType === Node.ELEMENT_NODE) {
            const el = checkParent as Element
            if (
              el.classList.contains(HIGHLIGHT_CLASS) ||
              el.hasAttribute(HIGHLIGHT_ATTRIBUTE)
            ) {
              return NodeFilter.FILTER_REJECT
            }
          }
          checkParent = checkParent.parentNode
        }

        return NodeFilter.FILTER_ACCEPT
      },
    }
  )

  const textNodes: Text[] = []
  let node: Node | null

  // 收集所有需要处理的文本节点
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text)
  }

  // 处理每个文本节点
  for (const textNode of textNodes) {
    try {
      // 检查文本节点是否仍然有效（可能在前面的处理中被替换）
      if (textNode.parentNode) {
        highlightTextNode(textNode, regex, wordsSet)
      }
    } catch (error) {
      console.error('高亮单词时出错:', error)
    }
  }
}

/**
 * 移除所有高亮
 */
export function removeHighlights(): void {
  const highlights = document.querySelectorAll(`.${HIGHLIGHT_CLASS}`)
  highlights.forEach(highlight => {
    const parent = highlight.parentNode
    if (parent) {
      // 将高亮span的内容替换为纯文本
      parent.replaceChild(
        document.createTextNode(highlight.textContent || ''),
        highlight
      )
      // 合并相邻的文本节点
      parent.normalize()
    }
  })
}

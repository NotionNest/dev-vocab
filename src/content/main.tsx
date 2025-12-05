// import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './views/App.tsx'
import { handlers } from '@/content/messaging.ts'
import tailwindStyles from '@/assets/style/tailwind.css?inline'
import { highlightWordsInPage, removeHighlights } from './utils/highlightWords'
import { MESSAGE } from '@/background/constants/message'

console.log('devvocab content script loaded')

chrome.runtime.onMessage.addListener(async msg => {
  const fn = handlers[msg.action as keyof typeof handlers]
  if (fn) fn()
  
  // 处理高亮单词的消息
  if (msg.action === 'HIGHLIGHT_WORDS') {
    try {
      const response = await chrome.runtime.sendMessage({
        action: MESSAGE.GET_ALL_WORDS,
      })
      if (response?.data && Array.isArray(response.data)) {
        const words = response.data.map((word: any) => word.originalText).filter(Boolean)
        await highlightWordsInPage(words)
      }
    } catch (error) {
      console.error('高亮单词失败:', error)
    }
  }
  
  // 处理移除高亮的消息
  if (msg.action === 'REMOVE_HIGHLIGHTS') {
    removeHighlights()
  }
})

type ShadowWrapperElement = HTMLDivElement & {
  __devvocabRoot?: Root
}

const SHADOW_WRAPPER_ID = 'devvocab-shadow-app'
const HOST_STYLE_ID = 'devvocab-shadow-style'
const TAILWIND_STYLE_ID = 'devvocab-tailwind-style'
const HOST_ID = 'devvocab-extension-root'

const ensureShadowStyles = (shadowRoot: ShadowRoot) => {
  if (!shadowRoot.getElementById(HOST_STYLE_ID)) {
    const hostStyle = document.createElement('style')
    hostStyle.id = HOST_STYLE_ID
    hostStyle.textContent = `
      :host {
        all: initial;
      }
      #${SHADOW_WRAPPER_ID} {
        font-family: inherit;
        overscroll-behavior: contain;
      }
    `
    shadowRoot.appendChild(hostStyle)
  }

  if (!shadowRoot.getElementById(TAILWIND_STYLE_ID)) {
    const tailwindStyle = document.createElement('style')
    tailwindStyle.id = TAILWIND_STYLE_ID
    tailwindStyle.textContent = tailwindStyles
    shadowRoot.appendChild(tailwindStyle)
  }
}

// 注入高亮样式到页面
const injectHighlightStyles = () => {
  const styleId = 'devvocab-highlight-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .devvocab-highlight {
      background-color: rgba(255, 255, 0, 0.1) !important;
      text-decoration: underline;
      text-decoration-color: rgba(255, 200, 0, 0.4);
      text-decoration-thickness: 2px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .devvocab-highlight:hover {
      background-color: rgba(255, 255, 0, 0.5) !important;
    }
  `
  document.head.appendChild(style)
}

const injectReactComponent = () => {
  let container = document.getElementById(HOST_ID) as HTMLElement | null
  if (!container) {
    container = document.createElement('div')
    container.id = HOST_ID
    // inject container to body
    document.body.appendChild(container)
  }

  // 创建或获取 Shadow DOM 容器，用于隔离扩展样式，避免与页面样式冲突
  let shadowContainer = container.shadowRoot
  if (!shadowContainer) {
    shadowContainer = container.attachShadow({ mode: 'open' })
  }

  ensureShadowStyles(shadowContainer)

  let shadowWrapper = shadowContainer.getElementById(
    SHADOW_WRAPPER_ID
  ) as ShadowWrapperElement | null
  if (!shadowWrapper) {
    shadowWrapper = document.createElement('div') as ShadowWrapperElement
    shadowWrapper.id = SHADOW_WRAPPER_ID
    shadowContainer.appendChild(shadowWrapper)
  }
  let root = shadowWrapper.__devvocabRoot
  if (!root) {
    root = createRoot(shadowWrapper)
    shadowWrapper.__devvocabRoot = root
  }

  root.render(
    // <StrictMode>
    <App shadowRoot={shadowWrapper} />
    // </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectReactComponent()
    injectHighlightStyles()
  }, {
    once: true,
  })
} else {
  injectReactComponent()
  injectHighlightStyles()
}

// 监听页面动态内容变化，自动高亮新添加的内容
let highlightObserver: MutationObserver | null = null
let highlightDebounceTimer: number | null = null

const startObserving = async () => {
  // 先移除旧的观察者
  if (highlightObserver) {
    highlightObserver.disconnect()
  }

  // 检查是否启用高亮功能（可以从chrome.storage读取配置）
  try {
    const result = await chrome.storage.local.get('enableWordHighlight')
    const enableHighlight = result.enableWordHighlight !== false // 默认启用

    if (!enableHighlight) {
      return
    }

    // 执行高亮的函数
    const performHighlight = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          action: MESSAGE.GET_ALL_WORDS,
        })
        if (response?.data && Array.isArray(response.data)) {
          const words = response.data.map((word: any) => word.originalText).filter(Boolean)
          await highlightWordsInPage(words)
        }
      } catch (error) {
        console.error('自动高亮失败:', error)
      }
    }

    // 初始高亮
    await performHighlight()

    // 监听DOM变化，高亮新添加的内容（使用防抖）
    highlightObserver = new MutationObserver(mutations => {
      let shouldHighlight = false
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 检查是否有新的文本节点被添加
          for (const node of mutation.addedNodes) {
            // 跳过扩展自己的元素
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              if (element.id === 'devvocab-extension-root' || 
                  element.closest('#devvocab-extension-root')) {
                continue
              }
            }
            
            if (node.nodeType === Node.TEXT_NODE || 
                (node.nodeType === Node.ELEMENT_NODE && 
                 (node as Element).textContent && 
                 (node as Element).textContent!.trim().length > 0)) {
              shouldHighlight = true
              break
            }
          }
        }
      }

      if (shouldHighlight) {
        // 清除之前的定时器
        if (highlightDebounceTimer) {
          clearTimeout(highlightDebounceTimer)
        }
        
        // 防抖：延迟执行，避免频繁触发
        highlightDebounceTimer = window.setTimeout(() => {
          performHighlight()
          highlightDebounceTimer = null
        }, 1000) // 1秒防抖
      }
    })

    highlightObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  } catch (error) {
    console.error('启动高亮观察者失败:', error)
  }
}

// 等待页面加载完成后开始观察
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startObserving, { once: true })
} else {
  startObserving()
}

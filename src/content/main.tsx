// import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import App from './views/App.tsx'
import {
  ExtensionMessage,
  handleRuntimeMessage,
} from '@/lib/utils/messaging.ts'
import tailwindStyles from '@/assets/style/tailwind.css?inline'

console.log('[CRXJS] Hello world from content script!')

/**
 * 监听来自 background service worker 或 popup 发送到 content script 的消息
 * 当 background 或 popup 调用 chrome.tabs.sendMessage() 时，会触发此监听器
 */
chrome.runtime.onMessage.addListener(
  (request: ExtensionMessage, _sender, sendResponse) => {
    handleRuntimeMessage(request, sendResponse)
    return true
  }
)

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
  console.log('shadowWrapper', shadowWrapper)

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
  document.addEventListener('DOMContentLoaded', injectReactComponent, {
    once: true,
  })
} else {
  injectReactComponent()
}

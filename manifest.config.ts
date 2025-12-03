import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  description: pkg.description,
  icons: {
    '16': 'icon16.png',
    '48': 'icon48.png',
    '128': 'icon128.png',
  },
  action: {
    default_icon: {
      '16': 'icon16.png',
      '48': 'icon48.png',
    },
    default_popup: 'src/popup/index.html',
  },
  background: {
    scripts: ['src/background/index.ts'],
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  options_page: 'src/options/index.html',
  permissions: [
    'sidePanel',
    'contentSettings',
    'activeTab',
    'storage',
    'tabs',
    'contextMenus',
    'scripting',
  ],
  content_scripts: [{
    js: ['src/content/main.tsx'],
    matches: ['https://*/*', 'http://*/*'],
  }],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  host_permissions: ['http://*/*', 'https://*/*'],
  commands: {
    'command_word_capture': {
      suggested_key: {
        default: 'Ctrl+Shift+Y',
        mac: 'Command+Shift+Y',
      },
      description: '将选定的单词添加到单词本',
    },
    'toggle_sidepanel': {
      suggested_key: {
        default: 'Ctrl+Shift+L',
        mac: 'Command+Shift+L',
      },
      description: '打开侧边栏',
    },
  },
})

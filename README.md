# DevVocab - 开发者词汇助手

> 一个专为开发者打造的智能划词翻译 Chrome 扩展，支持 Notion 同步和本地存储管理。

## ✨ 功能特性

- 🔍 **划词翻译**：在任何网页上选择单词或短语即可快速翻译
- 📚 **单词本管理**：自动保存查询的单词，建立个人词汇库
- ☁️ **Notion 同步**：将词汇数据同步到 Notion 数据库，方便跨设备查看和管理
- 💾 **本地存储**：支持本地 SQLite 存储，离线也能使用
- ⌨️ **快捷键支持**：使用 `Ctrl+Shift+Y` (Mac: `Command+Shift+Y`) 快速添加单词
- 🎨 **深色模式**：支持明暗主题自动切换
- 📊 **学习统计**：使用 Recharts 可视化你的学习进度
- 🎯 **侧边栏面板**：在浏览器侧边栏查看完整的单词列表

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI
- **图表**: Recharts
- **路由**: React Router DOM 7
- **Chrome 扩展**: Manifest V3 + @crxjs/vite-plugin

## 📦 安装

### 从源码安装

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/devVocab.git
   cd devVocab
   ```

2. **安装依赖**
   ```bash
   # 使用 pnpm (推荐)
   pnpm install
   
   # 或使用 npm
   npm install
   ```

3. **开发模式运行**
   ```bash
   pnpm dev
   ```

4. **加载到 Chrome**
   - 打开 Chrome 浏览器，访问 `chrome://extensions/`
   - 启用右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `dist` 文件夹

### 从发布包安装

1. 下载 `release/crx-dev-vocab-1.0.0.zip`
2. 解压文件
3. 在 Chrome 扩展管理页面加载解压后的文件夹

## 🚀 开发指南

### 项目结构

```
devVocab/
├── src/
│   ├── background/         # 后台脚本
│   │   ├── index.ts       # Service Worker
│   │   └── notion-sync.ts # Notion 同步逻辑
│   ├── content/           # 内容脚本
│   │   ├── main.tsx       # 内容脚本入口
│   │   ├── components/    # 划词弹窗组件
│   │   └── views/         # 内容页面视图
│   ├── popup/             # 浏览器工具栏弹窗
│   │   ├── index.html
│   │   ├── main.tsx
│   │   └── App.tsx
│   ├── options/           # 选项/设置页面
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/    # 设置组件
│   │   └── views/         # 设置页面视图
│   │       ├── General.tsx
│   │       ├── AITranslation.tsx
│   │       └── dataSync/  # 数据同步配置
│   │           ├── index.tsx
│   │           ├── Local.tsx
│   │           └── Notion.tsx
│   ├── sidepanel/         # 侧边栏面板
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   └── views/
│   ├── components/        # 共享 UI 组件
│   │   └── ui/           # Radix UI 封装组件
│   ├── hooks/            # React Hooks
│   │   ├── useTheme.ts
│   │   ├── useScrollLock.ts
│   │   └── useChromeStorage.ts
│   └── lib/              # 工具函数
│       └── utils/
│           ├── chrome.ts
│           ├── messaging.ts
│           ├── storage.ts
│           ├── translate.ts
│           └── word.ts
├── public/               # 静态资源
├── dist/                 # 构建输出目录
└── release/              # 发布包目录
```

### 可用脚本

```bash
# 开发模式（支持热更新）
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 主要功能模块

#### 1. 内容脚本 (Content Script)
- 监听页面文本选择事件
- 显示翻译弹窗
- 使用 Shadow DOM 隔离样式
- 支持深色模式

#### 2. 后台脚本 (Background Script)
- 处理扩展的生命周期事件
- 管理 Notion 同步任务
- 处理快捷键命令
- 维护本地数据存储

#### 3. 选项页面 (Options Page)
- **通用设置**: 主题、语言等基础配置
- **AI 翻译**: 翻译服务配置
- **数据同步**: 本地/Notion 同步设置

#### 4. 侧边栏面板 (Side Panel)
- 查看所有保存的单词
- 查看单词详情
- 复习模式
- 学习统计

## ⚙️ Notion 集成配置

### 1. 创建 Notion 集成

1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击"+ New integration"
3. 填写集成名称（如 "DevVocab"）
4. 选择关联的工作区
5. 点击"Submit"
6. 复制生成的 **Internal Integration Token** (格式: `secret_...`)

### 2. 创建数据库

在 Notion 中创建一个新的数据库，必须包含以下属性（**属性名称区分大小写**）：

| 属性名称 | 类型 (Type) | 说明 |
|---------|------------|------|
| **Word** | Title | 单词或短语 |
| **Definition** | Rich Text | 英文释义 |
| **Translation** | Rich Text | 中文翻译 |
| **Status** | Select | 学习状态 |
| **Context** | Rich Text | 上下文例句 |
| **Source** | URL | 来源网址 |
| **Tags** | Multi-select | 标签分类 |
| **Created At** | Date | 创建时间 |
| **Updated At** | Date | 更新时间 |

### 3. 连接数据库

1. 在 Notion 数据库页面，点击右上角"..."菜单
2. 选择"Connections" → "Connect to"
3. 找到并选择你创建的集成（如 "DevVocab"）
4. 复制数据库 URL 中的数据库 ID（32 位十六进制字符串）
   - 格式: `https://www.notion.so/{workspace}/{database_id}?v=...`

### 4. 在扩展中配置

1. 右键点击浏览器工具栏的扩展图标，选择"选项"
2. 进入"数据同步" → "Notion" 标签页
3. 填入你的 **Integration Token** 和 **Database ID**
4. 点击"测试连接"验证配置
5. 保存设置

⚠️ **注意**：当前版本不支持自定义属性映射，请确保数据库属性名称与上表完全一致。

## 🔑 快捷键

| 快捷键 | 功能 |
|-------|------|
| `Ctrl+Shift+Y` (Windows/Linux) | 将选中的单词添加到单词本 |
| `Command+Shift+Y` (Mac) | 将选中的单词添加到单词本 |

可以在 `chrome://extensions/shortcuts` 中自定义快捷键。

## 🎨 主题

扩展支持自动跟随系统主题，也可以在选项页面手动切换：
- ☀️ 浅色模式
- 🌙 深色模式
- 🔄 跟随系统

## 📝 权限说明

此扩展需要以下权限：

- **activeTab**: 获取当前标签页信息
- **storage**: 保存用户设置和词汇数据
- **sidePanel**: 显示侧边栏面板
- **tabs**: 管理标签页
- **contextMenus**: 添加右键菜单
- **scripting**: 注入内容脚本
- **host_permissions**: 在所有网页上运行内容脚本

## 🏗️ 构建和发布

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录，同时会在 `release/` 目录生成打包的 zip 文件。

### 发布到 Chrome Web Store

1. 构建生产版本
2. 将 `release/crx-dev-vocab-1.0.0.zip` 上传到 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. 填写商店信息（描述、截图、隐私政策等）
4. 提交审核

## 🤝 贡献

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开发注意事项

### Chrome 扩展开发

- 使用 Manifest V3 规范
- Service Worker 替代传统的 background pages
- 使用 Chrome Storage API 而非 localStorage

### 样式隔离

内容脚本使用 Shadow DOM 来隔离样式，避免与宿主页面的 CSS 冲突。

### 热更新

开发模式下，使用 `@crxjs/vite-plugin` 实现了热模块替换（HMR），修改代码后浏览器会自动重载扩展。

## 🐛 已知问题

- Notion 同步功能尚在开发中
- 部分网站可能因为 CSP 策略导致内容脚本无法正常工作

## 📅 更新日志

### v1.0.0 (2024-11)
- 🎉 首次发布
- ✅ 基础划词翻译功能
- ✅ 本地存储支持
- ✅ Notion 集成框架
- ✅ 侧边栏面板
- ✅ 深色模式支持

## 📮 联系方式

- 问题反馈: [GitHub Issues](https://github.com/yourusername/devVocab/issues)
- 邮箱: your.email@example.com

## 📜 许可证

[MIT License](LICENSE)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**


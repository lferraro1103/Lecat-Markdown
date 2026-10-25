# Lecat Markdown — 离线 Markdown 编辑器与阅读器

[English](README.md) · [Español](README.es.md) · **简体中文** · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [Português](README.pt.md)

适用于 **Windows、macOS 和 Linux** 的桌面 Markdown 编辑器。支持所见即所得编辑、源码与预览分栏、Mermaid 流程图和 KaTeX / LaTeX 数学公式，无需账号，文档编辑与渲染无需联网。

**当前稳定版：3.6.0。** [下载最新版](https://github.com/lferraro1103/Lecat-Markdown/releases/latest) · [版本记录](https://github.com/lferraro1103/Lecat-Markdown/releases)

## 主要功能

- 拖动标签页或使用右键菜单并排打开两个文档；独立编辑和滚动，可调整分隔线，并恢复已保存文件的布局。
- 精简顶部区域：在标签页展开文件信息，保存状态位于搜索旁。
- Linux x64 提供 AppImage 和 Debian/Ubuntu `.deb` 安装包，需手动更新。
- 浮动格式工具栏可展开或收起，右键选择五种位置，垂直排列位于上方。Windows 分享使用系统原生面板。
- 可视化编辑、阅读模式和 Markdown 源码预览；支持表格、任务列表、图片和代码高亮。
- 离线 Mermaid 图表及 LaTeX 公式；导出 PDF、HTML、EPUB、PNG 和图表 SVG。
- 本地文件侧栏、文件名过滤、最近文档、文件信息面板；创建文件、文件夹或从剪贴板创建 Markdown。
- 自动恢复打开的文档；支持浅色、深色和系统主题，触控板缩放及窗口置顶。
- macOS Quick Look 快速预览、系统分享菜单和 Finder 文件选择；原生打印对话框。
- `lecat README.md` 命令行与 `lecat://file/…` 链接；自定义应用链接需确认授权。
- 简体中文、繁体中文、日语、英语、西班牙语、葡萄牙语、法语和德语界面；可选测试版更新通道。

## 安装

- **Windows 10/11 x64：** 下载 `Setup-x64.exe` 安装，或解压便携版 ZIP。
- **macOS 13+：** 按 Apple Silicon（arm64）或 Intel（x64）下载 DMG，将应用拖到“应用程序”。
- **macOS 12 Monterey：** 使用[独立兼容版本](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.6.0-macos12.1)。

Homebrew 使用本项目自己的 tap：

```sh
brew tap lferraro1103/lecat-markdown https://github.com/lferraro1103/Lecat-Markdown
brew install --cask lferraro1103/lecat-markdown/lecat-markdown
```

在设置中切换界面语言。已安装版本可通过“检查更新”获取新版；macOS 3.2.5 或更早版本需要先手动安装一次新版。Mac 包使用 ad-hoc 签名，未经过 Apple 公证；首次打开方式及更新说明见[更新文档](docs/UPDATES.md)。

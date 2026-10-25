# Lecat Markdown — 離線 Markdown 編輯器與閱讀器

[English](README.md) · [Español](README.es.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [日本語](README.ja.md) · [Português](README.pt.md)

適用於 **Windows 與 macOS** 的桌面 Markdown 編輯器。支援所見即所得編輯、原始碼與預覽分欄、Mermaid 流程圖和 KaTeX / LaTeX 數學公式。編輯與繪製本機文件不需要帳號或網路連線。

**目前穩定版：3.4.1。** [下載最新版](https://github.com/lferraro1103/Lecat-Markdown/releases/latest) · [版本紀錄](https://github.com/lferraro1103/Lecat-Markdown/releases)

## 主要功能

- 視覺編輯、閱讀模式與 Markdown 原始碼預覽，支援表格、待辦清單、圖片及程式碼醒目提示。
- 離線 Mermaid 圖表與 LaTeX 公式；輸出 PDF、HTML、EPUB、PNG 及圖表 SVG。
- 本機檔案側邊欄、名稱篩選、最近使用文件與檔案資訊；建立檔案、資料夾或從剪貼簿建立 Markdown。
- 還原開啟的文件；淺色、深色及系統主題、觸控板縮放與視窗置頂。
- macOS Quick Look 快速預覽、原生分享選單、Finder 檔案選擇及系統列印對話框。
- `lecat README.md` 指令與 `lecat://file/…` 連結；開啟其他應用程式的連結前確認授權。
- 繁體中文、簡體中文、日文、英文、西班牙文、葡萄牙文、法文與德文介面，以及可選的測試版更新通道。

## 安裝

- **Windows 10/11 x64：** 執行 `Setup-x64.exe`，或解壓縮可攜版 ZIP。
- **macOS 13+：** 依 Apple Silicon（arm64）或 Intel（x64）下載 DMG，將應用程式拖入「應用程式」。
- **macOS 12 Monterey：** 使用[獨立相容版本](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.4.1-macos12.1)。

Homebrew 使用本專案的 tap：

```sh
brew tap lferraro1103/lecat-markdown https://github.com/lferraro1103/Lecat-Markdown
brew install --cask lferraro1103/lecat-markdown/lecat-markdown
```

介面語言可於設定切換。已安裝的版本可使用「檢查更新」取得新版；macOS 3.2.5 或更早版本需要先手動安裝新版一次。Mac 套件採用 ad-hoc 簽署，未經 Apple 公證；首次開啟與更新方式請參閱[更新文件](docs/UPDATES.md)。

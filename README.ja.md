# Lecat Markdown — オフライン Markdown エディタ・ビューア

[English](README.md) · [Español](README.es.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · **日本語** · [Português](README.pt.md)

**Windows / macOS** 向けのデスクトップ Markdown エディタです。見たまま編集できるビジュアル編集、ソースとプレビューの分割表示、Mermaid 図表、KaTeX / LaTeX 数式に対応。ローカル文書の編集と描画にアカウントやネット接続は必要ありません。

**安定版：3.4.0。** [最新版をダウンロード](https://github.com/lferraro1103/Lecat-Markdown/releases/latest) · [リリース一覧](https://github.com/lferraro1103/Lecat-Markdown/releases)

## 主な機能

- ビジュアル編集、読み取り、Markdown ソース表示。表、タスクリスト、画像、コードの強調表示。
- オフラインの Mermaid 図表と LaTeX 数式。PDF・HTML・EPUB・PNG、図表の SVG 書き出し。
- ファイルのサイドバー、名前フィルタ、最近の書類、ファイル情報インスペクタ。
- ファイルやフォルダの作成、クリップボードからの Markdown 作成、開いていた書類の復元。
- ライト・ダーク・システムテーマ、トラックパッドのピンチ操作、ウィンドウの最前面表示。
- macOS Quick Look、標準の共有メニュー、Finder のファイル選択とプリントダイアログ。
- `lecat README.md` コマンドと `lecat://file/…` URL。外部アプリへのリンクには許可確認。
- 日本語・簡体字中国語・繁体字中国語・英語・スペイン語・ポルトガル語・フランス語・ドイツ語。ベータ版の受信は任意。

## インストール

- **Windows 10/11 x64：** `Setup-x64.exe`、またはポータブル ZIP。
- **macOS 13 以降：** Apple Silicon（arm64）/ Intel（x64）の DMG を選び、アプリケーションフォルダに移動。
- **macOS 12 Monterey：** [互換リリース](https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.4.0-macos12.1)を利用してください。

Homebrew 用の独自 tap：

```sh
brew tap lferraro1103/lecat-markdown https://github.com/lferraro1103/Lecat-Markdown
brew install --cask lferraro1103/lecat-markdown/lecat-markdown
```

表示言語は設定から変更できます。インストール済みアプリは「アップデートを確認」から更新できます。Mac 3.2.5 以前は、一度だけ新版の手動インストールが必要です。Mac 版は ad-hoc 署名で、Apple の公証は含みません。初回起動と更新の説明は[更新ガイド](docs/UPDATES.md)をご覧ください。

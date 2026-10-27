cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.9.3"
  sha256 arm: "c253ce92b23e599dc06a457c0b3be7d58f37c4ae3f3c1ef44e3e15fed09362b6",
         intel: "7d8f393e8236ad36efe36f309c921ec94ab82613c457ec276fd26bce71654fc7"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

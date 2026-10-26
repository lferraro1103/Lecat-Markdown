cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.7.0"
  sha256 arm: "8d25b3c5a332bbd400dc548d7d3fc02a46286449c2a629eecfd375abf1b92cfe",
         intel: "c0b320aa005f7a82f1f3e118fe2d5ba0524b0e3938641a3b9042fed7b4eb1a22"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

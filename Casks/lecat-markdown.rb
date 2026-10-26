cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.7.2"
  sha256 arm: "e974980187509158516c53d0d07f83d81369d08c511137cad880771953d9789a",
         intel: "d5dadac44ec239c2bd29a3fc75b253a4fe4583d53f4c037981506d983dd304ea"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

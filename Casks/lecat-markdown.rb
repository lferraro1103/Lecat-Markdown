cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.9.2"
  sha256 arm: "2bb463e0cfbad3041dbfdbe27c349e7f4de33c40ca169c1e7bf5d6e353d11a84",
         intel: "01334e39991c47a58e2341c16f6fefee1bca3759adda35fb5594c00d7c252af0"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

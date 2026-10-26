cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.7.1"
  sha256 arm: "d2d8bb8b8b2ec24925369059a2fbbf928e7b533f7fb0c4c804f4a5fcb11b6254",
         intel: "19542695d14da23c835edd3e2a4c22c7d02c94190dd2264a11b31dd5989eb8a5"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

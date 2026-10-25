cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.6.0"
  sha256 arm: "506111f1f6863644c87cdf2fc410dfe6f684a45052108b0efbd13f46ef50ee36",
         intel: "dd1b8bc32a8c7ad82e843064f89abc203aab22a87c0994edb1258956f61e98ad"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

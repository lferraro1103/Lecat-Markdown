cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.5.0"
  sha256 arm: "829ec80a489ced80f0b0557e758819313172973663552e274bdcddee38ace540",
         intel: "3617b147532753fbe3ad5ca5c8c378612c4ba007bc268910a195a98d39a96f03"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

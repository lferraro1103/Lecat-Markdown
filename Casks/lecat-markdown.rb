cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.4.1"
  sha256 arm: "da9ddcce8a65c28ead92cd733c1c3298841a1fd6377be89ef46160dea372fcc4",
         intel: "762d22a30f01390374ad5849c75ac865968626905aeea5f1bb781de241889697"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

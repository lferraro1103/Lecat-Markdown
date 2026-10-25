cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.3.0"
  sha256 arm: "6a0552f4ac70288a1b3e493dc6f0ae083dcef5674c71457d1b5658be6a86360a",
         intel: "cc199441ba8072b082a56b30feca4753e218018c61fc92c82a5e946734ffaaa6"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"

  # User documents and the application profile are preserved on uninstall.
end

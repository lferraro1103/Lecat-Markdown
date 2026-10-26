cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.8.0"
  sha256 arm: "bb08c5d25b8a6b4ec745c795f7cf7ca75ec72354fd43535b1bb76315e9b5d5dc",
         intel: "d72f5ea2a54629c1dc1170b50f04067cb424547db5237fbef4c5005c68f0bfc8"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

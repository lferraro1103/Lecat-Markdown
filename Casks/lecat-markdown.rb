cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.9.5"
  sha256 arm: "e17fcfd895ffdaf46af5dadf49184b786755a295e3c8354621d4be326139ed3d",
         intel: "7c91a908f7f4afbffe1b14d20f939eb536d63bdcffb398cdc5affd62d6ad8647"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

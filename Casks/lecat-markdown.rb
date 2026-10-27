cask "lecat-markdown" do
  arch arm: "arm64", intel: "x64"

  version "3.9.1"
  sha256 arm: "197839dda44b8e763eead4040044f622d6baf413fe6bcc2b81ddaff842de9c6f",
         intel: "540b7ef9375b7dc0aa478e1895575cce335e3f3898c13cdc57ed951a36d1048f"

  url "https://github.com/lferraro1103/Lecat-Markdown/releases/download/v#{version}/Lecat-Markdown-#{version}-macOS-#{arch}.dmg"
  name "Lecat Markdown"
  desc "Markdown editor and reader with offline diagrams and equations"
  homepage "https://github.com/lferraro1103/Lecat-Markdown"

  depends_on macos: ">= :ventura"

  app "Lecat - Markdown.app"
  binary "#{appdir}/Lecat - Markdown.app/Contents/Resources/bin/lecat"

  # User documents and the application profile are preserved on uninstall.
end

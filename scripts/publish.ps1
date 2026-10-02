$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try { npm run dist; if ($LASTEXITCODE -ne 0) { throw 'Electron build failed' } } finally { Pop-Location }

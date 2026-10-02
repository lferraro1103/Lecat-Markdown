$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try { npm test; if ($LASTEXITCODE -ne 0) { throw 'Core tests failed' }; npm run audit; if ($LASTEXITCODE -ne 0) { throw 'Electron audit failed' } } finally { Pop-Location }

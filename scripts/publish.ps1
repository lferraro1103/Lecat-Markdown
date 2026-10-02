param([string]$OutputDirectory)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if(-not $OutputDirectory){$OutputDirectory=Join-Path $projectRoot 'dist/ClaroMD'}
$project=Join-Path $projectRoot 'src/ClaroMD.csproj'
dotnet publish $project -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o $OutputDirectory
if($LASTEXITCODE -ne 0){throw 'La compilación falló.'}
Copy-Item (Join-Path $projectRoot 'README.md') $OutputDirectory
Copy-Item (Join-Path $projectRoot 'examples'),(Join-Path $projectRoot 'branding'),(Join-Path $projectRoot 'licenses') $OutputDirectory -Recurse -Force
Write-Host "Portable listo: $OutputDirectory"


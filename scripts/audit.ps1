param([string]$AppDirectory)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
if(-not $AppDirectory){$AppDirectory=Join-Path $projectRoot 'dist/ClaroMD'}
if(-not(Test-Path (Join-Path $AppDirectory 'ClaroMD.exe'))){& (Join-Path $PSScriptRoot 'publish.ps1') -OutputDirectory $AppDirectory}
$auditExe=Join-Path $AppDirectory 'ClaroMD.exe'
$resultPath=Join-Path $AppDirectory 'audit-output/audit-results.txt'
if(Test-Path $resultPath){Remove-Item -LiteralPath $resultPath}
$auditProcess=Start-Process -FilePath $auditExe -ArgumentList '--audit' -WindowStyle Hidden -PassThru
if(-not $auditProcess.WaitForExit(60000)){Stop-Process -Id $auditProcess.Id;throw 'La auditoría excedió 60 segundos.'}
if(-not(Test-Path $resultPath)){throw 'La auditoría no produjo resultados.'}
$results=Get-Content $resultPath
$results | Write-Host
if($results -notcontains 'SUCCESS'){throw 'La auditoría encontró errores.'}

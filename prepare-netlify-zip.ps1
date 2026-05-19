# Creates christmissionschool-netlify.zip on your Desktop for Netlify drag-and-drop deploy.
$root = $PSScriptRoot
$desktop = [Environment]::GetFolderPath("Desktop")
$zipPath = Join-Path $desktop "christmissionschool-netlify.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$temp = Join-Path $env:TEMP "cms-netlify-deploy"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Path $temp | Out-Null

$excludeDirs = @("node_modules", "data", ".git")
$excludeFiles = @(".env", ".env.local", "christmissionschool-netlify.zip")

Get-ChildItem -Path $root -Force | ForEach-Object {
  if ($_.Name -in $excludeDirs) { return }
  if ($_.PSIsContainer) {
    Copy-Item -Path $_.FullName -Destination (Join-Path $temp $_.Name) -Recurse -Force
  } elseif ($_.Name -notin $excludeFiles) {
    Copy-Item -Path $_.FullName -Destination (Join-Path $temp $_.Name) -Force
  }
}

# Remove nested junk if copied
@("node_modules", "data") | ForEach-Object {
  $p = Join-Path $temp $_
  if (Test-Path $p) { Remove-Item $p -Recurse -Force }
}

Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $zipPath -Force
Remove-Item $temp -Recurse -Force

Write-Host ""
Write-Host "Done! Zip created:" -ForegroundColor Green
Write-Host $zipPath
Write-Host ""
Write-Host "Next: go to https://app.netlify.com/drop and drag this zip file onto the page."

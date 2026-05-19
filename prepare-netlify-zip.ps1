# Creates christmissionschool-netlify.zip on your Desktop for Netlify deploy.
# Reads Render URL from RENDER-API-URL.txt (first https line).

$root = $PSScriptRoot
$desktop = [Environment]::GetFolderPath("Desktop")
$zipPath = Join-Path $desktop "christmissionschool-netlify.zip"
$urlFile = Join-Path $root "RENDER-API-URL.txt"

$backend = ""
if (Test-Path $urlFile) {
  Get-Content $urlFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -match "^https://") { $backend = $line -replace "/$", "" }
  }
}
if (-not $backend) {
  Write-Host "ERROR: Edit RENDER-API-URL.txt and add your Render URL on a line starting with https://" -ForegroundColor Red
  exit 1
}

$redirectsLine = "/api/*  $backend/api/:splat  200!"
Set-Content -Path (Join-Path $root "_redirects") -Value $redirectsLine -Encoding UTF8
Write-Host "Wrote _redirects -> $backend" -ForegroundColor Cyan

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
$pngCount = (Get-ChildItem (Join-Path $root "assets") -Filter "*.png" -ErrorAction SilentlyContinue).Count
if ($pngCount -eq 0) {
  Write-Host "WARNING: No PNG images in assets/ - site will load without photos." -ForegroundColor Yellow
  Write-Host "         Copy images into D:\Christ Mission Bihar\assets\ then run this script again."
}
Write-Host "1) Confirm RENDER-API-URL.txt has the correct Render URL"
Write-Host "2) Netlify - Deploys - drag this zip to redeploy"

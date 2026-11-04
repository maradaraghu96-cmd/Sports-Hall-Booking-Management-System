
$ErrorActionPreference = "Stop"

Write-Host "`n=== Sports Hall Booking System: Frontend Startup ===" -ForegroundColor Cyan

# 1. Locate frontend folder
$frontendFolder = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path (Join-Path $frontendFolder "package.json"))) {
    Write-Host "ERROR: Frontend package.json was not found." -ForegroundColor Red
    exit 1
}

# 2. Check Node.js and npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Node.js and npm are available." -ForegroundColor Green

# 3. Install dependencies if node_modules is missing
Set-Location $frontendFolder

if (-not (Test-Path ".\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm ci

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Frontend dependency installation failed." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Frontend dependencies are ready." -ForegroundColor Green

# 4. Start React/Vite frontend
Write-Host "`nStarting frontend development server..." -ForegroundColor Cyan
npm run dev -- --host 127.0.0.1

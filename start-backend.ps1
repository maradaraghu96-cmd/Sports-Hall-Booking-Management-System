
$ErrorActionPreference = "Stop"

Write-Host "`n=== Sports Hall Booking System: Backend Startup ===" -ForegroundColor Cyan

# 1. Locate and load the root .env file
$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: Root .env file was not found." -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim().TrimStart([char]0xFEFF)

    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2

        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()

            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }

            if ($key -match '^[A-Za-z_][A-Za-z0-9_]*$') {
                Set-Item -Path "Env:$key" -Value $value
            }
        }
    }
}

Write-Host "Environment configuration loaded." -ForegroundColor Green

# 2. Check required configuration without displaying secret values
$requiredVariables = @(
    "DB_PASSWORD",
    "MAIL_USERNAME",
    "MAIL_APP_PASSWORD"
)

foreach ($variable in $requiredVariables) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($variable))) {
        Write-Host "ERROR: $variable is missing or empty in .env." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Required configuration checks passed." -ForegroundColor Green

# 3. Check MySQL Windows service
$mysqlServices = @(Get-Service | Where-Object {
    $_.Name -like "*MySQL*" -or $_.DisplayName -like "*MySQL*"
})

if ($mysqlServices.Count -gt 0) {
    $runningService = $mysqlServices | Where-Object { $_.Status -eq "Running" }

    if ($runningService) {
        Write-Host "MySQL service is running." -ForegroundColor Green
    }
    else {
        Write-Host "MySQL service is stopped. Attempting to start it..." -ForegroundColor Yellow

        try {
            $mysqlServices[0] | Start-Service
            Write-Host "MySQL service started." -ForegroundColor Green
        }
        catch {
            Write-Host "Could not start MySQL automatically. Start the MySQL service manually." -ForegroundColor Red
            Write-Host $_.Exception.Message
            exit 1
        }
    }
}
else {
    Write-Host "WARNING: No MySQL Windows service was detected. Check MySQL manually." -ForegroundColor Yellow
}

# 4. Start Spring Boot
$backendFolder = Join-Path $PSScriptRoot "backend"
$mavenWrapper = Join-Path $backendFolder "mvnw.cmd"

if (-not (Test-Path $mavenWrapper)) {
    Write-Host "ERROR: backend\mvnw.cmd was not found." -ForegroundColor Red
    exit 1
}

Set-Location $backendFolder

Write-Host "`nStarting Spring Boot backend..." -ForegroundColor Cyan
& .\mvnw.cmd spring-boot:run

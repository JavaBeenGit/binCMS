#Requires -Version 5.1
<#
.SYNOPSIS
    binCms — 로컬 개발 서버 일괄 실행 (Windows / PowerShell).

.DESCRIPTION
    Docker MySQL(3307)을 띄운 뒤 백엔드(8080)·프론트(3000)를 각각 새 창에서 기동한다.
    각 창을 닫으면 해당 서버가 종료된다. 상세·네이티브 DB 경로는 docs/30-dev/guides/dev-setup.md.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$backend = Join-Path $root 'apps\backend'
$frontend = Join-Path $root 'apps\frontend'

# 1. DB — docker 는 진행상황을 stderr 로 내보내므로 이 호출 동안만 오류 정책을 낮추고 종료코드로 판정한다.
$eap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
docker compose -f (Join-Path $backend 'docker-compose.yml') up -d --wait
$dbCode = $LASTEXITCODE
$ErrorActionPreference = $eap
if ($dbCode -ne 0) { throw "MySQL 기동 실패 — Docker Desktop 이 떠 있는지 확인하세요." }

# 2. 비밀값 파일 안내 (없어도 기동은 되지만 소셜 로그인·메일이 비활성)
if (-not (Test-Path (Join-Path $backend 'application-secret.yml'))) {
    Write-Host "  [warn] apps/backend/application-secret.yml 이 없습니다. application-secret.example.yml 을 복사해 채우세요." -ForegroundColor Yellow
}

function Start-InNewWindow([string]$title, [string]$command) {
    Start-Process powershell -ArgumentList @(
        '-NoExit', '-Command',
        "`$host.UI.RawUI.WindowTitle='$title'; $command"
    )
    Write-Host "  [start] $title" -ForegroundColor Green
}

Start-InNewWindow 'bincms-backend (8080)'  "Set-Location '$backend'; `$env:DB_PORT=3307; .\gradlew.bat bootRun"
Start-InNewWindow 'bincms-frontend (3000)' "Set-Location '$frontend'; npm run dev"

Write-Host "`n두 서버를 새 창에서 기동했습니다. 사용자: http://localhost:3000  관리자: http://localhost:3000/admin/login (admin/1234)" -ForegroundColor Cyan

# Script de PowerShell para verificar el estado del backend
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "VERIFICACION DEL BACKEND SISCOCA" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar proceso Java
Write-Host "[1] Verificando proceso Java..." -ForegroundColor Yellow
$javaProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcess) {
    Write-Host "[OK] Proceso Java encontrado (PID: $($javaProcess.Id))" -ForegroundColor Green
    $javaProcess | Format-Table Id, ProcessName, StartTime -AutoSize
} else {
    Write-Host "[ERROR] No hay procesos Java corriendo" -ForegroundColor Red
}
Write-Host ""

# Verificar puerto 8080
Write-Host "[2] Verificando puerto 8080 (configurado en application.yml)..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "[OK] Puerto 8080 esta en uso" -ForegroundColor Green
    Write-Host "   PID: $($port8080.OwningProcess)" -ForegroundColor Gray
    Write-Host "   Estado: $($port8080.State)" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Puerto 8080 no esta en uso" -ForegroundColor Red
}
Write-Host ""

# Verificar puerto 8000
Write-Host "[3] Verificando puerto 8000..." -ForegroundColor Yellow
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "[OK] Puerto 8000 esta en uso" -ForegroundColor Green
    Write-Host "   PID: $($port8000.OwningProcess)" -ForegroundColor Gray
} else {
    Write-Host "[INFO] Puerto 8000 no esta en uso" -ForegroundColor Gray
}
Write-Host ""

# Intentar conexión HTTP
Write-Host "[4] Intentando conexion HTTP al backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body '{"username":"test","password":"test"}' -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] Backend responde en puerto 8080" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "[OK] Backend responde (error de autenticacion esperado)" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACION ESPERADA:" -ForegroundColor Cyan
Write-Host "- Puerto: 8080 (según application.yml)" -ForegroundColor White
Write-Host "- URL Base: http://localhost:8080/api" -ForegroundColor White
Write-Host "- Endpoint Login: http://localhost:8080/api/auth/login" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan



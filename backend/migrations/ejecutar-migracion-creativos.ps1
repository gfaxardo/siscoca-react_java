# Script para ejecutar la migracion de creativos en PostgreSQL
# Ejecutar desde PowerShell: .\ejecutar-migracion-creativos.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   MIGRACION: CREAR TABLA CREATIVOS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion de la base de datos
$dbHost = "168.119.226.236"
$dbPort = "5432"
$database = "siscoca_dev"
$username = "yego_user"
# La contrasena contiene caracteres especiales (& y >), usar comillas simples
$password = '37>MNA&-35+'
$archivoMigracion = "create_tabla_creativos.sql"

# Verificar que el archivo de migracion existe
$rutaArchivo = Join-Path $PSScriptRoot $archivoMigracion
if (-not (Test-Path $rutaArchivo)) {
    Write-Host "[ERROR] No se encontro el archivo $archivoMigracion" -ForegroundColor Red
    Write-Host "   Ruta esperada: $rutaArchivo" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Archivo de migracion encontrado: $rutaArchivo" -ForegroundColor Green
Write-Host ""

# Verificar si psql esta instalado
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "[ERROR] psql no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "1. Instalar PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "2. Agregar PostgreSQL al PATH (generalmente: C:\Program Files\PostgreSQL\XX\bin)" -ForegroundColor Yellow
    Write-Host "3. Usar pgAdmin o DBeaver para ejecutar el script manualmente" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "O ejecuta manualmente:" -ForegroundColor Cyan
    Write-Host "   psql -h $dbHost -p $dbPort -U $username -d $database -f `"$rutaArchivo`"" -ForegroundColor White
    exit 1
}

Write-Host "[OK] psql encontrado: $($psqlPath.Source)" -ForegroundColor Green
Write-Host ""

# Crear variable de entorno temporal para la contrasena
$env:PGPASSWORD = $password

Write-Host "Conectando a la base de datos..." -ForegroundColor Cyan
Write-Host "   Host: $dbHost" -ForegroundColor Gray
Write-Host "   Puerto: $dbPort" -ForegroundColor Gray
Write-Host "   Base de datos: $database" -ForegroundColor Gray
Write-Host "   Usuario: $username" -ForegroundColor Gray
Write-Host ""

try {
    # Ejecutar la migracion
    Write-Host "Ejecutando migracion..." -ForegroundColor Yellow
    Write-Host ""
    
    $resultado = & psql -h $dbHost -p $dbPort -U $username -d $database -f $rutaArchivo 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host "   [OK] MIGRACION EJECUTADA EXITOSAMENTE" -ForegroundColor Green
        Write-Host "==========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "La tabla 'creativos' ha sido creada correctamente." -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Reinicia el backend de Spring Boot" -ForegroundColor White
        Write-Host "2. Verifica que la aplicacion se conecte correctamente" -ForegroundColor White
        Write-Host "3. Prueba crear un creativo desde el frontend" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host "   [ERROR] ERROR EN LA MIGRACION" -ForegroundColor Red
        Write-Host "==========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Salida del comando:" -ForegroundColor Yellow
        Write-Host $resultado -ForegroundColor Red
        Write-Host ""
        Write-Host "Verifica:" -ForegroundColor Yellow
        Write-Host "- La conexion a la base de datos" -ForegroundColor White
        Write-Host "- Los permisos del usuario" -ForegroundColor White
        Write-Host "- Que la base de datos exista" -ForegroundColor White
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Error inesperado: $_" -ForegroundColor Red
} finally {
    # Limpiar la variable de entorno
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""

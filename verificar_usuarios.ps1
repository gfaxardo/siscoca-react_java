# Script para verificar usuarios en la base de datos
$loginUrl = "http://localhost:8080/api/auth/login"

# Intentar login con gfajardo
$body = @{
    username = "gfajardo"
    password = "siscoca2024"
} | ConvertTo-Json

Write-Host "Intentando login con gfajardo:siscoca2024..."
$response = Invoke-RestMethod -Uri $loginUrl -Method POST -Body $body -ContentType "application/json"

Write-Host "Response:"
$response | ConvertTo-Json -Depth 3



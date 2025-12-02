#!/bin/bash

# Script de despliegue para yego-backend

# Entrar al directorio del backend
echo "==> Entrando al directorio backend..."
cd backend || { echo "❌ No se encontró el directorio 'backend'. Abortando."; exit 1; }

echo "==> Eliminando carpeta target/"
sudo rm -rf target/

echo "==> Listando archivos del proyecto..."
ls

echo "==> Haciendo git pull..."
git pull

echo "==> Compilando proyecto..."
mvn clean package -DskipTests

echo "==> Copiando JAR a /opt/ticketera..."
cp target/yego-backend-1.0.0.jar /opt/ticketera/yego-backend.jar

echo "==> Ajustando permisos..."
sudo chown root:root /opt/ticketera/yego-backend.jar
sudo chmod 755 /opt/ticketera/yego-backend.jar

echo "==> Reiniciando servicio..."
sudo systemctl restart yego_backend.service

echo "==> Mostrando logs..."
tail -f /var/log/yego-backend.log

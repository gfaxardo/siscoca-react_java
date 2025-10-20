#!/bin/bash

echo "Iniciando SISCOCA Backend..."
echo

# Verificar si Java está instalado
if ! command -v java &> /dev/null; then
    echo "Error: Java no está instalado o no está en el PATH"
    echo "Por favor instala Java 18 o superior"
    exit 1
fi

# Verificar si Maven está instalado
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven no está instalado o no está en el PATH"
    echo "Por favor instala Maven 3.6 o superior"
    exit 1
fi

echo "Compilando proyecto..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "Error en la compilación"
    exit 1
fi

echo
echo "Iniciando servidor en http://localhost:8080/api"
echo "Presiona Ctrl+C para detener el servidor"
echo

mvn spring-boot:run

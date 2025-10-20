#!/bin/bash

echo "========================================"
echo "    SISCOCA 2.0 - Build Completo"
echo "========================================"
echo

echo "Construyendo Frontend..."
echo
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "Error construyendo el frontend"
    exit 1
fi
echo "Frontend construido exitosamente"
echo

echo "Construyendo Backend..."
echo
cd ../backend
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "Error construyendo el backend"
    exit 1
fi
echo "Backend construido exitosamente"
echo

echo "========================================"
echo "    Build completado exitosamente"
echo "========================================"
echo
echo "Frontend: frontend/dist/"
echo "Backend:  backend/target/siscoca-backend-2.0.0.jar"
echo

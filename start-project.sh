#!/bin/bash

echo "========================================"
echo "    SISCOCA 2.0 - Sistema Completo"
echo "========================================"
echo

echo "Iniciando Backend..."
echo
cd backend
gnome-terminal -- bash -c "./start-backend.sh; exec bash" &
echo "Backend iniciado en http://localhost:8080/api"
echo

echo "Esperando 5 segundos para que el backend se inicie..."
sleep 5

echo
echo "Iniciando Frontend..."
echo
cd ../frontend
gnome-terminal -- bash -c "npm run dev; exec bash" &
echo "Frontend iniciado en http://localhost:5173"
echo

echo "========================================"
echo "    Sistema iniciado correctamente"
echo "========================================"
echo
echo "Backend:  http://localhost:8080/api"
echo "Frontend: http://localhost:5173"
echo
echo "Presiona Enter para cerrar..."
read

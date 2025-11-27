#!/bin/bash
PGPASSWORD='37>MNA&-35+' psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev << 'SQL'
-- Ver columnas de creativos (donde falló)
\d creativos

-- Ver columnas de historico_semanal
\d historico_semanal

-- Ver columnas de mensajes_chat
\d mensajes_chat

-- Ver columnas de tareas_pendientes  
\d tareas_pendientes
SQL

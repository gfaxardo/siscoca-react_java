-- ================================================
-- SCRIPT PARA VERIFICAR ESTRUCTURA DE TABLAS
-- ================================================

-- Ver todas las tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver columnas de historico_semanal
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historico_semanal'
ORDER BY ordinal_position;

-- Ver columnas de mensajes_chat
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mensajes_chat'
ORDER BY ordinal_position;

-- Ver columnas de tareas_pendientes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tareas_pendientes'
ORDER BY ordinal_position;

-- Ver columnas de creativos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'creativos'
ORDER BY ordinal_position;

-- Ver columnas de log_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'log_entries'
ORDER BY ordinal_position;

-- Ver columnas de historial_cambios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'historial_cambios'
ORDER BY ordinal_position;

-- Ver columnas de campanas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'campanas'
ORDER BY ordinal_position;

-- Ver todos los índices existentes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;


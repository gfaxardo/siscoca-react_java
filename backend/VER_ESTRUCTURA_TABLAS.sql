-- ========================================
-- EJECUTA ESTO EN pgAdmin o DBeaver
-- para ver la estructura REAL de las tablas
-- ========================================

-- 1. Ver estructura de creativos
SELECT 
    column_name, 
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'creativos'
ORDER BY ordinal_position;

-- 2. Ver estructura de historico_semanal  
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'historico_semanal'
ORDER BY ordinal_position;

-- 3. Ver estructura de mensajes_chat
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'mensajes_chat'
ORDER BY ordinal_position;

-- 4. Ver estructura de tareas_pendientes
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tareas_pendientes'
ORDER BY ordinal_position;

-- 5. Ver TODAS las foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;


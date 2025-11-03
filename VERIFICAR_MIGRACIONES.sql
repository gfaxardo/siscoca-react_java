-- ============================================================
-- VERIFICAR MIGRACIONES - Sistema de Usuarios y Tareas
-- ============================================================

-- ============================================================
-- PARTE 1: VERIFICAR CAMPO INICIALES
-- ============================================================

SELECT 
    '✓ Campo iniciales verificado' as estado,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'usuarios' 
  AND column_name = 'iniciales';

-- Ver usuarios con sus iniciales
SELECT 
    '✓ Usuarios con iniciales:' as estado,
    id,
    username,
    nombre,
    iniciales,
    rol
FROM usuarios
ORDER BY rol, nombre;

-- ============================================================
-- PARTE 2: VERIFICAR TABLA TAREAS_PENDIENTES
-- ============================================================

-- Verificar existencia de tabla
SELECT 
    '✓ Tabla tareas_pendientes existe' as estado,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'tareas_pendientes';

-- Ver estructura de tabla
SELECT 
    '✓ Columnas de tareas_pendientes:' as estado,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tareas_pendientes'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    '✓ Índices de tareas_pendientes:' as estado,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'tareas_pendientes'
ORDER BY indexname;

-- ============================================================
-- PARTE 3: VERIFICAR TABLA MENSAJES_CHAT
-- ============================================================

-- Verificar existencia de tabla
SELECT 
    '✓ Tabla mensajes_chat existe' as estado,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_name = 'mensajes_chat';

-- Ver estructura de tabla
SELECT 
    '✓ Columnas de mensajes_chat:' as estado,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'mensajes_chat'
ORDER BY ordinal_position;

-- Verificar índices
SELECT 
    '✓ Índices de mensajes_chat:' as estado,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'mensajes_chat'
ORDER BY indexname;

-- ============================================================
-- RESUMEN FINAL
-- ============================================================

SELECT 
    '✓ RESUMEN DE MIGRACIONES' as estado,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'usuarios' AND column_name = 'iniciales') as campo_iniciales,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name = 'tareas_pendientes') as tabla_tareas,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_name = 'mensajes_chat') as tabla_chat,
    (SELECT COUNT(*) FROM pg_indexes 
     WHERE tablename IN ('tareas_pendientes', 'mensajes_chat')) as total_indices;

-- ============================================================
-- FIN DE VERIFICACIÓN
-- ============================================================


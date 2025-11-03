-- ============================================================
-- SCRIPT DE CORRECCIÓN: Usuario gfajardo
-- ============================================================
-- Este script verifica y corrige el usuario gfajardo
-- para que pueda hacer login correctamente
-- ============================================================

-- Verificar si el usuario existe y su estado actual
SELECT 
    'Estado actual del usuario:' as info,
    id,
    username,
    nombre,
    rol,
    activo,
    iniciales
FROM usuarios 
WHERE username = 'gfajardo';

-- Si el usuario existe pero está inactivo, activarlo
UPDATE usuarios 
SET activo = true 
WHERE username = 'gfajardo' AND activo = false;

-- Verificar que el campo 'activo' existe y tiene un valor por defecto
DO $$
BEGIN
    -- Asegurar que el campo activo existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'activo'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Asegurar que todos los usuarios tengan activo = true por defecto
UPDATE usuarios 
SET activo = true 
WHERE activo IS NULL;

-- Verificar usuarios después de la corrección
SELECT 
    'Usuarios después de la corrección:' as info,
    id,
    username,
    nombre,
    rol,
    activo,
    iniciales
FROM usuarios 
WHERE username IN ('gfajardo', 'gfajardo2', 'acruz', 'rortega')
ORDER BY username;

-- Verificar que el usuario gfajardo puede hacer login
-- (activo = true y existe)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM usuarios 
            WHERE username = 'gfajardo' 
            AND activo = true
        ) 
        THEN '✓ Usuario gfajardo listo para login'
        ELSE '✗ Usuario gfajardo NO está listo para login'
    END as estado;



-- Script de migración para corregir tipos de datos y agregar columnas faltantes
-- Ejecutar este script en la base de datos PostgreSQL

-- 1. Agregar columnas nuevas si no existen
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS tipo_aterrizaje VARCHAR(50);

ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS url_aterrizaje TEXT;

ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS nombre_plataforma VARCHAR(255);

-- 2. Actualizar tipo de datos de columnas existentes que pueden ser muy largas
-- Cambiar archivo_creativo a TEXT (para almacenar archivos en base64 que pueden ser muy largos)
ALTER TABLE campanas 
ALTER COLUMN archivo_creativo TYPE TEXT;

-- Cambiar url_informe a TEXT (las URLs pueden ser muy largas)
ALTER TABLE campanas 
ALTER COLUMN url_informe TYPE TEXT;

-- 3. Aumentar el tamaño de columnas que pueden necesitar más espacio
ALTER TABLE campanas 
ALTER COLUMN nombre TYPE VARCHAR(500);

ALTER TABLE campanas 
ALTER COLUMN nombre_archivo_creativo TYPE VARCHAR(500);

ALTER TABLE campanas 
ALTER COLUMN id_plataforma_externa TYPE VARCHAR(500);

-- Verificar cambios
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'campanas' 
AND column_name IN ('archivo_creativo', 'url_informe', 'nombre', 'tipo_aterrizaje', 'url_aterrizaje', 'nombre_plataforma')
ORDER BY column_name;


-- Script para corregir tamaños de columnas en la tabla campanas
-- Ejecutar este script en la base de datos PostgreSQL
-- Base de datos: siscoca_dev
-- Usuario: yego_user
-- Host: 168.119.226.236:5432

-- Actualizar tipo de datos de columnas existentes que pueden ser muy largas
-- Cambiar archivo_creativo a TEXT (para almacenar archivos en base64 que pueden ser muy largos)
ALTER TABLE campanas 
ALTER COLUMN archivo_creativo TYPE TEXT USING archivo_creativo::TEXT;

-- Cambiar url_informe a TEXT (las URLs pueden ser muy largas)
ALTER TABLE campanas 
ALTER COLUMN url_informe TYPE TEXT USING url_informe::TEXT;

-- Aumentar el tamaño de columnas que pueden necesitar más espacio
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
AND column_name IN ('archivo_creativo', 'url_informe', 'nombre', 'nombre_archivo_creativo', 'id_plataforma_externa')
ORDER BY column_name;


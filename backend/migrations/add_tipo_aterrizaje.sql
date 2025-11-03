-- Script para agregar columnas y actualizar tipos de datos en la tabla campanas
-- Ejecutar este script en la base de datos PostgreSQL

-- Agregar columnas nuevas si no existen
ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS tipo_aterrizaje VARCHAR(50);

ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS url_aterrizaje TEXT;

ALTER TABLE campanas 
ADD COLUMN IF NOT EXISTS nombre_plataforma VARCHAR(255);

-- Actualizar tipo de datos de columnas existentes que pueden ser muy largas
-- Cambiar archivo_creativo a TEXT (para almacenar archivos en base64 que pueden ser muy largos)
ALTER TABLE campanas 
ALTER COLUMN archivo_creativo TYPE TEXT;

-- Cambiar url_informe a TEXT (las URLs pueden ser muy largas)
ALTER TABLE campanas 
ALTER COLUMN url_informe TYPE TEXT;

-- Aumentar el tamaño de columnas que pueden necesitar más espacio
ALTER TABLE campanas 
ALTER COLUMN nombre TYPE VARCHAR(500);

ALTER TABLE campanas 
ALTER COLUMN nombre_archivo_creativo TYPE VARCHAR(500);

ALTER TABLE campanas 
ALTER COLUMN id_plataforma_externa TYPE VARCHAR(500);

-- Comentario: 
-- - La columna tipo_aterrizaje puede ser NULL inicialmente
-- - Las campañas existentes tendrán NULL en este campo hasta que se actualicen
-- - archivo_creativo ahora es TEXT para almacenar archivos base64 grandes


-- Script para corregir el número de semana ISO en registros históricos
-- Ejecutar este script en la base de datos PostgreSQL
-- 
-- Este script corrige los registros que tienen semana_iso = 45 
-- y deberían tener semana_iso = 43
--
-- IMPORTANTE: Ajusta los valores según tus necesidades específicas

-- Verificar registros que necesitan corrección
SELECT 
    id,
    campana_id,
    semana_iso,
    fecha_semana,
    fecha_registro
FROM historico_semanal
WHERE semana_iso = 45
ORDER BY fecha_registro DESC;

-- CORRECCIÓN: Actualizar semana_iso de 45 a 43
-- IMPORTANTE: Ajusta el WHERE según tus criterios específicos
-- Por ejemplo, puedes filtrar por campana_id o fecha_registro
UPDATE historico_semanal
SET semana_iso = 43
WHERE semana_iso = 45
  -- Añade condiciones adicionales si es necesario, por ejemplo:
  -- AND campana_id = 21  -- para una campaña específica
  -- AND fecha_registro >= '2024-10-XX' AND fecha_registro <= '2024-10-XX'  -- para un rango de fechas
;

-- Verificar que la corrección se aplicó correctamente
SELECT 
    id,
    campana_id,
    semana_iso,
    fecha_semana,
    fecha_registro
FROM historico_semanal
WHERE semana_iso IN (43, 45)
ORDER BY semana_iso, fecha_registro DESC;


-- Migration: Agregar campo iniciales a usuarios
-- Fecha: 2024

-- Agregar columna iniciales si no existe
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS iniciales VARCHAR(10);

-- Actualizar usuarios existentes con sus iniciales
UPDATE usuarios SET iniciales = 'GF' WHERE nombre = 'Gonzalo Fajardo';
UPDATE usuarios SET iniciales = 'AC' WHERE nombre = 'Ariana de la Cruz';
UPDATE usuarios SET iniciales = 'RO' WHERE nombre = 'Rayedel Ortega';
UPDATE usuarios SET iniciales = 'FH' WHERE nombre = 'Frank Huarilloclla';
UPDATE usuarios SET iniciales = 'DV' WHERE nombre = 'Diego Valdivia';
UPDATE usuarios SET iniciales = 'MP' WHERE nombre = 'Martha Pineda';
UPDATE usuarios SET iniciales = 'JO' WHERE nombre = 'Jhajaira Ochoa';

-- Comentarios
COMMENT ON COLUMN usuarios.iniciales IS 'Iniciales del usuario (ej: GF, AC, RO)';


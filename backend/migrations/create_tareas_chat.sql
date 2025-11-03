-- Migration: Crear tablas para Tareas Pendientes y Chat por Campaña
-- Fecha: 2024

-- Tabla de tipos de tareas (enum implícito en código)
-- No se crea tabla, se usa el enum TipoTarea en Java

-- Tabla de Tareas Pendientes
CREATE TABLE IF NOT EXISTS tareas_pendientes (
    id BIGSERIAL PRIMARY KEY,
    tipo_tarea VARCHAR(50) NOT NULL,
    campana_id BIGINT NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
    asignado_a VARCHAR(255),
    responsable_rol VARCHAR(20) NOT NULL,
    descripcion TEXT,
    urgente BOOLEAN DEFAULT FALSE,
    completada BOOLEAN DEFAULT FALSE,
    fecha_completada TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);

-- Índices para tareas pendientes
CREATE INDEX IF NOT EXISTS idx_tareas_campana ON tareas_pendientes(campana_id);
CREATE INDEX IF NOT EXISTS idx_tareas_completada ON tareas_pendientes(completada);
CREATE INDEX IF NOT EXISTS idx_tareas_responsable ON tareas_pendientes(responsable_rol);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado ON tareas_pendientes(asignado_a);

-- Tabla de Mensajes de Chat
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id BIGSERIAL PRIMARY KEY,
    campana_id BIGINT NOT NULL REFERENCES campanas(id) ON DELETE CASCADE,
    remitente VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    urgente BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mensajes de chat
CREATE INDEX IF NOT EXISTS idx_mensajes_campana ON mensajes_chat(campana_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes_chat(leido);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes_chat(remitente);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes_chat(fecha_creacion);

-- Comentarios
COMMENT ON TABLE tareas_pendientes IS 'Tabla de tareas pendientes por usuario y campaña';
COMMENT ON TABLE mensajes_chat IS 'Tabla de mensajes de chat por campaña';

COMMENT ON COLUMN tareas_pendientes.tipo_tarea IS 'Tipo de tarea: ENVIAR_CREATIVO, ACTIVAR_CAMPANA, SUBIR_METRICAS_TRAFFICKER, SUBIR_METRICAS_DUENO, ARCHIVAR_CAMPANA';
COMMENT ON COLUMN tareas_pendientes.responsable_rol IS 'Rol responsable: ADMIN, TRAFFICKER, DUEÑO';
COMMENT ON COLUMN tareas_pendientes.asignado_a IS 'Nombre del dueño específico o username del trafficker asignado';

COMMENT ON COLUMN mensajes_chat.remitente IS 'Username o nombre del usuario que envía el mensaje';
COMMENT ON COLUMN mensajes_chat.mensaje IS 'Contenido del mensaje';



-- Insertar usuarios iniciales
INSERT INTO usuarios (username, password, nombre, rol, activo, fecha_creacion) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVhUOn0VWqQj7b2x1KqJ5K5K5K', 'Administrador', 'ADMIN', true, NOW()),
('trafficker1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVhUOn0VWqQj7b2x1KqJ5K5K5K', 'Trafficker 1', 'TRAFFICKER', true, NOW()),
('dueno1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVhUOn0VWqQj7b2x1KqJ5K5K5K', 'Dueño 1', 'DUEÑO', true, NOW());

-- Nota: La contraseña para todos los usuarios es 'password123'

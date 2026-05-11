-- Base de datos del SGRSI
-- Sistema de Gestion de Recursos y Soporte de Informatica
-- Script pensado para MySQL / MariaDB

CREATE DATABASE IF NOT EXISTS sgrsi
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sgrsi; 

-- =========================
-- TABLAS DE SEGURIDAD
-- =========================

CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- =========================
-- INVENTARIO
-- =========================

CREATE TABLE categorias_equipo (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE laboratorios (
    id_laboratorio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    ubicacion VARCHAR(150),
    capacidad INT
);

CREATE TABLE equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    id_laboratorio INT,
    codigo_inventario VARCHAR(50) NOT NULL UNIQUE,
    marca VARCHAR(80),
    modelo VARCHAR(80),
    numero_serie VARCHAR(100),
    estado ENUM('Disponible', 'Prestado', 'En reparacion', 'Baja') NOT NULL DEFAULT 'Disponible',
    fecha_compra DATE,
    observaciones TEXT,
    fecha_alta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias_equipo(id_categoria),
    FOREIGN KEY (id_laboratorio) REFERENCES laboratorios(id_laboratorio)
);

CREATE TABLE historial_equipos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_equipo INT NOT NULL,
    id_usuario INT,
    tipo_movimiento ENUM('Alta', 'Modificacion', 'Asignacion', 'Prestamo', 'Devolucion', 'Reparacion', 'Baja') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =========================
-- PRESTAMOS
-- =========================

CREATE TABLE prestamos (
    id_prestamo INT AUTO_INCREMENT PRIMARY KEY,
    id_equipo INT NOT NULL,
    id_usuario_solicitante INT NOT NULL,
    id_usuario_tecnico INT,
    fecha_prestamo DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_devolucion_estimada DATE NOT NULL,
    fecha_devolucion_real DATETIME,
    estado ENUM('Activo', 'Devuelto', 'Vencido') NOT NULL DEFAULT 'Activo',
    observaciones TEXT,
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo),
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_tecnico) REFERENCES usuarios(id_usuario)
);

-- =========================
-- MESA DE AYUDA
-- =========================

CREATE TABLE categorias_ticket (
    id_categoria_ticket INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE tickets (
    id_ticket INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria_ticket INT NOT NULL,
    id_usuario_solicitante INT NOT NULL,
    id_usuario_tecnico INT,
    id_equipo INT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
    estado ENUM('Pendiente', 'En proceso', 'Resuelto', 'Cerrado') NOT NULL DEFAULT 'Pendiente',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME,
    FOREIGN KEY (id_categoria_ticket) REFERENCES categorias_ticket(id_categoria_ticket),
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_tecnico) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_equipo) REFERENCES equipos(id_equipo)
);

CREATE TABLE intervenciones_ticket (
    id_intervencion INT AUTO_INCREMENT PRIMARY KEY,
    id_ticket INT NOT NULL,
    id_usuario_tecnico INT NOT NULL,
    diagnostico TEXT NOT NULL,
    solucion TEXT,
    fecha_intervencion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket),
    FOREIGN KEY (id_usuario_tecnico) REFERENCES usuarios(id_usuario)
);

-- =========================
-- SOLICITUDES DE SERVICIO
-- =========================

CREATE TABLE solicitudes_servicio (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_solicitante INT NOT NULL,
    id_laboratorio INT,
    tipo ENUM('Preparacion de laboratorio', 'Instalacion de software', 'Configuracion de equipos') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_requerida DATE NOT NULL,
    estado ENUM('Pendiente', 'En proceso', 'Realizada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_laboratorio) REFERENCES laboratorios(id_laboratorio)
);

CREATE TABLE tareas_soporte (
    id_tarea INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_tecnico INT,
    id_ticket INT,
    id_solicitud INT,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo ENUM('Preventiva', 'Reactiva') NOT NULL,
    fecha_programada DATE NOT NULL,
    estado ENUM('Pendiente', 'En proceso', 'Finalizada') NOT NULL DEFAULT 'Pendiente',
    FOREIGN KEY (id_usuario_tecnico) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket),
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_servicio(id_solicitud)
);

-- =========================
-- DATOS INICIALES
-- =========================

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema y reportes.'),
('Tecnico', 'Gestiona inventario, prestamos, tickets e intervenciones.'),
('Solicitante', 'Registra tickets y solicitudes de servicio.');

INSERT INTO categorias_equipo (nombre, descripcion) VALUES
('Notebook', 'Equipo portatil.'),
('PC de escritorio', 'Equipo fijo de laboratorio u oficina.'),
('Proyector', 'Equipo audiovisual.'),
('Router', 'Equipo de red.'),
('Impresora', 'Equipo de impresion.');

INSERT INTO categorias_ticket (nombre, descripcion) VALUES
('Hardware', 'Problemas fisicos de equipos.'),
('Software', 'Instalacion, configuracion o errores de programas.'),
('Red', 'Conectividad, internet o red local.'),
('Usuario y acceso', 'Problemas de cuentas, claves o permisos.');

INSERT INTO laboratorios (nombre, ubicacion, capacidad) VALUES
('Laboratorio 1', 'Planta baja', 25),
('Laboratorio 2', 'Primer piso', 30),
('Sala docente', 'Administracion', 10);

-- Usuarios de prueba para el login del prototipo:
-- admin@sgrsi.local / admin123
-- tecnico@sgrsi.local / tecnico123
-- usuario@sgrsi.local / usuario123
-- En una version real, el hash debe generarse desde el backend con un algoritmo seguro como bcrypt.
INSERT INTO usuarios (id_rol, nombre, apellido, email, password_hash, telefono) VALUES
(1, 'Administrador', 'SGRSI', 'admin@sgrsi.local', SHA2('admin123', 256), NULL),
(2, 'Tecnico', 'Soporte', 'tecnico@sgrsi.local', SHA2('tecnico123', 256), NULL),
(3, 'Usuario', 'Solicitante', 'usuario@sgrsi.local', SHA2('usuario123', 256), NULL);

INSERT INTO equipos (id_categoria, id_laboratorio, codigo_inventario, marca, modelo, estado) VALUES
(2, 1, 'PC-LAB1-001', 'Dell', 'OptiPlex', 'Disponible'),
(1, 3, 'NB-DOC-014', 'Lenovo', 'ThinkPad', 'Prestado'),
(3, 2, 'PROY-LAB2-001', 'Epson', 'X41', 'Disponible');

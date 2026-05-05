-- MS-Usuarios - Plataforma Arrendamientos CR
-- Database Schema for Azure SQL Database (MySQL compatibility mode)

-- =====================================================
-- CREACIÓN DE LA BASE DE DATOS
-- =====================================================
CREATE DATABASE IF NOT EXISTS arrendamientos_db;
USE arrendamientos_db;

-- =====================================================
-- TABLA: USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol ENUM('dueno', 'inquilino') NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    propiedades JSON DEFAULT NULL,
    propiedadesCompartidas JSON DEFAULT NULL,
    fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_rol (rol)
);

-- =====================================================
-- TABLA: PROPIEDADES
-- =====================================================
CREATE TABLE propiedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'CRC',
    provincia VARCHAR(100) NOT NULL,
    canton VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    tipo ENUM('casa', 'apartamento', 'terreno', 'comercial') NOT NULL,
    estado ENUM('disponible', 'ocupada', 'mantenimiento') DEFAULT 'disponible',
    imagenes JSON DEFAULT NULL,
    idDueno INT NOT NULL,
    amenidades JSON DEFAULT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idDueno) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_provincia (provincia),
    INDEX idx_tipo (tipo),
    INDEX idx_idDueno (idDueno),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA: INVITACIONES
-- =====================================================
CREATE TABLE invitaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propiedadId INT NOT NULL,
    duenoId INT NOT NULL,
    inquilinoCorreo VARCHAR(255) NOT NULL,
    montoAlquiler DECIMAL(12, 2) NOT NULL,
    montoDeposito DECIMAL(12, 2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'CRC',
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propiedadId) REFERENCES propiedades(id) ON DELETE CASCADE,
    FOREIGN KEY (duenoId) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_propiedadId (propiedadId),
    INDEX idx_duenoId (duenoId),
    INDEX idx_inquilinoCorreo (inquilinoCorreo),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA: CONTRATOS
-- =====================================================
CREATE TABLE contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invitacionId INT NOT NULL,
    propiedadId INT NOT NULL,
    duenoId INT NOT NULL,
    inquilinoId INT NOT NULL,
    montoMensual DECIMAL(12, 2) NOT NULL,
    montoDeposito DECIMAL(12, 2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'CRC',
    fechaInicio DATE NOT NULL,
    estado ENUM('en_proceso', 'activo', 'finalizado', 'cancelado') DEFAULT 'en_proceso',
    estadoDeposito ENUM('pendiente', 'pagado', 'devuelto') DEFAULT 'pendiente',
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invitacionId) REFERENCES invitaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (propiedadId) REFERENCES propiedades(id) ON DELETE CASCADE,
    FOREIGN KEY (duenoId) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (inquilinoId) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_inquilinoId (inquilinoId),
    INDEX idx_duenoId (duenoId),
    INDEX idx_propiedadId (propiedadId),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA: PAGOS
-- =====================================================
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('mensualidad', 'deposito') NOT NULL,
    idContrato INT NOT NULL,
    idPropiedad INT NOT NULL,
    idDueno INT NOT NULL,
    idInquilino INT NOT NULL,
    mes INT NOT NULL CHECK (mes >= 1 AND mes <= 12),
    año INT NOT NULL CHECK (año >= 2020),
    monto DECIMAL(12, 2) NOT NULL,
    moneda VARCHAR(10) NOT NULL DEFAULT 'CRC',
    comprobante TEXT NOT NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    fechaSubida DATETIME NOT NULL,
    fechaRevision DATETIME DEFAULT NULL,
    motivoRechazo TEXT DEFAULT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idContrato) REFERENCES contratos(id) ON DELETE CASCADE,
    FOREIGN KEY (idPropiedad) REFERENCES propiedades(id) ON DELETE CASCADE,
    FOREIGN KEY (idDueno) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (idInquilino) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_idDueno (idDueno),
    INDEX idx_idInquilino (idInquilino),
    INDEX idx_idContrato (idContrato),
    INDEX idx_mes_anio (mes, año),
    INDEX idx_estado (estado)
);

-- =====================================================
-- TABLA: NOTIFICACIONES
-- =====================================================
CREATE TABLE notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    tipo ENUM('invitacion', 'pago', 'contrato', 'mensaje', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha DATETIME NOT NULL,
    link VARCHAR(500) DEFAULT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_leida (leida),
    INDEX idx_tipo (tipo)
);

-- =====================================================
-- TABLA: CONVERSACIONES
-- =====================================================
CREATE TABLE conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participants JSON NOT NULL,
    propertyId INT DEFAULT NULL,
    type ENUM('consulta_propiedad', 'contrato_activo', 'pago_comprobante', 'general') NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES propiedades(id) ON DELETE SET NULL,
    INDEX idx_type (type)
);

-- =====================================================
-- TABLA: MENSAJES
-- =====================================================
CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversationId INT NOT NULL,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    content TEXT NOT NULL,
    type ENUM('text', 'image') DEFAULT 'text',
    status ENUM('enviado', 'leido') DEFAULT 'enviado',
    fecha DATETIME NOT NULL,
    fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fechaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversationId) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_conversationId (conversationId),
    INDEX idx_senderId (senderId),
    INDEX idx_receiverId (receiverId),
    INDEX idx_status (status)
);

-- =====================================================
-- USUARIO DE EJEMPLO (contraseña: "password123")
-- =====================================================
-- INSERT INTO usuarios (nombre, correo, contrasena, rol, telefono)
-- VALUES ('Juan Pérez', 'juan@example.com', '$2a$10$XQxBtLd3j5fW1h5v1examplehash', 'dueno', '+50612345678');
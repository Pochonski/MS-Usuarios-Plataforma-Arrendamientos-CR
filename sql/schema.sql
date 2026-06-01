-- MS-Usuarios - Plataforma Arrendamientos CR
-- Database Schema for Azure SQL Database (SQL Server)
-- Migrated from MySQL syntax to SQL Server syntax

-- =====================================================
-- CREACIÓN DE LA BASE DE DATOS
-- =====================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'arrendamientos_db')
BEGIN
    CREATE DATABASE arrendamientos_db;
END;
GO

USE arrendamientos_db;
GO

-- =====================================================
-- TABLA: USUARIOS
-- =====================================================
IF OBJECT_ID('Usuarios', 'U') IS NOT NULL DROP TABLE Usuarios;
GO

CREATE TABLE Usuarios (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(255) NOT NULL,
    ContrasenaHash NVARCHAR(MAX) NULL,           -- NULL for OAuth users
    Rol NVARCHAR(20) NOT NULL,
    Telefono NVARCHAR(20) NULL,
    Avatar NVARCHAR(500) NULL,
    GoogleId NVARCHAR(255) NULL,                -- Google user ID for OAuth
    FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
    UltimoLogin DATETIME2 NULL,
    CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('dueno', 'inquilino'))
);
GO

CREATE UNIQUE INDEX IX_Usuarios_Correo ON Usuarios (Correo);
GO
CREATE INDEX IX_Usuarios_GoogleId ON Usuarios (GoogleId);
GO

-- =====================================================
-- TABLA: PROPIEDADES
-- =====================================================
IF OBJECT_ID('Propiedades', 'U') IS NOT NULL DROP TABLE Propiedades;
GO

CREATE TABLE Propiedades (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Titulo NVARCHAR(200) NOT NULL,
    Descripcion NVARCHAR(MAX) NOT NULL,
    Precio DECIMAL(12, 2) NOT NULL,
    Moneda NVARCHAR(10) NOT NULL DEFAULT N'CRC',
    Provincia NVARCHAR(100) NOT NULL,
    Canton NVARCHAR(100) NOT NULL,
    Distrito NVARCHAR(100) NOT NULL,
    Tipo NVARCHAR(20) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT N'disponible',
    Imagenes NVARCHAR(MAX) NULL,
    IdDueno NVARCHAR(50) NOT NULL,
    Amenidades NVARCHAR(MAX) NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_Propiedades_Tipo CHECK (Tipo IN (N'casa', N'apartamento', N'terreno', N'comercial')),
    CONSTRAINT CK_Propiedades_Estado CHECK (Estado IN (N'disponible', N'ocupada', N'mantenimiento')),
    CONSTRAINT FK_Propiedades_Usuarios FOREIGN KEY (IdDueno) REFERENCES Usuarios(Id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_Propiedades_Provincia ON Propiedades (Provincia);
GO
CREATE INDEX IX_Propiedades_Tipo ON Propiedades (Tipo);
GO
CREATE INDEX IX_Propiedades_IdDueno ON Propiedades (IdDueno);
GO
CREATE INDEX IX_Propiedades_Estado ON Propiedades (Estado);
GO

-- =====================================================
-- TABLA: INVITACIONES
-- =====================================================
IF OBJECT_ID('Invitaciones', 'U') IS NOT NULL DROP TABLE Invitaciones;
GO

CREATE TABLE Invitaciones (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    PropiedadId INT NOT NULL,
    DuenoId NVARCHAR(50) NOT NULL,
    InquilinoCorreo NVARCHAR(255) NOT NULL,
    MontoAlquiler DECIMAL(12, 2) NOT NULL,
    MontoDeposito DECIMAL(12, 2) NOT NULL,
    Moneda NVARCHAR(10) NOT NULL DEFAULT N'CRC',
    Estado NVARCHAR(20) NOT NULL DEFAULT N'pendiente',
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Invitaciones_Propiedades FOREIGN KEY (PropiedadId) REFERENCES Propiedades(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Invitaciones_Usuarios FOREIGN KEY (DuenoId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Invitaciones_Estado CHECK (Estado IN (N'pendiente', N'aceptada', N'rechazada'))
);
GO

CREATE INDEX IX_Invitaciones_PropiedadId ON Invitaciones (PropiedadId);
GO
CREATE INDEX IX_Invitaciones_DuenoId ON Invitaciones (DuenoId);
GO
CREATE INDEX IX_Invitaciones_InquilinoCorreo ON Invitaciones (InquilinoCorreo);
GO
CREATE INDEX IX_Invitaciones_Estado ON Invitaciones (Estado);
GO

-- =====================================================
-- TABLA: CONTRATOS
-- =====================================================
IF OBJECT_ID('Contratos', 'U') IS NOT NULL DROP TABLE Contratos;
GO

CREATE TABLE Contratos (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    InvitacionId INT NOT NULL,
    PropiedadId INT NOT NULL,
    DuenoId NVARCHAR(50) NOT NULL,
    InquilinoId NVARCHAR(50) NOT NULL,
    MontoMensual DECIMAL(12, 2) NOT NULL,
    MontoDeposito DECIMAL(12, 2) NOT NULL,
    Moneda NVARCHAR(10) NOT NULL DEFAULT N'CRC',
    FechaInicio DATE NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT N'en_proceso',
    EstadoDeposito NVARCHAR(20) NOT NULL DEFAULT N'pendiente',
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Contratos_Invitaciones FOREIGN KEY (InvitacionId) REFERENCES Invitaciones(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Contratos_Propiedades FOREIGN KEY (PropiedadId) REFERENCES Propiedades(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Contratos_Dueno FOREIGN KEY (DuenoId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Contratos_Inquilino FOREIGN KEY (InquilinoId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Contratos_Estado CHECK (Estado IN (N'en_proceso', N'activo', N'finalizado', N'cancelado')),
    CONSTRAINT CK_Contratos_EstadoDeposito CHECK (EstadoDeposito IN (N'pendiente', N'pagado', N'devuelto'))
);
GO

CREATE INDEX IX_Contratos_InquilinoId ON Contratos (InquilinoId);
GO
CREATE INDEX IX_Contratos_DuenoId ON Contratos (DuenoId);
GO
CREATE INDEX IX_Contratos_PropiedadId ON Contratos (PropiedadId);
GO
CREATE INDEX IX_Contratos_Estado ON Contratos (Estado);
GO

-- =====================================================
-- TABLA: PAGOS
-- =====================================================
IF OBJECT_ID('Pagos', 'U') IS NOT NULL DROP TABLE Pagos;
GO

CREATE TABLE Pagos (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Tipo NVARCHAR(20) NOT NULL,
    IdContrato INT NOT NULL,
    IdPropiedad INT NOT NULL,
    IdDueno NVARCHAR(50) NOT NULL,
    IdInquilino NVARCHAR(50) NOT NULL,
    Mes INT NOT NULL,
    Anio INT NOT NULL,
    Monto DECIMAL(12, 2) NOT NULL,
    Moneda NVARCHAR(10) NOT NULL DEFAULT N'CRC',
    Comprobante NVARCHAR(MAX) NOT NULL,
    Estado NVARCHAR(20) NOT NULL DEFAULT N'pendiente',
    FechaSubida DATETIME2 NOT NULL,
    FechaRevision DATETIME2 NULL,
    MotivoRechazo NVARCHAR(MAX) NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Pagos_Contratos FOREIGN KEY (IdContrato) REFERENCES Contratos(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Pagos_Propiedades FOREIGN KEY (IdPropiedad) REFERENCES Propiedades(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Pagos_Dueno FOREIGN KEY (IdDueno) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Pagos_Inquilino FOREIGN KEY (IdInquilino) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Pagos_Tipo CHECK (Tipo IN (N'mensualidad', N'deposito')),
    CONSTRAINT CK_Pagos_Mes CHECK (Mes >= 1 AND Mes <= 12),
    CONSTRAINT CK_Pagos_Anio CHECK (Anio >= 2020),
    CONSTRAINT CK_Pagos_Estado CHECK (Estado IN (N'pendiente', N'aprobado', N'rechazado'))
);
GO

CREATE INDEX IX_Pagos_IdDueno ON Pagos (IdDueno);
GO
CREATE INDEX IX_Pagos_IdInquilino ON Pagos (IdInquilino);
GO
CREATE INDEX IX_Pagos_IdContrato ON Pagos (IdContrato);
GO
CREATE INDEX IX_Pagos_Mes_Anio ON Pagos (Mes, Anio);
GO
CREATE INDEX IX_Pagos_Estado ON Pagos (Estado);
GO

-- =====================================================
-- TABLA: NOTIFICACIONES
-- =====================================================
IF OBJECT_ID('Notificaciones', 'U') IS NOT NULL DROP TABLE Notificaciones;
GO

CREATE TABLE Notificaciones (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId NVARCHAR(50) NOT NULL,
    Tipo NVARCHAR(20) NOT NULL,
    Titulo NVARCHAR(200) NOT NULL,
    Mensaje NVARCHAR(MAX) NOT NULL,
    Leida BIT NOT NULL DEFAULT 0,
    Fecha DATETIME2 NOT NULL,
    Link NVARCHAR(500) NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Notificaciones_Usuarios FOREIGN KEY (UserId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Notificaciones_Tipo CHECK (Tipo IN (N'invitacion', N'pago', N'contrato', N'mensaje', N'sistema'))
);
GO

CREATE INDEX IX_Notificaciones_UserId ON Notificaciones (UserId);
GO
CREATE INDEX IX_Notificaciones_Leida ON Notificaciones (Leida);
GO
CREATE INDEX IX_Notificaciones_Tipo ON Notificaciones (Tipo);
GO

-- =====================================================
-- TABLA: CONVERSACIONES
-- =====================================================
IF OBJECT_ID('Conversaciones', 'U') IS NOT NULL DROP TABLE Conversaciones;
GO

CREATE TABLE Conversaciones (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Participants NVARCHAR(MAX) NOT NULL,
    PropertyId INT NULL,
    Type NVARCHAR(30) NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Conversaciones_Propiedades FOREIGN KEY (PropertyId) REFERENCES Propiedades(Id) ON DELETE SET NULL,
    CONSTRAINT CK_Conversaciones_Type CHECK (Type IN (N'consulta_propiedad', N'contrato_activo', N'pago_comprobante', N'general'))
);
GO

CREATE INDEX IX_Conversaciones_Type ON Conversaciones (Type);
GO

-- =====================================================
-- TABLA: MENSAJES
-- =====================================================
IF OBJECT_ID('Mensajes', 'U') IS NOT NULL DROP TABLE Mensajes;
GO

CREATE TABLE Mensajes (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ConversationId INT NOT NULL,
    SenderId NVARCHAR(50) NOT NULL,
    ReceiverId NVARCHAR(50) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(20) NOT NULL DEFAULT N'text',
    Status NVARCHAR(20) NOT NULL DEFAULT N'enviado',
    Fecha DATETIME2 NOT NULL,
    FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    FechaActualizacion DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Mensajes_Conversaciones FOREIGN KEY (ConversationId) REFERENCES Conversaciones(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Mensajes_Sender FOREIGN KEY (SenderId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Mensajes_Receiver FOREIGN KEY (ReceiverId) REFERENCES Usuarios(Id) ON DELETE CASCADE,
    CONSTRAINT CK_Mensajes_Type CHECK (Type IN (N'text', N'image')),
    CONSTRAINT CK_Mensajes_Status CHECK (Status IN (N'enviado', N'leido'))
);
GO

CREATE INDEX IX_Mensajes_ConversationId ON Mensajes (ConversationId);
GO
CREATE INDEX IX_Mensajes_SenderId ON Mensajes (SenderId);
GO
CREATE INDEX IX_Mensajes_ReceiverId ON Mensajes (ReceiverId);
GO
CREATE INDEX IX_Mensajes_Status ON Mensajes (Status);
GO

-- =====================================================
-- TABLA: SEQUENCES (para ID generation atómico)
-- =====================================================
IF OBJECT_ID('Sequences', 'U') IS NOT NULL DROP TABLE Sequences;
GO

CREATE TABLE Sequences (
    Name NVARCHAR(50) NOT NULL PRIMARY KEY,
    CurrentValue INT NOT NULL
);
GO

INSERT INTO Sequences (Name, CurrentValue) VALUES (N'UsuarioId', 0);
GO
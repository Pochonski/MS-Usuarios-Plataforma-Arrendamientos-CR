-- MS-Usuarios - Plataforma Arrendamientos CR
-- Database Schema for Azure SQL Database (SQL Server)
-- Base de datos propia del microservicio de usuarios

-- =====================================================
-- CREACION DE LA BASE DE DATOS
-- =====================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'usuarios_db')
BEGIN
    CREATE DATABASE usuarios_db;
END;
GO

USE usuarios_db;
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
-- TABLA: SEQUENCES (para generacion atomica de IDs)
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

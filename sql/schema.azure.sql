-- =====================================================
-- MS-Usuarios - Schema para Azure SQL Query Editor
-- =====================================================
-- PASO 1: Crear la base de datos desde Azure Portal:
--   Portal > SQL databases > Create > Database name: usuarios_db
-- PASO 2: Conectarse a usuarios_db en el Query Editor
-- PASO 3: Ejecutar este script completo
-- =====================================================

-- =====================================================
-- TABLA: USUARIOS
-- =====================================================
IF OBJECT_ID('Usuarios', 'U') IS NULL
BEGIN
    CREATE TABLE Usuarios (
        Id NVARCHAR(50) NOT NULL PRIMARY KEY,
        Nombre NVARCHAR(100) NOT NULL,
        Correo NVARCHAR(255) NOT NULL,
        ContrasenaHash NVARCHAR(MAX) NULL,
        Rol NVARCHAR(20) NOT NULL,
        Telefono NVARCHAR(20) NULL,
        Avatar NVARCHAR(500) NULL,
        GoogleId NVARCHAR(255) NULL,
        FechaRegistro DATETIME2 NOT NULL DEFAULT GETDATE(),
        UltimoLogin DATETIME2 NULL,
        CONSTRAINT CK_Usuarios_Rol CHECK (Rol IN ('dueno', 'inquilino'))
    );

    CREATE UNIQUE INDEX IX_Usuarios_Correo ON Usuarios (Correo);
    CREATE INDEX IX_Usuarios_GoogleId ON Usuarios (GoogleId);
END;

-- =====================================================
-- TABLA: SEQUENCES (generacion atomica de IDs)
-- =====================================================
IF OBJECT_ID('Sequences', 'U') IS NULL
BEGIN
    CREATE TABLE Sequences (
        Name NVARCHAR(50) NOT NULL PRIMARY KEY,
        CurrentValue INT NOT NULL
    );

    INSERT INTO Sequences (Name, CurrentValue) VALUES (N'UsuarioId', 0);
END;

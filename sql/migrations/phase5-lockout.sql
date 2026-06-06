-- =====================================================
-- Phase 5: Account Lockout + Token Revocation
-- MS-Usuarios - Plataforma Arrendamientos CR
-- Fecha: 2026-06-06
-- =====================================================

USE usuarios_db;
GO

-- =====================================================
-- 1. Agregar campos de lockout a Usuarios
-- =====================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Usuarios', 'U') AND name = 'IntentosFallidos')
BEGIN
    ALTER TABLE Usuarios ADD IntentosFallidos INT DEFAULT 0;
    PRINT 'Columna IntentosFallidos agregada a Usuarios';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Usuarios', 'U') AND name = 'BloqueadoHasta')
BEGIN
    ALTER TABLE Usuarios ADD BloqueadoHasta DATETIME2 NULL;
    PRINT 'Columna BloqueadoHasta agregada a Usuarios';
END
GO

-- =====================================================
-- 2. Tabla: TokensRevocados
-- Almacena tokens JWT que ya no son válidos
-- =====================================================
IF OBJECT_ID('TokensRevocados', 'U') IS NOT NULL
BEGIN
    DROP TABLE TokensRevocados;
    PRINT 'Tabla TokensRevocados eliminada (si existía)';
END
GO

CREATE TABLE TokensRevocados (
    TokenId NVARCHAR(255) NOT NULL,       -- jti del JWT
    RevocadoEl DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Expiracion DATETIME2 NULL,            -- exp del JWT (para cleanup automático)
    PRIMARY KEY (TokenId)
);
PRINT 'Tabla TokensRevocados creada';
GO

-- Índice para cleanup periódico
CREATE INDEX IX_TokensRevocados_Expiracion
ON TokensRevocados (Expiracion)
WHERE Expiracion IS NOT NULL;
PRINT 'Índice IX_TokensRevocados_Expiracion creado';
GO

-- =====================================================
-- 3. Stored Procedure: sp_LimpiarTokensRevocados
-- Limpia tokens con más de 7 días
-- =====================================================
IF OBJECT_ID('sp_LimpiarTokensRevocados', 'P') IS NOT NULL
BEGIN
    DROP PROCEDURE sp_LimpiarTokensRevocados;
END
GO

CREATE PROCEDURE sp_LimpiarTokensRevocados
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaLimite DATETIME2 = DATEADD(DAY, -7, SYSDATETIME());

    DELETE FROM TokensRevocados
    WHERE Expiracion IS NOT NULL AND Expiracion < @FechaLimite;

    DELETE FROM TokensRevocados
    WHERE Expiracion IS NULL AND RevocadoEl < @FechaLimite;

    SELECT @@ROWCOUNT as Eliminados;
END;
GO

PRINT 'Stored procedure sp_LimpiarTokensRevocados creado';
GO

-- Ejecutar cleanup inicial
EXEC sp_LimpiarTokensRevocados;
GO

PRINT '=== Phase 5 migration completada ===';
GO
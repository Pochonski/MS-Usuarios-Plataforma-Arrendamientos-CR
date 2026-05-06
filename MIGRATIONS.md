# Migraciones de Base de Datos - Microservicio Usuarios

## Resumen

El microservicio de usuarios (`Arrendamientos.Users.Api`) usa Entity Framework Core con SQL Server (Azure SQL Database).

## Modelo de Datos

**Tabla: Usuarios**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Id | nvarchar(50) | PK, formato: usr-001, usr-002, etc. |
| Nombre | nvarchar(100) | Nombre completo del usuario |
| Correo | nvarchar(255) | Email único del usuario |
| ContrasenaHash | nvarchar(max) | Hash BCrypt de la contraseña |
| Rol | nvarchar(20) | "dueno" o "inquilino" |
| Avatar | nvarchar(500) | URL de avatar (opcional) |
| Telefono | nvarchar(20) | Teléfono (opcional) |
| FechaRegistro | datetime2 | Fecha de registro |
| UltimoLogin | datetime2 | Último login (opcional) |

## Crear nueva migración

```bash
cd src/src/Arrendamientos.Users.Api
dotnet ef migrations add NombreMigracion
```

## Generar script SQL (sin ejecutar)

```bash
cd src/src/Arrendamientos.Users.Api
dotnet ef migrations script
```

## Aplicar migraciones manualmente (Azure Portal)

1. Ir a [Azure Portal](https://portal.azure.com)
2. Buscar `arrendamientos_db`
3. Click en **Query editor (preview)**
4. Ejecutar el script SQL

### Script SQL de migración

```sql
-- Tabla de control de migraciones
IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

-- Tabla Usuarios
CREATE TABLE [Usuarios] (
    [Id] nvarchar(50) NOT NULL,
    [Nombre] nvarchar(100) NOT NULL,
    [Correo] nvarchar(255) NOT NULL,
    [ContrasenaHash] nvarchar(max) NOT NULL,
    [Rol] nvarchar(20) NOT NULL,
    [Avatar] nvarchar(500) NULL,
    [Telefono] nvarchar(20) NULL,
    [FechaRegistro] datetime2 NOT NULL,
    [UltimoLogin] datetime2 NULL,
    CONSTRAINT [PK_Usuarios] PRIMARY KEY ([Id])
);
GO

-- Índice único para correo
CREATE UNIQUE INDEX [IX_Usuarios_Correo] ON [Usuarios] ([Correo]);
GO

-- Registrar migración
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260505234529_InitialCreate', N'8.0.0');
GO
```

## Aplicar migraciones automáticamente (desde código)

El API ejecuta `db.Database.Migrate()` automáticamente al iniciar en `Program.cs`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
```

Para que funcione, actualizar el `connectionString` en `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=arrendamientoscr.database.windows.net;Database=arrendamientos_db;[AUTH];Encrypt=true;TrustServerCertificate=true;"
  }
}
```

## Notas importantes

- **No usar `AUTO_INCREMENT`** - SQL Server usa `IDENTITY(1,1)`
- **No usar `JSON` directo** - Usar `nvarchar(max)` para JSON
- **Id es string** - Formato `usr-001`, `usr-002`, etc.
- **Autenticación AAD** - Puede fallar con sqlcmd local, usar Azure Portal Query Editor
# Migraciones de Base de Datos - MS-Usuarios

## Resumen

El microservicio de usuarios tiene su **propia base de datos independiente** y usa:
- **Runtime**: Node.js con TypeScript
- **Driver**: mssql (tedious) para Azure SQL Database
- **ORM**: Sin ORM - queries directos con parameterized queries
- **ID Generation**: Tabla Sequences para IDs atómicos (formato: usr-001, usr-002)

## Base de Datos

- **Nombre**: `usuarios_db`
- **Motor**: Azure SQL Database (SQL Server)

## Modelo de Datos

### Tabla: Usuarios

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Id | nvarchar(50) | PK, formato: usr-001, usr-002, etc. |
| Nombre | nvarchar(100) | Nombre completo del usuario |
| Correo | nvarchar(255) | Email único del usuario |
| ContrasenaHash | nvarchar(max) | Hash bcrypt (NULL para OAuth) |
| Rol | nvarchar(20) | "dueno" o "inquilino" |
| Avatar | nvarchar(500) | URL de avatar (opcional) |
| Telefono | nvarchar(20) | Teléfono (opcional) |
| GoogleId | nvarchar(255) | ID de Google para OAuth (opcional) |
| FechaRegistro | datetime2 | Fecha de registro |
| UltimoLogin | datetime2 | Último login (opcional) |

### Tabla: Sequences (auxiliar)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| Name | nvarchar(50) | PK, nombre de la secuencia |
| CurrentValue | int | Valor actual |

Seed: `INSERT INTO Sequences (Name, CurrentValue) VALUES (N'UsuarioId', 0);`

## Ejecutar Migraciones

Hay dos archivos SQL:

| Archivo | Uso |
|---------|-----|
| `sql/schema.azure.sql` | **Azure Portal Query Editor** (recomendado) |
| `sql/schema.sql` | CLI (`sqlcmd`) o referencia completa con CREATE DATABASE |

### Azure Portal (Query Editor) — Recomendado

1. Ir a [Azure Portal](https://portal.azure.com) > **SQL databases**
2. Crear la base de datos `usuarios_db` si no existe:
   - Click en **Create** > Database name: `usuarios_db`
   - Seleccionar el servidor existente y plan (Basic S0 es suficiente)
3. Abrir la base de datos `usuarios_db` > **Query editor (preview)**
4. Autenticarse con usuario/contraseña del servidor
5. Copiar y pegar el contenido de `sql/schema.azure.sql`
6. Click en **Run**

> **Nota**: El Query Editor de Azure NO soporta `CREATE DATABASE`, `USE`, ni batch separators `GO`. Por eso se usa `schema.azure.sql` que solo contiene las tablas.

### Azure CLI (sqlcmd)

```bash
# Crear la BD primero
az sql db create -g <resource-group> -s <server> -n usuarios_db --service-objective S0

# Ejecutar schema
sqlcmd -S <server>.database.windows.net -d usuarios_db -U <user> -P <password> -i sql/schema.azure.sql
```

### Desde código (desarrollo)

1. Copiar `.env.example` a `.env`
2. Configurar credenciales de Azure SQL con `DB_NAME=usuarios_db`
3. Ejecutar `schema.azure.sql` en la base de datos (vía Azure Portal o CLI)
4. Ejecutar `npm run dev`

## Notas Importantes

- **Base de datos independiente**: Este microservicio tiene su propia BD `usuarios_db`, separada de los demás microservicios
- **No usar AUTO_INCREMENT** - SQL Server usa `IDENTITY(1,1)` o Sequences
- **Parámetros siempre escapados** - El DAO usa parameterized queries para prevenir SQL injection
- **Id es string** - Formato `usr-001`, `usr-002`, etc.
- **Sequences** - Generación atómica de IDs sin gaps en condiciones normales

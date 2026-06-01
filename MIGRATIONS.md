# Migraciones de Base de Datos - MS-Usuarios

## Resumen

El microservicio de usuarios usa:
- **Runtime**: Node.js con TypeScript
- **Driver**: mssql (tedious) para Azure SQL Database
- **ORM**: Sin ORM - queries directos con parameterized queries
- **ID Generation**: Tabla Sequences para IDs atómicos (formato: usr-001, usr-002)

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

## Ejecutar Migraciones

### Azure Portal (Query Editor)

1. Ir a [Azure Portal](https://portal.azure.com)
2. Buscar `arrendamientos_db`
3. Click en **Query editor (preview)**
4. Ejecutar el script SQL de migración

### Azure CLI

```bash
# Ejecutar script SQL
sqlcmd -S arrendamientoscr.database.windows.net -d arrendamientos_db -U <user> -P <password> -i sql/schema.sql
```

### Desde código (desarrollo)

El proyecto no tiene migrations automáticas. Para desarrollo:

1. Copiar `.env.example` a `.env`
2. Configurar credenciales de Azure SQL
3. Ejecutar `npm run dev` - el schema se aplica manualmente

## Schema SQL

El schema completo está en `sql/schema.sql`. Incluye:
- Tabla Usuarios (este microservicio)
- Tablas de otros microservicios: Propiedades, Invitaciones, Contratos, Pagos, Notificaciones, Conversaciones, Mensajes
- Tabla Sequences para generación de IDs

## Notas Importantes

- **No usar AUTO_INCREMENT** - SQL Server usa `IDENTITY(1,1)` o Sequences
- **Parámetros siempre escapados** - El DAO usa parameterized queries para prevenir SQL injection
- **Id es string** - Formato `usr-001`, `usr-002`, etc.
- **CASCADE deletes** - Las foreign keys usan ON DELETE CASCADE
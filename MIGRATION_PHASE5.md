# Phase 5 - Account Lockout + Token Revocation

## Lo que hay que hacer en Azure

Son **2 pasos**. Ambos son necesarios para que el nuevo auth funcione.

---

## Paso 1: Correr el script SQL en Azure SQL

### Opción A: Azure Portal (recomendado)

1. Ve a [portal.azure.com](https://portal.azure.com)
2. Busca **Azure SQL** → selecciona `arrendamientoscr` server
3. Selecciona la base de datos **`usuarios_db`**
4. Click en **Query editor** (panel izquierdo)
5. Login con tus credenciales
6. Copia y pega el contenido de `sql/migrations/phase5-lockout.sql`
7. Click **Run**

### Opción B: Azure CLI

```bash
# Con Azure CLI instalado y logueado
az sql db query \
  --resource-group JosephResourceGroup \
  --server arrendamientoscr \
  --database usuarios_db \
  --query "ALTER TABLE Usuarios ADD IntentosFallidos INT DEFAULT 0"

az sql db query \
  --resource-group JosephResourceGroup \
  --server arrendamientoscr \
  --database usuarios_db \
  --query "ALTER TABLE Usuarios ADD BloqueadoHasta DATETIME2 NULL"

az sql db query \
  --resource-group JosephResourceGroup \
  --server arrendamientoscr \
  --database usuarios_db \
  --query "CREATE TABLE TokensRevocados (TokenId NVARCHAR(255) NOT NULL PRIMARY KEY, RevocadoEl DATETIME2 NOT NULL DEFAULT GETDATE(), Expiracion DATETIME2 NULL)"
```

---

## Paso 2: Deployar el MS actualizado

El commit `35d8a26` ya está listo. Necesitas hacer redeploy del App Service.

### Opción A: GitHub Actions (si está configurado)

```bash
cd MS-Usuarios-Plataforma-Arrendamientos-CR
git push origin main
```

### Opción B: Azure CLI

```bash
# Verificar que el build compile
npm run build

# Hacer zip del dist
cd dist
zip -r ../deploy.zip .
cd ..

# Deployar
az webapp up --resource-group JosephResourceGroup \
  --name ms-usuarios-arrendamientos \
  --src-path deploy.zip
```

### Opción C: Restart directo (si ya está deployed)

```bash
az webapp restart --resource-group JosephResourceGroup \
  --name ms-usuarios-arrendamientos
```

---

## Archivos nuevos/modificados

| Archivo | Qué hace |
|---------|----------|
| `src/dao/tokenRevocado.dao.ts` | Nuevo — revocar tokens |
| `src/services/usuario.service.ts` | Login con lockout, logout, refresh rotation |
| `src/controllers/usuario.controller.ts` | Handler logout + errores 429 |
| `src/routes/usuario.routes.ts` | Nueva ruta `POST /auth/logout` |
| `sql/migrations/phase5-lockout.sql` | Script de migración BD |

## Endpoints nuevos

- `POST /api/auth/logout` — requiere Bearer token, revoca la sesión

## Qué cambia para el frontend

El login ahora retorna `refreshToken` además de `token`:

```json
{
  "token": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { ... }
}
```

El frontend debe:
1. Guardar el `refreshToken` (localStorage o secure storage)
2. Enviarlo en el header `X-Refresh-Token` al hacer refresh
3. Llamar `/auth/logout` al cerrar sesión

---

## Verificar que funciona

Después de migrar y deployar:

```bash
# Login con credenciales incorrectas 5 veces → debe bloquear
curl -X POST https://plataforma-arrendamientos-api.azure-api.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"test@test.com","contrasena":"wrong"}'

# Después del 5to intento debe dar 429
# {"error":"Unauthorized","message":"Cuenta bloqueada...","blockedUntil":"..."}
```
# APIM Configuration Guide

Esta guía explica cómo configurar **Azure API Management** para que el frontend (Azure Static Web Apps) pueda consumir los endpoints de `MS-Usuarios` desde el navegador.

## Problema

Cuando el frontend hace una petición al gateway de APIM:

```
Frontend (SWA) → APIM Gateway → MS-Usuarios
```

APIM responde con `401 Unauthorized` (falta `Ocp-Apim-Subscription-Key`) **antes** de reenviar al backend, y la respuesta **no incluye headers CORS**, por lo que el navegador bloquea la petición real.

## Solución: Configurar APIM con Política CORS

Ir a **Azure Portal → API Management → plataforma-arrendamientos-api → APIs → MS-Usuarios → All operations → Inbound processing → "+ Add policy"**.

Aplicar la siguiente política (XML) en el scope de la API o de cada operación:

```xml
<policies>
  <inbound>
    <cors allow-credentials="true">
      <allowed-origins>
        <origin>https://agreeable-ground-0b1436910.6.azurestaticapps.net</origin>
        <origin>https://agreeable-ground-0b1436910.6.azurestaticapps.net</origin>
        <origin>http://localhost:3000</origin>
        <origin>http://localhost:5173</origin>
        <origin>http://localhost:4200</origin>
      </allowed-origins>
      <allowed-methods>
        <method>GET</method>
        <method>POST</method>
        <method>PUT</method>
        <method>DELETE</method>
        <method>PATCH</method>
        <method>OPTIONS</method>
      </allowed-methods>
      <allowed-headers>
        <header>Content-Type</header>
        <header>Authorization</header>
        <header>ocp-apim-subscription-key</header>
        <header>x-requested-with</header>
      </allowed-headers>
      <expose-headers>
        <header>Authorization</header>
      </expose-headers>
    </cors>
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>
```

> **Importante:** Esta política debe ir en `inbound` (entrada), NO en `outbound`. APIM intercepta el preflight `OPTIONS` y responde directamente con los headers CORS correctos antes de que llegue al backend.

## Verificar la configuración

### 1. Preflight OPTIONS

```bash
curl -i -X OPTIONS \
  -H "Origin: https://agreeable-ground-0b1436910.6.azurestaticapps.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  "https://plataforma-arrendamientos-api.azure-api.net/auth/google"
```

**Respuesta esperada:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://agreeable-ground-0b1436910.6.azurestaticapps.net
Access-Control-Allow-Methods: POST,GET,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,ocp-apim-subscription-key
```

### 2. POST real con preflight correcto

```bash
curl -i -X POST \
  -H "Origin: https://agreeable-ground-0b1436910.6.azurestaticapps.net" \
  -H "Content-Type: application/json" \
  -H "Ocp-Apim-Subscription-Key: <tu-subscription-key>" \
  -d '{"googleToken":"<token>"}' \
  "https://plataforma-arrendamientos-api.azure-api.net/auth/google"
```

**Respuesta esperada:** `200 OK` con `{ token, usuario }`.

## Checklist de configuración

- [ ] Política CORS aplicada en APIM (scope API o por operación)
- [ ] En **Google Cloud Console** → Credentials → OAuth Client ID → Authorized JavaScript origins:
  - [ ] `https://agreeable-ground-0b1436910.6.azurestaticapps.net`
  - [ ] `https://agreeable-ground-0b1436910.6.azurestaticapps.net`
  - [ ] `http://localhost:*` (para desarrollo)
- [ ] Frontend lee `VITE_APIM_SUBSCRIPTION_KEY` desde variables de entorno de Azure SWA
- [ ] Frontend envía header `Ocp-Apim-Subscription-Key` en cada request

## Alternativa: Sin APIM para endpoints públicos (BFF pattern)

Si prefieres evitar la complejidad de APIM para el frontend, considera:

1. Publicar el backend en Azure App Service con URL directa
2. Configurar CORS en el backend (ya está hecho en `src/app.ts`)
3. El frontend llama directamente al backend sin pasar por APIM
4. APIM queda solo para integraciones B2B server-to-server

Esta es la opción recomendada para aplicaciones web con frontend público.

---

## Fix para Google Sign-In en Azure Static Web Apps

El warning de `Cross-Origin-Opener-Policy would block the window.postMessage call` aparece en el popup de Google porque la **página padre (SWA)** tiene un COOP estricto. Esto **no se arregla en el backend**, se arregla en el frontend.

### Solución: `staticwebapp.config.json` en la raíz del repo del SWA

Crea o edita `staticwebapp.config.json` en la raíz del proyecto del frontend (Azure Static Web Apps):

```json
{
  "globalHeaders": {
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "Cross-Origin-Resource-Policy": "cross-origin"
  }
}
```

**Qué hace cada header:**
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` → Permite que el popup de Google Sign-In se comunique con la página padre (necesario para `postMessage`).
- `Cross-Origin-Embedder-Policy: unsafe-none` → Requerido por Google Identity Services para cargar sus recursos.
- `Cross-Origin-Resource-Policy: cross-origin` → Permite que recursos del SWA sean cargados por Google.

### Verificar después de redesplegar el SWA

```bash
curl -I https://agreeable-ground-0b1436910.6.azurestaticapps.net/
```

Debe incluir los 3 headers en la respuesta.

---

## Endpoint de diagnóstico del backend

El backend expone `/api/health` (sin autenticación). Útil para verificar configuración:

```bash
curl https://plataforma-arrendamientos-api.azure-api.net/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "database": { "status": "connected" },
  "google": {
    "configured": true,
    "clientIdPrefix": "703304000101"
  }
}
```

Si `clientIdPrefix` no empieza con `703304000101`, el backend está usando un Client ID distinto al configurado en Google Cloud Console.

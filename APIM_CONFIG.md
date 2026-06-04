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
        <origin>https://arrendacr.com</origin>
        <origin>https://www.arrendacr.com</origin>
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
  - [ ] `https://arrendacr.com`
  - [ ] `https://www.arrendacr.com`
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

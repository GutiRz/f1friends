# F1 Friends — Frontend

Next.js 16 frontend para la liga privada de Fórmula 1.

## Arrancar en desarrollo

```bash
npm run dev
```

La app arranca en http://localhost:3000.

## Variable de entorno

Crea un archivo `.env.local` en esta carpeta con:

```
BACKEND_API_URL=http://localhost:8080
```

## Estructura

```
src/
  app/
    layout.tsx                        # Layout raíz (HTML, metadata global)
    page.tsx                          # Página de inicio (/)
    globals.css                       # Estilos globales
    clasificacion/
      pilotos/
        page.tsx                      # Clasificación de pilotos (/clasificacion/pilotos)
  lib/
    api/
      f1friends-api.ts                # Capa de acceso a la API del backend
  types/
    clasificacion.ts                  # Tipos TypeScript del payload de clasificación
```

## Notas

- El fetch de datos se hace en servidor (Server Components).
- `searchParams.temporada` controla la temporada a mostrar. Por defecto: `1`.
  - Ejemplo: `/clasificacion/pilotos?temporada=2`

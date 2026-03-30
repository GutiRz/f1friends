# F1 Friends — Arquitectura Técnica

## 1. Arquitectura General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Navegador                            │
│                    Next.js (TypeScript)                     │
│         Server Components + Client Components               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP / JSON (REST)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Go (API REST)                            │
│              Chi router + dominio en capas                  │
│         /api/v1/public/*    /api/v1/admin/*                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ pgx / sql
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

**Principios de la arquitectura:**

- El frontend Next.js consume la API de Go. No hay lógica de negocio en el frontend.
- La API distingue rutas públicas (sin auth) y rutas de administración (JWT requerido).
- Las clasificaciones se calculan en el backend en tiempo de consulta; no se persisten.
- El backend valida todas las reglas de negocio; el frontend solo presenta y valida formato.

---

## 2. Estructura de Carpetas

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── app/                         # App Router de Next.js
│   │   ├── (public)/                # Grupo de rutas públicas
│   │   │   ├── page.tsx             # Home — temporada actual
│   │   │   ├── calendario/
│   │   │   │   └── page.tsx
│   │   │   ├── gp/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Detalle de GP
│   │   │   ├── clasificacion/
│   │   │   │   ├── pilotos/
│   │   │   │   │   └── page.tsx     # Clasificación de pilotos
│   │   │   │   └── constructores/
│   │   │   │       └── page.tsx     # Clasificación de constructores
│   │   │   ├── normativa/
│   │   │   │   └── page.tsx
│   │   │   └── historico/
│   │   │       └── page.tsx
│   │   ├── (admin)/                 # Grupo de rutas de administración
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       ├── layout.tsx       # Layout con sidebar y auth guard
│   │   │       ├── temporadas/
│   │   │       ├── equipos/
│   │   │       ├── pilotos/
│   │   │       ├── gp/
│   │   │       │   └── [id]/
│   │   │       │       ├── inscripciones/
│   │   │       │       └── resultados/
│   │   │       ├── normativa/
│   │   │       └── usuarios/
│   │   ├── layout.tsx               # Layout raíz
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                      # Componentes genéricos (Button, Table, Badge…)
│   │   ├── public/                  # Componentes específicos de la parte pública
│   │   └── admin/                   # Componentes específicos del panel admin
│   ├── lib/
│   │   ├── api/                     # Funciones de fetch hacia la API de Go
│   │   │   ├── client.ts            # fetch base con manejo de errores y auth header
│   │   │   ├── temporadas.ts
│   │   │   ├── gp.ts
│   │   │   ├── pilotos.ts
│   │   │   └── …
│   │   └── auth.ts                  # Gestión del token JWT en cliente
│   └── types/                       # Tipos TypeScript que reflejan las respuestas de la API
│       ├── temporada.ts
│       ├── gp.ts
│       ├── piloto.ts
│       └── …
├── public/
├── next.config.ts
└── package.json
```

### Backend (`/backend`)

```
backend/
├── cmd/
│   └── api/
│       └── main.go                  # Punto de entrada, arranque del servidor
├── internal/
│   ├── config/
│   │   └── config.go                # Variables de entorno (DB, JWT secret, puerto…)
│   ├── db/
│   │   ├── db.go                    # Inicialización del pool de conexiones (pgx)
│   │   └── migrations/              # Migraciones SQL ordenadas
│   │       ├── 001_initial_schema.sql
│   │       └── …
│   ├── model/                       # Structs compartidos que representan las entidades
│   │   ├── temporada.go
│   │   ├── piloto.go
│   │   ├── gp.go
│   │   ├── sesion.go
│   │   ├── resultado.go
│   │   └── sancion.go
│   ├── store/                       # Acceso a base de datos (SQL puro con pgx)
│   │   ├── temporada.go
│   │   ├── piloto.go
│   │   ├── gp.go
│   │   ├── sesion.go
│   │   ├── resultado.go
│   │   └── sancion.go
│   ├── service/                     # Lógica de negocio: orquesta store y reglas de dominio
│   │   ├── temporada.go
│   │   ├── gp.go
│   │   ├── resultado.go             # Incluye recálculo de posiciones y puntos
│   │   └── clasificacion.go        # Algoritmos de clasificación de pilotos y constructores
│   ├── handler/                     # Handlers HTTP: decodifica request, llama service, escribe response
│   │   ├── public/
│   │   │   ├── temporada.go
│   │   │   ├── gp.go
│   │   │   └── clasificacion.go
│   │   └── admin/
│   │       ├── temporada.go
│   │       ├── gp.go
│   │       ├── piloto.go
│   │       ├── resultado.go
│   │       ├── sancion.go
│   │       └── usuario.go
│   ├── middleware/
│   │   ├── auth.go                  # Validación JWT para rutas /admin
│   │   └── cors.go
│   └── router/
│       └── router.go                # Definición de todas las rutas con Chi
├── go.mod
└── go.sum
```

**Estructura en tres capas:** `handler` (HTTP) → `service` (lógica de negocio) → `store` (base de datos). Los tipos compartidos viven en `model/`. Esta estructura es suficiente para el MVP y fácil de razonar sin añadir abstracciones innecesarias.

**Decisión:** se usa SQL puro con `pgx` en lugar de un ORM. Las consultas son explícitas, fáciles de auditar y evitan la magia implícita de un ORM en un dominio con cálculos complejos.

---

## 3. Modelo de Base de Datos

### Diagrama de relaciones

```
temporadas
    │
    ├──< gran_premios
    │         │
    │         ├──< sesiones ──< resultados_sesion ──< sanciones
    │         │                       │
    │         └──< inscripciones_gp ──┘
    │
    └──< asignaciones_piloto >── pilotos >── inscripciones_gp
                │                                │
              equipos <───────────────────────── ┘

usuarios  (independiente — cuentas de administración, no relacionadas con pilotos en el MVP)
```

### Tablas

```sql
-- Temporadas
CREATE TABLE temporadas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    anio        SMALLINT     NOT NULL,
    descripcion TEXT,
    activa      BOOLEAN      NOT NULL DEFAULT false,
    normativa   TEXT,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Garantiza a nivel de base de datos que solo existe una temporada activa
CREATE UNIQUE INDEX idx_temporadas_una_activa
    ON temporadas (activa)
    WHERE activa = true;


-- Equipos (escuderías)
CREATE TABLE equipos (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color  CHAR(7),      -- hex color, p.ej. #E8002D
    logo   VARCHAR(255)  -- ruta o URL del logo
);


-- Pilotos (miembros/jugadores de la liga)
-- No son pilotos reales de F1; son los participantes del campeonato.
-- Separados de la entidad Usuario (que representa cuentas de administración).
CREATE TABLE pilotos (
    id             SERIAL PRIMARY KEY,
    nombre_publico VARCHAR(100) NOT NULL,        -- apodo o nombre de comunidad
    nombre_real    VARCHAR(100),                 -- opcional
    nacionalidad   VARCHAR(60),                  -- opcional
    numero         SMALLINT,                     -- dorsal; puede cambiar entre temporadas
    id_psn         VARCHAR(50),                  -- identificador PlayStation Network
    id_ea          VARCHAR(50),                  -- identificador EA / EA Sports FC
    id_xbox        VARCHAR(50),                  -- identificador Xbox Live / Gamertag
    twitch_url     VARCHAR(255),                 -- enlace al canal de Twitch
    youtube_url    VARCHAR(255),                 -- enlace al canal de YouTube
    avatar_url     VARCHAR(255),                 -- foto o avatar del miembro
    activo         BOOLEAN NOT NULL DEFAULT true -- false = baja en la liga
);


-- Asignaciones de piloto a temporada (con historial de cambios de equipo)
CREATE TABLE asignaciones_piloto (
    id           SERIAL PRIMARY KEY,
    piloto_id    INT         NOT NULL REFERENCES pilotos(id),
    temporada_id INT         NOT NULL REFERENCES temporadas(id),
    equipo_id    INT         REFERENCES equipos(id),  -- NULL si es reserva sin equipo
    tipo         VARCHAR(10) NOT NULL CHECK (tipo IN ('titular', 'reserva')),
    fecha_desde  DATE        NOT NULL,
    fecha_hasta  DATE        -- NULL = asignación actualmente vigente
    -- La validación de solapamientos de fechas se hace en el service, no en la BD
);


-- Grandes Premios
CREATE TABLE gran_premios (
    id           SERIAL PRIMARY KEY,
    temporada_id INT         NOT NULL REFERENCES temporadas(id),
    nombre       VARCHAR(100) NOT NULL,
    circuito     VARCHAR(100),
    pais         VARCHAR(60),
    fecha        DATE,
    tiene_sprint BOOLEAN     NOT NULL DEFAULT false,
    estado       VARCHAR(15) NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente', 'en_curso', 'completado')),
    orden        SMALLINT    NOT NULL DEFAULT 0  -- posición en el calendario
);


-- Inscripciones de piloto a GP (equipo real para ese GP)
CREATE TABLE inscripciones_gp (
    id              SERIAL PRIMARY KEY,
    gran_premio_id  INT         NOT NULL REFERENCES gran_premios(id),
    piloto_id       INT         NOT NULL REFERENCES pilotos(id),
    equipo_id       INT         NOT NULL REFERENCES equipos(id),
    estado          VARCHAR(12) NOT NULL DEFAULT 'inscrito'
                    CHECK (estado IN ('inscrito', 'ausente', 'sustituido', 'participo')),
    UNIQUE (gran_premio_id, piloto_id)
);


-- Sesiones de un GP (qualy, sprint, carrera)
CREATE TABLE sesiones (
    id             SERIAL PRIMARY KEY,
    gran_premio_id INT        NOT NULL REFERENCES gran_premios(id),
    tipo           VARCHAR(8) NOT NULL CHECK (tipo IN ('qualy', 'sprint', 'carrera')),
    estado         VARCHAR(10) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'completada')),
    UNIQUE (gran_premio_id, tipo)
);


-- Resultados por sesión (antes de sanciones = posicion_original)
CREATE TABLE resultados_sesion (
    id               SERIAL PRIMARY KEY,
    sesion_id        INT     NOT NULL REFERENCES sesiones(id),
    inscripcion_id   INT     NOT NULL REFERENCES inscripciones_gp(id),
    posicion_original SMALLINT NOT NULL,  -- posición al cruzar meta
    posicion         SMALLINT,            -- posición final tras sanciones (calculado)
    puntos           SMALLINT,            -- puntos asignados según posicion final (calculado)
    pole             BOOLEAN NOT NULL DEFAULT false,  -- solo válido en tipo qualy
    vuelta_rapida    BOOLEAN NOT NULL DEFAULT false,  -- solo válido en sprint y carrera
    UNIQUE (sesion_id, inscripcion_id),
    UNIQUE (sesion_id, posicion_original)
);


-- Sanciones sobre un resultado
CREATE TABLE sanciones (
    id                   SERIAL PRIMARY KEY,
    resultado_sesion_id  INT         NOT NULL REFERENCES resultados_sesion(id),
    tipo                 VARCHAR(20) NOT NULL
                         CHECK (tipo IN ('tiempo', 'descalificacion',
                                        'penalizacion_parrilla', 'amonestacion')),
    valor                INT,        -- segundos (tiempo) o posiciones (parrilla); NULL si no aplica
    motivo               TEXT        NOT NULL,
    orden                SMALLINT    NOT NULL DEFAULT 0,  -- orden de aplicación
    creado_en            TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Usuarios administradores
CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

### Notas sobre el modelo

- **`posicion` y `puntos` en `resultados_sesion`** son campos calculados. Se actualizan al guardar resultados y al añadir, editar o eliminar sanciones. La fuente canónica es `posicion_original` + `sanciones`.
- **`puntos` es `SMALLINT`** porque los puntos de F1 son siempre enteros (25, 18, 15…). No se necesita precisión decimal.
- **`UNIQUE (sesion_id, posicion_original)`** evita posiciones duplicadas al introducir resultados. No se añade unique sobre `posicion` final porque una descalificación puede dejar huecos en la numeración.
- **Partial unique index en `temporadas`** garantiza a nivel de base de datos que solo existe una temporada activa. No se necesita ninguna constraint adicional.
- **`asignaciones_piloto.equipo_id` nullable** permite representar reservas sin equipo asignado. La validación de solapamientos de períodos se delega al service para evitar la complejidad de `EXCLUDE USING gist` en el MVP.
- **`pilotos` ≠ `usuarios`:** la tabla `pilotos` representa miembros de la liga (jugadores), con campos de perfil y plataformas de juego. La tabla `usuarios` representa cuentas de administración con credenciales de acceso. No están vinculadas en el MVP. Si en el futuro un miembro pudiera tener cuenta propia, se añadiría una FK `pilotos.usuario_id` sin romper el modelo actual.
- **`pilotos.numero` no tiene UNIQUE** porque el dorsal puede repetirse entre temporadas o no estar asignado en todas ellas.

---

## 4. Endpoints de la API

Base URL: `/api/v1`

Convención de respuesta de error:
```json
{ "error": "mensaje legible", "code": "ERROR_CODE" }
```

### Rutas Públicas (`/api/v1/public`)

```
GET  /public/temporada-activa              Temporada activa con resumen (próximo GP, líder)
GET  /public/temporadas/:id/calendario     Lista de GPs de una temporada
GET  /public/gp/:id                        Detalle de GP con sesiones y resultados
GET  /public/temporadas/:id/clasificacion/pilotos        Clasificación de pilotos
GET  /public/temporadas/:id/clasificacion/constructores  Clasificación de constructores
GET  /public/temporadas/:id/normativa      Normativa de una temporada
GET  /public/temporadas                    Lista de temporadas (para histórico)
```

### Rutas de Administración (`/api/v1/admin`) — requieren JWT

#### Autenticación
```
POST /admin/auth/login                     Valida credenciales y devuelve JWT
GET  /admin/auth/me                        Datos del usuario autenticado (valida token)
```
> El logout se gestiona en cliente eliminando el token. No se implementa blacklist en el MVP.

#### Temporadas
```
GET    /admin/temporadas
POST   /admin/temporadas
GET    /admin/temporadas/:id
PUT    /admin/temporadas/:id
PATCH  /admin/temporadas/:id/activar       Activa esta temporada (desactiva la anterior)
```

#### Equipos
```
GET    /admin/equipos
POST   /admin/equipos
PUT    /admin/equipos/:id
```
> No se expone DELETE. Un equipo con inscripciones o asignaciones históricas no debe eliminarse;
> si se quiere ocultar, se puede añadir un campo `activo` en el futuro.

#### Pilotos
```
GET    /admin/pilotos
POST   /admin/pilotos
GET    /admin/pilotos/:id
PUT    /admin/pilotos/:id
GET    /admin/pilotos/:id/asignaciones     Historial de asignaciones a equipos
POST   /admin/temporadas/:id/asignaciones  Crear asignación de piloto en temporada
PUT    /admin/asignaciones/:id/cerrar      Cierra asignación (fecha_hasta = hoy)
```

#### Grandes Premios
```
GET    /admin/temporadas/:id/gp
POST   /admin/temporadas/:id/gp
GET    /admin/gp/:id
PUT    /admin/gp/:id
PATCH  /admin/gp/:id/estado
```

#### Inscripciones
```
GET    /admin/gp/:id/inscripciones
POST   /admin/gp/:id/inscripciones
PUT    /admin/inscripciones/:id
```
> No se expone DELETE. Para retirar a un piloto de un GP se cambia su estado a "ausente"
> o "sustituido", preservando el registro.

#### Sesiones y Resultados
```
GET    /admin/gp/:id/sesiones
POST   /admin/gp/:id/sesiones              Crear sesión (qualy/sprint/carrera)
GET    /admin/sesiones/:id/resultados
PUT    /admin/sesiones/:id/resultados      Guardar/reemplazar todos los resultados de la sesión
PATCH  /admin/sesiones/:id/estado          Marcar sesión como completada
```

#### Sanciones
```
GET    /admin/sesiones/:id/sanciones       Lista de sanciones de la sesión
POST   /admin/resultados/:id/sanciones     Añadir sanción a un resultado
PUT    /admin/sanciones/:id               Editar sanción
DELETE /admin/sanciones/:id               Eliminar sanción
```

#### Normativa
```
GET    /admin/temporadas/:id/normativa
PUT    /admin/temporadas/:id/normativa
```

#### Usuarios administradores
```
GET    /admin/usuarios
POST   /admin/usuarios
PUT    /admin/usuarios/:id
DELETE /admin/usuarios/:id          Solo si el usuario no tiene actividad registrada
PATCH  /admin/usuarios/:id/password
```

---

## 5. Estrategia de Cálculo de Clasificaciones

Las clasificaciones **no se persisten**. Se calculan en el servicio `clasificacion_service.go` bajo demanda.

### 5.1 Clasificación de Pilotos

**Algoritmo:**

1. Obtener todos los `resultados_sesion` de sesiones tipo `sprint` y `carrera` cuyo GP pertenezca a la temporada.
2. Ignorar resultados de sesiones tipo `qualy` (sin puntos).
3. Agrupar por `piloto_id` (obtenido a través de `inscripciones_gp`).
4. Sumar los `puntos` de cada piloto (campo calculado tras sanciones).
5. Ordenar por puntos descendente.
6. **Desempate:** ante igualdad de puntos, comparar conteo de posición 1 (victorias); si sigue el empate, posición 2; y así hasta la última posición registrada.

```
SELECT
    p.id, p.nombre, p.apellido,
    COALESCE(SUM(rs.puntos), 0) AS puntos_total,
    -- arrays de conteo por posición para desempate
    array_agg(rs.posicion ORDER BY rs.posicion) AS posiciones
FROM pilotos p
JOIN inscripciones_gp ig ON ig.piloto_id = p.id
JOIN gran_premios gp ON gp.id = ig.gran_premio_id AND gp.temporada_id = $1
JOIN sesiones s ON s.gran_premio_id = gp.id AND s.tipo IN ('sprint', 'carrera')
LEFT JOIN resultados_sesion rs ON rs.sesion_id = s.id AND rs.inscripcion_id = ig.id
GROUP BY p.id
ORDER BY puntos_total DESC
-- el desempate fino se resuelve en Go, no en SQL
```

El desempate fino (comparación posición a posición) se implementa en Go con una función de comparación sobre los arrays de posiciones, para no complicar innecesariamente el SQL.

### 5.2 Clasificación de Constructores

**Algoritmo:**

1. Obtener todos los `resultados_sesion` de sesiones tipo `sprint` y `carrera`.
2. Para cada resultado, identificar el `equipo_id` de la `inscripcion_gp` correspondiente (el equipo real del GP, no la asignación base).
3. Agrupar por `equipo_id` y sumar `puntos`.
4. Ordenar por puntos descendente.

**Clave:** se usa el equipo de `inscripciones_gp`, no el de `asignaciones_piloto`. Esto garantiza que los puntos de un reserva se asignan al equipo para el que corrió en ese GP concreto.

### 5.3 Recálculo de `posicion` y `puntos` tras sanciones

Este proceso se ejecuta en `service/resultado.go` cada vez que se guarda un resultado, o se añade, edita o elimina una sanción. Opera sobre todos los resultados de una sesión completa:

```
función recalcularSesion(sesion_id):

  1. Obtener todos los resultados de la sesión ordenados por posicion_original.

  2. Para cada resultado, aplicar sus sanciones en orden (campo `orden`):
       - tipo "tiempo":              en el MVP, el admin introduce directamente cuántas
                                     posiciones retrocede el piloto (campo `valor`).
                                     No se calculan segundos automáticamente porque la
                                     liga no registra tiempos reales de carrera.
       - tipo "descalificacion":     marcar como DSQ (posicion = NULL, puntos = 0)
       - tipo "amonestacion":        no modifica posición ni puntos
       - tipo "penalizacion_parrilla": no modifica posición ni puntos de esta sesión

  3. Reordenar los resultados no-DSQ según las posiciones ajustadas.
     Reasignar posiciones finales: 1, 2, 3… (los DSQ no ocupan posición).

  4. Asignar puntos según tabla oficial de F1 a cada posición final:
       - Carrera:  25-18-15-12-10-8-6-4-2-1 (top 10)
       - Sprint:   8-7-6-5-4-3-2-1 (top 8)
       - Qualy:    0 (sin puntos)

  5. Persistir los campos posicion y puntos actualizados en resultados_sesion.
```

> **Nota MVP — penalizaciones de tiempo:** dado que la liga no registra tiempos de carrera reales, el campo `valor` de una sanción de tipo `tiempo` representa el número de posiciones que retrocede el piloto, no segundos. El admin introduce este valor de forma explícita. Si en el futuro se añaden tiempos reales, el cálculo podrá automatizarse sin cambiar el modelo.

---

## 6. Flujo Completo de Introducción de Resultados

### 6.1 Flujo normal (sin sanciones)

```
1. Admin abre el GP en el panel.

2. Admin gestiona inscripciones:
   - Confirma qué pilotos participan (estado → "participo").
   - Marca ausentes (estado → "ausente").
   - Registra sustituciones: reserva toma el puesto de un titular
     (titular → "sustituido", reserva → nueva inscripcion con equipo del titular).

3. Admin accede a la sesión (qualy / sprint / carrera).

4. Admin introduce posiciones finales de cada piloto inscrito
   (posicion_original = posicion final inicial, posicion = mismo valor).

5. El sistema asigna puntos según tabla oficial y guarda resultados.

6. Admin marca la sesión como "completada".

7. Las clasificaciones se actualizan automáticamente en la próxima consulta.
```

### 6.2 Flujo con sanción posterior

```
1. Resultados ya guardados y sesión "completada".

2. Se produce una denuncia o incidente post-carrera.

3. Admin accede a Gestión de Sanciones de esa sesión.

4. Admin crea una sanción:
   - Selecciona el piloto (resultado_sesion_id).
   - Elige tipo: tiempo / descalificacion / penalizacion_parrilla / amonestacion.
   - Introduce valor (si aplica) y motivo.
   - Asigna orden si hay varias sanciones en la misma sesión.

5. Al guardar la sanción, el servicio ejecuta recalcularSesion():
   a. Lee todos los resultados de la sesión.
   b. Aplica todas las sanciones en orden.
   c. Recalcula posiciones y puntos finales.
   d. Actualiza posicion y puntos en resultados_sesion.

6. Las clasificaciones se actualizan automáticamente en la próxima consulta.

7. La sanción y su efecto son visibles en el detalle público del GP.
```

### 6.3 Corrección de resultados ya guardados

```
1. Admin edita directamente posicion_original de un resultado (error de transcripción).

2. El sistema ejecuta recalcularSesion() para esa sesión (igual que en sanciones).

3. Se mantienen las sanciones existentes — se reaaplican sobre la nueva posicion_original.
```

---

## 7. Decisiones Técnicas Importantes

### 7.1 SQL puro con pgx en lugar de ORM

Go tiene varios ORMs populares (GORM, sqlc, Ent). Se elige **SQL puro con pgx** por:
- Las consultas de clasificación son complejas y se benefician de SQL explícito.
- Sin magia implícita: cada consulta es auditable y predecible.
- Sin capa de abstracción que impida usar características de PostgreSQL (CTEs, window functions, partial indexes).
- Para el aprendizaje: entender SQL directamente es más formativo.

En el futuro, si el número de consultas crece mucho, se puede valorar **sqlc** (genera código Go tipado a partir de SQL) sin cambiar la filosofía.

### 7.2 Clasificaciones calculadas, no persistidas

Persistir clasificaciones crearía un problema de consistencia: cualquier corrección de resultado o sanción podría dejar la clasificación desincronizada. Calcular en tiempo de consulta garantiza que la clasificación siempre refleja el estado real de los datos.

**Coste:** para una liga con pocas decenas de pilotos y una temporada de ~25 GPs, el cálculo es trivialmente rápido. Si en el futuro se necesita rendimiento, se puede añadir una capa de caché (Redis o caché en memoria) invalidada por eventos, sin cambiar el modelo de datos.

### 7.3 JWT para autenticación de administradores

Se usa JWT (JSON Web Tokens) con una expiración razonable (p.ej. 24h). El token se almacena en una cookie `HttpOnly` en el navegador para evitar acceso desde JavaScript (protección contra XSS).

El MVP expone dos endpoints de auth: `POST /login` (genera token) y `GET /me` (valida token y devuelve datos del usuario). El logout se gestiona en cliente eliminando la cookie; no se implementa blacklist de tokens en servidor. Si en el futuro se necesita revocación inmediata, se puede añadir una tabla de tokens invalidados.

### 7.4 App Router de Next.js con Server Components

Se usa el App Router (Next.js 13+) con **Server Components** para las páginas públicas: el HTML se genera en el servidor, la página es indexable y la carga inicial es rápida sin JavaScript extra.

Los formularios del panel de administración usan **Client Components** donde se necesita interactividad (estado local, validación en tiempo real).

Las peticiones a la API de Go se hacen desde Server Components en el servidor (sin exponer el token al navegador en rutas públicas) y desde el cliente en el panel admin (con el JWT en la cookie).

### 7.5 Separación de rutas públicas y admin en la API

Las rutas `/public/*` no requieren autenticación. Las rutas `/admin/*` pasan por el middleware `auth.go` que valida el JWT antes de llegar al handler.

Esta separación es explícita en el router, lo que hace imposible olvidarse de proteger un endpoint admin por accidente.

### 7.6 Modelo de inscripciones como fuente de verdad para el equipo del GP

Un piloto puede tener una asignación base en `asignaciones_piloto` (su equipo habitual), pero en un GP concreto puede correr para otro equipo (sustitución, cambio temporal). La entidad `inscripciones_gp.equipo_id` es la que manda para el cálculo de puntos de constructores en ese GP.

Esto desacopla la asignación base (histórico) del equipo real de competición (GP a GP).

### 7.7 Migraciones SQL con control de versiones

Las migraciones se gestionan como archivos `.sql` numerados en `db/migrations/`. Se puede usar una herramienta ligera como **golang-migrate** para aplicarlas en orden y llevar el registro de cuáles se han ejecutado.

No se usan migraciones autogeneradas por ORM, por coherencia con la decisión 7.1.

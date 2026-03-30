-- Migración 001 — Esquema inicial de F1 Friends
-- Ejecutar con: psql -d f1friends -f 001_initial_schema.sql
-- O con golang-migrate cuando se integre.

-- ============================================================
-- TEMPORADAS
-- ============================================================
CREATE TABLE temporadas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    anio        SMALLINT     NOT NULL,
    descripcion TEXT,
    activa      BOOLEAN      NOT NULL DEFAULT false,
    normativa   TEXT,
    creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Solo puede existir una temporada activa simultáneamente.
CREATE UNIQUE INDEX idx_temporadas_una_activa
    ON temporadas (activa)
    WHERE activa = true;


-- ============================================================
-- EQUIPOS (escuderías)
-- ============================================================
CREATE TABLE equipos (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    color  CHAR(7),       -- color hex, p.ej. #E8002D
    logo   VARCHAR(255)   -- ruta o URL del logo
);


-- ============================================================
-- PILOTOS (miembros/jugadores de la liga)
-- No son pilotos reales de F1. Entidad distinta de usuarios (admins).
-- ============================================================
CREATE TABLE pilotos (
    id             SERIAL PRIMARY KEY,
    nombre_publico VARCHAR(100) NOT NULL,
    nombre_real    VARCHAR(100),
    nacionalidad   VARCHAR(60),
    numero         SMALLINT,        -- dorsal; sin UNIQUE porque puede cambiar entre temporadas
    id_psn         VARCHAR(50),
    id_ea          VARCHAR(50),
    id_xbox        VARCHAR(50),
    twitch_url     VARCHAR(255),
    youtube_url    VARCHAR(255),
    avatar_url     VARCHAR(255),
    activo         BOOLEAN NOT NULL DEFAULT true
);


-- ============================================================
-- ASIGNACIONES DE PILOTO A TEMPORADA
-- Cada fila = un período de asignación a un equipo.
-- Para registrar un cambio de equipo: se cierra la fila anterior
-- (fecha_hasta = fecha del cambio) y se crea una nueva.
-- ============================================================
CREATE TABLE asignaciones_piloto (
    id           SERIAL PRIMARY KEY,
    piloto_id    INT         NOT NULL REFERENCES pilotos(id),
    temporada_id INT         NOT NULL REFERENCES temporadas(id),
    equipo_id    INT         REFERENCES equipos(id),  -- NULL si es reserva sin equipo fijo
    tipo         VARCHAR(10) NOT NULL CHECK (tipo IN ('titular', 'reserva')),
    fecha_desde  DATE        NOT NULL,
    fecha_hasta  DATE        -- NULL = asignación vigente actualmente
    -- Nota: la validación de solapamientos de períodos se hace en el service.
);


-- ============================================================
-- GRANDES PREMIOS
-- ============================================================
CREATE TABLE gran_premios (
    id           SERIAL PRIMARY KEY,
    temporada_id INT          NOT NULL REFERENCES temporadas(id),
    nombre       VARCHAR(100) NOT NULL,
    circuito     VARCHAR(100),
    pais         VARCHAR(60),
    fecha        DATE,
    tiene_sprint BOOLEAN      NOT NULL DEFAULT false,
    estado       VARCHAR(15)  NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente', 'en_curso', 'completado')),
    orden        SMALLINT     NOT NULL DEFAULT 0   -- posición en el calendario
);


-- ============================================================
-- INSCRIPCIONES DE PILOTO A GP
-- Registra qué piloto corre en qué GP y para qué equipo.
-- El equipo_id aquí es el que computa en la clasificación de constructores,
-- independientemente de la asignación base del piloto en la temporada.
-- ============================================================
CREATE TABLE inscripciones_gp (
    id             SERIAL PRIMARY KEY,
    gran_premio_id INT         NOT NULL REFERENCES gran_premios(id),
    piloto_id      INT         NOT NULL REFERENCES pilotos(id),
    equipo_id      INT         NOT NULL REFERENCES equipos(id),
    estado         VARCHAR(12) NOT NULL DEFAULT 'inscrito'
                   CHECK (estado IN ('inscrito', 'ausente', 'sustituido', 'participo')),
    UNIQUE (gran_premio_id, piloto_id)
);


-- ============================================================
-- SESIONES DE UN GP (qualy, sprint, carrera)
-- ============================================================
CREATE TABLE sesiones (
    id             SERIAL PRIMARY KEY,
    gran_premio_id INT        NOT NULL REFERENCES gran_premios(id),
    tipo           VARCHAR(8) NOT NULL CHECK (tipo IN ('qualy', 'sprint', 'carrera')),
    estado         VARCHAR(10) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente', 'completada')),
    UNIQUE (gran_premio_id, tipo)
);


-- ============================================================
-- RESULTADOS POR SESIÓN
-- posicion_original: posición al cruzar meta (introducida por el admin).
-- posicion: posición final tras aplicar sanciones (calculada por el service).
-- puntos: puntos asignados según posicion final (calculados por el service).
-- ============================================================
CREATE TABLE resultados_sesion (
    id                SERIAL   PRIMARY KEY,
    sesion_id         INT      NOT NULL REFERENCES sesiones(id),
    inscripcion_id    INT      NOT NULL REFERENCES inscripciones_gp(id),
    posicion_original SMALLINT NOT NULL,
    posicion          SMALLINT,           -- NULL si descalificado
    puntos            SMALLINT,           -- NULL si descalificado o sin puntos (qualy)
    pole              BOOLEAN  NOT NULL DEFAULT false,  -- solo aplica en qualy
    vuelta_rapida     BOOLEAN  NOT NULL DEFAULT false,  -- solo aplica en sprint y carrera
    UNIQUE (sesion_id, inscripcion_id),
    UNIQUE (sesion_id, posicion_original)
);


-- ============================================================
-- SANCIONES SOBRE UN RESULTADO
-- orden: define el orden de aplicación cuando hay varias sanciones
--        sobre el mismo resultado (de menor a mayor).
-- valor: posiciones a retroceder (tipo 'tiempo' en el MVP, sin tiempos reales)
--        o posiciones de penalización de parrilla.
-- ============================================================
CREATE TABLE sanciones (
    id                  SERIAL      PRIMARY KEY,
    resultado_sesion_id INT         NOT NULL REFERENCES resultados_sesion(id),
    tipo                VARCHAR(20) NOT NULL
                        CHECK (tipo IN ('tiempo', 'descalificacion', 'penalizacion_parrilla', 'amonestacion')),
    valor               INT,        -- NULL si el tipo no requiere valor numérico
    motivo              TEXT        NOT NULL,
    orden               SMALLINT    NOT NULL DEFAULT 0,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ============================================================
-- USUARIOS ADMINISTRADORES
-- Entidad separada de pilotos. Los admins gestionan la liga;
-- los pilotos son los miembros que compiten.
-- ============================================================
CREATE TABLE usuarios (
    id            SERIAL      PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

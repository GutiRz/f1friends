-- Seed 003 — Pilotos y asignaciones de la temporada 2025
--
-- Cambia el valor de v_temporada_id al id real de la temporada antes de ejecutar.
--
-- Ejecutar:
--   psql -d f1friends -f seeds/003_pilotos_y_asignaciones_2025.sql
--
-- Idempotente:
--   - Pilotos: INSERT ... WHERE NOT EXISTS (nombre_publico)
--   - Asignaciones: INSERT solo si no existe asignación vigente para ese piloto/temporada

BEGIN;

-- ============================================================
-- CONFIGURACIÓN
-- ============================================================
-- Ajusta este valor al id de la temporada en tu base de datos.
DO $$ BEGIN
  PERFORM set_config('seed.temporada_id', '1', TRUE);
END $$;

-- ============================================================
-- MAPEO DE NOMBRES COMERCIALES A NOMBRES INTERNOS
-- ============================================================

CREATE TEMP TABLE equipo_alias (
  alias  TEXT PRIMARY KEY,
  nombre TEXT NOT NULL
);

INSERT INTO equipo_alias (alias, nombre) VALUES
  ('Oracle Red Bull Racing',               'Red Bull Racing'),
  ('Scuderia Ferrari HP',                  'Ferrari'),
  ('McLaren Formula 1 Team',               'McLaren'),
  ('Mercedes AMG Petronas F1 Team',        'Mercedes'),
  ('Aston Martin Aramco F1 Team',          'Aston Martin'),
  ('BWT Alpine F1 Team',                   'Alpine'),
  ('MoneyGram Haas F1 Team',               'Haas'),
  ('Visa Cash App Racing Bulls F1 Team',   'RB'),
  ('Atlassian Williams Racing',            'Williams'),
  ('Stake F1 Team Kick Sauber',            'Sauber');

-- ============================================================
-- PILOTOS (titulares + reservas)
-- ============================================================
-- INSERT ... WHERE NOT EXISTS porque pilotos.nombre_publico no tiene UNIQUE constraint.

DO $$
DECLARE
  nombres TEXT[] := ARRAY[
    'Loki', 'Erik', 'Jon', 'Robben', 'Sete', 'Franuko', 'Joker', 'Luis',
    'Jorge', 'Quadrifogliogiu', 'Guti', 'Jimmy Sainz Jr.', 'Joselu', 'Vicent',
    'Miguel MC', 'Franxu', 'Simarro', 'Paco', 'Barrero', 'Dario',
    'Pirata', 'Gon', 'Javi Caelum', 'Josema', 'Nacho', 'Pablo', 'Rubén', 'Pedro', 'Xavi'
  ];
  v_nombre TEXT;
BEGIN
  FOREACH v_nombre IN ARRAY nombres LOOP
    INSERT INTO pilotos (nombre_publico, activo)
    SELECT v_nombre, TRUE
    WHERE NOT EXISTS (SELECT 1 FROM pilotos WHERE nombre_publico = v_nombre);
  END LOOP;
END $$;

-- ============================================================
-- ASIGNACIONES TITULARES
-- ============================================================

DO $$
DECLARE
  v_temporada_id INT := current_setting('seed.temporada_id')::INT;

  titulares TEXT[][] := ARRAY[
    ARRAY['Loki',            'Oracle Red Bull Racing'],
    ARRAY['Erik',            'Aston Martin Aramco F1 Team'],
    ARRAY['Jon',             'MoneyGram Haas F1 Team'],
    ARRAY['Robben',          'Atlassian Williams Racing'],
    ARRAY['Sete',            'Mercedes AMG Petronas F1 Team'],
    ARRAY['Franuko',         'Oracle Red Bull Racing'],
    ARRAY['Joker',           'Scuderia Ferrari HP'],
    ARRAY['Luis',            'MoneyGram Haas F1 Team'],
    ARRAY['Jorge',           'McLaren Formula 1 Team'],
    ARRAY['Quadrifogliogiu', 'Atlassian Williams Racing'],
    ARRAY['Guti',            'Scuderia Ferrari HP'],
    ARRAY['Jimmy Sainz Jr.', 'Stake F1 Team Kick Sauber'],
    ARRAY['Joselu',          'BWT Alpine F1 Team'],
    ARRAY['Vicent',          'Stake F1 Team Kick Sauber'],
    ARRAY['Miguel MC',       'McLaren Formula 1 Team'],
    ARRAY['Franxu',          'Visa Cash App Racing Bulls F1 Team'],
    ARRAY['Simarro',         'Visa Cash App Racing Bulls F1 Team'],
    ARRAY['Paco',            'Aston Martin Aramco F1 Team'],
    ARRAY['Barrero',         'BWT Alpine F1 Team'],
    ARRAY['Dario',           'Mercedes AMG Petronas F1 Team']
  ];

  r TEXT[];
  v_piloto_id  INT;
  v_equipo_id  INT;
  v_ya_existe  BOOLEAN;
BEGIN
  FOREACH r SLICE 1 IN ARRAY titulares LOOP
    SELECT id INTO v_piloto_id FROM pilotos WHERE nombre_publico = r[1] LIMIT 1;
    IF v_piloto_id IS NULL THEN
      RAISE EXCEPTION 'Piloto no encontrado: %', r[1];
    END IF;

    SELECT e.id INTO v_equipo_id
    FROM equipos e
    JOIN equipo_alias a ON a.nombre = e.nombre
    WHERE a.alias = r[2];
    IF v_equipo_id IS NULL THEN
      RAISE EXCEPTION 'Equipo no encontrado para alias: %', r[2];
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM asignaciones_piloto
      WHERE piloto_id = v_piloto_id
        AND temporada_id = v_temporada_id
        AND fecha_hasta IS NULL
    ) INTO v_ya_existe;

    IF NOT v_ya_existe THEN
      INSERT INTO asignaciones_piloto (piloto_id, temporada_id, equipo_id, tipo, fecha_desde)
      VALUES (v_piloto_id, v_temporada_id, v_equipo_id, 'titular', CURRENT_DATE);
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- ASIGNACIONES RESERVAS
-- ============================================================

DO $$
DECLARE
  v_temporada_id INT := current_setting('seed.temporada_id')::INT;

  reservas TEXT[] := ARRAY[
    'Pirata', 'Gon', 'Javi Caelum', 'Josema',
    'Nacho', 'Pablo', 'Rubén', 'Pedro', 'Xavi'
  ];

  v_nombre     TEXT;
  v_piloto_id  INT;
  v_ya_existe  BOOLEAN;
BEGIN
  FOREACH v_nombre IN ARRAY reservas LOOP
    SELECT id INTO v_piloto_id FROM pilotos WHERE nombre_publico = v_nombre LIMIT 1;
    IF v_piloto_id IS NULL THEN
      RAISE EXCEPTION 'Piloto reserva no encontrado: %', v_nombre;
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM asignaciones_piloto
      WHERE piloto_id = v_piloto_id
        AND temporada_id = v_temporada_id
        AND fecha_hasta IS NULL
    ) INTO v_ya_existe;

    IF NOT v_ya_existe THEN
      INSERT INTO asignaciones_piloto (piloto_id, temporada_id, equipo_id, tipo, fecha_desde)
      VALUES (v_piloto_id, v_temporada_id, NULL, 'reserva', CURRENT_DATE);
    END IF;
  END LOOP;
END $$;

COMMIT;

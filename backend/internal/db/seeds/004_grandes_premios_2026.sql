-- Seed 004 — Grandes Premios y sesiones F1 temporada 2026
--
-- Cambia el valor de temporada_id al id real de la temporada antes de ejecutar.
-- Las fechas corresponden al día de carrera (domingo).
-- tiene_sprint = true en los GP con Sprint Race según el calendario oficial.
--
-- Sesiones creadas por GP:
--   Sin sprint: qualy + carrera
--   Con sprint: qualy + sprint_qualy + sprint + carrera
--
-- Ejecutar:
--   psql postgresql://f1friends:f1friends@localhost:5432/f1friends -f seeds/004_grandes_premios_2026.sql
--
-- Idempotente: GPs por (temporada_id, orden); sesiones por (gran_premio_id, tipo) — UNIQUE en tabla.

BEGIN;

DO $$ BEGIN
  PERFORM set_config('seed.temporada_id', '1', TRUE);
END $$;

DO $$
DECLARE
  v_temporada_id INT := current_setting('seed.temporada_id')::INT;

  -- ARRAY[orden, nombre, pais, circuito, fecha_carrera, tiene_sprint]
  gps TEXT[][] := ARRAY[
    ARRAY['1',  'GP Australia',       'Australia',       'Albert Park Circuit',               '2026-03-08', 'false'],
    ARRAY['2',  'GP China',           'China',           'Shanghai International Circuit',     '2026-03-15', 'true'],
    ARRAY['3',  'GP Japón',           'Japón',           'Suzuka International Racing Course', '2026-03-29', 'false'],
    ARRAY['4',  'GP Báhrein',         'Báhrein',         'Bahrain International Circuit',      '2026-04-12', 'false'],
    ARRAY['5',  'GP Arabia Saudí',    'Arabia Saudí',    'Jeddah Corniche Circuit',            '2026-04-26', 'false'],
    ARRAY['6',  'GP Miami',           'Estados Unidos',  'Miami International Autodrome',      '2026-05-03', 'true'],
    ARRAY['7',  'GP Bélgica',         'Bélgica',         'Circuit de Spa-Francorchamps',       '2026-05-10', 'false'],
    ARRAY['8',  'GP Canadá',          'Canadá',          'Circuit Gilles Villeneuve',          '2026-05-24', 'true'],
    ARRAY['9',  'GP Hungría',         'Hungría',         'Hungaroring',                        '2026-05-31', 'false'],
    ARRAY['10', 'GP Mónaco',          'Mónaco',          'Circuit de Monaco',                  '2026-06-07', 'false'],
    ARRAY['11', 'GP España',          'España',          'Circuit de Barcelona-Catalunya',     '2026-06-14', 'false'],
    ARRAY['12', 'GP Austria',         'Austria',         'Red Bull Ring',                      '2026-06-28', 'false'],
    ARRAY['13', 'GP Gran Bretaña',    'Reino Unido',     'Silverstone Circuit',                '2026-07-05', 'true'],
    ARRAY['14', 'GP Países Bajos',    'Países Bajos',    'Circuit Zandvoort',                  '2026-08-30', 'true'],
    ARRAY['15', 'GP Italia',          'Italia',          'Autodromo Nazionale Monza',          '2026-09-06', 'false'],
    ARRAY['16', 'GP Emilia Romagna',  'Italia',          'Autodromo Enzo e Dino Ferrari',      '2026-09-13', 'false'],
    ARRAY['17', 'GP Azerbaiyán',      'Azerbaiyán',      'Baku City Circuit',                  '2026-09-27', 'false'],
    ARRAY['18', 'GP Singapur',        'Singapur',        'Marina Bay Street Circuit',          '2026-10-04', 'true'],
    ARRAY['19', 'GP Estados Unidos',  'Estados Unidos',  'Circuit of the Americas',            '2026-10-25', 'false'],
    ARRAY['20', 'GP México',          'México',          'Autodromo Hermanos Rodriguez',       '2026-11-01', 'false'],
    ARRAY['21', 'GP Brasil',          'Brasil',          'Autodromo Jose Carlos Pace',         '2026-11-08', 'false'],
    ARRAY['22', 'GP Las Vegas',       'Estados Unidos',  'Las Vegas Street Circuit',           '2026-11-22', 'false'],
    ARRAY['23', 'GP Qatar',           'Qatar',           'Lusail International Circuit',       '2026-11-29', 'false'],
    ARRAY['24', 'GP Abu Dabi',        'Emiratos Árabes', 'Yas Marina Circuit',                 '2026-12-13', 'false']
  ];

  r             TEXT[];
  v_gp_id       INT;
  v_tiene_sprint BOOLEAN;
BEGIN
  FOREACH r SLICE 1 IN ARRAY gps LOOP
    v_tiene_sprint := r[6]::BOOLEAN;

    -- Inserta el GP solo si no existe (idempotente por temporada_id + orden)
    INSERT INTO gran_premios (temporada_id, nombre, pais, circuito, fecha, tiene_sprint, orden, estado)
    SELECT v_temporada_id, r[2], r[3], r[4], r[5]::DATE, v_tiene_sprint, r[1]::INT, 'pendiente'
    WHERE NOT EXISTS (
      SELECT 1 FROM gran_premios
      WHERE temporada_id = v_temporada_id AND orden = r[1]::INT
    )
    RETURNING id INTO v_gp_id;

    -- Si el GP ya existía, obtiene su id
    IF v_gp_id IS NULL THEN
      SELECT id INTO v_gp_id FROM gran_premios
      WHERE temporada_id = v_temporada_id AND orden = r[1]::INT;
    END IF;

    -- Sesiones base (todo GP)
    INSERT INTO sesiones (gran_premio_id, tipo, estado)
    VALUES (v_gp_id, 'qualy',   'pendiente'),
           (v_gp_id, 'carrera', 'pendiente')
    ON CONFLICT (gran_premio_id, tipo) DO NOTHING;

    -- Sesiones sprint (solo si tiene_sprint)
    IF v_tiene_sprint THEN
      INSERT INTO sesiones (gran_premio_id, tipo, estado)
      VALUES (v_gp_id, 'sprint_qualy', 'pendiente'),
             (v_gp_id, 'sprint',       'pendiente')
      ON CONFLICT (gran_premio_id, tipo) DO NOTHING;
    END IF;
  END LOOP;
END $$;

COMMIT;

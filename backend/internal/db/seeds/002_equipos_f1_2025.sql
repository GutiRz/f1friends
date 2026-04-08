-- Seed 002 — Equipos oficiales de Fórmula 1 temporada 2025
--
-- Colores: color principal del coche/equipo según identidad visual oficial.
-- Logos: rutas locales relativas al directorio public del frontend.
--        Los archivos SVG están en frontend/public/images/equipos/.
--        Reemplazables desde admin con la URL real cuando se disponga de los logos.
--
-- Ejecutar:
--   psql -d f1friends -f seeds/002_equipos_f1_2025.sql
--
-- Idempotente: ON CONFLICT (nombre) DO NOTHING evita duplicados.

INSERT INTO equipos (nombre, color, logo) VALUES
  ('Red Bull Racing', '#3671C6', '/images/equipos/red-bull.svg'),
  ('Ferrari',         '#E8002D', '/images/equipos/ferrari.svg'),
  ('McLaren',         '#FF8000', '/images/equipos/mclaren.svg'),
  ('Mercedes',        '#27F4D2', '/images/equipos/mercedes.svg'),
  ('Aston Martin',    '#229971', '/images/equipos/aston-martin.svg'),
  ('Alpine',          '#0093CC', '/images/equipos/alpine.svg'),
  ('Haas',            '#B6BABD', '/images/equipos/haas.svg'),
  ('RB',              '#6692FF', '/images/equipos/rb.svg'),
  ('Williams',        '#64C4FF', '/images/equipos/williams.svg'),
  ('Sauber',          '#52E252', '/images/equipos/sauber.svg')
ON CONFLICT (nombre) DO NOTHING;

-- Seed 002 — Equipos oficiales de Fórmula 1 temporada 2025
--
-- Colores: color principal del coche/equipo según identidad visual oficial.
-- Logos: rutas locales relativas al directorio public del frontend.
--        Los archivos JPG están en frontend/public/images/equipos/.
--        Reemplazables desde admin con la URL real cuando se disponga de los logos.
--
-- Ejecutar:
--   psql -d f1friends -f seeds/002_equipos_f1_2025.sql
--
-- Idempotente: ON CONFLICT (nombre) DO UPDATE actualiza color y logo.

INSERT INTO equipos (nombre, color, logo) VALUES
  ('Red Bull Racing', '#3671C6', '/images/equipos/red-bull.jpg'),
  ('Ferrari',         '#E8002D', '/images/equipos/ferrari.jpg'),
  ('McLaren',         '#FF8000', '/images/equipos/mclaren.jpg'),
  ('Mercedes',        '#27F4D2', '/images/equipos/mercedes.jpg'),
  ('Aston Martin',    '#229971', '/images/equipos/aston-martin.jpg'),
  ('Alpine',          '#0093CC', '/images/equipos/alpine.jpg'),
  ('Haas',            '#B6BABD', '/images/equipos/haas.jpg'),
  ('RB',              '#6692FF', '/images/equipos/rb.jpg'),
  ('Williams',        '#64C4FF', '/images/equipos/williams.jpg'),
  ('Sauber',          '#52E252', '/images/equipos/sauber.jpg')
ON CONFLICT (nombre) DO UPDATE SET color = EXCLUDED.color, logo = EXCLUDED.logo;

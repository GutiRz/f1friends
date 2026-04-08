-- reset_data.sql — Borra todos los datos de negocio y reinicia secuencias de IDs.
-- Conserva la tabla usuarios (admin).
--
-- Ejecutar:
--   psql postgresql://f1friends:f1friends@localhost:5432/f1friends -f backend/internal/db/seeds/reset_data.sql

TRUNCATE
  resultados_sesion,
  inscripciones_gp,
  sesiones,
  asignaciones_piloto,
  gran_premios,
  temporadas,
  equipos,
  pilotos
RESTART IDENTITY CASCADE;

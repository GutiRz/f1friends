-- Migración 004 — Añade campo orden a asignaciones_piloto
--
-- Para titulares: indica el número de piloto dentro del equipo (1 = primer piloto, 2 = segundo).
-- Para reservas:  indica prioridad de llamada (1 = primera opción, 2 = segunda, etc.).
--
-- Ejecutar:
--   psql -d f1friends -U f1friends -f migrations/004_asignacion_orden.sql

ALTER TABLE asignaciones_piloto ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 1;

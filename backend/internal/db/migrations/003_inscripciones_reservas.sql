-- Migración 003 — Soporte de reservas en inscripciones de GP
--
-- Cambios:
--   1. equipo_id pasa a ser nullable: los reservas no tienen equipo asignado.
--   2. Se añade el estado 'pendiente' para reservas sin participación confirmada.
--
-- Ejecutar con: psql -d f1friends -f 003_inscripciones_reservas.sql

ALTER TABLE inscripciones_gp ALTER COLUMN equipo_id DROP NOT NULL;

ALTER TABLE inscripciones_gp DROP CONSTRAINT inscripciones_gp_estado_check;
ALTER TABLE inscripciones_gp ADD CONSTRAINT inscripciones_gp_estado_check
    CHECK (estado IN ('pendiente', 'inscrito', 'ausente', 'sustituido', 'participo'));

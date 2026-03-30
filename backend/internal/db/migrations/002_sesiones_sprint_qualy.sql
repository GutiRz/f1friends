-- Migración 002 — Ampliar tipo de sesión para incluir sprint_qualy
-- Necesario para soportar el formato de fin de semana con sprint de F1.
-- Ejecutar con: psql -d f1friends -f 002_sesiones_sprint_qualy.sql

ALTER TABLE sesiones ALTER COLUMN tipo TYPE VARCHAR(15);

ALTER TABLE sesiones DROP CONSTRAINT sesiones_tipo_check;
ALTER TABLE sesiones ADD CONSTRAINT sesiones_tipo_check
    CHECK (tipo IN ('qualy', 'sprint_qualy', 'sprint', 'carrera'));

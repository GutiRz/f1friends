-- Seed 001 — Primer usuario administrador para desarrollo
--
-- Genera un hash bcrypt con:
--   htpasswd -bnBC 10 "" TU_PASSWORD | tr -d ':\n'
-- o con cualquier herramienta bcrypt (cost 10 recomendado).
--
-- Sustituye el hash de abajo y ejecuta:
--   psql -d f1friends -f seeds/001_admin_usuario.sql

INSERT INTO usuarios (nombre, email, password_hash)
VALUES (
    'admin',
    'admin@f1friends.local',
    '$2a$10$bFsWOLeyNPNO1wNX7LVE9e5jC6s78AaO01iCIJqR6vHyEHeDPncfa'
)
ON CONFLICT (email) DO NOTHING;

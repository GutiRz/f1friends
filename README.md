# F1 Friends

Aplicación web para gestionar y visualizar una liga privada de Fórmula 1.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js + TypeScript |
| Backend | Go + Chi |
| Base de datos | PostgreSQL 16 |

## Estructura del repositorio

```
f1friends/
├── backend/      # API REST en Go
├── frontend/     # Aplicación Next.js (pendiente)
├── docs/         # Especificación de producto y arquitectura
└── docker-compose.yml
```

---

## Entorno local — Backend

### Requisitos previos

- [Go 1.24+](https://go.dev/dl/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) con integración WSL2 activada
  *(o PostgreSQL instalado directamente — ver alternativa más abajo)*

---

### 1. Levantar PostgreSQL con Docker

```bash
# Desde la raíz del repositorio
docker compose up -d
```

Esto arranca un contenedor PostgreSQL 16 con:

| Parámetro | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `f1friends` |
| Usuario | `f1friends` |
| Contraseña | `f1friends` |

Para pararlo (conservando los datos):

```bash
docker compose stop
```

Para pararlo y eliminar los datos:

```bash
docker compose down -v
```

---

### 2. Aplicar la migración inicial

```bash
psql -h localhost -U f1friends -d f1friends \
  -f backend/internal/db/migrations/001_initial_schema.sql
```

Si no tienes `psql` instalado localmente, puedes ejecutarlo desde dentro del contenedor:

```bash
docker exec -i f1friends_db \
  psql -U f1friends -d f1friends \
  < backend/internal/db/migrations/001_initial_schema.sql
```

---

### 3. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

El archivo `.env.example` ya tiene los valores correctos para el contenedor Docker local. No necesitas modificar nada para empezar.

---

### 4. Arrancar el servidor

```bash
cd backend
go run ./cmd/api
```

Deberías ver:

```
conexión a la base de datos establecida
servidor escuchando en :8080
```

Verifica que responde:

```bash
curl http://localhost:8080/api/v1/health
# {"status":"ok","time":"..."}
```

---

### Alternativa sin Docker — PostgreSQL nativo

Si prefieres instalar PostgreSQL directamente (sin Docker):

```bash
# Ubuntu / Debian
sudo apt install postgresql postgresql-client

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER f1friends WITH PASSWORD 'f1friends';"
sudo -u postgres psql -c "CREATE DATABASE f1friends OWNER f1friends;"
```

Los valores del `.env` son los mismos; no necesitas cambiar nada.

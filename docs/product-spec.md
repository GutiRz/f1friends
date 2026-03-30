# F1 Friends — Especificación de Producto

## 1. Visión del Producto

F1 Friends es una aplicación web para gestionar ligas privadas de Fórmula 1. Sustituye la gestión manual en Excel y grupos de WhatsApp, ofreciendo una interfaz visual y moderna para consultar y administrar temporadas, pilotos, equipos, resultados y normativa.

**Objetivos principales:**
- Centralizar toda la información de la liga en un único lugar.
- Ofrecer una parte pública accesible sin registro para consultar datos de la temporada.
- Proveer una administración completa para los gestores de la liga.

**Stack tecnológico:**
- Frontend: Next.js + TypeScript
- Backend: Go (API REST)
- Base de datos: PostgreSQL

---

## 2. Roles

| Rol | Descripción |
|---|---|
| **Visitante** | Cualquier persona sin autenticar. Puede consultar la parte pública. |
| **Administrador** | Gestor de la liga. Accede al panel de administración completo. Puede haber varios. |

> **Decisión abierta:** ¿Habrá un rol intermedio (p.ej. piloto registrado) que pueda ver su propio perfil, inscribirse a carreras o consultar datos privados? Por ahora se asume solo dos roles.

---

## 3. Funcionalidades Públicas

Accesibles sin autenticación.

### 3.1 Temporada Actual
- Visualización de la temporada activa: nombre, año, descripción.
- Resumen rápido: próxima carrera, líder del campeonato.

### 3.2 Calendario
- Listado de todos los Grandes Premios de la temporada activa.
- Estado de cada GP: pendiente, en curso, completado.
- Indicación visual de si incluye sprint. 

### 3.3 Detalle de Gran Premio
- Información general: circuito, fecha, país.
- Resultado de clasificación de parrilla: posiciones y piloto en pole (sin puntos).
- Resultado de carrera sprint (si aplica): posiciones, puntos y piloto con vuelta rápida.
- Resultado de carrera principal: posiciones, puntos y piloto con vuelta rápida.
- Pilotos que participaron, incluyendo reservas que sustituyeron a titulares.
- Sanciones aplicadas en esa sesión: tipo, motivo y efecto sobre la clasificación.

### 3.4 Clasificación de Pilotos
- Tabla de clasificación de la temporada activa.
- Puntos totales por piloto.
- Desempate por número de victorias, después segundos puestos, terceros, etc.
- Indicación del equipo actual del piloto.

### 3.5 Clasificación de Constructores
- Tabla de clasificación por equipo.
- Suma de puntos de todos los pilotos (titulares y reservas) que corrieron para cada equipo en cada GP.

### 3.6 Normativa
- Página con la normativa vigente de la liga para la temporada activa.
- La normativa es editable desde administración y puede variar por temporada.

### 3.7 Histórico
- Consulta de temporadas pasadas: clasificaciones finales de pilotos y constructores.
- Consulta de resultados de GPs de temporadas anteriores.

---

## 4. Funcionalidades de Administración

Accesibles solo para el rol Administrador.

### 4.1 Gestión de Temporadas
- Crear, editar y archivar temporadas.
- Activar una temporada como la temporada activa (solo una activa a la vez).
- Ver el histórico de temporadas pasadas.

### 4.2 Gestión de Grandes Premios
- Crear y editar GPs dentro de una temporada: nombre, circuito, fecha, país.
- Configurar si el GP incluye sprint.
- Ordenar el calendario.
- Cambiar el estado del GP.

### 4.3 Gestión de Equipos (Escuderías)
- Crear y editar escuderías.
- Cada escudería tiene habitualmente 2 pilotos titulares.
- Los equipos son independientes de la temporada (pueden participar en varias).

### 4.4 Gestión de Pilotos
- Crear y editar pilotos: nombre, apellido, nacionalidad, número, etc.
- Asignar pilotos titulares a un equipo por temporada.
- Gestionar reservas: los reservas no pertenecen a una escudería fija.
- Registrar cambios de equipo de un piloto durante la temporada.

### 4.5 Gestión de Inscripciones por Carrera
- Para cada GP, registrar qué pilotos participan.
- Indicar si un reserva sustituye a un titular y para qué equipo corre.
- Un piloto puede cambiar de equipo respecto a su asignación base en un GP concreto.

### 4.6 Gestión de Resultados
- Registrar la parrilla de salida (clasificación de qualy) — sin puntos, solo informativo.
- Registrar el resultado de la carrera sprint (si aplica) — con puntos.
- Registrar el resultado de la carrera principal — con puntos.
- El sistema recalcula automáticamente las clasificaciones al guardar resultados.

### 4.7 Gestión de Sanciones
- Aplicar sanciones sobre el resultado de un piloto en una sesión concreta.
- Tipos de sanción:
  - **Penalización de tiempo** (+5s, +10s, etc.) — reordena la clasificación final y recalcula los puntos asignados.
  - **Descalificación (DSQ)** — el piloto pierde todos los puntos de esa sesión y se elimina de la clasificación.
  - **Penalización de posiciones en parrilla** — informativa. No afecta a los puntos ni a la clasificación de la sesión actual. Se registra como aviso para la gestión del siguiente GP, donde el administrador deberá aplicarla manualmente al introducir la parrilla.
  - **Amonestación** — solo informativa, sin efecto en puntos ni posición.
- Cada sanción incluye: motivo (texto libre), tipo, valor (si aplica) y referencia al incidente.
- Las sanciones son visibles en el detalle público del GP.
- Aplicar o modificar una sanción recalcula automáticamente las clasificaciones afectadas.

### 4.8 Gestión de Normativa
- Editor de texto enriquecido para redactar la normativa de cada temporada.
- Las normativas de temporadas pasadas quedan archivadas y son de solo lectura.

---

## 5. Entidades Principales

```
Temporada
  - id, nombre, año, descripción, activa (bool)
  - normativa (texto enriquecido)

Equipo (Escudería)
  - id, nombre, color, logo

Piloto
  - id, nombre, apellido, nacionalidad, número

AsignacionPiloto (Piloto en Temporada)
  - piloto_id, temporada_id, equipo_id, tipo (titular | reserva)
  - fecha_desde, fecha_hasta (nullable)
  - Cada fila representa un período de asignación. Para registrar un cambio de equipo
    se cierra la fila anterior (fecha_hasta) y se abre una nueva (fecha_desde)

GranPremio
  - id, temporada_id, nombre, circuito, pais, fecha, tiene_sprint, estado

InscripcionGP (Piloto en GP)
  - gran_premio_id, piloto_id, equipo_id (equipo para el que corre en ese GP)
  - estado (inscrito | ausente | sustituido | participó)
  - Es el equipo real que computa para la clasificación de constructores
  - El estado permite saber si el piloto finalmente tomó parte: "inscrito" es la
    intención inicial, "participó" confirma que corrió, "ausente" que no lo hizo,
    "sustituido" que fue reemplazado por un reserva en ese GP

Sesion
  - id, gran_premio_id, tipo (qualy | sprint | carrera), estado (pendiente | completada)
  - La qualy es informativa (sin puntos)

Usuario (Administrador)
  - id, nombre, email, password_hash

ResultadoSesion
  - sesion_id, inscripcion_id
  - posicion_original (posición al cruzar la línea de meta, antes de sanciones)
  - posicion (posición final tras aplicar sanciones — campo calculado)
  - puntos (puntos asignados según posicion final — campo calculado)
  - pole (bool) — solo aplica a sesión de tipo qualy
  - vuelta_rapida (bool) — solo aplica a sesiones de tipo sprint y carrera
  - NOTA: posicion y puntos no son fuente de verdad absoluta; se recalculan
    cada vez que se añade, modifica o elimina una sanción sobre este resultado

Sancion
  - id, resultado_sesion_id
  - tipo (tiempo | descalificacion | penalizacion_parrilla | amonestacion)
  - valor (int, opcional — segundos para tipo tiempo, posiciones para penalizacion_parrilla)
  - motivo (texto libre)
  - orden (int) — define el orden de aplicación cuando hay múltiples sanciones sobre
    el mismo resultado; se aplican de menor a mayor orden antes de recalcular posiciones
```

> **Decisión resuelta:** Sistema de puntos oficial de F1 (25-18-15-12-10-8-6-4-2-1 para carrera principal; 8-7-6-5-4-3-2-1 para sprint). Vuelta rápida y pole no puntúan pero se registran para mostrar en el detalle del GP.

> **Nota sobre clasificaciones:** Las clasificaciones de pilotos y constructores **no se almacenan como tablas persistidas**. Se calculan en tiempo de consulta a partir de `ResultadoSesion`, `InscripcionGP` y `Sancion`. Esto garantiza que cualquier corrección de resultados o sanciones se refleja automáticamente sin necesidad de sincronización.

---

## 6. Reglas de Negocio

1. **Una sola temporada activa:** Solo puede existir una temporada marcada como activa simultáneamente.
2. **Equipo base de titulares:** Cada escudería tiene normalmente 2 pilotos titulares por temporada. No es un límite técnico estricto, pero es la norma.
3. **Reservas sin equipo fijo:** Los pilotos reserva no pertenecen a ninguna escudería de forma permanente. Se asignan GP a GP.
4. **Sustitución en GP:** Un reserva puede sustituir a un titular en un GP concreto. El reserva computa para el equipo del titular sustituido en ese GP.
5. **Cambio de equipo en temporada:** Un piloto titular puede cambiar de equipo durante la temporada. El histórico de asignaciones debe conservarse.
6. **Clasificación de pilotos — desempate:** Ante igualdad de puntos, el orden se determina por el mayor número de victorias; si persiste el empate, por el mayor número de segundos puestos; y así sucesivamente.
7. **Clasificación de constructores:** Se suman los puntos de todos los pilotos (titulares o reservas) que corrieron bajo ese equipo en cada GP individual.
8. **Qualy sin puntos:** La sesión de clasificación de parrilla se almacena como información pero no genera puntos.
9. **Sprint con puntos:** La carrera sprint genera puntos independientes de la carrera principal.
10. **Normativa por temporada:** La normativa está vinculada a la temporada. Al archivar una temporada, su normativa queda en modo solo lectura.
11. **Sanciones y recálculo:** Aplicar una sanción de tiempo o descalificación modifica la posición final y los puntos de los pilotos afectados (el reordenamiento puede alterar los puntos de otros pilotos de la sesión). Las clasificaciones se recalculan automáticamente.
12. **Penalización de parrilla:** No afecta a puntos ni a la clasificación de la sesión de qualy; es meramente informativa para el siguiente GP.
13. **Amonestación:** Sin efecto en posición ni puntos. Se registra únicamente como histórico del incidente.

---

## 7. MVP (Primera Versión Funcional)

El objetivo del MVP es tener una aplicación funcional que permita gestionar una temporada completa y reemplazar el Excel.

### Backend
- [ ] CRUD de temporadas (con control de temporada activa)
- [ ] CRUD de equipos y pilotos
- [ ] Asignación de pilotos a equipos por temporada
- [ ] CRUD de Grandes Premios
- [ ] Registro de inscripciones por GP (con soporte de reservas y sustituciones)
- [ ] Registro de resultados (qualy, sprint, carrera)
- [ ] Gestión de sanciones con recálculo de posiciones y puntos
- [ ] Cálculo de clasificación de pilotos con desempate
- [ ] Cálculo de clasificación de constructores
- [ ] API de normativa (lectura/escritura por temporada)
- [ ] Autenticación con JWT para el panel de administración
- [ ] CRUD de usuarios administradores

### Frontend
- [ ] Página de temporada actual con próxima carrera y líder
- [ ] Calendario de GPs
- [ ] Detalle de GP con resultados
- [ ] Clasificación de pilotos
- [ ] Clasificación de constructores
- [ ] Página de normativa
- [ ] Panel de administración: temporadas, equipos, pilotos, GPs, inscripciones, resultados
- [ ] Panel de administración: editor de normativa

---

## 8. Funcionalidades Futuras (Post-MVP)

- **Perfil de piloto público:** Página individual por piloto con su historial de resultados y estadísticas.
- **Perfil de equipo público:** Página individual por equipo con su historia en la liga.
- **Notificaciones:** Avisos automáticos (email o push) sobre nuevos resultados o próximas carreras.
- **Predicciones o quinielas:** Los participantes pueden apostar resultados antes de cada GP.
- **Exportación a PDF/Excel:** Exportar clasificaciones y resultados.
- **Histórico de normativa con versiones:** Comparativa entre normativas de diferentes temporadas.
- **Panel de estadísticas avanzadas:** Gráficos de evolución del campeonato, comparativas entre pilotos, etc.
- **Integración con WhatsApp/Telegram:** Publicación automática de resultados en el grupo.
- **Modo multiliga:** Soporte para gestionar varias ligas independientes desde la misma aplicación.
- **App móvil:** Versión nativa o PWA para consulta desde el móvil.

---

## 9. Decisiones Abiertas

| # | Pregunta | Impacto |
|---|---|---|
| 1 | ¿Habrá un rol "piloto registrado" con acceso a su perfil personal? | Define si se necesita sistema de registro y autenticación para participantes |
| 4 | ¿Puede haber penalizaciones de puntos? | Afecta al cálculo de clasificación |
| 5 | ¿Los equipos pueden tener más de 2 titulares (p.ej. equipos satélite)? | Afecta a la regla de negocio nº 2 |
| 7 | ¿Se necesita internacionalización (i18n) desde el inicio? | Afecta a la arquitectura del frontend |

**Resueltas:**
| # | Decisión |
|---|---|
| 2 | Sistema de puntos oficial de F1. Fijo, no configurable. |
| 3 | Vuelta rápida y pole no puntúan, pero se registran para mostrar en el detalle del GP. |
| 6 | Múltiples administradores, cada uno con su cuenta (email + contraseña). |

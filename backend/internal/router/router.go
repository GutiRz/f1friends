package router

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	authhandler "f1friends/backend/internal/handler/auth"
	adminhandler "f1friends/backend/internal/handler/admin"
	publichandler "f1friends/backend/internal/handler/public"
	"f1friends/backend/internal/middleware"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// New construye y devuelve el router con todas las rutas registradas.
// Las dependencias se cablan aquí: store → service → handler.
func New(pool *pgxpool.Pool, jwtSecret string) *chi.Mux {
	// Capa store: acceso a base de datos.
	usuarioStore := store.NewUsuarioStore(pool)
	equipoStore := store.NewEquipoStore(pool)
	pilotoStore := store.NewPilotoStore(pool)
	temporadaStore := store.NewTemporadaStore(pool)
	granPremioStore := store.NewGranPremioStore(pool)
	asignacionStore := store.NewAsignacionStore(pool)
	inscripcionStore := store.NewInscripcionStore(pool)
	sesionStore := store.NewSesionStore(pool)
	resultadoStore := store.NewResultadoSesionStore(pool)
	clasificacionStore := store.NewClasificacionStore(pool)

	// Capa service: lógica de negocio y validaciones.
	authSvc := service.NewAuthService(usuarioStore, jwtSecret)
	equipoSvc := service.NewEquipoService(equipoStore)
	pilotoSvc := service.NewPilotoService(pilotoStore)
	temporadaSvc := service.NewTemporadaService(temporadaStore)
	granPremioSvc := service.NewGranPremioService(granPremioStore, asignacionStore)
	asignacionSvc := service.NewAsignacionService(asignacionStore)
	inscripcionSvc := service.NewInscripcionService(inscripcionStore)
	sesionSvc := service.NewSesionService(sesionStore, granPremioStore, resultadoStore)
	resultadoSvc := service.NewResultadoSesionService(resultadoStore, sesionStore, inscripcionStore)
	clasificacionSvc := service.NewClasificacionService(clasificacionStore)

	// Handlers: decodifican requests y escriben responses.
	authH := authhandler.NewHandler(authSvc)
	publicEquipo := publichandler.NewEquipoHandler(equipoSvc)
	adminEquipo := adminhandler.NewEquipoHandler(equipoSvc)
	publicPiloto := publichandler.NewPilotoHandler(pilotoSvc)
	adminPiloto := adminhandler.NewPilotoHandler(pilotoSvc)
	publicTemporada := publichandler.NewTemporadaHandler(temporadaSvc)
	adminTemporada := adminhandler.NewTemporadaHandler(temporadaSvc)
	publicGP := publichandler.NewGranPremioHandler(granPremioSvc)
	publicSesion := publichandler.NewSesionHandler(sesionSvc)
	publicAsignacion := publichandler.NewAsignacionHandler(asignacionSvc)
	adminGP := adminhandler.NewGranPremioHandler(granPremioSvc)
	adminInscripcion := adminhandler.NewInscripcionHandler(inscripcionSvc)
	adminSesion := adminhandler.NewSesionHandler(sesionSvc)
	adminResultado := adminhandler.NewResultadoHandler(resultadoSvc)
	adminAsignacion := adminhandler.NewAsignacionHandler(asignacionSvc)
	publicClasificacion := publichandler.NewClasificacionHandler(clasificacionSvc)

	r := chi.NewRouter()

	// Middlewares globales aplicados a todas las rutas.
	r.Use(chimiddleware.Logger)    // log de cada petición: método, ruta, status, duración
	r.Use(chimiddleware.Recoverer) // captura panics y devuelve 500 en lugar de romper el servidor
	r.Use(chimiddleware.RealIP)    // lee X-Forwarded-For para registrar la IP real del cliente
	r.Use(middleware.CORS)         // cabeceras CORS para el frontend Next.js

	r.Route("/api/v1", func(r chi.Router) {

		// Health — sin prefijo de grupo, accesible en /api/v1/health.
		r.Get("/health", publichandler.Health)

		// Auth — sin autenticación, accesible en /api/v1/auth/login.
		r.Post("/auth/login", authH.Login)

		// Rutas públicas — sin autenticación.
		r.Route("/public", func(r chi.Router) {
			r.Get("/equipos", publicEquipo.GetAll)
			r.Get("/pilotos", publicPiloto.GetAll)
			r.Get("/temporada-activa", publicTemporada.GetActiva)
			r.Get("/temporadas", publicTemporada.GetAll)
			r.Get("/temporadas/{id}/calendario", publicGP.GetCalendario)
			r.Get("/temporadas/{id}/pilotos", publicAsignacion.GetPilotosDeTemporada)
			r.Get("/temporadas/{id}/clasificacion/pilotos", publicClasificacion.GetPilotos)
			r.Get("/temporadas/{id}/clasificacion/constructores", publicClasificacion.GetConstructores)
			r.Get("/gp/{id}", publicGP.GetByID)
			r.Get("/gp/{id}/sesiones", publicSesion.GetSesiones)
		})

		// Rutas de administración — requieren JWT.
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.NewAuth(jwtSecret))

			r.Get("/equipos", adminEquipo.GetAll)
			r.Post("/equipos", adminEquipo.Create)
			r.Put("/equipos/{id}", adminEquipo.Update)

			r.Get("/pilotos", adminPiloto.GetAll)
			r.Post("/pilotos", adminPiloto.Create)
			r.Put("/pilotos/{id}", adminPiloto.Update)

			r.Get("/temporadas", adminTemporada.GetAll)
			r.Post("/temporadas", adminTemporada.Create)
			r.Put("/temporadas/{id}", adminTemporada.Update)
			r.Patch("/temporadas/{id}/activar", adminTemporada.Activar)
			r.Get("/temporadas/{id}/gp", adminGP.GetAll)
			r.Post("/temporadas/{id}/gp", adminGP.Create)
			r.Get("/temporadas/{id}/pilotos", adminAsignacion.GetVigentes)
			r.Post("/temporadas/{id}/pilotos", adminAsignacion.Create)

			r.Get("/gp/{id}", adminGP.GetByID)
			r.Put("/gp/{id}", adminGP.Update)
			r.Patch("/gp/{id}/estado", adminGP.UpdateEstado)
			r.Get("/gp/{id}/inscripciones", adminInscripcion.GetAll)
			r.Post("/gp/{id}/inscripciones", adminInscripcion.Create)
			r.Get("/gp/{id}/sesiones", adminSesion.GetAll)
			r.Post("/gp/{id}/sesiones", adminSesion.Create)

			r.Put("/inscripciones/{id}", adminInscripcion.Update)

			r.Patch("/sesiones/{id}/estado", adminSesion.UpdateEstado)
			r.Get("/sesiones/{id}/resultados", adminResultado.GetAll)
			r.Post("/sesiones/{id}/resultados", adminResultado.Create)

			r.Put("/resultados/{id}", adminResultado.Update)
		})
	})

	return r
}

package router

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"

	adminhandler "f1friends/backend/internal/handler/admin"
	publichandler "f1friends/backend/internal/handler/public"
	"f1friends/backend/internal/middleware"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// New construye y devuelve el router con todas las rutas registradas.
// Las dependencias se cablan aquí: store → service → handler.
func New(pool *pgxpool.Pool) *chi.Mux {
	// Capa store: acceso a base de datos.
	equipoStore := store.NewEquipoStore(pool)
	pilotoStore := store.NewPilotoStore(pool)
	temporadaStore := store.NewTemporadaStore(pool)
	granPremioStore := store.NewGranPremioStore(pool)

	// Capa service: lógica de negocio y validaciones.
	equipoSvc := service.NewEquipoService(equipoStore)
	pilotoSvc := service.NewPilotoService(pilotoStore)
	temporadaSvc := service.NewTemporadaService(temporadaStore)
	granPremioSvc := service.NewGranPremioService(granPremioStore)

	// Handlers: decodifican requests y escriben responses.
	publicEquipo := publichandler.NewEquipoHandler(equipoSvc)
	adminEquipo := adminhandler.NewEquipoHandler(equipoSvc)
	publicPiloto := publichandler.NewPilotoHandler(pilotoSvc)
	adminPiloto := adminhandler.NewPilotoHandler(pilotoSvc)
	publicTemporada := publichandler.NewTemporadaHandler(temporadaSvc)
	adminTemporada := adminhandler.NewTemporadaHandler(temporadaSvc)
	publicGP := publichandler.NewGranPremioHandler(granPremioSvc)
	adminGP := adminhandler.NewGranPremioHandler(granPremioSvc)

	r := chi.NewRouter()

	// Middlewares globales aplicados a todas las rutas.
	r.Use(chimiddleware.Logger)    // log de cada petición: método, ruta, status, duración
	r.Use(chimiddleware.Recoverer) // captura panics y devuelve 500 en lugar de romper el servidor
	r.Use(chimiddleware.RealIP)    // lee X-Forwarded-For para registrar la IP real del cliente
	r.Use(middleware.CORS)         // cabeceras CORS para el frontend Next.js

	r.Route("/api/v1", func(r chi.Router) {

		// Health — sin prefijo de grupo, accesible en /api/v1/health.
		r.Get("/health", publichandler.Health)

		// Rutas públicas — sin autenticación.
		r.Route("/public", func(r chi.Router) {
			r.Get("/equipos", publicEquipo.GetAll)
			r.Get("/pilotos", publicPiloto.GetAll)
			r.Get("/temporada-activa", publicTemporada.GetActiva)
			r.Get("/temporadas", publicTemporada.GetAll)
			r.Get("/temporadas/{id}/calendario", publicGP.GetCalendario)
			r.Get("/gp/{id}", publicGP.GetByID)
		})

		// Rutas de administración — requieren JWT.
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.Auth)

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

			r.Get("/gp/{id}", adminGP.GetByID)
			r.Put("/gp/{id}", adminGP.Update)
			r.Patch("/gp/{id}/estado", adminGP.UpdateEstado)
		})
	})

	return r
}

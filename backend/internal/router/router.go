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

	// Capa service: lógica de negocio y validaciones.
	equipoSvc := service.NewEquipoService(equipoStore)

	// Handlers: decodifican requests y escriben responses.
	publicEquipo := publichandler.NewEquipoHandler(equipoSvc)
	adminEquipo := adminhandler.NewEquipoHandler(equipoSvc)

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
		})

		// Rutas de administración — requieren JWT.
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.Auth)

			r.Get("/equipos", adminEquipo.GetAll)
			r.Post("/equipos", adminEquipo.Create)
			r.Put("/equipos/{id}", adminEquipo.Update)
		})
	})

	return r
}

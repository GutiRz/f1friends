package router

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"f1friends/backend/internal/handler/public"
	"f1friends/backend/internal/middleware"
)

// New construye y devuelve el router con todas las rutas registradas.
// Recibe las dependencias necesarias (por ahora ninguna; se añadirán con los handlers).
func New() *chi.Mux {
	r := chi.NewRouter()

	// Middlewares globales aplicados a todas las rutas.
	r.Use(chimiddleware.Logger)    // log de cada petición: método, ruta, status, duración
	r.Use(chimiddleware.Recoverer) // captura panics y devuelve 500 en lugar de romper el servidor
	r.Use(chimiddleware.RealIP)    // lee X-Forwarded-For para registrar la IP real del cliente
	r.Use(middleware.CORS)         // cabeceras CORS para el frontend Next.js

	// Todas las rutas viven bajo /api/v1.
	r.Route("/api/v1", func(r chi.Router) {

		// Rutas públicas — sin autenticación.
		r.Group(func(r chi.Router) {
			r.Get("/health", public.Health)

			// Aquí se añadirán los handlers públicos:
			// r.Get("/temporada-activa", public.GetTemporadaActiva)
			// r.Get("/temporadas/{id}/calendario", public.GetCalendario)
			// ...
		})

		// Rutas de administración — requieren JWT (middleware aplicado al grupo).
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth)

			// Aquí se añadirán los handlers de administración:
			// r.Post("/auth/login", admin.Login)
			// r.Get("/auth/me", admin.Me)
			// ...
		})
	})

	return r
}

package middleware

import (
	"net/http"
)

// Auth es un placeholder para el middleware de validación JWT.
// Se implementará cuando se desarrolle el sistema de autenticación.
// Por ahora simplemente pasa la petición al siguiente handler.
func Auth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: validar JWT de la cookie HttpOnly y añadir el usuario al contexto.
		next.ServeHTTP(w, r)
	})
}

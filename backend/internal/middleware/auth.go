package middleware

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"

	"f1friends/backend/internal/render"
)

// NewAuth devuelve el middleware de validación JWT.
// Lee el token del header Authorization: Bearer <token>.
func NewAuth(jwtSecret string) func(http.Handler) http.Handler {
	secret := []byte(jwtSecret)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				render.Error(w, http.StatusUnauthorized, "token no proporcionado")
				return
			}

			tokenStr := strings.TrimPrefix(header, "Bearer ")
			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return secret, nil
			}, jwt.WithExpirationRequired())

			if err != nil || !token.Valid {
				render.Error(w, http.StatusUnauthorized, "token no válido o expirado")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

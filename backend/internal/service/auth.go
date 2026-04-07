package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"f1friends/backend/internal/store"
)

// ErrCredenciales se devuelve cuando el email o la contraseña son incorrectos.
// Se usa el mismo error para ambos casos para no revelar cuál falló.
var ErrCredenciales = errors.New("credenciales no válidas")

// AuthService gestiona la autenticación de administradores.
type AuthService struct {
	store     *store.UsuarioStore
	jwtSecret []byte
}

func NewAuthService(s *store.UsuarioStore, jwtSecret string) *AuthService {
	return &AuthService{store: s, jwtSecret: []byte(jwtSecret)}
}

// Login valida las credenciales y devuelve un JWT firmado con 24h de validez.
// Devuelve ErrCredenciales si el email no existe o la contraseña no coincide.
func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	usuario, err := s.store.GetByEmail(ctx, email)
	if errors.Is(err, store.ErrNotFound) {
		return "", ErrCredenciales
	}
	if err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(usuario.PasswordHash), []byte(password)); err != nil {
		return "", ErrCredenciales
	}

	claims := jwt.RegisteredClaims{
		Subject:   fmt.Sprintf("%d", usuario.ID),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("auth Login sign: %w", err)
	}
	return signed, nil
}

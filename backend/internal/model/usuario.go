package model

// Usuario representa una cuenta de administrador de la liga.
type Usuario struct {
	ID           int    `json:"id"`
	Nombre       string `json:"nombre"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
}

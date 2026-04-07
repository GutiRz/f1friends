package auth

import (
	"encoding/json"
	"errors"
	"net/http"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
)

// Handler expone los endpoints de autenticación.
type Handler struct {
	svc *service.AuthService
}

func NewHandler(svc *service.AuthService) *Handler {
	return &Handler{svc: svc}
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	Token string `json:"token"`
}

// Login valida las credenciales y devuelve un JWT.
// POST /api/v1/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	if req.Email == "" || req.Password == "" {
		render.Error(w, http.StatusBadRequest, "email y contraseña son obligatorios")
		return
	}

	token, err := h.svc.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrCredenciales) {
			render.Error(w, http.StatusUnauthorized, "credenciales no válidas")
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al procesar el login")
		return
	}

	render.JSON(w, http.StatusOK, loginResponse{Token: token})
}

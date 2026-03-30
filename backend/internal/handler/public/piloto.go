package public

import (
	"net/http"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
)

// PilotoHandler expone los endpoints públicos del módulo de pilotos.
type PilotoHandler struct {
	svc *service.PilotoService
}

func NewPilotoHandler(svc *service.PilotoService) *PilotoHandler {
	return &PilotoHandler{svc: svc}
}

// GetAll devuelve los pilotos activos de la liga.
// GET /api/v1/public/pilotos
func (h *PilotoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	pilotos, err := h.svc.GetAllActivos(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener pilotos")
		return
	}
	render.JSON(w, http.StatusOK, pilotos)
}

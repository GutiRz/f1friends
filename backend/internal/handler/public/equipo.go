package public

import (
	"net/http"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
)

// EquipoHandler expone los endpoints públicos del módulo de equipos.
type EquipoHandler struct {
	svc *service.EquipoService
}

func NewEquipoHandler(svc *service.EquipoService) *EquipoHandler {
	return &EquipoHandler{svc: svc}
}

// GetAll devuelve todos los equipos.
// GET /api/v1/public/equipos
func (h *EquipoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	equipos, err := h.svc.GetAll(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener equipos")
		return
	}
	render.JSON(w, http.StatusOK, equipos)
}

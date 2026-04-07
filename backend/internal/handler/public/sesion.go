package public

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// SesionHandler expone los endpoints públicos del módulo de sesiones.
type SesionHandler struct {
	svc *service.SesionService
}

func NewSesionHandler(svc *service.SesionService) *SesionHandler {
	return &SesionHandler{svc: svc}
}

// GetSesiones devuelve las sesiones de un GP con sus resultados.
// GET /api/v1/public/gp/{id}/sesiones
func (h *SesionHandler) GetSesiones(w http.ResponseWriter, r *http.Request) {
	gpID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || gpID < 1 {
		render.Error(w, http.StatusBadRequest, "id de gran premio no válido")
		return
	}

	sesiones, err := h.svc.GetSesionesConResultados(r.Context(), gpID)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			render.Error(w, http.StatusNotFound, "gran premio no encontrado")
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al obtener sesiones")
		return
	}

	render.JSON(w, http.StatusOK, sesiones)
}

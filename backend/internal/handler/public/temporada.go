package public

import (
	"errors"
	"net/http"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// TemporadaHandler expone los endpoints públicos del módulo de temporadas.
type TemporadaHandler struct {
	svc *service.TemporadaService
}

func NewTemporadaHandler(svc *service.TemporadaService) *TemporadaHandler {
	return &TemporadaHandler{svc: svc}
}

// GetActiva devuelve la temporada activa o 404 si no hay ninguna.
// GET /api/v1/public/temporada-activa
func (h *TemporadaHandler) GetActiva(w http.ResponseWriter, r *http.Request) {
	t, err := h.svc.GetActiva(r.Context())
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			render.Error(w, http.StatusNotFound, "no hay ninguna temporada activa")
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al obtener la temporada activa")
		return
	}
	render.JSON(w, http.StatusOK, t)
}

// GetAll devuelve todas las temporadas.
// GET /api/v1/public/temporadas
func (h *TemporadaHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	temporadas, err := h.svc.GetAll(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener temporadas")
		return
	}
	render.JSON(w, http.StatusOK, temporadas)
}

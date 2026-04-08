package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// AsignacionHandler expone los endpoints de administración del módulo de asignaciones.
type AsignacionHandler struct {
	svc *service.AsignacionService
}

func NewAsignacionHandler(svc *service.AsignacionService) *AsignacionHandler {
	return &AsignacionHandler{svc: svc}
}

type asignacionRequest struct {
	PilotoID int    `json:"piloto_id"`
	EquipoID *int   `json:"equipo_id"`
	Tipo     string `json:"tipo"`
	Orden    int    `json:"orden"`
}

// GetVigentes devuelve las asignaciones vigentes de una temporada.
// GET /api/v1/admin/temporadas/{id}/pilotos
func (h *AsignacionHandler) GetVigentes(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	asignaciones, err := h.svc.GetVigentesByTemporada(r.Context(), temporadaID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener asignaciones")
		return
	}
	render.JSON(w, http.StatusOK, asignaciones)
}

// Update modifica la asignación vigente de un piloto en la temporada
// (cierra la actual y crea una nueva con los valores actualizados).
// PUT /api/v1/admin/temporadas/{id}/pilotos/{pilotoId}
func (h *AsignacionHandler) Update(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}
	pilotoID, err := strconv.Atoi(chi.URLParam(r, "pilotoId"))
	if err != nil || pilotoID < 1 {
		render.Error(w, http.StatusBadRequest, "id de piloto no válido")
		return
	}

	var req asignacionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	orden := req.Orden
	if orden < 1 {
		orden = 1
	}
	a := model.AsignacionVigente{
		EquipoID: req.EquipoID,
		Tipo:     req.Tipo,
		Orden:    orden,
	}

	updated, err := h.svc.Update(r.Context(), temporadaID, pilotoID, a)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "asignación vigente no encontrada")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "equipo no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar la asignación")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}

// Create añade un piloto a la temporada.
// POST /api/v1/admin/temporadas/{id}/pilotos
func (h *AsignacionHandler) Create(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	var req asignacionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	orden := req.Orden
	if orden < 1 {
		orden = 1
	}
	a := model.AsignacionVigente{
		PilotoID:    req.PilotoID,
		TemporadaID: temporadaID,
		EquipoID:    req.EquipoID,
		Tipo:        req.Tipo,
		Orden:       orden,
	}

	created, err := h.svc.Create(r.Context(), a)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "el piloto ya tiene una asignación vigente en esta temporada")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "piloto o equipo no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear la asignación")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

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

// EquipoHandler expone los endpoints de administración del módulo de equipos.
type EquipoHandler struct {
	svc *service.EquipoService
}

func NewEquipoHandler(svc *service.EquipoService) *EquipoHandler {
	return &EquipoHandler{svc: svc}
}

// equipoRequest es el cuerpo esperado en las peticiones de creación y actualización.
type equipoRequest struct {
	Nombre string  `json:"nombre"`
	Color  *string `json:"color"` // opcional; si viene, debe ser #RRGGBB
	Logo   *string `json:"logo"`  // opcional; URL o ruta
}

// GetAll devuelve todos los equipos.
// GET /api/v1/admin/equipos
func (h *EquipoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	equipos, err := h.svc.GetAll(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener equipos")
		return
	}
	render.JSON(w, http.StatusOK, equipos)
}

// Create crea un nuevo equipo.
// POST /api/v1/admin/equipos
func (h *EquipoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req equipoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	created, err := h.svc.Create(r.Context(), model.Equipo{
		Nombre: req.Nombre,
		Color:  req.Color,
		Logo:   req.Logo,
	})
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "ya existe un equipo con ese nombre")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear el equipo")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// Update actualiza un equipo existente.
// PUT /api/v1/admin/equipos/{id}
func (h *EquipoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req equipoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	updated, err := h.svc.Update(r.Context(), id, model.Equipo{
		Nombre: req.Nombre,
		Color:  req.Color,
		Logo:   req.Logo,
	})
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "equipo no encontrado")
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "ya existe un equipo con ese nombre")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el equipo")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}

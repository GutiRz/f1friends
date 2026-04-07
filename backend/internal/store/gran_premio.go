package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// GranPremioStore gestiona el acceso a la tabla gran_premios.
type GranPremioStore struct {
	db *pgxpool.Pool
}

func NewGranPremioStore(db *pgxpool.Pool) *GranPremioStore {
	return &GranPremioStore{db: db}
}

const granPremioCols = `id, temporada_id, nombre, circuito, pais, fecha, tiene_sprint, estado, orden`

func scanGranPremio(row interface{ Scan(...any) error }, gp *model.GranPremio) error {
	return row.Scan(
		&gp.ID, &gp.TemporadaID, &gp.Nombre, &gp.Circuito, &gp.Pais, &gp.Fecha,
		&gp.TieneSprint, &gp.Estado, &gp.Orden,
	)
}

// GetAllByTemporada devuelve los GPs de una temporada ordenados por orden ascendente.
func (s *GranPremioStore) GetAllByTemporada(ctx context.Context, temporadaID int) ([]model.GranPremio, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+granPremioCols+` FROM gran_premios WHERE temporada_id = $1 ORDER BY orden ASC`,
		temporadaID,
	)
	if err != nil {
		return nil, fmt.Errorf("gran_premios GetAllByTemporada: %w", err)
	}
	defer rows.Close()

	gps := make([]model.GranPremio, 0)
	for rows.Next() {
		var gp model.GranPremio
		if err := scanGranPremio(rows, &gp); err != nil {
			return nil, fmt.Errorf("gran_premios GetAllByTemporada scan: %w", err)
		}
		gps = append(gps, gp)
	}
	return gps, rows.Err()
}

// GetByID devuelve el GP con el id dado o ErrNotFound si no existe.
func (s *GranPremioStore) GetByID(ctx context.Context, id int) (*model.GranPremio, error) {
	var gp model.GranPremio
	err := scanGranPremio(
		s.db.QueryRow(ctx,
			`SELECT `+granPremioCols+` FROM gran_premios WHERE id = $1`, id,
		),
		&gp,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("gran_premios GetByID: %w", err)
	}
	return &gp, nil
}

// Create inserta un GP nuevo y devuelve el registro creado.
func (s *GranPremioStore) Create(ctx context.Context, gp model.GranPremio) (*model.GranPremio, error) {
	var created model.GranPremio
	err := scanGranPremio(
		s.db.QueryRow(ctx,
			`INSERT INTO gran_premios
				(temporada_id, nombre, circuito, pais, fecha, tiene_sprint, estado, orden)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING `+granPremioCols,
			gp.TemporadaID, gp.Nombre, gp.Circuito, gp.Pais, gp.Fecha,
			gp.TieneSprint, gp.Estado, gp.Orden,
		),
		&created,
	)
	if err != nil {
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("gran_premios Create: %w", err)
	}
	return &created, nil
}

// Update modifica el GP con el id dado y devuelve el registro actualizado.
// No modifica el estado ni el temporada_id.
// Devuelve ErrNotFound si el GP no existe.
func (s *GranPremioStore) Update(ctx context.Context, id int, gp model.GranPremio) (*model.GranPremio, error) {
	var updated model.GranPremio
	err := scanGranPremio(
		s.db.QueryRow(ctx,
			`UPDATE gran_premios SET
				nombre = $1, circuito = $2, pais = $3, fecha = $4,
				tiene_sprint = $5, orden = $6
			 WHERE id = $7
			 RETURNING `+granPremioCols,
			gp.Nombre, gp.Circuito, gp.Pais, gp.Fecha,
			gp.TieneSprint, gp.Orden, id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("gran_premios Update: %w", err)
	}
	return &updated, nil
}

// CreateConSesiones inserta un GP y sus sesiones base en una transacción.
// Si falla cualquier paso, no se persiste nada.
// Devuelve ErrForeignKey si el temporada_id no existe.
func (s *GranPremioStore) CreateConSesiones(ctx context.Context, gp model.GranPremio, tiposSesion []model.TipoSesion) (*model.GranPremio, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("gran_premios CreateConSesiones begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	var created model.GranPremio
	err = scanGranPremio(
		tx.QueryRow(ctx,
			`INSERT INTO gran_premios
				(temporada_id, nombre, circuito, pais, fecha, tiene_sprint, estado, orden)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING `+granPremioCols,
			gp.TemporadaID, gp.Nombre, gp.Circuito, gp.Pais, gp.Fecha,
			gp.TieneSprint, gp.Estado, gp.Orden,
		),
		&created,
	)
	if err != nil {
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("gran_premios CreateConSesiones insert gp: %w", err)
	}

	for _, tipo := range tiposSesion {
		if _, err = tx.Exec(ctx,
			`INSERT INTO sesiones (gran_premio_id, tipo, estado) VALUES ($1, $2, $3)`,
			created.ID, tipo, "pendiente",
		); err != nil {
			return nil, fmt.Errorf("gran_premios CreateConSesiones insert sesion %s: %w", tipo, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("gran_premios CreateConSesiones commit: %w", err)
	}
	return &created, nil
}

// CreateConSesionesEInscripciones inserta un GP, sus sesiones base y las inscripciones
// iniciales en una única transacción.
// inscripciones debe tener GranPremioID = 0; este método asigna el ID real del GP creado.
// Devuelve ErrForeignKey si el temporada_id no existe.
func (s *GranPremioStore) CreateConSesionesEInscripciones(
	ctx context.Context,
	gp model.GranPremio,
	tiposSesion []model.TipoSesion,
	inscripciones []model.InscripcionGP,
) (*model.GranPremio, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("gran_premios CreateConSesionesEInscripciones begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	var created model.GranPremio
	err = scanGranPremio(
		tx.QueryRow(ctx,
			`INSERT INTO gran_premios
				(temporada_id, nombre, circuito, pais, fecha, tiene_sprint, estado, orden)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			 RETURNING `+granPremioCols,
			gp.TemporadaID, gp.Nombre, gp.Circuito, gp.Pais, gp.Fecha,
			gp.TieneSprint, gp.Estado, gp.Orden,
		),
		&created,
	)
	if err != nil {
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("gran_premios CreateConSesionesEInscripciones insert gp: %w", err)
	}

	for _, tipo := range tiposSesion {
		if _, err = tx.Exec(ctx,
			`INSERT INTO sesiones (gran_premio_id, tipo, estado) VALUES ($1, $2, 'pendiente')`,
			created.ID, tipo,
		); err != nil {
			return nil, fmt.Errorf("gran_premios CreateConSesionesEInscripciones insert sesion %s: %w", tipo, err)
		}
	}

	for _, ins := range inscripciones {
		if _, err = tx.Exec(ctx,
			`INSERT INTO inscripciones_gp (gran_premio_id, piloto_id, equipo_id, estado)
			 VALUES ($1, $2, $3, $4)`,
			created.ID, ins.PilotoID, ins.EquipoID, ins.Estado,
		); err != nil {
			return nil, fmt.Errorf("gran_premios CreateConSesionesEInscripciones insert inscripcion piloto %d: %w", ins.PilotoID, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("gran_premios CreateConSesionesEInscripciones commit: %w", err)
	}
	return &created, nil
}

// UpdateSincronizandoSesiones actualiza el GP y, si tiene_sprint cambia,
// sincroniza las sesiones de sprint dentro de la misma transacción.
//
//   - false → true: inserta sprint_qualy y sprint si no existen (ON CONFLICT DO NOTHING).
//   - true  → false: rechaza con ErrConflict si alguna de esas sesiones tiene resultados;
//     si están vacías, las elimina.
//
// Devuelve ErrNotFound si el GP no existe.
// Devuelve ErrConflict si no se pueden eliminar las sesiones de sprint por tener resultados.
func (s *GranPremioStore) UpdateSincronizandoSesiones(ctx context.Context, id int, gp model.GranPremio) (*model.GranPremio, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Leer tiene_sprint actual con bloqueo de fila para evitar condiciones de carrera.
	var anteriorTieneSprint bool
	err = tx.QueryRow(ctx,
		`SELECT tiene_sprint FROM gran_premios WHERE id = $1 FOR UPDATE`,
		id,
	).Scan(&anteriorTieneSprint)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones select: %w", err)
	}

	// Actualizar el GP.
	var updated model.GranPremio
	err = scanGranPremio(
		tx.QueryRow(ctx,
			`UPDATE gran_premios SET
				nombre = $1, circuito = $2, pais = $3, fecha = $4,
				tiene_sprint = $5, orden = $6
			 WHERE id = $7
			 RETURNING `+granPremioCols,
			gp.Nombre, gp.Circuito, gp.Pais, gp.Fecha,
			gp.TieneSprint, gp.Orden, id,
		),
		&updated,
	)
	if err != nil {
		return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones update: %w", err)
	}

	// Sincronizar sesiones solo si tiene_sprint cambió.
	if anteriorTieneSprint != gp.TieneSprint {
		if anteriorTieneSprint && !gp.TieneSprint {
			// Quitando sprint: verificar que no haya resultados antes de borrar.
			var count int
			err = tx.QueryRow(ctx,
				`SELECT COUNT(*) FROM resultados_sesion rs
				 JOIN sesiones s ON rs.sesion_id = s.id
				 WHERE s.gran_premio_id = $1 AND s.tipo IN ('sprint_qualy', 'sprint')`,
				id,
			).Scan(&count)
			if err != nil {
				return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones count resultados: %w", err)
			}
			if count > 0 {
				return nil, ErrConflict
			}
			if _, err = tx.Exec(ctx,
				`DELETE FROM sesiones WHERE gran_premio_id = $1 AND tipo IN ('sprint_qualy', 'sprint')`,
				id,
			); err != nil {
				return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones delete sesiones: %w", err)
			}
		} else {
			// Añadiendo sprint: crear sesiones faltantes sin duplicar.
			for _, tipo := range []model.TipoSesion{model.TipoSprintQualy, model.TipoSprint} {
				if _, err = tx.Exec(ctx,
					`INSERT INTO sesiones (gran_premio_id, tipo, estado)
					 VALUES ($1, $2, 'pendiente')
					 ON CONFLICT (gran_premio_id, tipo) DO NOTHING`,
					id, tipo,
				); err != nil {
					return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones insert sesion %s: %w", tipo, err)
				}
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("gran_premios UpdateSincronizandoSesiones commit: %w", err)
	}
	return &updated, nil
}

// UpdateEstado cambia el estado de un GP y devuelve el registro actualizado.
// Devuelve ErrNotFound si el GP no existe.
func (s *GranPremioStore) UpdateEstado(ctx context.Context, id int, estado model.EstadoGP) (*model.GranPremio, error) {
	var updated model.GranPremio
	err := scanGranPremio(
		s.db.QueryRow(ctx,
			`UPDATE gran_premios SET estado = $1 WHERE id = $2 RETURNING `+granPremioCols,
			estado, id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("gran_premios UpdateEstado: %w", err)
	}
	return &updated, nil
}

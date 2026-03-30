package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config contiene toda la configuración de la aplicación leída de variables de entorno.
type Config struct {
	Port    int
	DB      DBConfig
	JWTSecret string
}

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

// DSN devuelve la cadena de conexión a PostgreSQL en formato URL.
func (d DBConfig) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		d.User, d.Password, d.Host, d.Port, d.Name, d.SSLMode)
}

// Load lee la configuración desde variables de entorno.
// Si una variable obligatoria no está definida, devuelve error.
func Load() (*Config, error) {
	port, err := envInt("PORT", 8080)
	if err != nil {
		return nil, fmt.Errorf("PORT: %w", err)
	}

	dbPort, err := envInt("DB_PORT", 5432)
	if err != nil {
		return nil, fmt.Errorf("DB_PORT: %w", err)
	}

	jwtSecret, err := envRequired("JWT_SECRET")
	if err != nil {
		return nil, err
	}

	return &Config{
		Port:      port,
		JWTSecret: jwtSecret,
		DB: DBConfig{
			Host:     envDefault("DB_HOST", "localhost"),
			Port:     dbPort,
			User:     envDefault("DB_USER", "postgres"),
			Password: envDefault("DB_PASSWORD", ""),
			Name:     envDefault("DB_NAME", "f1friends"),
			SSLMode:  envDefault("DB_SSLMODE", "disable"),
		},
	}, nil
}

// envRequired devuelve el valor de la variable o error si no está definida.
func envRequired(key string) (string, error) {
	v := os.Getenv(key)
	if v == "" {
		return "", fmt.Errorf("variable de entorno requerida no definida: %s", key)
	}
	return v, nil
}

// envDefault devuelve el valor de la variable o el valor por defecto si no está definida.
func envDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// envInt devuelve el valor de la variable como entero o el valor por defecto.
func envInt(key string, def int) (int, error) {
	v := os.Getenv(key)
	if v == "" {
		return def, nil
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return 0, fmt.Errorf("valor no válido para %s: %q", key, v)
	}
	return n, nil
}

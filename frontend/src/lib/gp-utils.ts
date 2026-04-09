const CIRCUITO_SLUG: Record<string, string> = {
  "Albert Park Circuit":                "albert-park",
  "Shanghai International Circuit":     "shanghai",
  "Suzuka International Racing Course": "suzuka",
  "Bahrain International Circuit":      "bahrain",
  "Jeddah Corniche Circuit":            "jeddah",
  "Miami International Autodrome":      "miami",
  "Circuit de Spa-Francorchamps":       "spa",
  "Circuit Gilles Villeneuve":          "gilles-villeneuve",
  "Hungaroring":                        "hungaroring",
  "Circuit de Monaco":                  "monaco",
  "Circuit Zandvoort":                  "zandvoort",
  "Silverstone Circuit":                "silverstone",
  "Circuit de Barcelona-Catalunya":     "barcelona",
  "Red Bull Ring":                      "red-bull-ring",
  "Autodromo Nazionale Monza":          "monza",
  "Marina Bay Street Circuit":          "marina-bay",
  "Circuit of the Americas":            "cota",
  "Las Vegas Street Circuit":           "las-vegas",
  "Autodromo Hermanos Rodriguez":       "hermanos-rodriguez",
  "Lusail International Circuit":       "lusail",
  "Yas Marina Circuit":                 "yas-marina",
  "Autodromo Jose Carlos Pace":         "interlagos",
  "Autodromo Enzo e Dino Ferrari":      "imola",
  "Baku City Circuit":                  "baku",
};

export function circuitoSlug(circuito?: string): string | null {
  if (!circuito) return null;
  return CIRCUITO_SLUG[circuito] ?? null;
}

/** Código ISO 3166-1 alpha-2 para flagcdn.com a partir del nombre de país en español */
export const PAIS_ISO: Record<string, string> = {
  "Arabia Saudí":    "sa",
  "Australia":       "au",
  "Austria":         "at",
  "Azerbaiyán":      "az",
  "Báhrein":         "bh",
  "Bélgica":         "be",
  "Brasil":          "br",
  "Canadá":          "ca",
  "China":           "cn",
  "Emiratos Árabes": "ae",
  "España":          "es",
  "Estados Unidos":  "us",
  "Hungría":         "hu",
  "Italia":          "it",
  "Japón":           "jp",
  "México":          "mx",
  "Mónaco":          "mc",
  "Países Bajos":    "nl",
  "Qatar":           "qa",
  "Reino Unido":     "gb",
  "Singapur":        "sg",
};

/** URL de la bandera para un país (40px de ancho) */
export function banderaUrl(pais?: string): string | null {
  if (!pais) return null;
  const iso = PAIS_ISO[pais];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}

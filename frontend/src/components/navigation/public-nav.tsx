import Link from "next/link";

type Props = {
  temporadaId: number;
};

export default function PublicNav({ temporadaId }: Props) {
  return (
    <nav style={{ padding: "0.75rem 2rem", borderBottom: "1px solid #e5e5e5", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <Link href="/">Inicio</Link>
      <Link href={`/grandes-premios?temporada=${temporadaId}`}>Grandes Premios</Link>
      <Link href={`/pilotos?temporada=${temporadaId}`}>Parrilla</Link>
      <Link href={`/clasificacion/pilotos?temporada=${temporadaId}`}>Clasificación Pilotos</Link>
      <Link href={`/clasificacion/constructores?temporada=${temporadaId}`}>Clasificación Constructores</Link>
    </nav>
  );
}

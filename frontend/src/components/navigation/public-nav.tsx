import Link from "next/link";

type Props = {
  temporadaId: number;
};

export default function PublicNav({ temporadaId }: Props) {
  return (
    <nav style={{ padding: "0.75rem 2rem", borderBottom: "1px solid #2e2e3a", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      <Link href="/">Inicio</Link>
      <Link href={`/grandes-premios?temporada=${temporadaId}`}>Grandes Premios</Link>
      <Link href={`/pilotos?temporada=${temporadaId}`}>Parrilla</Link>
      <Link href={`/clasificacion?temporada=${temporadaId}`}>Clasificación</Link>
    </nav>
  );
}

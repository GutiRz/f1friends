import Link from "next/link";
import Image from "next/image";

type Props = {
  temporadaId: number;
};

export default function PublicNav({ temporadaId }: Props) {
  return (
    <nav style={{
      padding: "0 2rem",
      borderBottom: "1px solid #2e2e3a",
      display: "flex",
      alignItems: "center",
      gap: "2rem",
      height: 80,
    }}>
      <Link href="/" style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
        <Image
          src="/images/logo.png"
          alt="F1 Friends"
          width={0}
          height={0}
          sizes="200px"
          style={{ height: 90, width: "auto" }}
          priority
        />
      </Link>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href={`/grandes-premios?temporada=${temporadaId}`}>Calendario</Link>
        <Link href={`/pilotos?temporada=${temporadaId}`}>Parrilla</Link>
        <Link href={`/clasificacion?temporada=${temporadaId}`}>Clasificación</Link>
      </div>
    </nav>
  );
}

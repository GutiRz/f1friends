import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>F1 Friends</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        Liga privada de Fórmula 1
      </p>
      <nav style={{ marginTop: "1.5rem" }}>
        <ul style={{ listStyle: "none", display: "flex", gap: "1rem" }}>
          <li>
            <Link href="/clasificacion/pilotos">Clasificación de pilotos</Link>
          </li>
          <li>
            <Link href="/clasificacion/constructores">Clasificación de constructores</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}

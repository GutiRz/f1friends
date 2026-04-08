import PublicNav from "@/components/navigation/public-nav";
import { getTemporadaActivaId } from "@/lib/api/f1friends-api";

export default async function Home() {
  const activaId = await getTemporadaActivaId();
  return (
    <>
      <PublicNav temporadaId={activaId} />
      <main style={{ padding: "2rem" }}>
        <h1>F1 Friends</h1>
        <p style={{ marginTop: "0.5rem", color: "#9ca3af" }}>
          Liga privada de Fórmula 1
        </p>
      </main>
    </>
  );
}

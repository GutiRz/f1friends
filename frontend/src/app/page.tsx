import PublicNav from "@/components/navigation/public-nav";

export default function Home() {
  return (
    <>
      <PublicNav temporadaId={1} />
      <main style={{ padding: "2rem" }}>
        <h1>F1 Friends</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          Liga privada de Fórmula 1
        </p>
      </main>
    </>
  );
}

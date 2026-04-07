import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminPilotos } from "@/lib/admin-api";

export default async function AdminPilotosPage() {
  let pilotos;
  try {
    pilotos = await getAdminPilotos();
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    throw err;
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin">← Panel de administración</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Pilotos</h1>
        <Link href="/admin/pilotos/nuevo">+ Nuevo piloto</Link>
      </div>
      {pilotos.length === 0 ? (
        <p>No hay pilotos registrados.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Nombre público</th>
              <th style={th}>Nombre real</th>
              <th style={th}>Nº</th>
              <th style={th}>Nacionalidad</th>
              <th style={th}>Activo</th>
            </tr>
          </thead>
          <tbody>
            {pilotos.map((p) => (
              <tr key={p.id}>
                <td style={td}>{p.id}</td>
                <td style={td}>{p.nombre_publico}</td>
                <td style={td}>{p.nombre_real ?? "—"}</td>
                <td style={td}>{p.numero ?? "—"}</td>
                <td style={td}>{p.nacionalidad ?? "—"}</td>
                <td style={td}>{p.activo ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #ccc",
};

const td: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};

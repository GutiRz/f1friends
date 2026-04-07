import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminTemporadas } from "@/lib/admin-api";

export default async function AdminTemporadasPage() {
  let temporadas;
  try {
    temporadas = await getAdminTemporadas();
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    throw err;
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin">← Panel de administración</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Temporadas</h1>
        <Link href="/admin/temporadas/nueva">+ Nueva temporada</Link>
      </div>
      {temporadas.length === 0 ? (
        <p>No hay temporadas registradas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Nombre</th>
              <th style={th}>Año</th>
              <th style={th}>Activa</th>
              <th style={th}>Descripción</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {temporadas.map((t) => (
              <tr key={t.id}>
                <td style={td}>{t.id}</td>
                <td style={td}>{t.nombre}</td>
                <td style={td}>{t.anio}</td>
                <td style={td}>{t.activa ? "Sí" : "No"}</td>
                <td style={td}>{t.descripcion ?? "—"}</td>
                <td style={td}>
                  <Link href={`/admin/temporadas/${t.id}`}>Editar</Link>
                </td>
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

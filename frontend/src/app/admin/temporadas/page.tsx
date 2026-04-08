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
      <style>{`
        .admin-table tbody tr:hover td { background: #f5f5f5; }
        .admin-table tbody tr { cursor: pointer; }
        .row-link { display: block; padding: 8px 12px; color: inherit; text-decoration: none; }
      `}</style>
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
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Nombre</th>
              <th style={th}>Año</th>
              <th style={th}>Activa</th>
              <th style={th}>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {temporadas.map((t) => {
              const href = `/admin/temporadas/${t.id}`;
              return (
                <tr key={t.id}>
                  <td style={td0}><Link href={href} className="row-link">{t.id}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{t.nombre}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{t.anio}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{t.activa ? "Sí" : "No"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{t.descripcion ?? "—"}</Link></td>
                </tr>
              );
            })}
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

const td0: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: 0,
};

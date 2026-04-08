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
      <style>{`
        .admin-table tbody tr:hover td { background: #f5f5f5; }
        .admin-table tbody tr { cursor: pointer; }
        .row-link { display: block; padding: 8px 12px; color: inherit; text-decoration: none; }
      `}</style>
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
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Nombre público</th>
              <th style={th}>Nombre real</th>
              <th style={th}>Nº</th>
              <th style={th}>Nacionalidad</th>
              <th style={th}>Activo</th>
            </tr>
          </thead>
          <tbody>
            {pilotos.map((p) => {
              const href = `/admin/pilotos/${p.id}`;
              return (
                <tr key={p.id}>
                  <td style={td0}><Link href={href} className="row-link">{p.nombre_publico}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{p.nombre_real ?? "—"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{p.numero ?? "—"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{p.nacionalidad ?? "—"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{p.activo ? "Sí" : "No"}</Link></td>
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

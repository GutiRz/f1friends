import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminEquipos } from "@/lib/admin-api";

export default async function AdminEquiposPage() {
  let equipos;
  try {
    equipos = await getAdminEquipos();
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    throw err;
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <style>{`
        .admin-table tbody tr:hover td { background: #f5f5f5; }
        .admin-table tbody tr { cursor: pointer; }
        .row-link { display: block; padding: 8px 12px; color: inherit; text-decoration: none; }
      `}</style>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin">← Panel de administración</Link>
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Equipos</h1>
        <Link href="/admin/equipos/nuevo">+ Nuevo equipo</Link>
      </div>
      {equipos.length === 0 ? (
        <p>No hay equipos registrados.</p>
      ) : (
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Nombre</th>
              <th style={th}>Color</th>
              <th style={th}>Logo</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((e) => {
              const href = `/admin/equipos/${e.id}`;
              return (
                <tr key={e.id}>
                  <td style={td0}><Link href={href} className="row-link">{e.id}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{e.nombre}</Link></td>
                  <td style={td0}>
                    <Link href={href} className="row-link">
                      {e.color ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span style={{ display: "inline-block", width: 14, height: 14, background: e.color, border: "1px solid #ccc", borderRadius: 2 }} />
                          {e.color}
                        </span>
                      ) : "—"}
                    </Link>
                  </td>
                  <td style={td0}>
                    <Link href={href} className="row-link">
                      {e.logo ? (
                        <img src={e.logo} alt={e.nombre} height={28} style={{ objectFit: "contain", display: "block" }} />
                      ) : "—"}
                    </Link>
                  </td>
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

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminEquipos } from "@/lib/admin-api";
import PageHeader from "@/components/admin/page-header";
import { AdminCard, adminTh, adminTd, adminTableStyles } from "@/components/admin/admin-table";

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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <style>{adminTableStyles}</style>
      <PageHeader title="Equipos" newHref="/admin/equipos/nuevo" newLabel="Nuevo equipo" />
      {equipos.length === 0 ? (
        <p style={{ color: "#64748b" }}>No hay equipos registrados.</p>
      ) : (
        <AdminCard>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={adminTh}>Nombre</th>
                <th style={adminTh}>Color</th>
                <th style={adminTh}>Logo</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((e) => {
                const href = `/admin/equipos/${e.id}`;
                return (
                  <tr key={e.id}>
                    <td style={adminTd}><Link href={href} className="row-link" style={{ fontWeight: 500 }}>{e.nombre}</Link></td>
                    <td style={adminTd}>
                      <Link href={href} className="row-link">
                        {e.color ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <span style={{ display: "inline-block", width: 16, height: 16, background: e.color, borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)" }} />
                            <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>{e.color}</span>
                          </span>
                        ) : "—"}
                      </Link>
                    </td>
                    <td style={{ ...adminTd, width: 56 }}>
                      <Link href={href} className="row-link">
                        {e.logo ? (
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 32, height: 32, borderRadius: "50%",
                            background: e.color ?? "#ccc",
                            flexShrink: 0,
                          }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={e.logo} alt={e.nombre} height={18} style={{ objectFit: "contain" }} />
                          </span>
                        ) : "—"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      )}
    </div>
  );
}

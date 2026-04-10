import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminPilotos } from "@/lib/admin-api";
import PageHeader from "@/components/admin/page-header";
import { AdminCard, adminTh, adminTd, adminTableStyles } from "@/components/admin/admin-table";

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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <style>{adminTableStyles}</style>
      <PageHeader title="Pilotos" newHref="/admin/pilotos/nuevo" newLabel="Nuevo piloto" />
      {pilotos.length === 0 ? (
        <p style={{ color: "#64748b" }}>No hay pilotos registrados.</p>
      ) : (
        <AdminCard>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={adminTh}>Nombre</th>
                <th style={adminTh}>Activo</th>
              </tr>
            </thead>
            <tbody>
              {pilotos.map((p) => {
                const href = `/admin/pilotos/${p.id}`;
                return (
                  <tr key={p.id}>
                    <td style={adminTd}><Link href={href} className="row-link" style={{ fontWeight: 500 }}>{p.nombre_publico}</Link></td>
                    <td style={{ ...adminTd, width: 90 }}>
                      <Link href={href} className="row-link">
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          background: p.activo ? "#dcfce7" : "#f1f5f9",
                          color: p.activo ? "#16a34a" : "#64748b",
                        }}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
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

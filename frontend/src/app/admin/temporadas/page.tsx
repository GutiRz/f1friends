import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminTemporadas } from "@/lib/admin-api";
import PageHeader from "@/components/admin/page-header";
import { AdminCard, adminTh, adminTd, adminTableStyles } from "@/components/admin/admin-table";

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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <style>{adminTableStyles}</style>
      <PageHeader title="Temporadas" newHref="/admin/temporadas/nueva" newLabel="Nueva temporada" />
      {temporadas.length === 0 ? (
        <p style={{ color: "#64748b" }}>No hay temporadas registradas.</p>
      ) : (
        <AdminCard>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={adminTh}>Nombre</th>
                <th style={adminTh}>Año</th>
                <th style={adminTh}>Activa</th>
                <th style={adminTh}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {temporadas.map((t) => {
                const href = `/admin/temporadas/${t.id}`;
                return (
                  <tr key={t.id}>
                    <td style={adminTd}><Link href={href} className="row-link" style={{ fontWeight: 500 }}>{t.nombre}</Link></td>
                    <td style={adminTd}><Link href={href} className="row-link">{t.anio}</Link></td>
                    <td style={adminTd}>
                      <Link href={href} className="row-link">
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          background: t.activa ? "#dcfce7" : "#f1f5f9",
                          color: t.activa ? "#16a34a" : "#64748b",
                        }}>
                          {t.activa ? "Activa" : "Inactiva"}
                        </span>
                      </Link>
                    </td>
                    <td style={adminTd}><Link href={href} className="row-link">{t.descripcion ?? "—"}</Link></td>
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

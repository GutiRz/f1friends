import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  newHref?: string;
  newLabel?: string;
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({ title, newHref, newLabel, backHref, backLabel }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 28 }}>
      {backHref && (
        <nav style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <Link href={backHref} style={{ fontSize: "0.8rem", color: "#64748b", textDecoration: "none", fontWeight: 500 }}>
            {backLabel ?? "Volver"}
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ fontSize: "0.8rem", color: "#0f172a", fontWeight: 500 }}>{title}</span>
        </nav>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {title}
        </h1>
        {newHref && (
          <Link
            href={newHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              background: "#0f172a",
              color: "#f8fafc",
              borderRadius: 6,
              fontSize: "0.875rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {newLabel ?? "Nuevo"}
          </Link>
        )}
      </div>
    </div>
  );
}

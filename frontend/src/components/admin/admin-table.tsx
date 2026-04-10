import type { ReactNode, CSSProperties } from "react";

export function AdminCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export const adminTh: CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
};

export const adminTd: CSSProperties = {
  borderBottom: "1px solid #f1f5f9",
  padding: 0,
};

export const adminTableStyles = `
  .admin-table tbody tr:last-child td { border-bottom: none; }
  .admin-table tbody tr:hover td { background: #f8fafc; }
  .admin-table tbody tr { cursor: pointer; transition: background 0.1s; }
  .row-link { display: block; padding: 12px 16px; color: #0f172a; text-decoration: none; font-size: 0.875rem; }
`;

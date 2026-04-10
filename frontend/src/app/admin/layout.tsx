import type { ReactNode } from "react";
import "./admin.css";
import AdminSidebar from "@/components/admin/sidebar";

export const metadata = {
  title: "Admin — F1 Friends",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root" style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

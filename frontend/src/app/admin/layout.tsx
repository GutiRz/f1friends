import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./admin.css";
import AdminSidebar from "@/components/admin/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin — F1 Friends",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`admin-root ${inter.className}`} style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "32px 40px", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}

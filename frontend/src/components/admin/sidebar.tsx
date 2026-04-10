"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Building2,
  Flag,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/temporadas", label: "Temporadas", icon: Trophy },
  { href: "/admin/pilotos", label: "Pilotos", icon: Users },
  { href: "/admin/equipos", label: "Equipos", icon: Building2 },
  { href: "/admin/grandes-premios?temporada=1", label: "Grandes Premios", icon: Flag, matchHref: "/admin/grandes-premios" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: "#0f172a",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      gap: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1e293b" }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f8fafc", letterSpacing: "-0.02em" }}>
          F1 Friends
        </div>
        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
          Panel de administración
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon, exact, matchHref }) => {
          const isActive = exact
            ? pathname === "/admin"
            : pathname.startsWith(matchHref ?? href.split("?")[0]);
          return (
            <Link
              key={label}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#f8fafc" : "#94a3b8",
                background: isActive ? "#1e293b" : "transparent",
                textDecoration: "none",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "0 12px", borderTop: "1px solid #1e293b", paddingTop: 16 }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: "0.875rem",
            color: "#94a3b8",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

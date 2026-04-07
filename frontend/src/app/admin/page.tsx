"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <h1>Panel de administración</h1>
      <ul style={{ marginBottom: 24 }}>
        <li>
          <Link href="/admin/grandes-premios?temporada=1">
            Grandes Premios
          </Link>
        </li>
      </ul>
      <button onClick={handleLogout} style={{ padding: "8px 16px" }}>
        Cerrar sesión
      </button>
    </main>
  );
}

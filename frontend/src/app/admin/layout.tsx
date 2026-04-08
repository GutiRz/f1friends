import type { ReactNode } from "react";

export const metadata = {
  title: "Admin — F1 Friends",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root">{children}</div>;
}

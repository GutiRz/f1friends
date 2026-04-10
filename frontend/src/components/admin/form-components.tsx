"use client";

import type { ReactNode, CSSProperties } from "react";

export const adminInputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  boxSizing: "border-box",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  fontSize: "0.875rem",
  color: "#0f172a",
  background: "#fff",
  outline: "none",
};

export const adminTextareaStyle: CSSProperties = {
  ...adminInputStyle,
  resize: "vertical",
};

export function FormCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      padding: "24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function FormSection({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>
          {title}
        </h2>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function SaveButton({ isPending, label = "Guardar" }: { isPending: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        padding: "8px 20px",
        background: isPending ? "#94a3b8" : "#0f172a",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: isPending ? "not-allowed" : "pointer",
      }}
    >
      {isPending ? "Guardando..." : label}
    </button>
  );
}

export function ActionButton({
  onClick,
  isPending,
  label,
  pendingLabel,
  variant = "default",
}: {
  onClick: () => void;
  isPending: boolean;
  label: string;
  pendingLabel?: string;
  variant?: "default" | "success";
}) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      style={{
        padding: "8px 20px",
        background: isPending ? "#94a3b8" : variant === "success" ? "#16a34a" : "#0f172a",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: "0.875rem",
        fontWeight: 500,
        cursor: isPending ? "not-allowed" : "pointer",
      }}
    >
      {isPending ? (pendingLabel ?? label) : label}
    </button>
  );
}

export function FormFeedback({ result }: { result: { ok: boolean; error?: string } | null }) {
  if (!result) return null;
  return (
    <p style={{
      margin: "0 0 12px",
      fontSize: "0.875rem",
      color: result.ok ? "#16a34a" : "#dc2626",
    }}>
      {result.ok ? "Guardado correctamente." : result.error}
    </p>
  );
}

export function FormDivider() {
  return <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "8px 0" }} />;
}

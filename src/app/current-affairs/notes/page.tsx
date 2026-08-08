"use client";

import Link from "next/link";

export default function NotesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f6fb",
        padding: "20px",
      }}
    >
      <Link
        href="/current-affairs"
        style={{
          color: "#2563eb",
          fontWeight: "bold",
          textDecoration: "none",
        }}
      >
        ← Back
      </Link>

      <h1 style={{ marginTop: "20px", color: "#111" }}>
        Current Affairs Notes
      </h1>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "14px",
          marginTop: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ color: "#555" }}>
          Yahan Current Affairs Notes show honge.
        </p>
      </div>
    </main>
  );
}
import Link from "next/link";
import type { CSSProperties } from "react";

export default function AboutPage() {
  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>← Back to Home</Link>

      <section style={cardStyle}>
        <p style={brandStyle}>Successful Academy Official</p>

        <h1 style={titleStyle}>About Us</h1>

        <p style={paragraphStyle}>
          Successful Academy Official is an educational platform created to help
          students prepare for competitive exams with useful study materials,
          current affairs, mock tests, previous year papers, job updates and
          class resources.
        </p>

        <p style={paragraphStyle}>
          Our main aim is to provide simple, exam-focused and helpful content for
          students preparing for exams like WBP, KP, Railway, Banking, SSC and
          other competitive exams.
        </p>

        <p style={paragraphStyle}>
          We try to make learning easy by organizing notes, PDFs, videos, mock
          tests and updates in one place.
        </p>

        <p style={paragraphStyle}>
          This website is created for educational purposes only.
        </p>
      </section>
    </main>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#ffffff 0%,#eff6ff 50%,#f5f3ff 100%)",
  padding: "20px",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "18px",
  color: "#2563eb",
  fontWeight: "bold",
  textDecoration: "none",
};

const cardStyle: CSSProperties = {
  padding: "24px",
  borderRadius: "24px",
  background: "white",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
};

const brandStyle: CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontWeight: "bold",
};

const titleStyle: CSSProperties = {
  color: "#111827",
  fontSize: "32px",
  marginTop: "10px",
};

const paragraphStyle: CSSProperties = {
  color: "#374151",
  lineHeight: 1.7,
  fontSize: "16px",
};
import Link from "next/link";
import type { CSSProperties } from "react";

export default function ContactPage() {
  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>← Back to Home</Link>

      <section style={cardStyle}>
        <p style={brandStyle}>Successful Academy Official</p>

        <h1 style={titleStyle}>Contact Us</h1>

        <p style={paragraphStyle}>
          If you have any questions, suggestions, feedback or need help related
          to our study materials, mock tests, current affairs or other website
          content, you can contact us.
        </p>

        <div style={infoBoxStyle}>
          <h2 style={sectionTitleStyle}>Email</h2>
          <p style={paragraphStyle}>successfulacademyofficial@gmail.com</p>
        </div>

        <div style={infoBoxStyle}>
          <h2 style={sectionTitleStyle}>Website Name</h2>
          <p style={paragraphStyle}>Successful Academy Official</p>
        </div>

        <div style={infoBoxStyle}>
          <h2 style={sectionTitleStyle}>Purpose</h2>
          <p style={paragraphStyle}>
            Educational support for competitive exam students.
          </p>
        </div>

        <p style={paragraphStyle}>
          We try to respond to important messages as soon as possible.
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

const sectionTitleStyle: CSSProperties = {
  color: "#1e3a8a",
  marginBottom: "6px",
};

const paragraphStyle: CSSProperties = {
  color: "#374151",
  lineHeight: 1.7,
  fontSize: "16px",
};

const infoBoxStyle: CSSProperties = {
  marginTop: "16px",
  padding: "16px",
  borderRadius: "16px",
  background: "#eff6ff",
  border: "1px solid #dbeafe",
};
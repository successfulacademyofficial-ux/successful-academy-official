import Link from "next/link";
import type { CSSProperties } from "react";

export default function TermsPage() {
  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>← Back to Home</Link>

      <section style={cardStyle}>
        <p style={brandStyle}>Successful Academy Official</p>

        <h1 style={titleStyle}>Terms and Conditions</h1>

        <p style={paragraphStyle}>
          By using Successful Academy Official, you agree to follow these Terms
          and Conditions.
        </p>

        <h2 style={sectionTitleStyle}>Educational Purpose</h2>
        <p style={paragraphStyle}>
          This website is created for educational purposes only. We provide
          study materials, current affairs, mock tests, previous year papers and
          exam-related updates to help students.
        </p>

        <h2 style={sectionTitleStyle}>Content Accuracy</h2>
        <p style={paragraphStyle}>
          We try to provide accurate and useful information, but we do not
          guarantee that every content will always be completely error-free or
          updated.
        </p>

        <h2 style={sectionTitleStyle}>User Responsibility</h2>
        <p style={paragraphStyle}>
          Students should verify important exam notifications, job updates and
          official information from official government or exam authority
          websites.
        </p>

        <h2 style={sectionTitleStyle}>Account Use</h2>
        <p style={paragraphStyle}>
          Users should not misuse the website, upload harmful content, try to
          damage the website or share false information.
        </p>

        <h2 style={sectionTitleStyle}>Copyright</h2>
        <p style={paragraphStyle}>
          Website design, notes, content and materials created by Successful
          Academy Official should not be copied or reused without permission.
        </p>

        <h2 style={sectionTitleStyle}>Changes to Terms</h2>
        <p style={paragraphStyle}>
          We may update these Terms and Conditions from time to time.
        </p>

        <h2 style={sectionTitleStyle}>Contact</h2>
        <p style={paragraphStyle}>
          For any questions, contact us at:
          successfulacademyofficial@gmail.com
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
  marginTop: "24px",
};

const paragraphStyle: CSSProperties = {
  color: "#374151",
  lineHeight: 1.7,
  fontSize: "16px",
};
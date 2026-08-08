import Link from "next/link";
import type { CSSProperties } from "react";

export default function PrivacyPolicyPage() {
  return (
    <main style={mainStyle}>
      <Link href="/" style={backLinkStyle}>← Back to Home</Link>

      <section style={cardStyle}>
        <p style={brandStyle}>Successful Academy Official</p>

        <h1 style={titleStyle}>Privacy Policy</h1>

        <p style={paragraphStyle}>
          This Privacy Policy explains how Successful Academy Official handles
          user information when visitors use our website.
        </p>

        <h2 style={sectionTitleStyle}>Information We May Collect</h2>
        <p style={paragraphStyle}>
          We may collect basic information such as name, email address, mobile
          number and login details when users register or use our services.
        </p>

        <h2 style={sectionTitleStyle}>How We Use Information</h2>
        <p style={paragraphStyle}>
          We use information to provide login access, study materials, mock
          tests, notifications, updates and better educational services.
        </p>

        <h2 style={sectionTitleStyle}>Cookies and Ads</h2>
        <p style={paragraphStyle}>
          In the future, this website may use cookies or third-party advertising
          services such as Google AdSense to show ads and improve user
          experience.
        </p>

        <h2 style={sectionTitleStyle}>Data Protection</h2>
        <p style={paragraphStyle}>
          We try to keep user information safe and do not sell personal
          information to anyone.
        </p>

        <h2 style={sectionTitleStyle}>External Links</h2>
        <p style={paragraphStyle}>
          Our website may contain links to external websites or videos. We are
          not responsible for the privacy practices of those external websites.
        </p>

        <h2 style={sectionTitleStyle}>Contact</h2>
        <p style={paragraphStyle}>
          For privacy-related questions, contact us at:
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
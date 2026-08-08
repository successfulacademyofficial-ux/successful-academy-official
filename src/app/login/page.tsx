"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await userCredential.user.reload();

      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        await signOut(auth);

        alert(
          "Please verify your email first. A verification link has been sent to your email. Check inbox or spam folder."
        );

        return;
      }

      alert("Login Successful!");
      router.push("/");
    } catch (error: any) {
      alert(error.message || "Login failed.");
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      alert("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      alert("Password reset link sent. Check your email inbox or spam folder.");
    } catch (error: any) {
      alert(error.message || "Password reset failed.");
    }
  };

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={brandTitleStyle}>Successful Academy</h1>

        <h2 style={pageTitleStyle}>Student Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <div style={passwordWrapStyle}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={passwordInputStyle}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={eyeButtonStyle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon show={showPassword} />
          </button>
        </div>

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        <button onClick={handleForgotPassword} style={forgotButtonStyle}>
          Forgot Password?
        </button>

        <p style={registerTextStyle}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "#2563eb" }}>
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  if (show) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.8-2.27 2.25-4.2 4.06-5.5" />
        <path d="M9.9 4.24A10.7 10.7 0 0 1 12 4c5 0 9.27 3.11 11 8a11.8 11.8 0 0 1-2.16 3.49" />
        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
        <path d="M1 1l22 22" />
      </svg>
    );
  }

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
  padding: "20px",
};

const cardStyle: CSSProperties = {
  width: "380px",
  maxWidth: "100%",
  background: "#fff",
  padding: "35px",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};

const brandTitleStyle: CSSProperties = {
  textAlign: "center",
  color: "#1e3a8a",
  marginBottom: "25px",
};

const pageTitleStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#111",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const passwordWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  marginBottom: "20px",
};

const passwordInputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  paddingRight: "52px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

const eyeButtonStyle: CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "34px",
  height: "34px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: "50%",
  background: "transparent",
  color: "#64748b",
  cursor: "pointer",
  padding: 0,
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
};

const forgotButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  background: "#e0e7ff",
  color: "#1e3a8a",
  border: "none",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const registerTextStyle: CSSProperties = {
  textAlign: "center",
  marginTop: "20px",
  color: "#444",
};
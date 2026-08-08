"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const getCleanValues = () => {
    return {
      cleanName: fullName.trim(),
      cleanEmail: email.trim().toLowerCase(),
      cleanMobile: mobile.trim(),
    };
  };

  const validateForm = () => {
    const { cleanName, cleanEmail, cleanMobile } = getCleanValues();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const indianMobileRegex = /^[6-9]\d{9}$/;

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanMobile ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill all fields.");
      return false;
    }

    if (cleanName.length < 2) {
      alert("Please enter a valid full name.");
      return false;
    }

    if (!emailRegex.test(cleanEmail)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (!indianMobileRegex.test(cleanMobile)) {
      alert(
        "Please enter a valid 10-digit Indian mobile number. Number must start with 6, 7, 8, or 9."
      );
      return false;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const { cleanName, cleanEmail, cleanMobile } = getCleanValues();

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: cleanName,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,

        name: cleanName,
        fullName: cleanName,
        studentName: cleanName,
        displayName: cleanName,

        email: cleanEmail,
        emailLower: cleanEmail,
        emailVerified: user.emailVerified,

        phone: cleanMobile,
        mobile: cleanMobile,
        mobileNumber: cleanMobile,
        phoneNumber: cleanMobile,
        contactNumber: cleanMobile,
        phoneVerified: false,

        role: cleanEmail === ADMIN_EMAIL ? "admin" : "student",
        targetExam: "WBP / KP 2026",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await sendEmailVerification(user);
      await signOut(auth);

      alert(
        "Registration successful. Email verification link has been sent. Please verify your email before login."
      );

      router.push("/login");
    } catch (error: any) {
      const errorCode = String(error?.code || "");

      if (errorCode === "auth/email-already-in-use") {
        alert("This email is already registered. Please login.");
      } else if (errorCode === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else if (errorCode === "auth/weak-password") {
        alert("Password is too weak. Please use at least 6 characters.");
      } else if (errorCode === "auth/network-request-failed") {
        alert("Network problem. Please check your internet connection.");
      } else {
        alert(error.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={mainStyle}>
      <div style={cardStyle}>
        <h1 style={brandTitleStyle}>Successful Academy</h1>

        <h2 style={pageTitleStyle}>Student Registration</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => {
            const onlyNumbers = e.target.value.replace(/\D/g, "");
            setMobile(onlyNumbers.slice(0, 10));
          }}
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

        <div style={passwordWrapStyle}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={passwordInputStyle}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={eyeButtonStyle}
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            <EyeIcon show={showConfirmPassword} />
          </button>
        </div>

        <button
          onClick={() => void handleRegister()}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={loginTextStyle}>
          Already have an account? <Link href="/login">Login</Link>
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
  width: "420px",
  maxWidth: "100%",
  background: "#fff",
  padding: "35px",
  borderRadius: "15px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
};

const brandTitleStyle: CSSProperties = {
  textAlign: "center",
  color: "#1e3a8a",
  margin: 0,
};

const pageTitleStyle: CSSProperties = {
  textAlign: "center",
  margin: "20px 0",
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
  marginBottom: "15px",
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

const loginTextStyle: CSSProperties = {
  textAlign: "center",
  marginTop: "20px",
};
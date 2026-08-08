"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type KnowledgeItem = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  category: string;
};

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";

export default function KnowledgeBasePage() {
  const router = useRouter();

  const [checkingUser, setCheckingUser] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState<KnowledgeItem[]>([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const admin = user.email === ADMIN_EMAIL;
      setIsAdmin(admin);
      setCheckingUser(false);

      if (!admin) {
        alert("Only admin can open this page.");
        router.push("/settings");
        return;
      }

      await loadKnowledge();
    });

    return () => unsubscribe();
  }, [router]);

  const loadKnowledge = async () => {
    const q = query(
      collection(db, "knowledgeBase"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const loadedItems: KnowledgeItem[] = snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        question: String(data.question || ""),
        answer: String(data.answer || ""),
        keywords: String(data.keywords || ""),
        category: String(data.category || "General"),
      };
    });

    setItems(loadedItems);
  };

  const saveKnowledge = async () => {
    if (!question.trim() || !answer.trim()) {
      alert("Question aur Answer dono likhna padega.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "knowledgeBase"), {
        question: question.trim(),
        answer: answer.trim(),
        keywords: keywords.trim(),
        category: category.trim() || "General",
        createdAt: serverTimestamp(),
      });

      setQuestion("");
      setAnswer("");
      setKeywords("");
      setCategory("General");

      await loadKnowledge();

      alert("Knowledge saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Knowledge save nahi hua. Firestore rules check karo.");
    } finally {
      setSaving(false);
    }
  };

  const deleteKnowledge = async (id: string) => {
    if (!confirm("Delete this question-answer?")) return;

    try {
      await deleteDoc(doc(db, "knowledgeBase", id));
      await loadKnowledge();
    } catch (error) {
      console.error(error);
      alert("Delete nahi hua.");
    }
  };

  if (checkingUser) {
    return <main style={loadingStyle}>Loading...</main>;
  }

  if (!isAdmin) {
    return <main style={loadingStyle}>Only admin can open this page.</main>;
  }

  return (
    <main style={mainStyle}>
      <Link href="/settings" style={backLinkStyle}>
        ← Back to Settings
      </Link>

      <section style={heroStyle}>
        <p style={{ margin: 0, opacity: 0.9 }}>Successful Academy Official</p>

        <h1 style={{ marginTop: "8px", fontSize: "31px" }}>
          🧠 AI Knowledge Box
        </h1>

        <p style={{ marginTop: "8px", opacity: 0.95 }}>
          Add your own questions and answers. Chat Support will search here
          first before using Gemini.
        </p>
      </section>

      <section style={formBoxStyle}>
        <h2 style={titleStyle}>Add Question Answer</h2>

        <label style={labelStyle}>Question</label>
        <textarea
          placeholder="Example: India's biggest river?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={textareaStyle}
        />

        <label style={labelStyle}>Answer</label>
        <textarea
          placeholder="Write the answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ ...textareaStyle, minHeight: "150px" }}
        />

        <label style={labelStyle}>Keywords</label>
        <input
          placeholder="Example: river, india, ganga, brahmaputra"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Category</label>
        <input
          placeholder="Example: GK, Current Affairs, Math"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        />

        <button onClick={saveKnowledge} disabled={saving} style={saveButtonStyle}>
          {saving ? "Saving..." : "Save Knowledge"}
        </button>
      </section>

      <section style={listBoxStyle}>
        <h2 style={titleStyle}>Saved Knowledge</h2>

        {items.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No question-answer added yet.</p>
        ) : (
          <div style={gridStyle}>
            {items.map((item) => (
              <div key={item.id} style={cardStyle}>
                <p style={categoryStyle}>{item.category}</p>

                <h3 style={questionStyle}>{item.question}</h3>

                <p style={answerStyle}>{item.answer}</p>

                {item.keywords && (
                  <p style={keywordStyle}>Keywords: {item.keywords}</p>
                )}

                <button
                  onClick={() => deleteKnowledge(item.id)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#eef4ff",
  padding: "20px",
  paddingBottom: "90px",
};

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#eef4ff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#2563eb",
  fontWeight: "bold",
  fontSize: "20px",
};

const backLinkStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: "bold",
  textDecoration: "none",
};

const heroStyle: CSSProperties = {
  marginTop: "20px",
  padding: "24px",
  borderRadius: "24px",
  color: "white",
  background: "linear-gradient(135deg,#2563eb,#1e40af,#111827)",
  boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
};

const formBoxStyle: CSSProperties = {
  marginTop: "20px",
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
};

const listBoxStyle: CSSProperties = {
  marginTop: "20px",
  background: "white",
  padding: "18px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
};

const titleStyle: CSSProperties = {
  marginTop: 0,
  color: "#111827",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginTop: "14px",
  marginBottom: "6px",
  color: "#111827",
  fontWeight: "bold",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "90px",
  resize: "vertical",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  color: "#111827",
  fontSize: "15px",
  boxSizing: "border-box",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  color: "#111827",
  fontSize: "15px",
  boxSizing: "border-box",
};

const saveButtonStyle: CSSProperties = {
  marginTop: "16px",
  padding: "12px 18px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  cursor: "pointer",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "14px",
};

const cardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "14px",
  background: "#f8fafc",
};

const categoryStyle: CSSProperties = {
  margin: 0,
  color: "#2563eb",
  fontWeight: "bold",
  fontSize: "13px",
};

const questionStyle: CSSProperties = {
  marginTop: "8px",
  color: "#111827",
};

const answerStyle: CSSProperties = {
  color: "#374151",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const keywordStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: 1.5,
};

const deleteButtonStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#fee2e2",
  color: "#dc2626",
  border: "none",
  borderRadius: "9px",
  fontWeight: "bold",
  cursor: "pointer",
};
"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { sendNotificationToStudents } from "@/lib/sendNotification";

type FolderItem = {
  id: string;
  title: string;
  bgColor: string;
  bgImage: string;
};

type PaperItem = {
  id: string;
  folderId: string;
  title: string;
  fileName: string;
  size: number;
  dataUrl: string;
  createdAt: number;
};

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";

export default function PreviousPapersPage() {
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [papers, setPapers] = useState<PaperItem[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [bgColor, setBgColor] = useState("#7c3aed");
  const [bgImage, setBgImage] = useState("");

  const [openMenuId, setOpenMenuId] = useState("");
  const [editId, setEditId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBgColor, setEditBgColor] = useState("#7c3aed");
  const [editBgImage, setEditBgImage] = useState("");

  const [showAddPaper, setShowAddPaper] = useState(false);
  const [paperTitle, setPaperTitle] = useState("");

  async function loadPapers(folderId: string) {
    try {
      const pSnap = await getDocs(collection(db, "pyp_papers"));
      const allPapers = pSnap.docs.map(d => d.data() as PaperItem);
      const folderPapers = allPapers.filter(p => p.folderId === folderId);
      setPapers(folderPapers.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Error loading papers:", error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setIsAdmin(user.email === ADMIN_EMAIL);
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const fSnap = await getDocs(collection(db, "pyp_folders"));
        const loadedFolders = fSnap.docs.map(d => d.data() as FolderItem).sort((a, b) => Number(b.id) - Number(a.id));
        setFolders(loadedFolders);
      } catch (error) {
        console.error("Error fetching folders:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) {
      loadPapers(selectedFolder.id);
      setShowAddPaper(false);
      setPaperTitle("");
    }
  }, [selectedFolder]);

  const convertImageToBase64 = (
    event: ChangeEvent<HTMLInputElement>,
    callback: (image: string) => void
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Keep the background image under 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      callback(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const addFolder = async () => {
    if (!folderName.trim()) {
      alert("Please enter a folder name.");
      return;
    }

    const newFolder: FolderItem = {
      id: Date.now().toString(),
      title: folderName,
      bgColor,
      bgImage,
    };

    try {
      await setDoc(doc(db, "pyp_folders", newFolder.id), newFolder);
      setFolders([newFolder, ...folders]);
      setFolderName("");
      setBgColor("#7c3aed");
      setBgImage("");
      setShowAddFolder(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Folder banane mein error aayi.");
    }
  };

  const startEditFolder = (folder: FolderItem) => {
    setEditId(folder.id);
    setEditTitle(folder.title);
    setEditBgColor(folder.bgColor);
    setEditBgImage(folder.bgImage);
    setOpenMenuId("");
    setShowAddFolder(false);
  };

  const saveEditFolder = async () => {
    if (!editTitle.trim()) {
      alert("Please enter a folder name.");
      return;
    }

    try {
      await updateDoc(doc(db, "pyp_folders", editId), {
        title: editTitle,
        bgColor: editBgColor,
        bgImage: editBgImage,
      });

      setFolders(
        folders.map((folder) =>
          folder.id === editId
            ? {
                ...folder,
                title: editTitle,
                bgColor: editBgColor,
                bgImage: editBgImage,
              }
            : folder
        )
      );

      setEditId("");
      setEditTitle("");
      setEditBgColor("#7c3aed");
      setEditBgImage("");
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  const deleteFolder = async (id: string) => {
    if (!confirm("Do you want to delete this folder?")) return;

    try {
      await deleteDoc(doc(db, "pyp_folders", id));
      setFolders(folders.filter((folder) => folder.id !== id));

      const pSnap = await getDocs(collection(db, "pyp_papers"));
      const papersToDelete = pSnap.docs.filter(d => d.data().folderId === id);
      for(const p of papersToDelete) {
         await deleteDoc(doc(db, "pyp_papers", p.id));
      }

      setOpenMenuId("");
      setEditId("");
    } catch (error) {
      console.error("Delete folder error:", error);
    }
  };

  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder) return;

    const file = event.target.files?.[0];

    if (!file) return;

    if (!paperTitle.trim()) {
      alert("Please enter a title first.");
      event.target.value = "";
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please upload only a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("Keep the PDF under 25MB.");
      event.target.value = "";
      return;
    }

    try {
      alert("PDF upload ho rahi hai, kripya thoda intezaar karein... ⏳");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "successful_preset");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      const newPaper: PaperItem = {
        id: Date.now().toString(),
        folderId: selectedFolder.id,
        title: paperTitle,
        fileName: file.name,
        size: file.size,
        dataUrl: data.secure_url,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, "pyp_papers", newPaper.id), newPaper);
      setPapers([newPaper, ...papers]);

      setPaperTitle("");
      setShowAddPaper(false);
      event.target.value = "";

      alert("Wah! PDF successfully upload ho gayi 🚀");

      void sendNotificationToStudents({
        title: "Successful Academy Official",
        body: "New Previous Papers PDF uploaded.",
        url: "/previous-papers",
      });
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload mein error aayi. Please dobara try karein.");
      event.target.value = "";
    }
  };

  const deletePaper = async (id: string) => {
    if (!confirm("Do you want to delete this PDF?")) return;

    try {
      await deleteDoc(doc(db, "pyp_papers", id));
      setPapers(papers.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
  };

  if (checkingUser || !dataLoaded) {
    return <main style={loadingStyle}>Loading...</main>;
  }

  if (selectedFolder) {
    return (
      <main style={mainStyle}>
        <button
          onClick={() => {
            setSelectedFolder(null);
            setPapers([]);
          }}
          style={backButtonStyle}
        >
          ← Back to Folders
        </button>

        <section
          style={{
            ...folderHeroStyle,
            background: selectedFolder.bgImage
              ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${selectedFolder.bgImage})`
              : `linear-gradient(135deg, ${selectedFolder.bgColor}, #111827)`,
          }}
        >
          <p style={{ margin: 0, opacity: 0.9 }}>
            Previous Year Question Paper
          </p>

          <h1 style={{ marginTop: "8px", fontSize: "30px" }}>
            📁 {selectedFolder.title}
          </h1>

          <p style={{ marginTop: "8px" }}>
            Enter a title and add the PDF inside it.
          </p>
        </section>

        {isAdmin && (
          <button
            onClick={() => setShowAddPaper(!showAddPaper)}
            style={addButtonStyle}
          >
            {showAddPaper ? "✖ Close Add Paper" : "＋ Add Question Paper"}
          </button>
        )}

        {isAdmin && showAddPaper && (
          <section style={boxStyle}>
            <h2 style={sectionTitleStyle}>Add Previous Year Paper</h2>

            <input
              type="text"
              placeholder="Title, example: WBP Constable 2023 Paper"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Upload PDF</label>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              style={inputStyle}
            />

            <p style={{ color: "#555", marginTop: "10px", fontSize: "14px" }}>
              Enter the title before choosing file.
            </p>
          </section>
        )}

        <section style={{ marginTop: "25px" }}>
          <h2 style={sectionTitleStyle}>Question Papers</h2>

          {papers.length === 0 && (
            <div style={emptyBoxStyle}>No paper added yet.</div>
          )}

          <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
            {papers.map((paper) => (
              <div key={paper.id} style={paperCardStyle}>
                <h3 style={{ color: "#111", margin: 0, fontSize: "21px" }}>
                  📄 {paper.title}
                </h3>

                <p style={{ color: "#555", marginTop: "8px" }}>
                  File: {paper.fileName}
                </p>

                <p style={{ color: "#555", marginTop: "4px" }}>
                  Size: {formatSize(paper.size)}
                </p>

                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <a
                    href={paper.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={openButtonStyle}
                  >
                    Open
                  </a>

                  <a
                    href={paper.dataUrl}
                    download={paper.fileName}
                    style={downloadButtonStyle}
                  >
                    Download
                  </a>

                  {isAdmin && (
                    <button
                      onClick={() => deletePaper(paper.id)}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={mainStyle}>
      <Link href="/settings" style={backLinkStyle}>
        ← Back to Settings
      </Link>

      <section style={topHeroStyle}>
        <p style={{ margin: 0, opacity: 0.9 }}>Successful Academy Official</p>

        <h1 style={{ marginTop: "8px", fontSize: "30px" }}>
          Previous Year Question Paper
        </h1>

        <p style={{ marginTop: "8px", opacity: 0.95 }}>
          Exam-wise folders create karo aur previous year PDFs upload karo.
        </p>
      </section>

      {isAdmin && (
        <button
          onClick={() => {
            setShowAddFolder(!showAddFolder);
            setEditId("");
            setOpenMenuId("");
          }}
          style={floatingButtonStyle}
        >
          ＋
        </button>
      )}

      {isAdmin && showAddFolder && (
        <section style={boxStyle}>
          <h2 style={sectionTitleStyle}>Add Paper Folder</h2>

          <input
            type="text"
            placeholder="Folder name, example: WBP Previous Papers"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Background Color</label>

          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={colorInputStyle}
          />

          <label style={labelStyle}>Background Photo</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => convertImageToBase64(e, setBgImage)}
            style={inputStyle}
          />

          {bgImage && (
            <button
              onClick={() => setBgImage("")}
              style={smallDangerButtonStyle}
            >
              Remove Selected Photo
            </button>
          )}

          <button onClick={addFolder} style={saveButtonStyle}>
            Save Folder
          </button>
        </section>
      )}

      {isAdmin && editId && (
        <section style={boxStyle}>
          <h2 style={sectionTitleStyle}>Edit Folder</h2>

          <input
            type="text"
            placeholder="Folder name"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Background Color</label>

          <input
            type="color"
            value={editBgColor}
            onChange={(e) => setEditBgColor(e.target.value)}
            style={colorInputStyle}
          />

          <label style={labelStyle}>Change Background Photo</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => convertImageToBase64(e, setEditBgImage)}
            style={inputStyle}
          />

          {editBgImage && (
            <button
              onClick={() => setEditBgImage("")}
              style={smallDangerButtonStyle}
            >
              Remove Background Photo
            </button>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button onClick={saveEditFolder} style={saveButtonStyle}>
              Save Changes
            </button>

            <button onClick={() => setEditId("")} style={cancelButtonStyle}>
              Cancel
            </button>
          </div>
        </section>
      )}

      <section style={{ marginTop: "25px" }}>
        <h2 style={sectionTitleStyle}>Paper Folders</h2>

        {folders.length === 0 && (
          <div style={emptyBoxStyle}>No folder added yet.</div>
        )}

        <div style={{ display: "grid", gap: "16px", marginTop: "15px" }}>
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setSelectedFolder(folder)}
              style={{
                ...folderCardStyle,
                background: folder.bgImage
                  ? `linear-gradient(rgba(0,0,0,0.50), rgba(0,0,0,0.50)), url(${folder.bgImage})`
                  : `linear-gradient(135deg, ${folder.bgColor}, #111827)`,
              }}
            >
              {isAdmin && (
                <div style={menuWrapperStyle} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === folder.id ? "" : folder.id)
                    }
                    style={threeDotButtonStyle}
                  >
                    ⋮
                  </button>

                  {openMenuId === folder.id && (
                    <div style={dropdownStyle}>
                      <button
                        onClick={() => startEditFolder(folder)}
                        style={dropdownButtonStyle}
                      >
                        Rename / Background
                      </button>

                      <button
                        onClick={() => deleteFolder(folder.id)}
                        style={{ ...dropdownButtonStyle, color: "#dc2626" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={folderIconStyle}>📚</div>

                <h3 style={{ fontSize: "24px", marginTop: "10px" }}>
                  {folder.title}
                </h3>

                <p style={{ marginTop: "8px", opacity: 0.95 }}>
                  Tap to open folder →
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function formatSize(size: number) {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f5f3ff",
  padding: "20px",
  paddingBottom: "90px",
};

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f5f3ff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "#7c3aed",
  fontWeight: "bold",
  fontSize: "20px",
};

const backLinkStyle: CSSProperties = {
  color: "#7c3aed",
  fontWeight: "bold",
  textDecoration: "none",
};

const backButtonStyle: CSSProperties = {
  padding: "10px 14px",
  background: "white",
  color: "#7c3aed",
  border: "1px solid #ddd6fe",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const topHeroStyle: CSSProperties = {
  marginTop: "20px",
  padding: "24px",
  borderRadius: "24px",
  color: "white",
  background: "linear-gradient(135deg,#7c3aed,#4f46e5,#111827)",
  boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
};

const folderHeroStyle: CSSProperties = {
  marginTop: "20px",
  padding: "24px",
  borderRadius: "24px",
  color: "white",
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

const boxStyle: CSSProperties = {
  marginTop: "20px",
  background: "white",
  padding: "20px",
  borderRadius: "18px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.10)",
};

const sectionTitleStyle: CSSProperties = {
  color: "#111827",
  fontSize: "22px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginTop: "15px",
  color: "#111",
  fontWeight: "bold",
};

const colorInputStyle: CSSProperties = {
  width: "100%",
  height: "45px",
  marginTop: "8px",
  border: "1px solid #ccc",
  borderRadius: "10px",
};

const saveButtonStyle: CSSProperties = {
  width: "100%",
  marginTop: "15px",
  padding: "12px",
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const cancelButtonStyle: CSSProperties = {
  width: "100%",
  marginTop: "15px",
  padding: "12px",
  background: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallDangerButtonStyle: CSSProperties = {
  marginTop: "10px",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#fee2e2",
  color: "#dc2626",
  fontWeight: "bold",
  cursor: "pointer",
};

const floatingButtonStyle: CSSProperties = {
  position: "fixed",
  right: "22px",
  bottom: "25px",
  width: "58px",
  height: "58px",
  borderRadius: "50%",
  border: "none",
  background: "#7c3aed",
  color: "white",
  fontSize: "32px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  zIndex: 50,
};

const addButtonStyle: CSSProperties = {
  width: "100%",
  marginTop: "20px",
  padding: "14px",
  background: "#7c3aed",
  color: "white",
  border: "none",
  borderRadius: "14px",
  fontWeight: "bold",
  cursor: "pointer",
};

const emptyBoxStyle: CSSProperties = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  color: "#555",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginTop: "15px",
};

const folderCardStyle: CSSProperties = {
  minHeight: "155px",
  borderRadius: "24px",
  padding: "22px",
  color: "white",
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0 10px 26px rgba(0,0,0,0.24)",
  position: "relative",
  display: "flex",
  alignItems: "flex-end",
  cursor: "pointer",
  overflow: "visible",
};

const folderIconStyle: CSSProperties = {
  width: "48px",
  height: "48px",
  background: "rgba(255,255,255,0.22)",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
};

const menuWrapperStyle: CSSProperties = {
  position: "absolute",
  top: "12px",
  right: "12px",
  zIndex: 10,
};

const threeDotButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.92)",
  color: "#111",
  fontSize: "23px",
  cursor: "pointer",
  fontWeight: "bold",
};

const dropdownStyle: CSSProperties = {
  position: "absolute",
  top: "44px",
  right: 0,
  width: "190px",
  background: "white",
  borderRadius: "10px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
  overflow: "hidden",
  zIndex: 20,
};

const dropdownButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  border: "none",
  background: "white",
  color: "#111",
  textAlign: "left",
  cursor: "pointer",
  fontWeight: "bold",
};

const paperCardStyle: CSSProperties = {
  background: "white",
  padding: "18px",
  borderRadius: "16px",
  boxShadow: "0 5px 16px rgba(0,0,0,0.09)",
  borderLeft: "5px solid #7c3aed",
};

const openButtonStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#7c3aed",
  color: "white",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
};

const downloadButtonStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#16a34a",
  color: "white",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "bold",
};

const deleteButtonStyle: CSSProperties = {
  padding: "8px 12px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};
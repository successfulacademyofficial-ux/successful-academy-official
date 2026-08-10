"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Added db here
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore"; // Added Firestore methods
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { sendNotificationToStudents } from "@/lib/sendNotification";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";
const SELECTED_EXAM_KEY = "selected_exam_v1";

type FolderType = {
  id: string;
  name: string;
  exam: string;
  backgroundColor?: string;
  backgroundImage?: string;
  createdAt: number;
};

type PdfItem = {
  id: string;
  folderId: string;
  title: string;
  fileName: string;
  dataUrl: string;
  createdAt: number;
};

type VideoItem = {
  id: string;
  folderId: string;
  title: string;
  link: string;
  visible: boolean;
  createdAt: number;
};

const text = {
  en: {
    loading: "Loading Current Affairs...",
    back: "Back to Home",
    brand: "Successful Academy Official",
    title: "Daily Current Affairs and Updates",
    subtitle: "Exam-wise notes, PDFs and videos for serious preparation.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    notes: "Notes",
    videos: "Videos",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "No folder added yet.",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addPdf: "Add File",
    pdfTitle: "File Title",
    choosePdf: "Choose File",
    uploadPdf: "Upload File",
    noPdf: "No file added yet.",
    viewPdf: "View File",
    addVideo: "Add Video",
    videoTitle: "Video Title",
    videoLink: "YouTube / Video Link",
    saveVideo: "Save Video",
    noVideo: "No video added yet.",
    watch: "Watch",
    visible: "Visible to students",
    hidden: "Hidden from students",
  },
  hi: {
    loading: "Current Affairs लोड हो रहा है...",
    back: "Home par wapas",
    brand: "Successful Academy Official",
    title: "Daily Current Affairs and Updates",
    subtitle: "Exam-wise notes, PDFs aur videos preparation ke liye.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    notes: "Notes",
    videos: "Videos",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "Abhi koi folder nahi hai.",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addPdf: "Add File",
    pdfTitle: "File Title",
    choosePdf: "Choose File",
    uploadPdf: "Upload File",
    noPdf: "Abhi koi file nahi hai.",
    viewPdf: "View File",
    addVideo: "Add Video",
    videoTitle: "Video Title",
    videoLink: "YouTube / Video Link",
    saveVideo: "Save Video",
    noVideo: "Abhi koi video nahi hai.",
    watch: "Watch",
    visible: "Students ko dikhega",
    hidden: "Students se hidden",
  },
  bn: {
    loading: "Current Affairs লোড হচ্ছে...",
    back: "Home-এ ফিরে যান",
    brand: "Successful Academy Official",
    title: "Daily Current Affairs and Updates",
    subtitle: "Exam-wise notes, PDFs এবং videos preparation-এর জন্য.",
    adminMode: "Admin Mode",
    studentMode: "Student Mode",
    selectedExam: "Selected Exam",
    notes: "Notes",
    videos: "Videos",
    addFolder: "Add Folder",
    folderName: "Folder Name",
    backgroundColor: "Background Color",
    backgroundImage: "Background Image",
    createFolder: "Create Folder",
    cancel: "Cancel",
    noFolder: "এখনো কোনো folder নেই।",
    open: "Open",
    rename: "Rename",
    changeBackground: "Background",
    delete: "Delete",
    save: "Save",
    addPdf: "Add File",
    pdfTitle: "File Title",
    choosePdf: "Choose File",
    uploadPdf: "Upload File",
    noPdf: "এখনো কোনো file নেই।",
    viewPdf: "View File",
    addVideo: "Add Video",
    videoTitle: "Video Title",
    videoLink: "YouTube / Video Link",
    saveVideo: "Save Video",
    noVideo: "এখনো কোনো video নেই।",
    watch: "Watch",
    visible: "Students দেখতে পাবে",
    hidden: "Students থেকে hidden",
  },
};

function CurrentAffairsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");

  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");
  const [activeTab, setActiveTab] = useState<"notes" | "videos">("notes");

  const [noteFolders, setNoteFolders] = useState<FolderType[]>([]);
  const [videoFolders, setVideoFolders] = useState<FolderType[]>([]);
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBgColor, setFolderBgColor] = useState("#2563eb");
  const [folderBgImage, setFolderBgImage] = useState("");

  const [openedFolderId, setOpenedFolderId] = useState("");
  const [menuOpenId, setMenuOpenId] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [backgroundFolderId, setBackgroundFolderId] = useState("");
  const [editBgColor, setEditBgColor] = useState("#2563eb");
  const [editBgImage, setEditBgImage] = useState("");

  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [viewerFile, setViewerFile] = useState<PdfItem | null>(null);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const currentFolders = activeTab === "notes" ? noteFolders : videoFolders;

  const filteredFolders = useMemo(() => {
    return currentFolders.filter((folder) => {
      return (
        selectedExam === "All Competitive Exams" ||
        folder.exam === selectedExam ||
        folder.exam === "All Competitive Exams"
      );
    });
  }, [currentFolders, selectedExam]);

  const openedFolder = currentFolders.find((item) => item.id === openedFolderId);
  const currentPdfs = pdfItems.filter((item) => item.folderId === openedFolderId);
  const currentVideos = videoItems.filter((item) => {
    if (item.folderId !== openedFolderId) return false;
    if (isAdmin) return true;
    return item.visible;
  });

  useEffect(() => {
    const examFromUrl = searchParams.get("exam");
    const examFromStorage = localStorage.getItem(SELECTED_EXAM_KEY);

    if (examFromUrl) {
      setSelectedExam(examFromUrl);
      localStorage.setItem(SELECTED_EXAM_KEY, examFromUrl);
    } else if (examFromStorage) {
      setSelectedExam(examFromStorage);
    }

    // Fetching data from Firestore Database
    const fetchFirebaseData = async () => {
      try {
        const [notesSnap, vFoldersSnap, pdfsSnap, vItemsSnap] = await Promise.all([
          getDocs(collection(db, "ca_noteFolders")),
          getDocs(collection(db, "ca_videoFolders")),
          getDocs(collection(db, "ca_pdfItems")),
          getDocs(collection(db, "ca_videoItems")),
        ]);

        setNoteFolders(
          notesSnap.docs
            .map((d) => d.data() as FolderType)
            .sort((a, b) => b.createdAt - a.createdAt)
        );
        setVideoFolders(
          vFoldersSnap.docs
            .map((d) => d.data() as FolderType)
            .sort((a, b) => b.createdAt - a.createdAt)
        );
        setPdfItems(
          pdfsSnap.docs
            .map((d) => d.data() as PdfItem)
            .sort((a, b) => b.createdAt - a.createdAt)
        );
        setVideoItems(
          vItemsSnap.docs
            .map((d) => d.data() as VideoItem)
            .sort((a, b) => b.createdAt - a.createdAt)
        );
      } catch (error) {
        console.error("Error loading data from Firestore:", error);
      }
    };

    fetchFirebaseData();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");
      setCheckingUser(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const makeId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const createFolder = async () => {
    if (!isAdmin) return;

    const cleanName = folderName.trim();
    if (!cleanName) {
      alert("Please enter a folder name.");
      return;
    }

    const newFolder: FolderType = {
      id: makeId(),
      name: cleanName,
      exam: selectedExam,
      backgroundColor: folderBgColor,
      backgroundImage: folderBgImage,
      createdAt: Date.now(),
    };

    if (activeTab === "notes") {
      setNoteFolders([newFolder, ...noteFolders]);
      await setDoc(doc(db, "ca_noteFolders", newFolder.id), newFolder).catch(console.error);
    } else {
      setVideoFolders([newFolder, ...videoFolders]);
      await setDoc(doc(db, "ca_videoFolders", newFolder.id), newFolder).catch(console.error);
    }

    setFolderName("");
    setFolderBgColor("#2563eb");
    setFolderBgImage("");
    setShowAddFolder(false);
  };

  const openRenameBox = (folder: FolderType) => {
    if (!isAdmin) return;
    setRenameFolderId(folder.id);
    setRenameValue(folder.name);
    setBackgroundFolderId("");
    setMenuOpenId("");
  };

  const saveRenameFolder = async () => {
    if (!isAdmin) return;
    const cleanName = renameValue.trim();
    if (!cleanName) {
      alert("Please enter a folder name.");
      return;
    }

    const targetFolder = currentFolders.find((f) => f.id === renameFolderId);
    if (targetFolder) {
      const updatedFolder = { ...targetFolder, name: cleanName };

      if (activeTab === "notes") {
        setNoteFolders(noteFolders.map((f) => (f.id === renameFolderId ? updatedFolder : f)));
        await setDoc(doc(db, "ca_noteFolders", renameFolderId), updatedFolder).catch(console.error);
      } else {
        setVideoFolders(videoFolders.map((f) => (f.id === renameFolderId ? updatedFolder : f)));
        await setDoc(doc(db, "ca_videoFolders", renameFolderId), updatedFolder).catch(console.error);
      }
    }
    setRenameFolderId("");
    setRenameValue("");
  };

  const openBackgroundBox = (folder: FolderType) => {
    if (!isAdmin) return;
    setBackgroundFolderId(folder.id);
    setEditBgColor(folder.backgroundColor || "#2563eb");
    setEditBgImage(folder.backgroundImage || "");
    setRenameFolderId("");
    setMenuOpenId("");
  };

  const saveBackgroundChange = async () => {
    if (!isAdmin) return;
    const targetFolder = currentFolders.find((f) => f.id === backgroundFolderId);
    
    if (targetFolder) {
      const updatedFolder = {
        ...targetFolder,
        backgroundColor: editBgColor,
        backgroundImage: editBgImage,
      };

      if (activeTab === "notes") {
        setNoteFolders(noteFolders.map((f) => (f.id === backgroundFolderId ? updatedFolder : f)));
        await setDoc(doc(db, "ca_noteFolders", backgroundFolderId), updatedFolder).catch(console.error);
      } else {
        setVideoFolders(videoFolders.map((f) => (f.id === backgroundFolderId ? updatedFolder : f)));
        await setDoc(doc(db, "ca_videoFolders", backgroundFolderId), updatedFolder).catch(console.error);
      }
    }
    setBackgroundFolderId("");
    setEditBgImage("");
  };

  const deleteFolder = async (folderId: string) => {
    if (!isAdmin) return;
    if (!confirm("Do you want to delete this folder?")) return;

    if (activeTab === "notes") {
      setNoteFolders(noteFolders.filter((item) => item.id !== folderId));
      await deleteDoc(doc(db, "ca_noteFolders", folderId)).catch(console.error);

      const deletingPdfs = pdfItems.filter((item) => item.folderId === folderId);
      for (const item of deletingPdfs) {
        await deleteDoc(doc(db, "ca_pdfItems", item.id)).catch(console.error);
      }
      setPdfItems(pdfItems.filter((item) => item.folderId !== folderId));
    } else {
      setVideoFolders(videoFolders.filter((item) => item.id !== folderId));
      await deleteDoc(doc(db, "ca_videoFolders", folderId)).catch(console.error);

      const deletingVideos = videoItems.filter((item) => item.folderId === folderId);
      for (const item of deletingVideos) {
        await deleteDoc(doc(db, "ca_videoItems", item.id)).catch(console.error);
      }
      setVideoItems(videoItems.filter((item) => item.folderId !== folderId));
    }

    if (openedFolderId === folderId) {
      setOpenedFolderId("");
    }
    setMenuOpenId("");
  };

  const openFolder = (folderId: string) => {
    setOpenedFolderId(folderId);
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  const goBackToFolders = () => {
    setOpenedFolderId("");
    setPdfTitle("");
    setPdfFile(null);
    setVideoTitle("");
    setVideoLink("");
  };

  const uploadPdf = async () => {
    if (!isAdmin) return;

    if (!pdfTitle.trim() || !pdfFile || !openedFolderId) {
      alert("Please enter a file title and select a file.");
      return;
    }

    const allowedExtensions = [
      ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
      ".jpg", ".jpeg", ".png", ".webp", ".txt", ".zip",
    ];
    const lowerFileName = pdfFile.name.toLowerCase();
    const allowedFile = allowedExtensions.some((ext) => lowerFileName.endsWith(ext));

    if (!allowedFile) {
      alert("Please upload PDF, Word, PowerPoint, Excel, image, text or zip file.");
      return;
    }

    try {
      alert("File upload ho rahi hai, kripya thoda intezaar karein... ⏳");

      const formData = new FormData();
      formData.append("file", pdfFile);
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

      const item: PdfItem = {
        id: makeId(),
        folderId: openedFolderId,
        title: pdfTitle.trim(),
        fileName: pdfFile.name,
        dataUrl: data.secure_url,
        createdAt: Date.now(),
      };

      // Save to Firebase Database
      await setDoc(doc(db, "ca_pdfItems", item.id), item);
      setPdfItems([item, ...pdfItems]);

      setPdfTitle("");
      setPdfFile(null);
      alert("Wah! File successfully upload ho gayi 🚀");

      void sendNotificationToStudents({
        title: "Successful Academy Official",
        body: "New Current Affairs Notes uploaded.",
        url: `/current-affairs?exam=${encodeURIComponent(selectedExam)}`,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload mein error aayi. Please dobara try karein.");
    }
  };

  const deletePdf = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("File delete karna hai?")) return;

    await deleteDoc(doc(db, "ca_pdfItems", id)).catch(console.error);
    setPdfItems(pdfItems.filter((item) => item.id !== id));
  };

  const addVideo = async () => {
    if (!isAdmin) return;

    if (!videoTitle.trim() || !videoLink.trim() || !openedFolderId) {
      alert("Please enter a video title and link.");
      return;
    }

    const item: VideoItem = {
      id: makeId(),
      folderId: openedFolderId,
      title: videoTitle.trim(),
      link: videoLink.trim(),
      visible: true,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, "ca_videoItems", item.id), item).catch(console.error);
    setVideoItems([item, ...videoItems]);
    setVideoTitle("");
    setVideoLink("");

    void sendNotificationToStudents({
      title: "Successful Academy Official",
      body: "New Current Affairs Videos uploaded.",
      url: `/current-affairs?exam=${encodeURIComponent(selectedExam)}`,
    });
  };

  const toggleVideoVisibility = async (id: string) => {
    if (!isAdmin) return;
    const target = videoItems.find((i) => i.id === id);
    
    if (target) {
      const updated = { ...target, visible: !target.visible };
      setVideoItems(videoItems.map((item) => (item.id === id ? updated : item)));
      await setDoc(doc(db, "ca_videoItems", id), updated).catch(console.error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Video delete karna hai?")) return;

    await deleteDoc(doc(db, "ca_videoItems", id)).catch(console.error);
    setVideoItems(videoItems.filter((item) => item.id !== id));
  };

  const changeTab = (tab: "notes" | "videos") => {
    setActiveTab(tab);
    setOpenedFolderId("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="ca-page" style={mainStyle}>
      <style>{currentAffairsCss}</style>

      <div className="ca-bg-grid" />
      <div className="ca-orb-one" />
      <div className="ca-orb-two" />

      <Link href="/" style={backLinkStyle}>
        {t.back}
      </Link>

      <section className="ca-hero" style={heroStyle}>
        <div style={modeBadgeStyle}>{isAdmin ? t.adminMode : t.studentMode}</div>

        <p style={brandStyle}>{t.brand}</p>
        <h1 style={heroTitleStyle}>{t.title}</h1>
        <p style={heroTextStyle}>{t.subtitle}</p>

        <div style={examBadgeStyle}>
          {t.selectedExam}: {selectedExam}
        </div>
      </section>

      <section style={tabBoxStyle}>
        <button
          onClick={() => changeTab("notes")}
          style={activeTab === "notes" ? activeTabStyle : tabButtonStyle}
        >
          {t.notes}
        </button>

        <button
          onClick={() => changeTab("videos")}
          style={activeTab === "videos" ? activeTabStyle : tabButtonStyle}
        >
          {t.videos}
        </button>
      </section>

      {!openedFolderId && (
        <>
          {isAdmin && (
            <>
              {!showAddFolder && (
                <button
                  onClick={() => setShowAddFolder(true)}
                  className="ca-action-btn"
                  style={mainButtonStyle}
                >
                  {t.addFolder}
                </button>
              )}

              {showAddFolder && (
                <section className="ca-panel" style={panelStyle}>
                  <label style={labelStyle}>{t.folderName}</label>
                  <input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder={t.folderName}
                    style={inputStyle}
                  />

                  <label style={labelStyle}>{t.backgroundColor}</label>
                  <input
                    type="color"
                    value={folderBgColor}
                    onChange={(e) => setFolderBgColor(e.target.value)}
                    style={colorInputStyle}
                  />

                  <label style={labelStyle}>{t.backgroundImage}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setFolderBgImage(dataUrl);
                    }}
                    style={inputStyle}
                  />

                  <div style={buttonRowStyle}>
                    <button onClick={createFolder} style={smallBlueButtonStyle}>
                      {t.createFolder}
                    </button>

                    <button
                      onClick={() => {
                        setShowAddFolder(false);
                        setFolderName("");
                        setFolderBgImage("");
                      }}
                      style={smallGrayButtonStyle}
                    >
                      {t.cancel}
                    </button>
                  </div>
                </section>
              )}
            </>
          )}

          {filteredFolders.length === 0 && (
            <section style={emptyBoxStyle}>{t.noFolder}</section>
          )}

          <section style={folderGridStyle}>
            {filteredFolders.map((folder) => (
              <article
                key={folder.id}
                className="ca-folder"
                style={{
                  ...folderCardStyle,
                  background: getFolderBackground(folder),
                }}
              >
                {isAdmin && (
                  <div style={threeDotWrapStyle}>
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === folder.id ? "" : folder.id)
                      }
                      style={threeDotButtonStyle}
                    >
                      ⋮
                    </button>

                    {menuOpenId === folder.id && (
                      <div style={folderMenuStyle}>
                        <button
                          onClick={() => openRenameBox(folder)}
                          style={menuItemStyle}
                        >
                          {t.rename}
                        </button>

                        <button
                          onClick={() => openBackgroundBox(folder)}
                          style={menuItemStyle}
                        >
                          {t.changeBackground}
                        </button>

                        <button
                          onClick={() => void deleteFolder(folder.id)}
                          style={deleteMenuItemStyle}
                        >
                          {t.delete}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <h2 style={folderTitleStyle}>{folder.name}</h2>
                <p style={folderSubTextStyle}>{folder.exam || selectedExam}</p>

                <button onClick={() => openFolder(folder.id)} style={openButtonStyle}>
                  {t.open}
                </button>

                {renameFolderId === folder.id && (
                  <section style={inlineEditBoxStyle}>
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      style={inputStyle}
                    />

                    <div style={buttonRowStyle}>
                      <button onClick={saveRenameFolder} style={smallBlueButtonStyle}>
                        {t.save}
                      </button>

                      <button
                        onClick={() => {
                          setRenameFolderId("");
                          setRenameValue("");
                        }}
                        style={smallGrayButtonStyle}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </section>
                )}

                {backgroundFolderId === folder.id && (
                  <section style={inlineEditBoxStyle}>
                    <label style={labelStyle}>{t.backgroundColor}</label>
                    <input
                      type="color"
                      value={editBgColor}
                      onChange={(e) => setEditBgColor(e.target.value)}
                      style={colorInputStyle}
                    />

                    <label style={labelStyle}>{t.backgroundImage}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const dataUrl = await fileToDataUrl(file);
                        setEditBgImage(dataUrl);
                      }}
                      style={inputStyle}
                    />

                    <div style={buttonRowStyle}>
                      <button
                        onClick={saveBackgroundChange}
                        style={smallBlueButtonStyle}
                      >
                        {t.save}
                      </button>

                      <button
                        onClick={() => {
                          setBackgroundFolderId("");
                          setEditBgImage("");
                        }}
                        style={smallGrayButtonStyle}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </section>
                )}
              </article>
            ))}
          </section>
        </>
      )}

      {openedFolderId && openedFolder && (
        <>
          <button onClick={goBackToFolders} style={backButtonStyle}>
            Back: {openedFolder.name}
          </button>

          {activeTab === "notes" && (
            <>
              {isAdmin && (
                <section className="ca-panel" style={panelStyle}>
                  <h2 style={sectionTitleStyle}>{t.addPdf}</h2>

                  <label style={labelStyle}>{t.pdfTitle}</label>
                  <input
                    value={pdfTitle}
                    onChange={(e) => setPdfTitle(e.target.value)}
                    placeholder={t.pdfTitle}
                    style={inputStyle}
                  />

                  <label style={labelStyle}>{t.choosePdf}</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.txt,.zip"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    style={inputStyle}
                  />

                  <button
                    onClick={() => void uploadPdf()}
                    className="ca-action-btn"
                    style={mainButtonStyle}
                  >
                    {t.uploadPdf}
                  </button>
                </section>
              )}

              {currentPdfs.length === 0 && (
                <section style={emptyBoxStyle}>{t.noPdf}</section>
              )}

              <section style={resourceGridStyle}>
                {currentPdfs.map((item) => (
                  <article key={item.id} className="ca-resource" style={resourceCardStyle}>
                    <h3 style={resourceTitleStyle}>{item.title}</h3>
                    <p style={resourceSubTextStyle}>{item.fileName}</p>

                    <div style={buttonRowStyle}>
                      <button
                        onClick={() => setViewerFile(item)}
                        style={smallLinkButtonStyle}
                      >
                        View File
                      </button>

                      <a
                        href={item.dataUrl}
                        download={item.fileName}
                        style={{ ...smallGreenButtonStyle, textDecoration: "none" }}
                      >
                        Download
                      </a>

                      {isAdmin && (
                        <button
                          onClick={() => void deletePdf(item.id)}
                          style={smallRedButtonStyle}
                        >
                          {t.delete}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}

          {activeTab === "videos" && (
            <>
              {isAdmin && (
                <section className="ca-panel" style={panelStyle}>
                  <h2 style={sectionTitleStyle}>{t.addVideo}</h2>

                  <label style={labelStyle}>{t.videoTitle}</label>
                  <input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={t.videoTitle}
                    style={inputStyle}
                  />

                  <label style={labelStyle}>{t.videoLink}</label>
                  <input
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    placeholder={t.videoLink}
                    style={inputStyle}
                  />

                  <button onClick={addVideo} className="ca-action-btn" style={mainButtonStyle}>
                    {t.saveVideo}
                  </button>
                </section>
              )}

              {currentVideos.length === 0 && (
                <section style={emptyBoxStyle}>{t.noVideo}</section>
              )}

              <section style={resourceGridStyle}>
                {currentVideos.map((item) => (
                  <article key={item.id} className="ca-resource" style={resourceCardStyle}>
                    <h3 style={resourceTitleStyle}>{item.title}</h3>

                    <p style={resourceSubTextStyle}>
                      {item.visible ? t.visible : t.hidden}
                    </p>

                    <div style={buttonRowStyle}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={smallLinkButtonStyle}
                      >
                        {t.watch}
                      </a>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => toggleVideoVisibility(item.id)}
                            style={smallGreenButtonStyle}
                          >
                            {item.visible ? t.hidden : t.visible}
                          </button>

                          <button
                            onClick={() => deleteVideo(item.id)}
                            style={smallRedButtonStyle}
                          >
                            {t.delete}
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            </>
          )}
        </>
      )}

      {viewerFile && (
        <section style={viewerOverlayStyle}>
          <div style={viewerBoxStyle}>
            <div style={viewerHeaderStyle}>
              <h2 style={{ margin: 0, color: "#1e3a8a" }}>
                {viewerFile.title}
              </h2>

              <button
                onClick={() => setViewerFile(null)}
                style={smallRedButtonStyle}
              >
                Close
              </button>
            </div>

            <p style={{ color: "#64748b", fontWeight: "bold" }}>
              {viewerFile.fileName}
            </p>

            {canPreviewFile(viewerFile.fileName) ? (
              isImageFile(viewerFile.fileName) ? (
                <img
                  src={viewerFile.dataUrl}
                  alt={viewerFile.title}
                  style={viewerImageStyle}
                />
              ) : (
                <iframe
                  src={viewerFile.dataUrl}
                  style={viewerFrameStyle}
                  title={viewerFile.title}
                />
              )
            ) : (
              <div style={viewerNotSupportedStyle}>
                <h3>Preview available nahi hai</h3>
                <p>
                  Word, PowerPoint aur Excel file browser me direct view nahi hota.
                  Download button se file open karo.
                </p>

                <a
                  href={viewerFile.dataUrl}
                  download={viewerFile.fileName}
                  style={{ ...smallGreenButtonStyle, textDecoration: "none" }}
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default function CurrentAffairsPage() {
  return (
    <Suspense fallback={<main style={loadingStyle}>Loading Current Affairs...</main>}>
      <CurrentAffairsContent />
    </Suspense>
  );
}

function getFolderBackground(folder: FolderType) {
  if (folder.backgroundImage) {
    return `linear-gradient(135deg, rgba(15,23,42,0.30), rgba(37,99,235,0.45)), url(${folder.backgroundImage}) center/cover no-repeat`;
  }

  return `linear-gradient(135deg, ${
    folder.backgroundColor || "#38bdf8"
  }, #2563eb, #8b5cf6)`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(file);
  });
}

function isImageFile(fileName: string) {
  const name = fileName.toLowerCase();

  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp")
  );
}

function canPreviewFile(fileName: string) {
  const name = fileName.toLowerCase();

  return (
    name.endsWith(".pdf") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".txt")
  );
}

const currentAffairsCss = `
  .ca-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .ca-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(14,165,233,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(37,99,235,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(20,184,166,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: caGridMove 12s linear infinite;
    pointer-events: none;
  }

  .ca-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 120px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(14,165,233,0.16);
    z-index: -4;
    animation: caOrbOne 7s ease-in-out infinite;
  }

  .ca-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(124,58,237,0.14);
    z-index: -4;
    animation: caOrbTwo 8s ease-in-out infinite;
  }

  .ca-hero,
  .ca-folder,
  .ca-resource,
  .ca-panel {
    transform-style: preserve-3d;
  }

  .ca-hero {
    position: relative;
    overflow: hidden;
    animation: caHeroFloat 5s ease-in-out infinite;
  }

  .ca-hero::before,
  .ca-folder::before,
  .ca-resource::before,
  .ca-panel::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: caShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .ca-hero::after,
  .ca-folder::after,
  .ca-resource::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .ca-action-btn {
    position: relative;
    overflow: hidden;
    animation: caButtonPulse 2.8s ease-in-out infinite;
  }

  .ca-action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: caButtonShine 3.6s ease-in-out infinite;
    pointer-events: none;
  }

  .ca-folder,
  .ca-resource {
    position: relative;
    overflow: visible;
    animation: caCardEnter 0.55s ease both, caCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .ca-panel {
    overflow: hidden;
  }

  .ca-folder:hover,
  .ca-resource:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(37,99,235,0.16);
  }

  @keyframes caGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes caOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes caOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes caHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes caShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes caCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes caCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes caButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(37,99,235,0.18); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(14,165,233,0.22); }
  }

  @keyframes caButtonShine {
    0% { left: -130%; }
    50% { left: 130%; }
    100% { left: 130%; }
  }
`;

const loadingStyle: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: "22px",
  fontWeight: "bold",
};

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#ffffff 0%,#eff6ff 45%,#f5f3ff 100%)",
  padding: "20px",
  paddingBottom: "105px",
};

const backLinkStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "inline-block",
  color: "#2563eb",
  fontWeight: "bold",
  textDecoration: "none",
  marginBottom: "18px",
};

const heroStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "28px",
  borderRadius: "30px",
  background:
    "linear-gradient(135deg, rgba(14,165,233,0.92), rgba(37,99,235,0.82), rgba(20,184,166,0.72))",
  color: "white",
  boxShadow:
    "0 24px 55px rgba(37,99,235,0.18), inset 0 0 30px rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.55)",
};

const modeBadgeStyle: CSSProperties = {
  position: "absolute",
  right: "24px",
  top: "24px",
  zIndex: 5,
  padding: "9px 13px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.22)",
  color: "white",
  fontWeight: "900",
  border: "1px solid rgba(255,255,255,0.35)",
};

const brandStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  margin: 0,
  fontWeight: "bold",
};

const heroTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "14px",
  fontSize: "31px",
  lineHeight: 1.2,
};

const heroTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "10px",
  opacity: 0.96,
  lineHeight: 1.6,
};

const examBadgeStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  display: "inline-block",
  marginTop: "14px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.20)",
  border: "1px solid rgba(255,255,255,0.35)",
  fontWeight: "bold",
};

const tabBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginTop: "18px",
};

const tabButtonStyle: CSSProperties = {
  padding: "14px",
  border: "none",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
  color: "#2563eb",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(37,99,235,0.08)",
};

const activeTabStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg,#2563eb,#0ea5e9,#14b8a6)",
  color: "white",
};

const mainButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  width: "100%",
  marginTop: "18px",
  padding: "14px",
  border: "none",
  borderRadius: "16px",
  background: "linear-gradient(135deg,#2563eb,#0ea5e9,#14b8a6)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

const panelStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "18px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
  overflow: "hidden",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#0f766e",
  fontWeight: "bold",
  marginTop: "12px",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "13px",
  border: "1px solid rgba(37,99,235,0.20)",
  background: "white",
  color: "#1e3a8a",
  fontSize: "15px",
};

const colorInputStyle: CSSProperties = {
  width: "90px",
  height: "46px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(37,99,235,0.20)",
  background: "white",
  cursor: "pointer",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "12px",
};

const smallBlueButtonStyle: CSSProperties = {
  padding: "9px 12px",
  border: "none",
  borderRadius: "10px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const smallGreenButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#14b8a6",
};

const smallRedButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#ef4444",
};

const smallGrayButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  background: "#64748b",
};

const smallLinkButtonStyle: CSSProperties = {
  ...smallBlueButtonStyle,
  display: "inline-block",
  textDecoration: "none",
};

const emptyBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
  color: "#64748b",
  border: "1px solid rgba(37,99,235,0.12)",
};

const folderGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "26px",
  marginTop: "18px",
};

const folderCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "20px",
  borderRadius: "26px",
  color: "white",
  minHeight: "150px",
  boxShadow: "0 22px 44px rgba(37,99,235,0.14)",
};

const folderTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  margin: 0,
  fontSize: "22px",
  paddingRight: "55px",
};

const folderSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  opacity: 0.92,
  fontWeight: "bold",
};

const openButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  marginTop: "12px",
  padding: "10px 14px",
  border: "none",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.25)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const threeDotWrapStyle: CSSProperties = {
  position: "absolute",
  right: "18px",
  top: "18px",
  zIndex: 9998,
};

const threeDotButtonStyle: CSSProperties = {
  width: "38px",
  height: "38px",
  border: "none",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.25)",
  color: "white",
  fontSize: "25px",
  fontWeight: "bold",
  cursor: "pointer",
};

const folderMenuStyle: CSSProperties = {
  position: "absolute",
  right: 0,
  top: "45px",
  width: "205px",
  padding: "8px",
  borderRadius: "14px",
  background: "white",
  boxShadow: "0 18px 34px rgba(15,23,42,0.20)",
  zIndex: 9999,
};

const menuItemStyle: CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 10px",
  border: "none",
  borderRadius: "10px",
  background: "white",
  color: "#1e3a8a",
  textAlign: "left",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

const deleteMenuItemStyle: CSSProperties = {
  ...menuItemStyle,
  color: "#ef4444",
};

const inlineEditBoxStyle: CSSProperties = {
  position: "relative",
  zIndex: 5,
  marginTop: "14px",
  padding: "14px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.92)",
};

const backButtonStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "11px 14px",
  border: "none",
  borderRadius: "14px",
  background: "#2563eb",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitleStyle: CSSProperties = {
  color: "#2563eb",
  marginTop: 0,
};

const resourceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  marginTop: "18px",
};

const resourceCardStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  padding: "18px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.94)",
  border: "1px solid rgba(37,99,235,0.12)",
  boxShadow: "0 18px 36px rgba(37,99,235,0.10)",
};

const resourceTitleStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#1e3a8a",
  marginTop: 0,
};

const resourceSubTextStyle: CSSProperties = {
  position: "relative",
  zIndex: 4,
  color: "#64748b",
  fontWeight: "bold",
};

const viewerOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 99999,
  background: "rgba(15,23,42,0.75)",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const viewerBoxStyle: CSSProperties = {
  width: "100%",
  maxWidth: "1000px",
  height: "90vh",
  background: "white",
  borderRadius: "22px",
  padding: "16px",
  overflow: "hidden",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
};

const viewerHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const viewerFrameStyle: CSSProperties = {
  width: "100%",
  height: "75vh",
  border: "1px solid rgba(37,99,235,0.18)",
  borderRadius: "14px",
  background: "#f8fafc",
};

const viewerImageStyle: CSSProperties = {
  width: "100%",
  maxHeight: "75vh",
  objectFit: "contain",
  borderRadius: "14px",
  background: "#f8fafc",
};

const viewerNotSupportedStyle: CSSProperties = {
  marginTop: "20px",
  padding: "20px",
  borderRadius: "18px",
  background: "#eff6ff",
  color: "#1e3a8a",
};
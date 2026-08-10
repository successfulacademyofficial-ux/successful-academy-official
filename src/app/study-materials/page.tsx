"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { sendNotificationToStudents } from "@/lib/sendNotification";

const ADMIN_EMAIL = "successfulacademyofficial@gmail.com";
const SELECTED_EXAM_KEY = "selected_exam_v1";

type FolderType = {
  id: string;
  name: string;
  exam: string;
  parentId?: string;
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
    loading: "Loading Study Materials...",
    back: "Back to Home",
    brand: "Successful Academy Official",
    title: "Study Materials and Notes",
    subtitle: "Exam-wise notes, PDFs and videos for better preparation.",
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
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "No PDF added yet.",
    viewPdf: "View PDF",
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
    loading: "Study Materials लोड हो रहा है...",
    back: "Home par wapas",
    brand: "Successful Academy Official",
    title: "Study Materials and Notes",
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
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "Abhi koi PDF nahi hai.",
    viewPdf: "View PDF",
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
    loading: "Study Materials লোড হচ্ছে...",
    back: "Home-এ ফিরে যান",
    brand: "Successful Academy Official",
    title: "Study Materials and Notes",
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
    addPdf: "Add PDF",
    pdfTitle: "PDF Title",
    choosePdf: "Choose PDF",
    uploadPdf: "Upload PDF",
    noPdf: "এখনো কোনো PDF নেই।",
    viewPdf: "View PDF",
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

function StudyMaterialsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language = useAppLanguage();
  const t = text[language];

  const [checkingUser, setCheckingUser] = useState(true);
  const [email, setEmail] = useState("");

  const [selectedExam, setSelectedExam] = useState("All Competitive Exams");
  const [activeTab, setActiveTab] = useState<"notes" | "videos">("notes");
  const [activePass, setActivePass] = useState<"simple" | "premium">("simple");

  const [noteFolders, setNoteFolders] = useState<FolderType[]>([]);
  const [pdfItems, setPdfItems] = useState<PdfItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);

  const [showAddFolder, setShowAddFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderBgColor, setFolderBgColor] = useState("#7c3aed");
  const [folderBgImage, setFolderBgImage] = useState("");

  const [openedFolderId, setOpenedFolderId] = useState("");
  const [menuOpenId, setMenuOpenId] = useState("");
  const [renameFolderId, setRenameFolderId] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [backgroundFolderId, setBackgroundFolderId] = useState("");
  const [editBgColor, setEditBgColor] = useState("#7c3aed");
  const [editBgImage, setEditBgImage] = useState("");

  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const cleanEmail = email.trim().toLowerCase();
  const isAdmin = cleanEmail === ADMIN_EMAIL;

  const currentFolders = noteFolders;
  const currentVideoItems = videoItems;

  const filteredFolders = useMemo(() => {
    return currentFolders.filter((folder) => {
      const folderParentId = folder.parentId || "";

      return (
        folderParentId === openedFolderId &&
        (selectedExam === "All Competitive Exams" ||
          folder.exam === selectedExam ||
          folder.exam === "All Competitive Exams")
      );
    });
  }, [currentFolders, openedFolderId, selectedExam]);

  const openedFolder = currentFolders.find((item) => item.id === openedFolderId);
  const openedFolderDepth = openedFolderId
    ? getFolderDepth(currentFolders, openedFolderId)
    : -1;
  const finalFolderDepth = 2;

  const currentPdfs = pdfItems.filter((item) => item.folderId === openedFolderId);

  const currentVideos = currentVideoItems.filter((item) => {
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

    // Fetch data from Firebase Firestore
    const fetchAllData = async () => {
      try {
        const foldSnap = await getDocs(collection(db, "sm_folders"));
        setNoteFolders(foldSnap.docs.map(d => d.data() as FolderType).sort((a,b) => b.createdAt - a.createdAt));

        const pdfSnap = await getDocs(collection(db, "sm_pdfs"));
        setPdfItems(pdfSnap.docs.map(d => d.data() as PdfItem).sort((a,b) => b.createdAt - a.createdAt));

        const vidSnap = await getDocs(collection(db, "sm_videos"));
        setVideoItems(vidSnap.docs.map(d => d.data() as VideoItem).sort((a,b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Firestore fetch error:", error);
      }
    };

    fetchAllData();

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
      parentId: openedFolderId || "",
      backgroundColor: folderBgColor,
      backgroundImage: folderBgImage,
      createdAt: Date.now(),
    };

    try {
      await setDoc(doc(db, "sm_folders", newFolder.id), newFolder);
      setNoteFolders([newFolder, ...noteFolders]);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Folder banane mein error aayi.");
      return;
    }

    setFolderName("");
    setFolderBgColor("#7c3aed");
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

    try {
      await updateDoc(doc(db, "sm_folders", renameFolderId), { name: cleanName });
      const updated = currentFolders.map((folder) =>
        folder.id === renameFolderId ? { ...folder, name: cleanName } : folder
      );
      setNoteFolders(updated);
      setRenameFolderId("");
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  const openBackgroundBox = (folder: FolderType) => {
    if (!isAdmin) return;
    setBackgroundFolderId(folder.id);
    setEditBgColor(folder.backgroundColor || "#7c3aed");
    setEditBgImage(folder.backgroundImage || "");
    setRenameFolderId("");
    setMenuOpenId("");
  };

  const saveBackgroundChange = async () => {
    if (!isAdmin) return;

    try {
      await updateDoc(doc(db, "sm_folders", backgroundFolderId), {
        backgroundColor: editBgColor,
        backgroundImage: editBgImage,
      });

      const updated = currentFolders.map((folder) =>
        folder.id === backgroundFolderId
          ? { ...folder, backgroundColor: editBgColor, backgroundImage: editBgImage }
          : folder
      );
      setNoteFolders(updated);
      setBackgroundFolderId("");
      setEditBgImage("");
    } catch (error) {
      console.error("Error changing background:", error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!isAdmin) return;
    if (!confirm("Do you want to delete this folder?")) return;

    const deletingIds = getFolderAndChildIds(currentFolders, folderId);

    try {
      // Delete Folders
      for (const id of deletingIds) {
        await deleteDoc(doc(db, "sm_folders", id));
      }
      setNoteFolders(currentFolders.filter((item) => !deletingIds.has(item.id)));

      // Delete PDFs
      const deletingPdfs = pdfItems.filter((item) => deletingIds.has(item.folderId));
      for (const item of deletingPdfs) {
        await deleteDoc(doc(db, "sm_pdfs", item.id));
      }
      setPdfItems(pdfItems.filter((item) => !deletingIds.has(item.folderId)));

      // Delete Videos
      const deletingVids = currentVideoItems.filter((item) => deletingIds.has(item.folderId));
      for (const item of deletingVids) {
        await deleteDoc(doc(db, "sm_videos", item.id));
      }
      setVideoItems(currentVideoItems.filter((item) => !deletingIds.has(item.folderId)));

      if (deletingIds.has(openedFolderId)) {
        setOpenedFolderId("");
      }
      setMenuOpenId("");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const openFolder = (folderId: string) => {
    setOpenedFolderId(folderId);
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  const goBackToFolders = () => {
    const parentId = openedFolder?.parentId || "";
    setOpenedFolderId(parentId);
    setPdfTitle("");
    setPdfFile(null);
    setVideoTitle("");
    setVideoLink("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  const uploadPdf = async () => {
    if (!isAdmin) return;

    if (!pdfTitle.trim() || !pdfFile || !openedFolderId) {
      alert("Please enter a PDF title and select a PDF file.");
      return;
    }

    try {
      alert("PDF upload ho rahi hai, kripya thoda intezaar karein... ⏳");

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

      await setDoc(doc(db, "sm_pdfs", item.id), item);
      setPdfItems([item, ...pdfItems]);
      setPdfTitle("");
      setPdfFile(null);

      alert("Wah! PDF successfully upload ho gayi 🚀");

      void sendNotificationToStudents({
        title: "Successful Academy Official",
        body: "New Study Materials Notes uploaded.",
        url: `/study-materials?exam=${encodeURIComponent(selectedExam)}`,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload mein error aayi. Please dobara try karein.");
    }
  };

  const deletePdf = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Do you want to delete this PDF?")) return;

    try {
      await deleteDoc(doc(db, "sm_pdfs", id));
      setPdfItems(pdfItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting PDF:", error);
    }
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

    try {
      await setDoc(doc(db, "sm_videos", item.id), item);
      setVideoItems([item, ...currentVideoItems]);
      setVideoTitle("");
      setVideoLink("");

      void sendNotificationToStudents({
        title: "Successful Academy Official",
        body: "New Study Materials Videos uploaded.",
        url: `/study-materials?exam=${encodeURIComponent(selectedExam)}`,
      });
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };

  const toggleVideoVisibility = async (id: string) => {
    if (!isAdmin) return;

    const item = currentVideoItems.find((i) => i.id === id);
    if (!item) return;

    try {
      await updateDoc(doc(db, "sm_videos", id), { visible: !item.visible });
      const updated = currentVideoItems.map((v) =>
        v.id === id ? { ...v, visible: !v.visible } : v
      );
      setVideoItems(updated);
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Do you want to delete this video?")) return;

    try {
      await deleteDoc(doc(db, "sm_videos", id));
      setVideoItems(currentVideoItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const changeTab = (tab: "notes" | "videos") => {
    setActiveTab(tab);
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
  };

  const changePass = (pass: "simple" | "premium") => {
    setActivePass(pass);
    setOpenedFolderId("");
    setShowAddFolder(false);
    setMenuOpenId("");
    setRenameFolderId("");
    setBackgroundFolderId("");
    if (pass === "simple") {
      setActiveTab("notes");
    }
  };

  if (checkingUser) {
    return <main style={loadingStyle}>{t.loading}</main>;
  }

  return (
    <main className="study-page" style={mainStyle}>
      <style>{studyCss}</style>

      <div className="study-bg-grid" />
      <div className="study-orb-one" />
      <div className="study-orb-two" />

      <Link href="/" style={backLinkStyle}>
        {t.back}
      </Link>

      <section className="study-hero" style={heroStyle}>
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
          onClick={() => changePass("simple")}
          style={activePass === "simple" ? silverPassActiveStyle : silverPassStyle}
        >
          Simple Paas
        </button>

        <button
          onClick={() => changePass("premium")}
          style={activePass === "premium" ? goldenPassActiveStyle : goldenPassStyle}
        >
          Premium Paas
        </button>
      </section>

      {activePass === "premium" && (
        <section className="study-panel" style={premiumPassPanelStyle}>
          <div style={premiumCrownStyle}>👑</div>

          <h2 style={premiumTitleStyle}>Premium Paas</h2>

          <p style={premiumTextStyle}>
            Coming soon. Premium notes and videos will be available here later.
          </p>
        </section>
      )}

      {activePass === "simple" && (!openedFolderId || (openedFolder && openedFolderDepth < finalFolderDepth)) && (
        <>
          {openedFolderId && openedFolder && (
            <button onClick={goBackToFolders} style={backButtonStyle}>
              {openedFolderDepth === 0 ? "Back: All Folders" : "Back: Parent Folder"}
            </button>
          )}

          {isAdmin && (
            <>
              {!showAddFolder && (
                <button
                  onClick={() => setShowAddFolder(true)}
                  className="study-action-btn"
                  style={mainButtonStyle}
                >
                  {t.addFolder}
                </button>
              )}

              {showAddFolder && (
                <section className="study-panel" style={panelStyle}>
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
                    <button onClick={() => void createFolder()} style={smallBlueButtonStyle}>
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
                className="study-folder"
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
                      <button onClick={() => void saveRenameFolder()} style={smallBlueButtonStyle}>
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
                        onClick={() => void saveBackgroundChange()}
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

      {activePass === "simple" && openedFolderId && openedFolder && openedFolderDepth >= finalFolderDepth && (
        <>
          <button onClick={goBackToFolders} style={backButtonStyle}>
            Back: Parent Folder
          </button>

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

          {activeTab === "notes" && (
            <>
              {isAdmin && (
                <section className="study-panel" style={panelStyle}>
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
                    className="study-action-btn"
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
                  <article
                    key={item.id}
                    className="study-resource"
                    style={resourceCardStyle}
                  >
                    <h3 style={resourceTitleStyle}>{item.title}</h3>
                    <p style={resourceSubTextStyle}>{item.fileName}</p>

                    <div style={buttonRowStyle}>
                      <a
                        href={item.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={smallLinkButtonStyle}
                      >
                        {t.viewPdf}
                      </a>

                      <a
                        href={item.dataUrl}
                        download={item.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ ...smallGreenButtonStyle, textDecoration: "none" }}
                      >
                        Download
                      </a>

                      {isAdmin && (
                        <button
                          type="button"
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
                <section className="study-panel" style={panelStyle}>
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

                  <button
                    onClick={() => void addVideo()}
                    className="study-action-btn"
                    style={mainButtonStyle}
                  >
                    {t.saveVideo}
                  </button>
                </section>
              )}

              {currentVideos.length === 0 && (
                <section style={emptyBoxStyle}>{t.noVideo}</section>
              )}

              <section style={resourceGridStyle}>
                {currentVideos.map((item) => (
                  <article
                    key={item.id}
                    className="study-resource"
                    style={resourceCardStyle}
                  >
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
                            onClick={() => void toggleVideoVisibility(item.id)}
                            style={smallGreenButtonStyle}
                          >
                            {item.visible ? t.hidden : t.visible}
                          </button>

                          <button
                            onClick={() => void deleteVideo(item.id)}
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
    </main>
  );
}

export default function StudyMaterialsPage() {
  return (
    <Suspense fallback={<main style={loadingStyle}>Loading Study Materials...</main>}>
      <StudyMaterialsContent />
    </Suspense>
  );
}

function getFolderBackground(folder: FolderType) {
  if (folder.backgroundImage) {
    return `linear-gradient(135deg, rgba(15,23,42,0.30), rgba(124,58,237,0.45)), url(${folder.backgroundImage}) center/cover no-repeat`;
  }

  return `linear-gradient(135deg, ${
    folder.backgroundColor || "#7c3aed"
  }, #2563eb, #14b8a6)`;
}

function getFolderAndChildIds(folders: FolderType[], folderId: string) {
  const ids = new Set<string>([folderId]);
  let changed = true;

  while (changed) {
    changed = false;

    folders.forEach((folder) => {
      if (!ids.has(folder.id) && ids.has(folder.parentId || "")) {
        ids.add(folder.id);
        changed = true;
      }
    });
  }

  return ids;
}

function getFolderDepth(folders: FolderType[], folderId: string) {
  let depth = 0;
  let current = folders.find((folder) => folder.id === folderId);
  const visited = new Set<string>();

  while (current?.parentId) {
    if (visited.has(current.id)) break;
    visited.add(current.id);
    depth += 1;
    current = folders.find((folder) => folder.id === current?.parentId);
  }

  return depth;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const studyCss = `
  .study-page {
    position: relative;
    overflow-x: hidden;
    isolation: isolate;
  }

  .study-bg-grid {
    position: fixed;
    inset: 0;
    z-index: -5;
    background:
      linear-gradient(120deg, rgba(124,58,237,0.08) 0 2px, transparent 2px 76px),
      linear-gradient(60deg, rgba(37,99,235,0.07) 0 2px, transparent 2px 90px),
      linear-gradient(30deg, rgba(20,184,166,0.06) 0 2px, transparent 2px 104px);
    background-size: 112px 112px;
    animation: studyGridMove 12s linear infinite;
    pointer-events: none;
  }

  .study-orb-one {
    position: fixed;
    width: 280px;
    height: 280px;
    right: -100px;
    top: 120px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(124,58,237,0.16);
    z-index: -4;
    animation: studyOrbOne 7s ease-in-out infinite;
  }

  .study-orb-two {
    position: fixed;
    width: 260px;
    height: 260px;
    left: -100px;
    bottom: 130px;
    border-radius: 50%;
    filter: blur(30px);
    background: rgba(14,165,233,0.14);
    z-index: -4;
    animation: studyOrbTwo 8s ease-in-out infinite;
  }

  .study-hero,
  .study-folder,
  .study-resource,
  .study-panel {
    transform-style: preserve-3d;
  }

  .study-hero {
    position: relative;
    overflow: hidden;
    animation: studyHeroFloat 5s ease-in-out infinite;
  }

  .study-hero::before,
  .study-folder::before,
  .study-resource::before,
  .study-panel::before {
    content: "";
    position: absolute;
    inset: -2px;
    background:
      radial-gradient(circle at 18% 20%, rgba(255,255,255,0.58), transparent 28%),
      linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: studyShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  .study-hero::after,
  .study-folder::after,
  .study-resource::after {
    content: "";
    position: absolute;
    inset: 13px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.45);
    pointer-events: none;
  }

  .study-action-btn {
    position: relative;
    overflow: hidden;
    animation: studyButtonPulse 2.8s ease-in-out infinite;
  }

  .study-action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    left: -130%;
    background: linear-gradient(120deg, transparent, rgba(255,255,255,0.65), transparent);
    animation: studyButtonShine 3.6s ease-in-out infinite;
    pointer-events: none;
  }

  .study-folder,
  .study-resource {
    position: relative;
    overflow: visible;
    animation: studyCardEnter 0.55s ease both, studyCardFloat 4.3s ease-in-out infinite;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .study-panel {
    overflow: hidden;
  }

  .study-folder:hover,
  .study-resource:hover {
    transform: translateY(-8px) rotateX(5deg);
    box-shadow: 0 24px 44px rgba(124,58,237,0.16);
  }

  @keyframes studyGridMove {
    from { background-position: 0 0; }
    to { background-position: 112px 112px; }
  }

  @keyframes studyOrbOne {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(-28px,24px) scale(1.14); }
  }

  @keyframes studyOrbTwo {
    0%, 100% { transform: translate(0,0) scale(1); }
    50% { transform: translate(26px,-24px) scale(1.14); }
  }

  @keyframes studyHeroFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-7px) rotateX(2deg); }
  }

  @keyframes studyShine {
    0% { transform: translateX(-65%); opacity: 0.7; }
    50% { opacity: 1; }
    100% { transform: translateX(65%); opacity: 0.7; }
  }

  @keyframes studyCardEnter {
    from { opacity: 0; transform: translateY(24px) rotateX(14deg) scale(0.96); }
    to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
  }

  @keyframes studyCardFloat {
    0%, 100% { transform: translateY(0) rotateX(0deg); }
    50% { transform: translateY(-5px) rotateX(2deg); }
  }

  @keyframes studyButtonPulse {
    0%, 100% { transform: translateY(0); box-shadow: 0 14px 28px rgba(124,58,237,0.18); }
    50% { transform: translateY(-4px); box-shadow: 0 22px 36px rgba(14,165,233,0.22); }
  }

  @keyframes studyButtonShine {
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
  background: "#f5f3ff",
  color: "#7c3aed",
  fontSize: "22px",
  fontWeight: "bold",
};

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg,#ffffff 0%,#f5f3ff 45%,#eff6ff 100%)",
  padding: "20px",
  paddingBottom: "105px",
};

const backLinkStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  display: "inline-block",
  color: "#7c3aed",
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
    "linear-gradient(135deg, rgba(124,58,237,0.92), rgba(37,99,235,0.82), rgba(20,184,166,0.72))",
  color: "white",
  boxShadow:
    "0 24px 55px rgba(124,58,237,0.18), inset 0 0 30px rgba(255,255,255,0.18)",
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
  color: "#7c3aed",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(124,58,237,0.08)",
};

const activeTabStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg,#7c3aed,#2563eb,#14b8a6)",
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
  background: "linear-gradient(135deg,#7c3aed,#2563eb,#14b8a6)",
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
  border: "1px solid rgba(124,58,237,0.12)",
  boxShadow: "0 18px 36px rgba(124,58,237,0.10)",
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
  border: "1px solid rgba(124,58,237,0.20)",
  background: "white",
  color: "#1e3a8a",
  fontSize: "15px",
};

const colorInputStyle: CSSProperties = {
  width: "90px",
  height: "46px",
  marginTop: "8px",
  borderRadius: "12px",
  border: "1px solid rgba(124,58,237,0.20)",
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
  border: "1px solid rgba(124,58,237,0.12)",
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
  boxShadow: "0 22px 44px rgba(124,58,237,0.14)",
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
  background: "#7c3aed",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionTitleStyle: CSSProperties = {
  color: "#7c3aed",
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
  border: "1px solid rgba(124,58,237,0.12)",
  boxShadow: "0 18px 36px rgba(124,58,237,0.10)",
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
const silverPassStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg,#ffffff,#e5e7eb,#94a3b8)",
  color: "#0f172a",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow:
    "0 18px 34px rgba(148,163,184,0.28), inset 0 0 24px rgba(255,255,255,0.65)",
};

const silverPassActiveStyle: CSSProperties = {
  ...silverPassStyle,
  background: "linear-gradient(135deg,#f8fafc,#cbd5e1,#64748b)",
  color: "#0f172a",
  boxShadow:
    "0 22px 42px rgba(100,116,139,0.35), inset 0 0 28px rgba(255,255,255,0.75)",
};

const goldenPassStyle: CSSProperties = {
  ...tabButtonStyle,
  background: "linear-gradient(135deg,#fff7ed,#fde68a,#f59e0b,#b45309)",
  color: "#3b2500",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow:
    "0 18px 34px rgba(245,158,11,0.28), inset 0 0 24px rgba(255,255,255,0.55)",
};

const goldenPassActiveStyle: CSSProperties = {
  ...goldenPassStyle,
  background: "linear-gradient(135deg,#fff7ed,#facc15,#f59e0b,#92400e)",
  color: "#2f1a00",
  boxShadow:
    "0 24px 46px rgba(245,158,11,0.40), inset 0 0 30px rgba(255,255,255,0.65)",
};

const premiumPassPanelStyle: CSSProperties = {
  position: "relative",
  zIndex: 3,
  marginTop: "18px",
  padding: "22px",
  borderRadius: "26px",
  background:
    "linear-gradient(135deg,#fff7ed,#fef3c7,#f59e0b,#92400e)",
  color: "#3b2500",
  boxShadow:
    "0 24px 50px rgba(245,158,11,0.28), inset 0 0 30px rgba(255,255,255,0.45)",
  border: "1px solid rgba(255,255,255,0.65)",
  overflow: "hidden",
};

const premiumCrownStyle: CSSProperties = {
  fontSize: "42px",
  marginBottom: "10px",
};

const premiumTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: "8px",
  color: "#3b2500",
  fontSize: "26px",
  fontWeight: "900",
};

const premiumTextStyle: CSSProperties = {
  color: "#4b2e00",
  lineHeight: 1.6,
  fontWeight: "800",
};
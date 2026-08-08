"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LANGUAGE_STORAGE_KEY } from "@/lib/appLanguages";

type Lang = "en" | "hi" | "bn";

const dictionary: Record<Exclude<Lang, "en">, Record<string, string>> = {
  hi: {
    "Back to Home": "होम पर वापस जाएं",
    "Back to Settings": "सेटिंग्स पर वापस जाएं",
    "Back to Folders": "फोल्डर पर वापस जाएं",
    "Back to Job Folders": "जॉब फोल्डर पर वापस जाएं",
    "Back to Subjects": "सब्जेक्ट पर वापस जाएं",
    "Back to Sets": "सेट पर वापस जाएं",

    Settings: "सेटिंग्स",
    "Account Details": "अकाउंट डिटेल्स",
    "Student Name": "स्टूडेंट नाम",
    "Email Address": "ईमेल एड्रेस",
    "Phone Number": "फोन नंबर",
    "Account Type": "अकाउंट टाइप",
    Admin: "एडमिन",
    Student: "स्टूडेंट",
    "Student / User": "स्टूडेंट / यूजर",
    "Not available": "उपलब्ध नहीं",
    "Account Actions": "अकाउंट एक्शन",
    "Sign Out": "साइन आउट",

    "Learning Preferences": "लर्निंग प्रेफरेंस",
    "Target Exam": "टार्गेट एग्जाम",
    "App Language": "ऐप भाषा",
    English: "English",
    Hindi: "हिन्दी",
    Bengali: "বাংলা",

    "Notification Center": "नोटिफिकेशन सेंटर",
    "Add Notification": "नोटिफिकेशन जोड़ें",
    "Send Notification": "नोटिफिकेशन भेजें",
    "Latest Notifications": "लेटेस्ट नोटिफिकेशन",
    "No notifications yet.": "अभी कोई नोटिफिकेशन नहीं है।",
    Title: "टाइटल",
    Message: "मैसेज",
    Delete: "डिलीट",

    "Previous Year Question Paper": "पिछले वर्ष के प्रश्नपत्र",
    "Open Previous Year Papers": "पिछले वर्ष के पेपर खोलें",
    "Paper Folders": "पेपर फोल्डर",
    "Add Paper Folder": "पेपर फोल्डर जोड़ें",
    "Add Previous Year Paper": "पिछले वर्ष का पेपर जोड़ें",
    "Add Question Paper": "प्रश्नपत्र जोड़ें",
    "Question Papers": "प्रश्नपत्र",
    "Upload PDF": "PDF अपलोड करें",
    "Open": "खोलें",
    "Download": "डाउनलोड",

    "Chat 24x7 Support": "चैट 24x7 सपोर्ट",
    "Open Chat 24x7 Support": "चैट 24x7 सपोर्ट खोलें",
    "AI Support Chat": "AI सपोर्ट चैट",
    "Ask anything in any language.": "किसी भी भाषा में कुछ भी पूछें।",
    "Personal chat": "पर्सनल चैट",
    Clear: "क्लियर",
    Send: "भेजें",
    "AI typing...": "AI लिख रहा है...",
    Important: "जरूरी",
    "Contact Support": "कॉन्टैक्ट सपोर्ट",
    "Write your message": "अपना मैसेज लिखें",
    "Send Message": "मैसेज भेजें",
    "Admin Support Inbox": "एडमिन सपोर्ट इनबॉक्स",
    "My Support Messages": "मेरे सपोर्ट मैसेज",
    Reply: "रिप्लाई",
    "Save Reply": "रिप्लाई सेव करें",
    "No support messages.": "अभी कोई सपोर्ट मैसेज नहीं है।",

    Home: "होम",
    "Mock Test": "मॉक टेस्ट",
    "Job Details": "जॉब डिटेल्स",
    "Live Classes": "लाइव क्लासेस",
    "Study Materials": "स्टडी मटेरियल्स",
    "Study Materials & Notes": "स्टडी मटेरियल्स और नोट्स",
    "Daily Current Affairs & Updates": "डेली करेंट अफेयर्स और अपडेट्स",
    "Paid Courses": "पेड कोर्सेस",
    "Coming Soon": "जल्द आ रहा है",
    "Current Affairs": "करेंट अफेयर्स",

    "Mock Test Folders": "मॉक टेस्ट फोल्डर",
    "Add Mock Test Folder": "मॉक टेस्ट फोल्डर जोड़ें",
    "Mock Test Folder": "मॉक टेस्ट फोल्डर",
    "Choose Subject": "सब्जेक्ट चुनें",
    "General Knowledge": "जनरल नॉलेज",
    Mathematics: "मैथेमेटिक्स",
    Reasoning: "रीजनिंग",
    "Add Mock Test Set": "मॉक टेस्ट सेट जोड़ें",
    "Create General Knowledge Mock Test Set": "जनरल नॉलेज मॉक टेस्ट सेट बनाएं",
    "Create Mathematics Mock Test Set": "मैथेमेटिक्स मॉक टेस्ट सेट बनाएं",
    "Create Reasoning Mock Test Set": "रीजनिंग मॉक टेस्ट सेट बनाएं",
    "Add Questions": "प्रश्न जोड़ें",
    "Correct Answer tick karo:": "सही उत्तर टिक करें:",
    "Add This Question": "यह प्रश्न जोड़ें",
    "Save Full Mock Test Set": "पूरा मॉक टेस्ट सेट सेव करें",
    "Start Mock Test": "मॉक टेस्ट शुरू करें",
    "Test Completed": "टेस्ट पूरा हुआ",
    "Your Score": "आपका स्कोर",
    "Answer Review": "उत्तर रिव्यू",
    "Your Answer": "आपका उत्तर",
    "Correct Answer": "सही उत्तर",
    "Back to Mock Test": "मॉक टेस्ट पर वापस जाएं",
    "Next Question": "अगला प्रश्न",
    "Submit Test": "टेस्ट सबमिट करें",

    "Job Folders": "जॉब फोल्डर",
    "Add Job Folder": "जॉब फोल्डर जोड़ें",
    "Add Job Details": "जॉब डिटेल्स जोड़ें",
    "Job Information": "जॉब जानकारी",
    "Uploaded PDFs": "अपलोड किए गए PDF",
    "Add Custom Information": "कस्टम जानकारी जोड़ें",
    "Add This Information": "यह जानकारी जोड़ें",
    "Save Full Job Information": "पूरी जॉब जानकारी सेव करें",
    "Delete Info": "जानकारी डिलीट करें",
    "PDF": "PDF",

    "Live Class Folders": "लाइव क्लास फोल्डर",
    "Add Live Class Folder": "लाइव क्लास फोल्डर जोड़ें",
    "Live Classes Folder": "लाइव क्लास फोल्डर",
    "Recorded Classes": "रिकॉर्डेड क्लासेस",
    "Add Live Class": "लाइव क्लास जोड़ें",
    "Add Recorded Class": "रिकॉर्डेड क्लास जोड़ें",
    "Open on YouTube": "YouTube पर खोलें",
    Visible: "दिख रहा है",
    Hidden: "छिपा हुआ",

    "Add Folder": "फोल्डर जोड़ें",
    "Save Folder": "फोल्डर सेव करें",
    "Edit Folder": "फोल्डर एडिट करें",
    "Folder name": "फोल्डर नाम",
    "Folder name likho": "फोल्डर नाम लिखें",
    "Background Color": "बैकग्राउंड कलर",
    "Background Photo": "बैकग्राउंड फोटो",
    "Change Background Photo": "बैकग्राउंड फोटो बदलें",
    "Remove Selected Photo": "चुनी हुई फोटो हटाएं",
    "Remove Background Photo": "बैकग्राउंड फोटो हटाएं",
    "Save Changes": "बदलाव सेव करें",
    Cancel: "कैंसल",
    "Rename / Background": "नाम बदलें / बैकग्राउंड",
    "Tap to open folder →": "फोल्डर खोलने के लिए टैप करें →",
    "Abhi koi folder add nahi hua.": "अभी कोई फोल्डर जोड़ा नहीं गया।",
    "Abhi koi PDF add nahi hua.": "अभी कोई PDF जोड़ा नहीं गया।",
    "Abhi koi paper add nahi hua.": "अभी कोई पेपर जोड़ा नहीं गया।",
    "Abhi koi class add nahi hua.": "अभी कोई क्लास जोड़ी नहीं गई।",
    "Loading...": "लोड हो रहा है...",
    Search: "सर्च",
    Logout: "लॉगआउट",
  },

  bn: {
    "Back to Home": "হোমে ফিরে যান",
    "Back to Settings": "সেটিংসে ফিরে যান",
    "Back to Folders": "ফোল্ডারে ফিরে যান",
    "Back to Job Folders": "জব ফোল্ডারে ফিরে যান",
    "Back to Subjects": "বিষয়ে ফিরে যান",
    "Back to Sets": "সেটে ফিরে যান",

    Settings: "সেটিংস",
    "Account Details": "অ্যাকাউন্ট ডিটেইলস",
    "Student Name": "স্টুডেন্টের নাম",
    "Email Address": "ইমেল অ্যাড্রেস",
    "Phone Number": "ফোন নম্বর",
    "Account Type": "অ্যাকাউন্ট টাইপ",
    Admin: "অ্যাডমিন",
    Student: "স্টুডেন্ট",
    "Student / User": "স্টুডেন্ট / ইউজার",
    "Not available": "পাওয়া যায়নি",
    "Account Actions": "অ্যাকাউন্ট অ্যাকশন",
    "Sign Out": "সাইন আউট",

    "Learning Preferences": "লার্নিং পছন্দ",
    "Target Exam": "টার্গেট পরীক্ষা",
    "App Language": "অ্যাপ ভাষা",
    English: "English",
    Hindi: "हिन्दी",
    Bengali: "বাংলা",

    "Notification Center": "নোটিফিকেশন সেন্টার",
    "Add Notification": "নোটিফিকেশন যোগ করুন",
    "Send Notification": "নোটিফিকেশন পাঠান",
    "Latest Notifications": "সর্বশেষ নোটিফিকেশন",
    "No notifications yet.": "এখনো কোনো নোটিফিকেশন নেই।",
    Title: "টাইটেল",
    Message: "মেসেজ",
    Delete: "ডিলিট",

    "Previous Year Question Paper": "প্রিভিয়াস ইয়ার প্রশ্নপত্র",
    "Open Previous Year Papers": "প্রিভিয়াস ইয়ার পেপার খুলুন",
    "Paper Folders": "পেপার ফোল্ডার",
    "Add Paper Folder": "পেপার ফোল্ডার যোগ করুন",
    "Add Previous Year Paper": "প্রিভিয়াস ইয়ার পেপার যোগ করুন",
    "Add Question Paper": "প্রশ্নপত্র যোগ করুন",
    "Question Papers": "প্রশ্নপত্র",
    "Upload PDF": "PDF আপলোড করুন",
    Open: "খুলুন",
    Download: "ডাউনলোড",

    "Chat 24x7 Support": "চ্যাট ২৪x৭ সাপোর্ট",
    "Open Chat 24x7 Support": "চ্যাট ২৪x৭ সাপোর্ট খুলুন",
    "AI Support Chat": "AI সাপোর্ট চ্যাট",
    "Ask anything in any language.": "যেকোনো ভাষায় যেকোনো প্রশ্ন করুন।",
    "Personal chat": "পার্সোনাল চ্যাট",
    Clear: "ক্লিয়ার",
    Send: "পাঠান",
    "AI typing...": "AI লিখছে...",
    Important: "গুরুত্বপূর্ণ",
    "Contact Support": "কন্টাক্ট সাপোর্ট",
    "Write your message": "আপনার মেসেজ লিখুন",
    "Send Message": "মেসেজ পাঠান",
    "Admin Support Inbox": "অ্যাডমিন সাপোর্ট ইনবক্স",
    "My Support Messages": "আমার সাপোর্ট মেসেজ",
    Reply: "রিপ্লাই",
    "Save Reply": "রিপ্লাই সেভ করুন",
    "No support messages.": "এখনো কোনো সাপোর্ট মেসেজ নেই।",

    Home: "হোম",
    "Mock Test": "মক টেস্ট",
    "Job Details": "জব ডিটেইলস",
    "Live Classes": "লাইভ ক্লাস",
    "Study Materials": "স্টাডি মেটেরিয়ালস",
    "Study Materials & Notes": "স্টাডি মেটেরিয়ালস এবং নোটস",
    "Daily Current Affairs & Updates": "ডেইলি কারেন্ট অ্যাফেয়ার্স এবং আপডেট",
    "Paid Courses": "পেইড কোর্স",
    "Coming Soon": "শীঘ্রই আসছে",
    "Current Affairs": "কারেন্ট অ্যাফেয়ার্স",

    "Mock Test Folders": "মক টেস্ট ফোল্ডার",
    "Add Mock Test Folder": "মক টেস্ট ফোল্ডার যোগ করুন",
    "Mock Test Folder": "মক টেস্ট ফোল্ডার",
    "Choose Subject": "বিষয় নির্বাচন করুন",
    "General Knowledge": "জেনারেল নলেজ",
    Mathematics: "গণিত",
    Reasoning: "রিজনিং",
    "Add Mock Test Set": "মক টেস্ট সেট যোগ করুন",
    "Create General Knowledge Mock Test Set": "জেনারেল নলেজ মক টেস্ট সেট তৈরি করুন",
    "Create Mathematics Mock Test Set": "গণিত মক টেস্ট সেট তৈরি করুন",
    "Create Reasoning Mock Test Set": "রিজনিং মক টেস্ট সেট তৈরি করুন",
    "Add Questions": "প্রশ্ন যোগ করুন",
    "Correct Answer tick karo:": "সঠিক উত্তর টিক করুন:",
    "Add This Question": "এই প্রশ্ন যোগ করুন",
    "Save Full Mock Test Set": "সম্পূর্ণ মক টেস্ট সেট সেভ করুন",
    "Start Mock Test": "মক টেস্ট শুরু করুন",
    "Test Completed": "টেস্ট সম্পন্ন হয়েছে",
    "Your Score": "আপনার স্কোর",
    "Answer Review": "উত্তর রিভিউ",
    "Your Answer": "আপনার উত্তর",
    "Correct Answer": "সঠিক উত্তর",
    "Back to Mock Test": "মক টেস্টে ফিরে যান",
    "Next Question": "পরের প্রশ্ন",
    "Submit Test": "টেস্ট জমা দিন",

    "Job Folders": "জব ফোল্ডার",
    "Add Job Folder": "জব ফোল্ডার যোগ করুন",
    "Add Job Details": "জব ডিটেইলস যোগ করুন",
    "Job Information": "জব তথ্য",
    "Uploaded PDFs": "আপলোড করা PDF",
    "Add Custom Information": "কাস্টম তথ্য যোগ করুন",
    "Add This Information": "এই তথ্য যোগ করুন",
    "Save Full Job Information": "সম্পূর্ণ জব তথ্য সেভ করুন",
    "Delete Info": "তথ্য ডিলিট করুন",
    PDF: "PDF",

    "Live Class Folders": "লাইভ ক্লাস ফোল্ডার",
    "Add Live Class Folder": "লাইভ ক্লাস ফোল্ডার যোগ করুন",
    "Live Classes Folder": "লাইভ ক্লাস ফোল্ডার",
    "Recorded Classes": "রেকর্ডেড ক্লাস",
    "Add Live Class": "লাইভ ক্লাস যোগ করুন",
    "Add Recorded Class": "রেকর্ডেড ক্লাস যোগ করুন",
    "Open on YouTube": "YouTube-এ খুলুন",
    Visible: "দেখানো হচ্ছে",
    Hidden: "লুকানো",

    "Add Folder": "ফোল্ডার যোগ করুন",
    "Save Folder": "ফোল্ডার সেভ করুন",
    "Edit Folder": "ফোল্ডার এডিট করুন",
    "Folder name": "ফোল্ডারের নাম",
    "Folder name likho": "ফোল্ডারের নাম লিখুন",
    "Background Color": "ব্যাকগ্রাউন্ড কালার",
    "Background Photo": "ব্যাকগ্রাউন্ড ফটো",
    "Change Background Photo": "ব্যাকগ্রাউন্ড ফটো পরিবর্তন করুন",
    "Remove Selected Photo": "নির্বাচিত ফটো সরান",
    "Remove Background Photo": "ব্যাকগ্রাউন্ড ফটো সরান",
    "Save Changes": "পরিবর্তন সেভ করুন",
    Cancel: "ক্যানসেল",
    "Rename / Background": "নাম বদল / ব্যাকগ্রাউন্ড",
    "Tap to open folder →": "ফোল্ডার খুলতে ট্যাপ করুন →",
    "Abhi koi folder add nahi hua.": "এখনো কোনো ফোল্ডার যোগ হয়নি।",
    "Abhi koi PDF add nahi hua.": "এখনো কোনো PDF যোগ হয়নি।",
    "Abhi koi paper add nahi hua.": "এখনো কোনো পেপার যোগ হয়নি।",
    "Abhi koi class add nahi hua.": "এখনো কোনো ক্লাস যোগ হয়নি।",
    "Loading...": "লোড হচ্ছে...",
    Search: "সার্চ",
    Logout: "লগআউট",
  },
};

export default function SiteTranslator() {
  const pathname = usePathname();

  const [language, setLanguage] = useState<Lang>("en");
  const originalTextRef = useRef<WeakMap<Text, string>>(new WeakMap());

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;
    setLanguage(saved || "en");

    const changeLanguage = () => {
      const newLanguage = (localStorage.getItem(LANGUAGE_STORAGE_KEY) ||
        "en") as Lang;

      setLanguage(newLanguage);
    };

    window.addEventListener("app-language-change", changeLanguage);
    window.addEventListener("storage", changeLanguage);

    return () => {
      window.removeEventListener("app-language-change", changeLanguage);
      window.removeEventListener("storage", changeLanguage);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      translatePage(language);
    }, 250);

    return () => clearTimeout(timer);
  }, [language, pathname]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      translatePage(language);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const translatePage = (targetLanguage: Lang) => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;

          if (!parent) return NodeFilter.FILTER_REJECT;
          if (shouldBlock(parent)) return NodeFilter.FILTER_REJECT;

          const text = node.nodeValue || "";

          if (!text.trim()) return NodeFilter.FILTER_REJECT;

          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes: Text[] = [];
    let current = walker.nextNode();

    while (current) {
      textNodes.push(current as Text);
      current = walker.nextNode();
    }

    textNodes.forEach((node) => {
      const original = getOriginalText(node);

      if (targetLanguage === "en") {
        node.nodeValue = original;
        return;
      }

      node.nodeValue = translateText(original, targetLanguage);
    });

    translateAttributes(targetLanguage);
  };

  const getOriginalText = (node: Text) => {
    const saved = originalTextRef.current.get(node);

    if (saved !== undefined) return saved;

    const current = node.nodeValue || "";
    originalTextRef.current.set(node, current);

    return current;
  };

  const translateAttributes = (targetLanguage: Lang) => {
    const elements = document.querySelectorAll<HTMLElement>(
      "[placeholder], [title], [aria-label]"
    );

    elements.forEach((element) => {
      if (shouldBlock(element)) return;

      ["placeholder", "title", "aria-label"].forEach((attribute) => {
        const current = element.getAttribute(attribute);

        if (!current) return;

        const dataKey = `original${attribute.replace("-", "")}`;
        const original = element.dataset[dataKey] || current;
        element.dataset[dataKey] = original;

        if (targetLanguage === "en") {
          element.setAttribute(attribute, original);
        } else {
          element.setAttribute(
            attribute,
            translateText(original, targetLanguage)
          );
        }
      });
    });
  };

  return null;
}

function translateText(text: string, language: Lang) {
  if (language === "en") return text;

  const dict = dictionary[language];
  const leading = text.match(/^\s*/)?.[0] || "";
  const trailing = text.match(/\s*$/)?.[0] || "";
  const clean = text.trim();

  if (dict[clean]) {
    return `${leading}${dict[clean]}${trailing}`;
  }

  let translated = clean;

  Object.keys(dict)
    .sort((a, b) => b.length - a.length)
    .forEach((key) => {
      translated = translated.replaceAll(key, dict[key]);
    });

  return `${leading}${translated}${trailing}`;
}

function shouldBlock(element: HTMLElement) {
  const blockedTags = [
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "CODE",
    "PRE",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "OPTION",
  ];

  let current: HTMLElement | null = element;

  while (current) {
    if (blockedTags.includes(current.tagName)) return true;
    if (current.dataset.noTranslate === "true") return true;

    current = current.parentElement;
  }

  return false;
}
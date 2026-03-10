"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Full Tanzil revelation order (114 surahs, traditional order from Ibn Abbas)
const REVELATION_ORDER = [
  {o:1,s:96,ar:"العلق",en:"Al-Alaq",t:"مكية",v:19,note:""},
  {o:2,s:68,ar:"القلم",en:"Al-Qalam",t:"مكية",v:52,note:"إلا 17-33 و48-50 مدنية"},
  {o:3,s:73,ar:"المزمل",en:"Al-Muzzammil",t:"مكية",v:20,note:"إلا 10،11،20 مدنية"},
  {o:4,s:74,ar:"المدثر",en:"Al-Muddaththir",t:"مكية",v:56,note:""},
  {o:5,s:1,ar:"الفاتحة",en:"Al-Fatiha",t:"مكية",v:7,note:""},
  {o:6,s:111,ar:"المسد",en:"Al-Masad",t:"مكية",v:5,note:""},
  {o:7,s:81,ar:"التكوير",en:"At-Takwir",t:"مكية",v:29,note:""},
  {o:8,s:87,ar:"الأعلى",en:"Al-A'la",t:"مكية",v:19,note:""},
  {o:9,s:92,ar:"الليل",en:"Al-Lail",t:"مكية",v:21,note:""},
  {o:10,s:89,ar:"الفجر",en:"Al-Fajr",t:"مكية",v:30,note:""},
  {o:11,s:93,ar:"الضحى",en:"Ad-Duha",t:"مكية",v:11,note:""},
  {o:12,s:94,ar:"الشرح",en:"Ash-Sharh",t:"مكية",v:8,note:""},
  {o:13,s:103,ar:"العصر",en:"Al-Asr",t:"مكية",v:3,note:""},
  {o:14,s:100,ar:"العاديات",en:"Al-Adiyat",t:"مكية",v:11,note:""},
  {o:15,s:108,ar:"الكوثر",en:"Al-Kawthar",t:"مكية",v:3,note:""},
  {o:16,s:102,ar:"التكاثر",en:"At-Takathur",t:"مكية",v:8,note:""},
  {o:17,s:107,ar:"الماعون",en:"Al-Ma'un",t:"مكية",v:7,note:"1-3 مكية والباقي مدنية"},
  {o:18,s:109,ar:"الكافرون",en:"Al-Kafirun",t:"مكية",v:6,note:""},
  {o:19,s:105,ar:"الفيل",en:"Al-Fil",t:"مكية",v:5,note:""},
  {o:20,s:113,ar:"الفلق",en:"Al-Falaq",t:"مكية",v:5,note:""},
  {o:21,s:114,ar:"الناس",en:"An-Nas",t:"مكية",v:6,note:""},
  {o:22,s:112,ar:"الإخلاص",en:"Al-Ikhlas",t:"مكية",v:4,note:""},
  {o:23,s:53,ar:"النجم",en:"An-Najm",t:"مكية",v:62,note:"إلا 32 مدنية"},
  {o:24,s:80,ar:"عبس",en:"Abasa",t:"مكية",v:42,note:""},
  {o:25,s:97,ar:"القدر",en:"Al-Qadr",t:"مكية",v:5,note:""},
  {o:26,s:91,ar:"الشمس",en:"Ash-Shams",t:"مكية",v:15,note:""},
  {o:27,s:85,ar:"البروج",en:"Al-Buruj",t:"مكية",v:22,note:""},
  {o:28,s:95,ar:"التين",en:"At-Tin",t:"مكية",v:8,note:""},
  {o:29,s:106,ar:"قريش",en:"Quraysh",t:"مكية",v:4,note:""},
  {o:30,s:101,ar:"القارعة",en:"Al-Qari'a",t:"مكية",v:11,note:""},
  {o:31,s:75,ar:"القيامة",en:"Al-Qiyama",t:"مكية",v:40,note:""},
  {o:32,s:104,ar:"الهمزة",en:"Al-Humaza",t:"مكية",v:9,note:""},
  {o:33,s:77,ar:"المرسلات",en:"Al-Mursalat",t:"مكية",v:50,note:"إلا 48 مدنية"},
  {o:34,s:50,ar:"ق",en:"Qaf",t:"مكية",v:45,note:"إلا 38 مدنية"},
  {o:35,s:90,ar:"البلد",en:"Al-Balad",t:"مكية",v:20,note:""},
  {o:36,s:86,ar:"الطارق",en:"At-Tariq",t:"مكية",v:17,note:""},
  {o:37,s:54,ar:"القمر",en:"Al-Qamar",t:"مكية",v:55,note:"إلا 44-46 مدنية"},
  {o:38,s:38,ar:"ص",en:"Sad",t:"مكية",v:88,note:""},
  {o:39,s:7,ar:"الأعراف",en:"Al-A'raf",t:"مكية",v:206,note:"إلا 163-170 مدنية"},
  {o:40,s:72,ar:"الجن",en:"Al-Jinn",t:"مكية",v:28,note:""},
  {o:41,s:36,ar:"يس",en:"Ya-Sin",t:"مكية",v:83,note:"إلا 45 مدنية"},
  {o:42,s:25,ar:"الفرقان",en:"Al-Furqan",t:"مكية",v:77,note:"إلا 68-70 مدنية"},
  {o:43,s:35,ar:"فاطر",en:"Fatir",t:"مكية",v:45,note:""},
  {o:44,s:19,ar:"مريم",en:"Maryam",t:"مكية",v:98,note:"إلا 58،71 مدنية"},
  {o:45,s:20,ar:"طه",en:"Ta-Ha",t:"مكية",v:135,note:"إلا 130،131 مدنية"},
  {o:46,s:56,ar:"الواقعة",en:"Al-Waqi'a",t:"مكية",v:96,note:"إلا 81،82 مدنية"},
  {o:47,s:26,ar:"الشعراء",en:"Ash-Shu'ara",t:"مكية",v:227,note:"إلا 197،224-227 مدنية"},
  {o:48,s:27,ar:"النمل",en:"An-Naml",t:"مكية",v:93,note:""},
  {o:49,s:28,ar:"القصص",en:"Al-Qasas",t:"مكية",v:88,note:"إلا 52-55 مدنية"},
  {o:50,s:17,ar:"الإسراء",en:"Al-Isra",t:"مكية",v:111,note:"إلا 26،32،33،57،73-80 مدنية"},
  {o:51,s:10,ar:"يونس",en:"Yunus",t:"مكية",v:109,note:"إلا 40،94-96 مدنية"},
  {o:52,s:11,ar:"هود",en:"Hud",t:"مكية",v:123,note:"إلا 12،17،114 مدنية"},
  {o:53,s:12,ar:"يوسف",en:"Yusuf",t:"مكية",v:111,note:"إلا 1-3،7 مدنية"},
  {o:54,s:15,ar:"الحجر",en:"Al-Hijr",t:"مكية",v:99,note:"إلا 87 مدنية"},
  {o:55,s:6,ar:"الأنعام",en:"Al-An'am",t:"مكية",v:165,note:"إلا 20،23،91،93،114،151-153 مدنية"},
  {o:56,s:37,ar:"الصافات",en:"As-Saffat",t:"مكية",v:182,note:""},
  {o:57,s:31,ar:"لقمان",en:"Luqman",t:"مكية",v:34,note:"إلا 27-29 مدنية"},
  {o:58,s:34,ar:"سبأ",en:"Saba",t:"مكية",v:54,note:""},
  {o:59,s:39,ar:"الزمر",en:"Az-Zumar",t:"مكية",v:75,note:""},
  {o:60,s:40,ar:"غافر",en:"Ghafir",t:"مكية",v:85,note:"إلا 56،57 مدنية"},
  {o:61,s:41,ar:"فصلت",en:"Fussilat",t:"مكية",v:54,note:""},
  {o:62,s:42,ar:"الشورى",en:"Ash-Shura",t:"مكية",v:53,note:"إلا 23-25،27 مدنية"},
  {o:63,s:43,ar:"الزخرف",en:"Az-Zukhruf",t:"مكية",v:89,note:"إلا 54 مدنية"},
  {o:64,s:44,ar:"الدخان",en:"Ad-Dukhan",t:"مكية",v:59,note:""},
  {o:65,s:45,ar:"الجاثية",en:"Al-Jathiya",t:"مكية",v:37,note:"إلا 14 مدنية"},
  {o:66,s:46,ar:"الأحقاف",en:"Al-Ahqaf",t:"مكية",v:35,note:"إلا 10،15،35 مدنية"},
  {o:67,s:51,ar:"الذاريات",en:"Adh-Dhariyat",t:"مكية",v:60,note:""},
  {o:68,s:88,ar:"الغاشية",en:"Al-Ghashiya",t:"مكية",v:26,note:""},
  {o:69,s:18,ar:"الكهف",en:"Al-Kahf",t:"مكية",v:110,note:"إلا 28،83-101 مدنية"},
  {o:70,s:16,ar:"النحل",en:"An-Nahl",t:"مكية",v:128,note:"إلا آخر 3 آيات مدنية"},
  {o:71,s:71,ar:"نوح",en:"Nuh",t:"مكية",v:28,note:""},
  {o:72,s:14,ar:"إبراهيم",en:"Ibrahim",t:"مكية",v:52,note:"إلا 28،29 مدنية"},
  {o:73,s:21,ar:"الأنبياء",en:"Al-Anbiya",t:"مكية",v:112,note:""},
  {o:74,s:23,ar:"المؤمنون",en:"Al-Mu'minun",t:"مكية",v:118,note:""},
  {o:75,s:32,ar:"السجدة",en:"As-Sajda",t:"مكية",v:30,note:"إلا 16-20 مدنية"},
  {o:76,s:52,ar:"الطور",en:"At-Tur",t:"مكية",v:49,note:""},
  {o:77,s:67,ar:"الملك",en:"Al-Mulk",t:"مكية",v:30,note:""},
  {o:78,s:69,ar:"الحاقة",en:"Al-Haqqah",t:"مكية",v:52,note:""},
  {o:79,s:70,ar:"المعارج",en:"Al-Ma'arij",t:"مكية",v:44,note:""},
  {o:80,s:78,ar:"النبأ",en:"An-Naba",t:"مكية",v:40,note:""},
  {o:81,s:79,ar:"النازعات",en:"An-Nazi'at",t:"مكية",v:46,note:""},
  {o:82,s:82,ar:"الانفطار",en:"Al-Infitar",t:"مكية",v:19,note:""},
  {o:83,s:84,ar:"الانشقاق",en:"Al-Inshiqaq",t:"مكية",v:25,note:""},
  {o:84,s:30,ar:"الروم",en:"Ar-Rum",t:"مكية",v:60,note:"إلا 17 مدنية"},
  {o:85,s:29,ar:"العنكبوت",en:"Al-Ankabut",t:"مكية",v:69,note:"إلا 1-11 مدنية"},
  {o:86,s:83,ar:"المطففين",en:"Al-Mutaffifin",t:"مكية",v:36,note:""},
  // ─── MADINAN ───
  {o:87,s:2,ar:"البقرة",en:"Al-Baqara",t:"مدنية",v:286,note:""},
  {o:88,s:8,ar:"الأنفال",en:"Al-Anfal",t:"مدنية",v:75,note:"إلا 30-36 مكية"},
  {o:89,s:3,ar:"آل عمران",en:"Aal-Imran",t:"مدنية",v:200,note:""},
  {o:90,s:33,ar:"الأحزاب",en:"Al-Ahzab",t:"مدنية",v:73,note:""},
  {o:91,s:60,ar:"الممتحنة",en:"Al-Mumtahana",t:"مدنية",v:13,note:""},
  {o:92,s:4,ar:"النساء",en:"An-Nisa",t:"مدنية",v:176,note:""},
  {o:93,s:99,ar:"الزلزلة",en:"Az-Zalzala",t:"مدنية",v:8,note:""},
  {o:94,s:57,ar:"الحديد",en:"Al-Hadid",t:"مدنية",v:29,note:""},
  {o:95,s:47,ar:"محمد",en:"Muhammad",t:"مدنية",v:38,note:""},
  {o:96,s:13,ar:"الرعد",en:"Ar-Ra'd",t:"مدنية",v:43,note:""},
  {o:97,s:55,ar:"الرحمن",en:"Ar-Rahman",t:"مدنية",v:78,note:""},
  {o:98,s:76,ar:"الإنسان",en:"Al-Insan",t:"مدنية",v:31,note:""},
  {o:99,s:65,ar:"الطلاق",en:"At-Talaq",t:"مدنية",v:12,note:""},
  {o:100,s:98,ar:"البينة",en:"Al-Bayyina",t:"مدنية",v:8,note:""},
  {o:101,s:59,ar:"الحشر",en:"Al-Hashr",t:"مدنية",v:24,note:""},
  {o:102,s:24,ar:"النور",en:"An-Nur",t:"مدنية",v:64,note:""},
  {o:103,s:22,ar:"الحج",en:"Al-Hajj",t:"مدنية",v:78,note:""},
  {o:104,s:63,ar:"المنافقون",en:"Al-Munafiqun",t:"مدنية",v:11,note:""},
  {o:105,s:58,ar:"المجادلة",en:"Al-Mujadila",t:"مدنية",v:22,note:""},
  {o:106,s:49,ar:"الحجرات",en:"Al-Hujurat",t:"مدنية",v:18,note:""},
  {o:107,s:66,ar:"التحريم",en:"At-Tahrim",t:"مدنية",v:12,note:""},
  {o:108,s:64,ar:"التغابن",en:"At-Taghabun",t:"مدنية",v:18,note:""},
  {o:109,s:61,ar:"الصف",en:"As-Saf",t:"مدنية",v:14,note:""},
  {o:110,s:62,ar:"الجمعة",en:"Al-Jumu'a",t:"مدنية",v:11,note:""},
  {o:111,s:48,ar:"الفتح",en:"Al-Fath",t:"مدنية",v:29,note:""},
  {o:112,s:5,ar:"المائدة",en:"Al-Ma'ida",t:"مدنية",v:120,note:""},
  {o:113,s:9,ar:"التوبة",en:"At-Tawba",t:"مدنية",v:129,note:""},
  {o:114,s:110,ar:"النصر",en:"An-Nasr",t:"مدنية",v:3,note:"آخر سورة نزلت كاملة"},
];

// Seerah period each surah belongs to
function getPeriod(order: number): string {
  if (order <= 4)  return "بداية الوحي";
  if (order <= 20) return "المكي الأول";
  if (order <= 50) return "المكي الأوسط";
  if (order <= 86) return "المكي الأخير";
  if (order <= 92) return "مدني مبكر";
  if (order <= 110) return "مدني";
  return "مدني أخير";
}

const PERIOD_COLORS: Record<string, string> = {
  "بداية الوحي":  "#c9a84c",
  "المكي الأول":  "#d4913a",
  "المكي الأوسط": "#b8762a",
  "المكي الأخير": "#8a6040",
  "مدني مبكر":    "#2a9d8f",
  "مدني":          "#2a6090",
  "مدني أخير":    "#1a4a7a",
};

type ViewMode = "timeline" | "grid" | "compare";
type Filter = "all" | "مكية" | "مدنية";

function SurahCard({ surah, mode }: { surah: typeof REVELATION_ORDER[0]; mode: ViewMode }) {
  const [open, setOpen] = useState(false);
  const period = getPeriod(surah.o);
  const color = PERIOD_COLORS[period] ?? "#c9a84c";
  const isMakki = surah.t === "مكية";

  if (mode === "timeline") {
    return (
      <div className="tl-item" onClick={() => setOpen(!open)}
        style={{ "--c": color } as React.CSSProperties}>
        <div className="tl-dot" style={{ background: color }}/>
        <div className={`tl-card ${open ? "open" : ""}`}>
          <div className="tl-top">
            <div className="tl-order">#{surah.o}</div>
            <div className="tl-name-ar">{surah.ar}</div>
            <div className="tl-name-en">{surah.en}</div>
            <div className="tl-badges">
              <span className={`tl-type ${isMakki ? "makki" : "madani"}`}>{surah.t}</span>
              <span className="tl-ayahs">{surah.v} آية</span>
              <span className="tl-surah-num">سورة {surah.s}</span>
            </div>
          </div>
          {open && surah.note && (
            <div className="tl-note">⚠ {surah.note}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid-card" style={{ "--c": color } as React.CSSProperties}
      onClick={() => setOpen(!open)}>
      <div className="gc-order">#{surah.o}</div>
      <div className="gc-name">{surah.ar}</div>
      <div className="gc-en">{surah.en}</div>
      <div className="gc-meta">
        <span className={`gc-type ${isMakki ? "makki" : "madani"}`}>{surah.t}</span>
        <span className="gc-v">{surah.v}v</span>
      </div>
      {open && surah.note && <div className="tl-note">⚠ {surah.note}</div>}
    </div>
  );
}

function CompareView() {
  // Side by side: mushaf order vs revelation order
  const mushafsOrder = [...REVELATION_ORDER].sort((a, b) => a.s - b.s);
  return (
    <div className="compare-wrap">
      <div className="compare-col">
        <div className="compare-header makki-header">ترتيب المصحف (1→114)</div>
        <div className="compare-list">
          {mushafsOrder.map(s => (
            <div key={s.s} className="cmp-row">
              <span className="cmp-surah-num">{s.s}</span>
              <span className="cmp-name">{s.ar}</span>
              <span className="cmp-arrow" style={{ color: PERIOD_COLORS[getPeriod(s.o)] }}>→ #{s.o}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="compare-col">
        <div className="compare-header madani-header">ترتيب النزول (1→114)</div>
        <div className="compare-list">
          {REVELATION_ORDER.map(s => (
            <div key={s.o} className="cmp-row">
              <span className="cmp-surah-num" style={{ color: PERIOD_COLORS[getPeriod(s.o)] }}>#{s.o}</span>
              <span className="cmp-name">{s.ar}</span>
              <span className="cmp-arrow">← سورة {s.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuranPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let d = REVELATION_ORDER;
    if (filter !== "all") d = d.filter(s => s.t === filter);
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(s => s.ar.includes(search) || s.en.toLowerCase().includes(q));
    }
    return d;
  }, [filter, search]);

  const makki = REVELATION_ORDER.filter(s => s.t === "مكية").length;
  const madani = REVELATION_ORDER.filter(s => s.t === "مدنية").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #c9a84c; --bg0: #04070d; --bg1: #070c14;
          --text: #d8c8a0; --text2: #a89870; --text3: #6a5e48;
          --border: rgba(201,168,76,0.15); --radius: 10px;
        }
        html, body { background: var(--bg0); color: var(--text); min-height: 100vh;
          font-family: 'Cormorant Garamond', serif; direction: rtl; }

        .nav { position: sticky; top: 0; z-index: 50; background: rgba(4,7,13,0.95);
          backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
          padding: 0.8rem 2rem; display: flex; align-items: center; gap: 1.5rem; }
        .nav-brand { font-family: 'Scheherazade New', serif; font-size: 1.2rem; color: var(--gold); }
        .nav-links { display: flex; gap: 0.8rem; margin-right: auto; }
        .nav-link { font-family: 'Amiri', serif; font-size: 0.9rem; color: var(--text2);
          text-decoration: none; padding: 0.3rem 0.8rem; border-radius: 16px;
          border: 1px solid transparent; transition: all 0.2s; }
        .nav-link:hover { border-color: var(--border); color: var(--gold); }
        .nav-link.active { background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.3); color: var(--gold); }

        .shell { max-width: 1300px; margin: 0 auto; padding: 2rem 2rem 4rem; }
        .page-title { font-family: 'Scheherazade New', serif; font-size: 2rem; color: var(--gold);
          text-align: center; margin-bottom: 0.3rem; }
        .page-sub { font-family: 'Amiri', serif; color: var(--text3); text-align: center;
          font-size: 0.9rem; margin-bottom: 0.5rem; }
        .source-note { font-family: 'Cormorant Garamond', serif; font-style: italic;
          color: var(--text3); font-size: 0.8rem; text-align: center; margin-bottom: 1.5rem;
          direction: ltr; }

        /* STATS */
        .stats-row { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
          margin-bottom: 1.5rem; }
        .stat-pill { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 1.2rem;
          border-radius: 20px; font-family: 'Amiri', serif; font-size: 0.9rem; }
        .stat-pill.total { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25); color: var(--gold); }
        .stat-pill.makki-pill { background: rgba(201,168,76,0.07); border: 1px solid rgba(201,168,76,0.2); color: #d4913a; }
        .stat-pill.madani-pill { background: rgba(42,96,144,0.1); border: 1px solid rgba(42,96,144,0.25); color: #4a90c0; }
        .stat-n { font-family: 'Cinzel Decorative', serif; font-size: 1rem; font-weight: 700; }

        /* PROGRESS BAR */
        .progress-bar { height: 6px; border-radius: 3px; background: var(--border);
          overflow: hidden; margin-bottom: 1.5rem; }
        .progress-fill-makki { height: 100%; background: linear-gradient(to left, #d4913a, #c9a84c);
          transition: width 0.5s; }

        /* CONTROLS */
        .controls { display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center;
          margin-bottom: 1.5rem; }
        .ctrl-btn { font-family: 'Amiri', serif; font-size: 0.85rem; padding: 0.35rem 1rem;
          border-radius: 20px; border: 1px solid var(--border); background: transparent;
          color: var(--text2); cursor: pointer; transition: all 0.2s; display: flex;
          align-items: center; gap: 0.4rem; }
        .ctrl-btn.on { background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.4); color: var(--gold); }
        .ctrl-btn.makki-on { background: rgba(201,168,76,0.1); border-color: #d4913a; color: #d4913a; }
        .ctrl-btn.madani-on { background: rgba(42,96,144,0.1); border-color: #4a90c0; color: #4a90c0; }
        .search-ctrl { font-family: 'Amiri', serif; font-size: 0.9rem; padding: 0.35rem 1rem;
          border-radius: 20px; border: 1px solid var(--border); background: rgba(201,168,76,0.04);
          color: var(--text); outline: none; margin-right: auto; transition: border-color 0.2s; }
        .search-ctrl:focus { border-color: rgba(201,168,76,0.4); }
        .search-ctrl::placeholder { color: var(--text3); }

        /* PERIOD LEGEND */
        .period-legend { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
        .legend-item { display: flex; align-items: center; gap: 0.4rem;
          font-family: 'Amiri', serif; font-size: 0.8rem; color: var(--text3); }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; }

        /* TIMELINE VIEW */
        .timeline-view { position: relative; padding-right: 2rem; }
        .tl-spine { position: absolute; right: 8px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, transparent, rgba(201,168,76,0.3) 5%, rgba(201,168,76,0.3) 95%, transparent); }
        .tl-item { display: flex; gap: 1rem; align-items: flex-start; padding: 0.4rem 0;
          cursor: pointer; }
        .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          margin-top: 0.45rem; box-shadow: 0 0 8px currentColor; transition: transform 0.2s; }
        .tl-item:hover .tl-dot { transform: scale(1.5); }
        .tl-card { flex: 1; padding: 0.6rem 1rem; border-radius: var(--radius);
          border: 1px solid transparent; border-right: 2px solid var(--c, #c9a84c);
          transition: all 0.2s; background: rgba(201,168,76,0.02); }
        .tl-card:hover, .tl-card.open { background: rgba(201,168,76,0.06);
          border-color: rgba(201,168,76,0.25); border-right-color: var(--c, #c9a84c); }
        .tl-top { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
        .tl-order { font-family: 'Cinzel Decorative', serif; font-size: 0.62rem; color: var(--text3);
          min-width: 28px; }
        .tl-name-ar { font-family: 'Scheherazade New', serif; font-size: 1rem; color: var(--text); }
        .tl-name-en { font-family: 'Cormorant Garamond', serif; font-size: 0.8rem; color: var(--text3);
          font-style: italic; direction: ltr; }
        .tl-badges { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-right: auto; }
        .tl-note { font-family: 'Amiri', serif; font-size: 0.8rem; color: var(--text3);
          margin-top: 0.5rem; padding: 0.4rem 0.8rem; background: rgba(201,168,76,0.06);
          border-radius: 6px; }
        .tl-ayahs { font-family: 'Cinzel Decorative', serif; font-size: 0.6rem; color: var(--text3); }
        .tl-surah-num { font-family: 'Amiri', serif; font-size: 0.75rem; color: var(--text3); }

        /* GRID VIEW */
        .grid-view { display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.6rem; }
        .grid-card { border-radius: var(--radius); border: 1px solid var(--border);
          border-top: 3px solid var(--c, #c9a84c); padding: 0.8rem;
          background: rgba(201,168,76,0.02); cursor: pointer; transition: all 0.2s; }
        .grid-card:hover { background: rgba(201,168,76,0.06); }
        .gc-order { font-family: 'Cinzel Decorative', serif; font-size: 0.6rem; color: var(--text3); margin-bottom: 0.3rem; }
        .gc-name { font-family: 'Scheherazade New', serif; font-size: 1rem; color: var(--text);
          margin-bottom: 0.1rem; }
        .gc-en { font-family: 'Cormorant Garamond', serif; font-size: 0.72rem; color: var(--text3);
          font-style: italic; direction: ltr; margin-bottom: 0.5rem; }
        .gc-meta { display: flex; gap: 0.4rem; align-items: center; }
        .gc-v { font-family: 'Cinzel Decorative', serif; font-size: 0.6rem; color: var(--text3); direction: ltr; }

        /* TYPE BADGES */
        .makki { background: rgba(212,145,58,0.15); color: #d4913a;
          border: 1px solid rgba(212,145,58,0.3); font-family: 'Amiri', serif;
          font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 8px; }
        .madani { background: rgba(42,96,144,0.15); color: #4a90c0;
          border: 1px solid rgba(42,96,144,0.3); font-family: 'Amiri', serif;
          font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 8px; }

        /* COMPARE VIEW */
        .compare-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .compare-col { background: rgba(201,168,76,0.03); border: 1px solid var(--border);
          border-radius: 12px; overflow: hidden; }
        .compare-header { padding: 0.8rem 1rem; font-family: 'Scheherazade New', serif;
          font-size: 1rem; font-weight: 600; border-bottom: 1px solid var(--border); }
        .makki-header { color: #d4913a; background: rgba(212,145,58,0.07); }
        .madani-header { color: #4a90c0; background: rgba(42,96,144,0.07); }
        .compare-list { height: 60vh; overflow-y: auto; padding: 0.5rem;
          scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
        .cmp-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.6rem;
          border-radius: 6px; transition: background 0.15s; cursor: default; }
        .cmp-row:hover { background: rgba(201,168,76,0.05); }
        .cmp-surah-num { font-family: 'Cinzel Decorative', serif; font-size: 0.6rem;
          color: var(--gold); min-width: 28px; }
        .cmp-name { font-family: 'Scheherazade New', serif; font-size: 0.9rem; color: var(--text); flex: 1; }
        .cmp-arrow { font-family: 'Cormorant Garamond', serif; font-size: 0.75rem;
          color: var(--text3); font-style: italic; direction: ltr; white-space: nowrap; }

        /* RESULT COUNT */
        .result-count { font-family: 'Amiri', serif; font-size: 0.85rem; color: var(--text3);
          margin-bottom: 0.8rem; }

        @media (max-width: 768px) {
          .shell { padding: 1rem 1rem 3rem; }
          .compare-wrap { grid-template-columns: 1fr; }
          .grid-view { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-brand">محرك السيرة المعرفي</div>
        <div className="nav-links">
          <Link href="/" className="nav-link">🕌 السيرة</Link>
          <Link href="/hadith" className="nav-link">☽ الحديث</Link>
          <Link href="/quran" className="nav-link active">﴿ ترتيب النزول</Link>
        </div>
      </nav>

      <div className="shell">
        <h1 className="page-title">القرآن بترتيب النزول</h1>
        <p className="page-sub">ترتيب النزول التقليدي المستخرج من رواية ابن عباس رضي الله عنهما</p>
        <p className="source-note">المصدر: تاريخ القرآن للعلامة الزنجاني — موقع تنزيل (tanzil.net)</p>

        {/* STATS */}
        <div className="stats-row">
          <div className="stat-pill total">
            <span className="stat-n">114</span> سورة كاملة
          </div>
          <div className="stat-pill makki-pill">
            <span className="stat-n">{makki}</span> مكية
          </div>
          <div className="stat-pill madani-pill">
            <span className="stat-n">{madani}</span> مدنية
          </div>
        </div>

        {/* PROGRESS */}
        <div className="progress-bar">
          <div className="progress-fill-makki" style={{ width: `${(makki / 114) * 100}%` }}/>
        </div>

        {/* PERIOD LEGEND */}
        <div className="period-legend">
          {Object.entries(PERIOD_COLORS).map(([p, c]) => (
            <div key={p} className="legend-item">
              <div className="legend-dot" style={{ background: c }}/>
              {p}
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div className="controls">
          <button className={`ctrl-btn ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>الكل</button>
          <button className={`ctrl-btn ${filter === "مكية" ? "makki-on" : ""}`} onClick={() => setFilter("مكية")}>مكية فقط</button>
          <button className={`ctrl-btn ${filter === "مدنية" ? "madani-on" : ""}`} onClick={() => setFilter("مدنية")}>مدنية فقط</button>
          <div style={{ width: 1, height: 20, background: "var(--border)" }}/>
          <button className={`ctrl-btn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")}>⊞ شبكة</button>
          <button className={`ctrl-btn ${view === "timeline" ? "on" : ""}`} onClick={() => setView("timeline")}>≡ خط زمني</button>
          <button className={`ctrl-btn ${view === "compare" ? "on" : ""}`} onClick={() => setView("compare")}>⇄ مقارنة</button>
          {view !== "compare" && (
            <input className="search-ctrl" placeholder="ابحث عن سورة..."
              value={search} onChange={e => setSearch(e.target.value)} dir="rtl"/>
          )}
        </div>

        {view !== "compare" && (
          <div className="result-count">{filtered.length} سورة</div>
        )}

        {/* CONTENT */}
        {view === "compare" ? (
          <CompareView />
        ) : view === "timeline" ? (
          <div className="timeline-view">
            <div className="tl-spine"/>
            {filtered.map(s => (
              <SurahCard key={s.o} surah={s} mode="timeline" />
            ))}
          </div>
        ) : (
          <div className="grid-view">
            {filtered.map(s => (
              <SurahCard key={s.o} surah={s} mode="grid" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

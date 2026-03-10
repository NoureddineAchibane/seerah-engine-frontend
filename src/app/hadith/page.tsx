"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const BOOKS: Record<string, { ar: string; en: string; color: string }> = {
  bukhari:  { ar: "صحيح البخاري",  en: "Sahih al-Bukhari",  color: "#c9a84c" },
  muslim:   { ar: "صحيح مسلم",    en: "Sahih Muslim",       color: "#2a9d8f" },
  abudawud: { ar: "سنن أبي داود", en: "Sunan Abi Dawud",    color: "#7a6aac" },
  tirmidhi: { ar: "جامع الترمذي", en: "Jami' at-Tirmidhi",  color: "#c0624a" },
  nasai:    { ar: "سنن النسائي",  en: "Sunan an-Nasa'i",    color: "#3a8a5a" },
  ibnmajah: { ar: "سنن ابن ماجه", en: "Sunan Ibn Majah",    color: "#8a6a3a" },
};

const TOPICS: { cat: string; icon: string; chips: string[] }[] = [
  { cat: "عبادة",    icon: "🕌", chips: ["صلاة","زكاة","صوم","حج","وضوء","رمضان","قيام الليل"] },
  { cat: "أخلاق",   icon: "✨", chips: ["صدق","أمانة","صبر","شكر","رحمة","تواضع","عفو"] },
  { cat: "معاملات", icon: "⚖️", chips: ["بيع","نكاح","طلاق","ميراث","تجارة"] },
  { cat: "عقيدة",   icon: "🌙", chips: ["توحيد","إيمان","قدر","جنة","نار","يوم القيامة"] },
  { cat: "السيرة",  icon: "📜", chips: ["النبي","صحابة","هجرة","غزوة","بدر","فتح مكة"] },
  { cat: "الأسرة",  icon: "👨‍👩‍👧", chips: ["أم","أب","أولاد","جار","صلة الرحم","زوجة"] },
  { cat: "علم",     icon: "📚", chips: ["علم","فقه","حديث","تفسير","طلب العلم"] },
];

interface Hadith {
  id: number;
  book_id: string;
  book_name_ar: string;
  book_name_en: string;
  arabic: string;
  english: { narrator: string; text: string };
}

// ─── Animated background particles ───────────────────────────────────────────
function Orbs() {
  return (
    <div className="orbs-wrap" aria-hidden>
      {[0,1,2,3].map(i => <div key={i} className={`orb orb-${i}`} />)}
    </div>
  );
}

// ─── Star field ───────────────────────────────────────────────────────────────
function StarField() {
  const [stars, setStars] = useState<{id:number;x:number;y:number;s:number;d:number;dur:number}[]>([]);
  useEffect(() => {
    setStars(Array.from({length:80},(_,i)=>({
      id:i, x:Math.random()*100, y:Math.random()*100,
      s:Math.random()*1.8+0.3, d:Math.random()*6, dur:Math.random()*4+2,
    })));
  },[]);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map(s=>(
        <div key={s.id} className="star-dot" style={{
          left:`${s.x}%`,top:`${s.y}%`,width:s.s,height:s.s,
          animationDelay:`${s.d}s`,animationDuration:`${s.dur}s`,
        }}/>
      ))}
    </div>
  );
}

// ─── Hadith card ──────────────────────────────────────────────────────────────
function HadithCard({ h, index }: { h: Hadith; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const color = BOOKS[h.book_id]?.color ?? "#c9a84c";

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const shortAr = h.arabic.length > 280 ? h.arabic.slice(0,280)+"…" : h.arabic;
  const shortEn = h.english.text.length > 200 ? h.english.text.slice(0,200)+"…" : h.english.text;

  return (
    <div ref={ref} className={`hcard ${visible?"hcard-in":""}`}
      style={{ "--c": color, "--delay": `${Math.min(index * 0.05, 0.4)}s` } as React.CSSProperties}
      onClick={() => setExpanded(e => !e)}>
      {/* Left accent bar */}
      <div className="hcard-bar" style={{ background: color }} />
      <div className="hcard-inner">
        <div className="hcard-top">
          <span className="hcard-badge" style={{ background: color+"1a", borderColor: color+"55", color }}>
            {h.book_name_ar}
          </span>
          <span className="hcard-num" style={{ color: color+"99" }}>#{h.id}</span>
        </div>
        <p className="hcard-arabic">{expanded ? h.arabic : shortAr}</p>
        {h.english.narrator && <p className="hcard-narrator">{h.english.narrator}</p>}
        <p className="hcard-english">{expanded ? h.english.text : shortEn}</p>
        <div className="hcard-footer">
          <span className="hcard-toggle" style={{ color }}>
            {expanded ? "▲ أقل" : "▼ المزيد"}
          </span>
          <span className="hcard-source">{h.book_name_en}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Random hadith widget ─────────────────────────────────────────────────────
function RandomHadith() {
  const [h, setH]           = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(false);
  const [book, setBook]     = useState("bukhari");
  const [error, setError]   = useState("");
  const [animKey, setAnimKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/hadith/random?book=${book}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setH(data); setAnimKey(k => k+1);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  }, [book]);

  useEffect(() => { load(); }, [book]);

  const color = BOOKS[book]?.color ?? "#c9a84c";

  return (
    <div className="rnd-wrap" style={{ "--rc": color } as React.CSSProperties}>
      <div className="rnd-header">
        <div className="rnd-title-group">
          <span className="rnd-moon">☽</span>
          <span className="rnd-title">حديث اليوم</span>
        </div>
        <div className="rnd-controls">
          <select className="rnd-select" value={book} onChange={e => setBook(e.target.value)}>
            {Object.entries(BOOKS).map(([id, b]) => <option key={id} value={id}>{b.ar}</option>)}
          </select>
          <button className="rnd-btn" onClick={load} disabled={loading}
            style={{ color, borderColor: color+"44" }}>
            {loading ? <span className="spin-anim">↻</span> : "↻"}
          </button>
        </div>
      </div>
      {error && <div className="rnd-error">⚠ {error}</div>}
      {loading && !h && <div className="rnd-loading">جارٍ التحميل…</div>}
      {h && !error && (
        <div key={animKey} className="rnd-body rnd-fadein">
          <p className="rnd-arabic">{h.arabic}</p>
          {h.english.narrator && <p className="rnd-narrator">{h.english.narrator}</p>}
          <p className="rnd-english">{h.english.text}</p>
          <div className="rnd-source" style={{ borderColor: color+"33" }}>
            <span style={{ color }}>{h.book_name_ar}</span>
            <span className="rnd-sep">·</span>
            <span>#{h.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cache status bar ─────────────────────────────────────────────────────────
function CacheBar({ status }: { status: Record<string,number> }) {
  const total = Object.keys(BOOKS).length;
  const loaded = Object.values(status).filter(Boolean).length;
  return (
    <div className="cache-wrap">
      <div className="cache-pills">
        {Object.entries(BOOKS).map(([id, b]) => (
          <span key={id} className={`cache-pill ${status[id] ? "ready" : ""}`}
            style={{ "--bc": b.color } as React.CSSProperties}>
            <span className="cache-dot" />
            {b.ar}
          </span>
        ))}
      </div>
      <span className="cache-count">{loaded}/{total} محمّل</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HadithPage() {
  const [query,        setQuery]        = useState("");
  const [activeTopic,  setActiveTopic]  = useState<string|null>(null);
  const [selectedBook, setSelectedBook] = useState("all");
  const [results,      setResults]      = useState<Hadith[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [hasSearched,  setHasSearched]  = useState(false);
  const [error,        setError]        = useState("");
  const [cacheStatus,  setCacheStatus]  = useState<Record<string,number>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/hadith/warmup`).then(r=>r.json()).then(d=>{
      if (d.loaded) setCacheStatus(d.loaded);
    }).catch(()=>{});
  }, []);

  // Core search — always takes current book from param, not state (avoids stale closure)
  const doSearch = useCallback(async (q: string, book: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]); setHasSearched(false); setError(""); setActiveTopic(null);
      return;
    }
    setLoading(true); setHasSearched(true); setError("");
    try {
      const bookParam = book !== "all" ? `&book=${book}` : "";
      const res  = await fetch(`${API}/hadith/search?q=${encodeURIComponent(trimmed)}${bookParam}&limit=40`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.cached_books) {
        setCacheStatus(data.cached_books.reduce((a:any,b:string)=>({...a,[b]:1}),{}));
      }
      setResults(data.results ?? []);
      // Scroll to results smoothly
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: any) {
      setError(e.message); setResults([]);
    }
    setLoading(false);
  }, []);

  // Typing in the search box
  const handleQuery = (v: string) => {
    setQuery(v);
    setActiveTopic(null);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => doSearch(v, selectedBook), 500);
  };

  // ✅ FIX: topic click — set query AND immediately fire search with current book
  const handleTopic = (t: string) => {
    setQuery(t);
    setActiveTopic(t);
    clearTimeout(timer.current);
    // Call doSearch directly with current selectedBook (no stale state issue)
    doSearch(t, selectedBook);
  };

  // Book filter — re-run current query with new book
  const handleBook = (b: string) => {
    setSelectedBook(b);
    if (query.trim().length >= 2) doSearch(query, b);
  };

  // Clear search
  const clearSearch = () => {
    setQuery(""); setActiveTopic(null); setResults([]);
    setHasSearched(false); setError("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --gold:#c9a84c;--gold2:#e8c86a;
          --bg0:#04070d;--bg1:#070c14;--bg2:#0c1220;
          --text:#d8c8a0;--text2:#a89870;--text3:#6a5e48;
          --border:rgba(201,168,76,0.15);--radius:14px;
        }
        html,body{background:var(--bg0);color:var(--text);min-height:100vh;font-family:'Cormorant Garamond',serif;direction:rtl;overflow-x:hidden;}

        /* ── Stars ── */
        .star-dot{position:absolute;border-radius:50%;background:white;
          animation:twinkle var(--dur,3s) var(--del,0s) ease-in-out infinite alternate;}
        @keyframes twinkle{from{opacity:0.05;transform:scale(0.5);}to{opacity:0.9;transform:scale(1.4);}}

        /* ── Floating orbs ── */
        .orbs-wrap{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:0;}
        .orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.06;}
        .orb-0{width:600px;height:600px;background:#c9a84c;top:-20%;right:-15%;animation:orbDrift0 18s ease-in-out infinite alternate;}
        .orb-1{width:400px;height:400px;background:#2a9d8f;bottom:10%;left:-10%;animation:orbDrift1 22s ease-in-out infinite alternate;}
        .orb-2{width:300px;height:300px;background:#7a6aac;top:40%;left:40%;animation:orbDrift2 15s ease-in-out infinite alternate;}
        .orb-3{width:500px;height:500px;background:#c0624a;bottom:-20%;right:20%;animation:orbDrift3 25s ease-in-out infinite alternate;}
        @keyframes orbDrift0{from{transform:translate(0,0) scale(1);}to{transform:translate(-80px,60px) scale(1.2);}}
        @keyframes orbDrift1{from{transform:translate(0,0) scale(1);}to{transform:translate(60px,-80px) scale(0.9);}}
        @keyframes orbDrift2{from{transform:translate(0,0);}to{transform:translate(-40px,50px);}}
        @keyframes orbDrift3{from{transform:translate(0,0);}to{transform:translate(-60px,-40px);}}

        /* ── Nav ── */
        .nav{position:sticky;top:0;z-index:100;background:rgba(4,7,13,0.93);backdrop-filter:blur(24px);
          border-bottom:1px solid var(--border);padding:0 2rem;display:flex;align-items:center;
          justify-content:space-between;gap:1rem;}
        .nav-inner{max-width:1200px;margin:0 auto;width:100%;display:flex;align-items:center;
          justify-content:space-between;gap:1rem;padding:0.9rem 0;}
        .nav-brand{font-family:'Scheherazade New',serif;font-size:1.3rem;font-weight:700;color:var(--gold);}
        .nav-links{display:flex;align-items:center;gap:0.6rem;}
        .nav-link{font-family:'Amiri',serif;font-size:0.88rem;color:var(--text2);text-decoration:none;
          padding:0.28rem 0.85rem;border-radius:16px;border:1px solid var(--border);transition:all 0.2s;}
        .nav-link:hover{color:var(--gold);border-color:rgba(201,168,76,0.35);}
        .nav-link.active{color:var(--gold);border-color:var(--gold);background:rgba(201,168,76,0.1);}
        .gold-line{position:fixed;top:0;left:0;width:100%;height:1px;
          background:linear-gradient(to right,transparent,#c9a84c,transparent);opacity:0.6;z-index:200;}

        /* ── Shell ── */
        .shell{max-width:900px;margin:0 auto;padding:2rem 1.5rem 6rem;position:relative;z-index:1;}

        /* ── Page header ── */
        .page-header{text-align:center;margin-bottom:2.5rem;animation:fadeDown 0.7s ease both;}
        .page-bismillah{font-family:'Scheherazade New',serif;font-size:1.8rem;color:var(--gold);
          opacity:0.7;margin-bottom:0.5rem;}
        .page-title{font-family:'Cinzel Decorative',serif;font-size:1.25rem;letter-spacing:0.08em;
          color:var(--text);margin-bottom:0.3rem;}
        .page-sub{font-family:'Amiri',serif;font-size:0.9rem;color:var(--text3);}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px);}to{opacity:1;transform:translateY(0);}}

        /* ── Cache bar ── */
        .cache-wrap{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
          gap:0.5rem;margin-bottom:1.5rem;padding:0.6rem 1rem;
          background:rgba(201,168,76,0.03);border:1px solid var(--border);border-radius:12px;}
        .cache-pills{display:flex;flex-wrap:wrap;gap:0.35rem;}
        .cache-pill{font-family:'Amiri',serif;font-size:0.76rem;color:var(--text3);
          display:flex;align-items:center;gap:0.3rem;padding:0.15rem 0.6rem;
          border-radius:10px;border:1px solid rgba(201,168,76,0.1);transition:all 0.4s;}
        .cache-dot{width:6px;height:6px;border-radius:50%;background:var(--text3);flex-shrink:0;transition:all 0.4s;}
        .cache-pill.ready{color:var(--bc,var(--gold));}
        .cache-pill.ready .cache-dot{background:var(--bc,var(--gold));box-shadow:0 0 6px var(--bc,var(--gold));}
        .cache-count{font-family:'Cinzel Decorative',serif;font-size:0.7rem;color:var(--text3);}

        /* ── Random hadith ── */
        .rnd-wrap{background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.18);
          border-top:2px solid var(--rc,var(--gold));
          border-radius:var(--radius);padding:1.3rem 1.5rem;margin-bottom:2rem;
          transition:border-color 0.3s;animation:fadeUp 0.6s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .rnd-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}
        .rnd-title-group{display:flex;align-items:center;gap:0.5rem;}
        .rnd-moon{font-size:1.1rem;animation:moonGlow 3s ease-in-out infinite alternate;}
        @keyframes moonGlow{from{opacity:0.6;filter:drop-shadow(0 0 4px #c9a84c44);}to{opacity:1;filter:drop-shadow(0 0 10px #c9a84c99);}}
        .rnd-title{font-family:'Scheherazade New',serif;font-size:1.05rem;color:var(--gold);}
        .rnd-controls{display:flex;align-items:center;gap:0.5rem;}
        .rnd-select{background:rgba(201,168,76,0.08);border:1px solid var(--border);
          color:var(--text);border-radius:8px;padding:0.3rem 0.6rem;
          font-family:'Amiri',serif;font-size:0.84rem;outline:none;cursor:pointer;}
        .rnd-btn{background:transparent;border:1px solid;border-radius:8px;
          padding:0.3rem 0.8rem;cursor:pointer;font-size:1.1rem;transition:all 0.2s;}
        .rnd-btn:hover{background:rgba(201,168,76,0.12);}
        .rnd-btn:disabled{opacity:0.4;}
        .spin-anim{display:inline-block;animation:spin360 0.8s linear infinite;}
        @keyframes spin360{to{transform:rotate(360deg);}}
        .rnd-fadein{animation:fadeIn 0.45s ease both;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        .rnd-arabic{font-family:'Amiri',serif;font-size:1.05rem;line-height:2.2;color:var(--text);margin-bottom:0.6rem;}
        .rnd-narrator{font-family:'Cormorant Garamond',serif;font-size:0.85rem;color:var(--gold);
          font-style:italic;direction:ltr;text-align:left;margin-bottom:0.3rem;}
        .rnd-english{font-family:'Cormorant Garamond',serif;font-size:0.92rem;color:var(--text2);
          direction:ltr;text-align:left;line-height:1.7;}
        .rnd-source{font-family:'Amiri',serif;font-size:0.78rem;color:var(--text3);
          display:flex;align-items:center;gap:0.5rem;margin-top:0.8rem;
          padding-top:0.6rem;border-top:1px solid;}
        .rnd-sep{opacity:0.4;}
        .rnd-error{font-family:'Amiri',serif;font-size:0.85rem;color:#c06060;
          padding:0.5rem;border-radius:8px;background:rgba(192,96,96,0.08);}
        .rnd-loading{font-family:'Amiri',serif;color:var(--text3);font-size:0.9rem;padding:0.5rem 0;}

        /* ── Search box ── */
        .search-section{position:relative;margin-bottom:1.2rem;animation:fadeUp 0.6s 0.1s ease both;}
        .search-wrap{position:relative;}
        .search-inp{width:100%;background:rgba(201,168,76,0.05);
          border:1.5px solid rgba(201,168,76,0.22);border-radius:18px;
          padding:1rem 3.5rem 1rem 1.4rem;font-family:'Amiri',serif;font-size:1.1rem;
          color:var(--text);outline:none;transition:all 0.3s;direction:rtl;}
        .search-inp:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,0.12),0 4px 20px rgba(0,0,0,0.3);}
        .search-inp::placeholder{color:var(--text3);}
        .search-icon-btn{position:absolute;left:1rem;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;font-size:1rem;color:var(--text3);
          transition:color 0.2s;padding:0;}
        .search-icon-btn:hover{color:var(--gold);}
        .search-active-q{font-family:'Amiri',serif;font-size:0.82rem;color:var(--text3);
          margin-top:0.4rem;display:flex;align-items:center;gap:0.5rem;}
        .clear-btn{background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);
          color:var(--gold);border-radius:8px;padding:0.1rem 0.6rem;cursor:pointer;
          font-family:'Amiri',serif;font-size:0.78rem;transition:all 0.2s;}
        .clear-btn:hover{background:rgba(201,168,76,0.2);}

        /* ── Book filters ── */
        .book-filters{display:flex;flex-wrap:wrap;gap:0.45rem;margin-bottom:1.5rem;animation:fadeUp 0.6s 0.15s ease both;}
        .book-btn{font-family:'Amiri',serif;font-size:0.84rem;padding:0.3rem 1rem;
          border-radius:20px;border:1px solid;cursor:pointer;transition:all 0.2s;background:transparent;}
        .book-btn:hover{transform:translateY(-1px);}

        /* ── Topics ── */
        .topics-section{margin-bottom:2rem;animation:fadeUp 0.6s 0.2s ease both;}
        .topics-header{font-family:'Cinzel Decorative',serif;font-size:0.72rem;
          letter-spacing:0.12em;color:var(--text3);margin-bottom:1rem;
          display:flex;align-items:center;gap:0.7rem;}
        .topics-header::after{content:'';flex:1;height:1px;background:var(--border);}
        .topic-group{margin-bottom:0.9rem;}
        .topic-cat{font-family:'Amiri',serif;font-size:0.8rem;color:var(--text3);
          margin-bottom:0.45rem;display:flex;align-items:center;gap:0.35rem;}
        .topic-chips{display:flex;flex-wrap:wrap;gap:0.35rem;}
        .topic-chip{font-family:'Amiri',serif;font-size:0.88rem;padding:0.28rem 0.9rem;
          border-radius:14px;background:rgba(201,168,76,0.06);
          border:1px solid rgba(201,168,76,0.15);color:var(--text2);
          cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;}
        .topic-chip::before{content:'';position:absolute;inset:0;background:rgba(201,168,76,0.08);
          opacity:0;transition:opacity 0.2s;}
        .topic-chip:hover{border-color:rgba(201,168,76,0.4);color:var(--gold);transform:translateY(-1px);}
        .topic-chip:hover::before{opacity:1;}
        .topic-chip.active{background:rgba(201,168,76,0.15);border-color:var(--gold);
          color:var(--gold);box-shadow:0 0 12px rgba(201,168,76,0.2);}
        .topic-chip:active{transform:scale(0.96);}

        /* ── Results ── */
        .results-section{animation:fadeUp 0.4s ease both;}
        .results-meta{font-family:'Amiri',serif;font-size:0.88rem;color:var(--text3);
          margin-bottom:1.2rem;display:flex;align-items:center;gap:0.5rem;}
        .results-count{font-family:'Cinzel Decorative',serif;font-size:0.85rem;color:var(--gold);}
        .results-grid{display:grid;gap:0.85rem;}
        .loading-msg{text-align:center;padding:3.5rem 2rem;color:var(--text3);font-family:'Amiri',serif;}
        .spin-moon{display:inline-block;animation:spin360 3s linear infinite;font-size:1.8rem;margin-bottom:0.8rem;}
        .empty-msg{text-align:center;padding:2.5rem;color:var(--text3);font-family:'Amiri',serif;font-size:1rem;}
        .error-msg{font-family:'Amiri',serif;font-size:0.85rem;color:#c06060;padding:0.8rem 1rem;
          border-radius:var(--radius);background:rgba(192,96,96,0.07);border:1px solid rgba(192,96,96,0.2);}

        /* ── Hadith card ── */
        .hcard{display:flex;border-radius:var(--radius);overflow:hidden;cursor:pointer;
          border:1px solid var(--border);background:rgba(201,168,76,0.02);
          transition:all 0.25s;
          opacity:0;transform:translateY(16px);}
        .hcard-in{animation:cardIn 0.5s cubic-bezier(0.22,1,0.36,1) var(--delay,0s) both;}
        @keyframes cardIn{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        .hcard:hover{border-color:var(--c,var(--gold));background:rgba(201,168,76,0.05);
          transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.35),0 0 0 1px var(--c,var(--gold))22;}
        .hcard-bar{width:4px;flex-shrink:0;opacity:0.85;}
        .hcard-inner{flex:1;padding:1.1rem 1.3rem;}
        .hcard-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:0.7rem;}
        .hcard-badge{font-family:'Amiri',serif;font-size:0.76rem;font-weight:700;
          padding:0.15rem 0.7rem;border-radius:10px;border:1px solid;}
        .hcard-num{font-family:'Cinzel Decorative',serif;font-size:0.6rem;}
        .hcard-arabic{font-family:'Amiri',serif;line-height:2.2;font-size:1rem;color:var(--text);margin-bottom:0.5rem;}
        .hcard-narrator{font-family:'Cormorant Garamond',serif;font-size:0.84rem;color:var(--gold);
          font-style:italic;direction:ltr;text-align:left;margin-bottom:0.3rem;}
        .hcard-english{font-family:'Cormorant Garamond',serif;font-size:0.9rem;color:var(--text2);
          line-height:1.7;direction:ltr;text-align:left;}
        .hcard-footer{display:flex;justify-content:space-between;align-items:center;
          margin-top:0.7rem;padding-top:0.5rem;border-top:1px solid var(--border);}
        .hcard-toggle{font-family:'Amiri',serif;font-size:0.76rem;}
        .hcard-source{font-family:'Cormorant Garamond',serif;font-size:0.72rem;color:var(--text3);font-style:italic;direction:ltr;}

        /* ── Idle state ── */
        .idle-hint{text-align:center;padding:2.5rem 1rem;color:var(--text3);font-family:'Amiri',serif;font-size:0.95rem;}
        .idle-icon{font-size:2rem;margin-bottom:0.5rem;animation:moonGlow 3s ease-in-out infinite alternate;}

        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

        @media(max-width:768px){.shell{padding:1rem 1rem 4rem;}.nav-inner{gap:0.5rem;}}
      `}</style>

      <StarField />
      <Orbs />
      <div className="gold-line" />

      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">محرك السيرة المعرفي</div>
          <div className="nav-links">
            <Link href="/"       className="nav-link">🕌 السيرة</Link>
            <Link href="/hadith" className="nav-link active">☽ الحديث</Link>
            <Link href="/quran"  className="nav-link">﴿ القرآن</Link>
          </div>
        </div>
      </nav>

      <div className="shell">
        {/* Header */}
        <div className="page-header">
          <div className="page-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
          <h1 className="page-title">Hadith Search Engine</h1>
          <p className="page-sub">الكتب الستة · بحث عربي وإنجليزي · {Object.keys(BOOKS).length} كتب</p>
        </div>

        {/* Cache status */}
        <CacheBar status={cacheStatus} />

        {/* Random hadith */}
        <RandomHadith />

        {/* Search input */}
        <div className="search-section">
          <div className="search-wrap">
            <input className="search-inp"
              placeholder="ابحث بالعربية أو الإنجليزية… مثل: صلاة ، نية ، mercy ، prayer"
              value={query}
              onChange={e => handleQuery(e.target.value)}
              dir="rtl"
            />
            <button className="search-icon-btn" onClick={query ? clearSearch : undefined}>
              {query ? "✕" : "🔍"}
            </button>
          </div>
          {hasSearched && query && (
            <div className="search-active-q">
              <span>نتائج:</span>
              <strong style={{ color: "var(--gold)" }}>{query}</strong>
              <button className="clear-btn" onClick={clearSearch}>✕ مسح</button>
            </div>
          )}
        </div>

        {/* Book filters */}
        <div className="book-filters">
          {[{ id: "all", ar: "الكل", color: "#c9a84c" }, ...Object.entries(BOOKS).map(([id,b])=>({id,ar:b.ar,color:b.color}))].map(b => (
            <button key={b.id} className="book-btn"
              style={{
                borderColor: selectedBook === b.id ? b.color : "rgba(201,168,76,0.15)",
                color:       selectedBook === b.id ? b.color : "#6a5e48",
                background:  selectedBook === b.id ? b.color + "1a" : "transparent",
              }}
              onClick={() => handleBook(b.id)}>
              {b.ar}
            </button>
          ))}
        </div>

        {/* Topics — ALWAYS VISIBLE, active topic highlighted */}
        <div className="topics-section">
          <div className="topics-header">TOPICS · المواضيع</div>
          {TOPICS.map(({ cat, icon, chips }) => (
            <div key={cat} className="topic-group">
              <div className="topic-cat"><span>{icon}</span>{cat}</div>
              <div className="topic-chips">
                {chips.map(t => (
                  <button key={t}
                    className={`topic-chip ${activeTopic === t ? "active" : ""}`}
                    onClick={() => handleTopic(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results area */}
        <div ref={resultsRef}>
          {loading && (
            <div className="loading-msg">
              <div className="spin-moon">☽</div>
              <div>جارٍ البحث في الأحاديث…</div>
            </div>
          )}

          {error && !loading && <div className="error-msg">⚠ {error}</div>}

          {!loading && !error && hasSearched && (
            <div className="results-section">
              <div className="results-meta">
                <span className="results-count">{results.length}</span>
                <span>نتيجة للبحث عن</span>
                <strong style={{ color: "var(--gold)", fontFamily: "'Amiri', serif" }}>"{query}"</strong>
              </div>
              {results.length === 0
                ? <div className="empty-msg">
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🔍</div>
                    لا نتائج — جرّب كلمة أخرى أو اختر كتاباً مختلفاً
                  </div>
                : <div className="results-grid">
                    {results.map((h, i) => (
                      <HadithCard key={`${h.book_id}-${h.id}-${i}`} h={h} index={i} />
                    ))}
                  </div>
              }
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="idle-hint">
              <div className="idle-icon">☽</div>
              <div>ابحث عن حديث أو اختر موضوعاً من القائمة أعلاه</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { SeerahEvent, Periods } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const PERIOD_STYLES: Record<string, { bg: string; glow: string; dot: string; label: string }> = {
  pre_revelation: { bg: "rgba(107,91,69,0.12)",  glow: "#6b5b45", dot: "#a88b6a", label: "قبل البعثة" },
  makki_early:    { bg: "rgba(139,105,20,0.12)",  glow: "#c9a84c", dot: "#c9a84c", label: "المكي الأول" },
  makki_middle:   { bg: "rgba(122,92,46,0.12)",   glow: "#b8842a", dot: "#d4973a", label: "المكي الأوسط" },
  hijra:          { bg: "rgba(42,96,73,0.15)",    glow: "#2a9d8f", dot: "#2a9d8f", label: "الهجرة" },
  madani:         { bg: "rgba(26,74,107,0.15)",   glow: "#2a6090", dot: "#4a90c0", label: "المدني" },
};

function IslamicGeometry() {
  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.035 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="star8" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <polygon points="50,6 58,34 84,25 68,47 92,56 65,64 74,90 50,74 26,90 35,64 8,56 32,47 16,25 42,34"
            fill="none" stroke="#c9a84c" strokeWidth="0.6"/>
          <circle cx="50" cy="50" r="15" fill="none" stroke="#c9a84c" strokeWidth="0.35"/>
          <circle cx="50" cy="50" r="3" fill="#c9a84c" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star8)"/>
    </svg>
  );
}

function StarField() {
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: 120 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.3, delay: Math.random() * 6, duration: Math.random() * 4 + 2,
    })));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map(s => (
        <div key={s.id} className="star" style={{
          left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
        }}/>
      ))}
    </div>
  );
}

function EventCard({ event, isActive, onClick, index }: {
  event: SeerahEvent; isActive: boolean; onClick: () => void; index: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const style = PERIOD_STYLES[event.period] ?? PERIOD_STYLES.madani;
  const isEven = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`tl-row ${isEven ? "even" : "odd"} ${visible ? "visible" : ""}`}
      style={{ "--delay": `${index * 0.07}s`, "--glow": style.glow, "--dot": style.dot } as React.CSSProperties}>
      <div className="tl-year">{event.year_ce}</div>
      <div className="tl-dot-col">
        <div className={`tl-dot ${isActive ? "active" : ""}`}
          style={{ background: isActive ? style.dot : "var(--bg0)", borderColor: style.dot,
            boxShadow: isActive ? `0 0 0 4px ${style.dot}33, 0 0 24px ${style.dot}88` : `0 0 8px ${style.dot}44` }}>
          <div className="tl-dot-core" style={{ background: style.dot, opacity: isActive ? 1 : 0.7 }} />
        </div>
        {isActive && <div className="tl-pulse" style={{ borderColor: style.dot }} />}
      </div>
      <div className={`tl-body ${isActive ? "active" : ""}`}
        style={{ "--bg": style.bg, "--glow": style.glow } as React.CSSProperties}
        onClick={onClick}>
        <div className="tl-era" style={{ color: style.dot }}>{event.era}</div>
        <h3 className="tl-title-ar">{event.title_ar}</h3>
        <p className="tl-title-en">{event.title_en}</p>
        <div className="tl-meta">
          {event.location && <span className="tl-loc">📍 {event.location_ar || event.location}</span>}
          <div className="tl-badges">
            {event.quran_verses?.length > 0 && <span className="badge-q">﴿ {event.quran_verses.length}</span>}
            {event.hadith?.length > 0 && <span className="badge-h">☽ {event.hadith.length}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ event, onClose }: { event: SeerahEvent; onClose: () => void }) {
  const [tab, setTab] = useState<"seerah"|"quran"|"hadith">("seerah");
  const style = PERIOD_STYLES[event.period] ?? PERIOD_STYLES.madani;
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="detail-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="detail-panel" style={{ "--glow": style.glow, "--dot": style.dot } as React.CSSProperties}>
        <div className="detail-header" style={{ borderColor: style.glow + "44" }}>
          <div className="detail-meta">
            <span className="detail-year">{event.year_ce}</span>
            <span className="detail-era" style={{ color: style.dot }}>{event.era}</span>
            {event.location && <span className="detail-loc">📍 {event.location_ar || event.location}</span>}
          </div>
          <div className="detail-titles">
            <div className="detail-title-ar">{event.title_ar}</div>
            <div className="detail-title-en">{event.title_en}</div>
          </div>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>
        <div className="detail-tabs">
          {[{id:"seerah",icon:"📜",ar:"السيرة",en:"Seerah"},{id:"quran",icon:"﴿",ar:"القرآن",en:"Quran"},{id:"hadith",icon:"☽",ar:"الحديث",en:"Hadith"}].map(t=>(
            <button key={t.id} className={`detail-tab ${tab===t.id?"active":""}`}
              onClick={()=>setTab(t.id as any)}>
              <span>{t.icon}</span><span className="tab-ar">{t.ar}</span><span className="tab-en">{t.en}</span>
            </button>
          ))}
        </div>
        <div className="detail-content">
          {tab==="seerah" && (
            <div className="d-section arabic-text">
              <p className="desc-ar">{event.description_ar}</p>
              <div className="divider">✦ ✦ ✦</div>
              <p className="desc-en">{event.description_en}</p>
              {event.tags?.length>0 && <div className="tags-wrap">{event.tags.map((t:string)=><span key={t} className="tag">{t}</span>)}</div>}
            </div>
          )}
          {tab==="quran" && (
            <div className="d-section">
              {!event.quran_verses?.length ? <div className="empty-state">لا توجد آيات مرتبطة</div>
                : event.quran_verses.map((v:any,i:number)=>(
                  <div key={i} className="verse-card">
                    <div className="verse-ref">سورة {v.surah} · الآيات {v.ayah_start}–{v.ayah_end}</div>
                    <div className="verse-text arabic-quran">{v.text_ar}</div>
                    {v.revelation_context&&<div className="verse-ctx"><span className="ctx-label">سبب النزول:</span> {v.revelation_context}</div>}
                  </div>
                ))}
            </div>
          )}
          {tab==="hadith" && (
            <div className="d-section">
              {!event.hadith?.length ? <div className="empty-state">لا توجد أحاديث مرتبطة</div>
                : event.hadith.map((h:any,i:number)=>(
                  <div key={i} className="hadith-card">
                    <p className="hadith-ar arabic-text">{h.text_ar}</p>
                    {h.text_en&&<p className="hadith-en">{h.text_en}</p>}
                    <div className="hadith-src"><span className="src-lbl">المصدر:</span><span className="src-name">{h.source}</span>{h.number&&<span className="src-num">#{h.number}</span>}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [val, setVal] = useState("");
  const t = useRef<ReturnType<typeof setTimeout>>();
  const handle = (v: string) => { setVal(v); clearTimeout(t.current); t.current = setTimeout(() => onSearch(v), 350); };
  return (
    <div className="search-wrap">
      <span className="search-icon">🔍</span>
      <input className="search-input" placeholder="ابحث في السيرة..." value={val} onChange={e=>handle(e.target.value)} dir="rtl"/>
    </div>
  );
}

function PeriodFilter({ periods, active, onChange }: { periods: Periods; active: string|null; onChange: (p:string|null)=>void }) {
  return (
    <div className="filter-wrap">
      <button className={`filter-btn ${!active?"active":""}`} onClick={()=>onChange(null)}>الكل</button>
      {Object.entries(periods).map(([id,p])=>{
        const s=PERIOD_STYLES[id];
        return <button key={id} className={`filter-btn ${active===id?"active":""}`} onClick={()=>onChange(active===id?null:id)}>
          <span className="filter-dot" style={{background:s?.dot}}/>{p.label_ar}
        </button>;
      })}
    </div>
  );
}

function StatsBar({ stats }: { stats: any }) {
  if (!stats) return null;
  return (
    <div className="stats-bar">
      {[{n:stats.total_events,label:"حدث تاريخي",icon:"📜"},{n:stats.total_hadith,label:"حديث نبوي",icon:"☽"},{n:stats.total_quran_refs,label:"مرجع قرآني",icon:"﴿"},{n:"62",label:"عاماً من السيرة",icon:"✦"}].map((s,i)=>(
        <div key={i} className="stat-item">
          <span className="stat-icon">{s.icon}</span>
          <span className="stat-num">{s.n}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [events,setEvents]=useState<SeerahEvent[]>([]);
  const [periods,setPeriods]=useState<Periods>({});
  const [stats,setStats]=useState<any>(null);
  const [selected,setSelected]=useState<SeerahEvent|null>(null);
  const [activePeriod,setActivePeriod]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [loading,setLoading]=useState(true);

  const fetchEvents=useCallback(async(period?:string|null,q?:string)=>{
    setLoading(true);
    try {
      const url = q&&q.length>1
        ?`${API}/search?q=${encodeURIComponent(q)}`
        :`${API}/timeline${period?`?period=${period}`:""}`;
      const res=await fetch(url); const data=await res.json();
      setEvents(q&&q.length>1?data.results:data.events);
    } catch(err){console.error(err);}
    setLoading(false);
  },[]);

  useEffect(()=>{
    Promise.all([fetch(`${API}/periods`).then(r=>r.json()),fetch(`${API}/stats`).then(r=>r.json())])
      .then(([p,s])=>{setPeriods(p);setStats(s);});
    fetchEvents();
  },[]);

  useEffect(()=>{
    if(!search)fetchEvents(activePeriod); else fetchEvents(null,search);
  },[activePeriod,search]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--gold:#c9a84c;--gold2:#e8c86a;--teal:#2a9d8f;--bg0:#04070d;--bg1:#070c14;--bg2:#0c1220;--text:#d8c8a0;--text2:#a89870;--text3:#6a5e48;--border:rgba(201,168,76,0.15);--radius:14px;}
        html,body{background:var(--bg0);color:var(--text);min-height:100vh;font-family:'Cormorant Garamond',serif;direction:rtl;overflow-x:hidden;}
        .arabic-text{font-family:'Amiri',serif;line-height:2.2;}
        .arabic-quran{font-family:'Scheherazade New',serif;font-size:1.35rem;line-height:2.6;letter-spacing:0.02em;}

        /* Stars */
        .star{position:absolute;border-radius:50%;background:white;animation:twinkle var(--dur,3s) var(--del,0s) ease-in-out infinite alternate;}
        @keyframes twinkle{from{opacity:0.05;transform:scale(0.6);}to{opacity:0.9;transform:scale(1.3);}}

        /* Nav */
        .topbar{position:sticky;top:0;z-index:100;background:rgba(4,7,13,0.93);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:0 2rem;}
        .topbar-inner{max-width:1400px;margin:0 auto;padding:0.9rem 0;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}
        .brand-ar{font-family:'Scheherazade New',serif;font-size:1.4rem;font-weight:700;color:var(--gold);}
        .brand-en{font-family:'Cinzel Decorative',serif;font-size:0.55rem;color:var(--text3);letter-spacing:0.15em;text-transform:uppercase;}
        .brand-sep{width:1px;height:32px;background:var(--border);}
        .tagline{font-family:'Amiri',serif;font-size:0.85rem;color:var(--text2);}
        .topbar-right{margin-right:auto;display:flex;align-items:center;gap:0.8rem;}
        .nav-link{font-family:'Amiri',serif;font-size:0.9rem;color:var(--text2);text-decoration:none;padding:0.3rem 0.9rem;border-radius:16px;border:1px solid var(--border);transition:all 0.2s;}
        .nav-link:hover{color:var(--gold);border-color:rgba(201,168,76,0.35);}

        /* Search */
        .search-wrap{position:relative;}
        .search-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:0.8rem;opacity:0.4;}
        .search-input{background:rgba(201,168,76,0.06);border:1px solid var(--border);border-radius:24px;padding:0.45rem 2.5rem 0.45rem 1.2rem;color:var(--text);font-family:'Amiri',serif;font-size:0.95rem;width:230px;outline:none;transition:all 0.25s;}
        .search-input:focus{border-color:rgba(201,168,76,0.4);box-shadow:0 0 0 3px rgba(201,168,76,0.08);width:270px;}
        .search-input::placeholder{color:var(--text3);}

        /* Stats */
        .stats-bar{background:rgba(201,168,76,0.03);border-bottom:1px solid var(--border);padding:0.55rem 2rem;display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;}
        .stat-item{display:flex;align-items:center;gap:0.5rem;}
        .stat-icon{font-size:0.85rem;opacity:0.65;}
        .stat-num{font-family:'Cinzel Decorative',serif;font-size:0.95rem;color:var(--gold);}
        .stat-label{font-family:'Amiri',serif;font-size:0.78rem;color:var(--text3);}

        /* Filters */
        .filter-wrap{padding:0.8rem 2rem;max-width:1400px;margin:0 auto;width:100%;display:flex;gap:0.5rem;flex-wrap:wrap;}
        .filter-btn{background:transparent;border:1px solid var(--border);color:var(--text2);border-radius:20px;padding:0.3rem 0.9rem;font-family:'Amiri',serif;font-size:0.88rem;cursor:pointer;display:flex;align-items:center;gap:0.4rem;transition:all 0.2s;white-space:nowrap;}
        .filter-btn:hover{border-color:rgba(201,168,76,0.3);color:var(--gold);}
        .filter-btn.active{background:rgba(201,168,76,0.12);border-color:var(--gold);color:var(--gold);}
        .filter-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}

        /* Main layout */
        .app-shell{min-height:100vh;display:flex;flex-direction:column;}
        .main{flex:1;max-width:1400px;margin:0 auto;width:100%;padding:0.5rem 2rem 6rem;}

        /* Bismillah header */
        .bismillah-header{text-align:center;padding:2rem 1rem 1.5rem;}
        .bismillah-text{font-family:'Scheherazade New',serif;font-size:2.2rem;color:var(--gold);opacity:0.75;animation:fadeInDown 0.8s ease both;}
        .header-title{font-family:'Cinzel Decorative',serif;font-size:1.3rem;color:var(--text);letter-spacing:0.1em;margin-top:0.4rem;animation:fadeInDown 0.8s 0.15s ease both;}
        .header-sub{font-family:'Amiri',serif;font-size:0.95rem;color:var(--text3);margin-top:0.2rem;animation:fadeInDown 0.8s 0.25s ease both;}
        @keyframes fadeInDown{from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);}}

        /* ══════════════════════════════════
           TIMELINE — animated
        ══════════════════════════════════ */
        .timeline-wrap{position:relative;padding:1rem 0;}

        /* Glowing spine */
        .tl-spine{position:absolute;left:50%;transform:translateX(-50%);top:0;bottom:0;width:2px;z-index:0;
          background:linear-gradient(to bottom,transparent 0%,rgba(201,168,76,0.7) 6%,rgba(201,168,76,0.25) 50%,rgba(201,168,76,0.7) 94%,transparent 100%);
          animation:spineBreath 4s ease-in-out infinite alternate;}
        @keyframes spineBreath{from{opacity:0.5;}to{opacity:1;filter:blur(0.5px);}}
        .tl-spine::after{content:'';position:absolute;left:-1px;top:-20%;width:4px;height:15%;border-radius:2px;
          background:linear-gradient(to bottom,transparent,rgba(201,168,76,0.95),transparent);
          animation:shimmerDown 7s ease-in-out infinite;}
        @keyframes shimmerDown{0%{top:-20%;opacity:0;}15%{opacity:1;}85%{opacity:1;}100%{top:110%;opacity:0;}}

        /* Row */
        .tl-row{display:grid;grid-template-columns:1fr 52px 1fr;align-items:start;padding:1.1rem 0;position:relative;z-index:1;
          opacity:0;transition:opacity 0.65s ease var(--delay,0s),transform 0.65s cubic-bezier(0.22,1,0.36,1) var(--delay,0s);}
        .tl-row.odd{transform:translateX(-50px);}
        .tl-row.odd .tl-year{order:3;text-align:left;padding-left:1.4rem;}
        .tl-row.odd .tl-dot-col{order:2;}
        .tl-row.odd .tl-body{order:1;text-align:right;}
        .tl-row.odd .tl-meta{justify-content:flex-end;}
        .tl-row.even{transform:translateX(50px);}
        .tl-row.even .tl-year{order:1;text-align:right;padding-right:1.4rem;}
        .tl-row.even .tl-dot-col{order:2;}
        .tl-row.even .tl-body{order:3;text-align:left;direction:ltr;}
        .tl-row.even .tl-meta{justify-content:flex-start;}
        .tl-row.visible{opacity:1;transform:translateX(0);}

        /* Year */
        .tl-year{font-family:'Cinzel Decorative',serif;font-size:0.7rem;color:var(--text3);padding-top:0.9rem;letter-spacing:0.05em;align-self:start;}

        /* Dot */
        .tl-dot-col{display:flex;justify-content:center;align-items:flex-start;padding-top:0.65rem;position:relative;}
        .tl-dot{width:20px;height:20px;border-radius:50%;cursor:pointer;position:relative;z-index:2;
          display:flex;align-items:center;justify-content:center;border:2px solid;
          transition:transform 0.25s ease,box-shadow 0.25s ease;}
        .tl-dot:hover{transform:scale(1.45);}
        .tl-dot.active{transform:scale(1.6);}
        .tl-dot-core{width:8px;height:8px;border-radius:50%;transition:all 0.25s;}
        .tl-pulse{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:34px;height:34px;border-radius:50%;border:2px solid;
          animation:pulse 1.8s ease-out infinite;z-index:1;pointer-events:none;}
        @keyframes pulse{0%{transform:translate(-50%,-50%) scale(0.6);opacity:1;}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0;}}

        /* Body */
        .tl-body{padding:0.9rem 1.3rem;border-radius:var(--radius);background:var(--bg,rgba(201,168,76,0.03));
          border:1px solid transparent;margin:0 0.25rem;cursor:pointer;
          transition:all 0.3s ease;position:relative;overflow:hidden;}
        .tl-body::after{content:'';position:absolute;inset:0;opacity:0;
          background:linear-gradient(120deg,transparent 30%,rgba(255,255,255,0.045) 50%,transparent 70%);
          transition:opacity 0.3s;}
        .tl-body:hover::after{opacity:1;}
        .tl-body:hover{border-color:rgba(201,168,76,0.25);background:rgba(201,168,76,0.07);
          transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,0.3);}
        .tl-body.active{border-color:var(--glow,#c9a84c)!important;
          box-shadow:0 0 0 1px var(--glow,#c9a84c),0 0 40px var(--glow,#c9a84c)1a;}
        .tl-era{font-family:'Amiri',serif;font-size:0.72rem;font-weight:700;letter-spacing:0.04em;margin-bottom:0.2rem;}
        .tl-title-ar{font-family:'Scheherazade New',serif;font-size:1.15rem;font-weight:600;color:var(--text);line-height:1.6;margin-bottom:0.12rem;}
        .tl-title-en{font-family:'Cormorant Garamond',serif;font-size:0.82rem;color:var(--text3);font-style:italic;margin-bottom:0.5rem;}
        .tl-meta{display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;}
        .tl-loc{font-family:'Amiri',serif;font-size:0.72rem;color:var(--text3);}
        .tl-badges{display:flex;gap:0.3rem;}
        .badge-q{font-family:'Amiri',serif;font-size:0.66rem;padding:0.1rem 0.55rem;border-radius:10px;background:rgba(42,157,143,0.12);color:#2a9d8f;border:1px solid rgba(42,157,143,0.25);}
        .badge-h{font-family:'Amiri',serif;font-size:0.66rem;padding:0.1rem 0.55rem;border-radius:10px;background:rgba(201,168,76,0.1);color:var(--gold);border:1px solid rgba(201,168,76,0.22);}

        /* Loading */
        .loading-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6rem 2rem;gap:1.5rem;}
        .loading-crescent{font-size:3rem;animation:spin-slow 4s linear infinite;opacity:0.6;}
        @keyframes spin-slow{to{transform:rotate(360deg);}}
        .loading-text{font-family:'Amiri',serif;color:var(--text3);font-size:1rem;}
        .no-results{text-align:center;padding:4rem 2rem;color:var(--text3);font-family:'Amiri',serif;font-size:1.1rem;}

        /* Detail overlay */
        .detail-overlay{position:fixed;inset:0;z-index:200;background:rgba(4,7,13,0.88);backdrop-filter:blur(16px);
          display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:fadeIn 0.2s ease;}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        .detail-panel{background:var(--bg1);border:1px solid rgba(201,168,76,0.2);border-radius:20px;
          width:100%;max-width:820px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;
          box-shadow:0 0 80px rgba(0,0,0,0.7),0 0 60px var(--glow,#c9a84c)11;animation:slideUp 0.3s ease;}
        @keyframes slideUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        .detail-header{display:flex;align-items:flex-start;gap:1.2rem;padding:1.4rem 1.7rem;border-bottom:1px solid;}
        .detail-meta{display:flex;flex-direction:column;gap:0.22rem;align-items:flex-end;min-width:100px;}
        .detail-year{font-family:'Cinzel Decorative',serif;font-size:0.76rem;color:var(--gold);letter-spacing:0.08em;}
        .detail-era{font-family:'Amiri',serif;font-size:0.78rem;font-weight:700;}
        .detail-loc{font-family:'Amiri',serif;font-size:0.76rem;color:var(--text3);}
        .detail-titles{flex:1;text-align:center;}
        .detail-title-ar{font-family:'Scheherazade New',serif;font-size:1.5rem;font-weight:700;color:var(--text);line-height:1.6;}
        .detail-title-en{font-family:'Cormorant Garamond',serif;font-size:0.88rem;color:var(--text3);font-style:italic;margin-top:0.15rem;}
        .detail-close{background:transparent;border:1px solid var(--border);color:var(--text3);width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:0.75rem;transition:all 0.2s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .detail-close:hover{border-color:rgba(201,168,76,0.4);color:var(--gold);}
        .detail-tabs{display:flex;border-bottom:1px solid var(--border);background:rgba(0,0,0,0.2);flex-shrink:0;}
        .detail-tab{flex:1;background:transparent;border:none;padding:0.85rem;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.12rem;border-bottom:2px solid transparent;transition:all 0.2s;}
        .detail-tab:hover{background:rgba(201,168,76,0.05);}
        .detail-tab.active{border-bottom-color:var(--dot,#c9a84c);background:rgba(201,168,76,0.07);}
        .tab-ar{font-family:'Scheherazade New',serif;font-size:0.86rem;color:var(--text);font-weight:600;}
        .tab-en{font-family:'Cormorant Garamond',serif;font-size:0.68rem;color:var(--text3);font-style:italic;}
        .detail-content{flex:1;overflow-y:auto;padding:1.5rem;scrollbar-width:thin;scrollbar-color:var(--border) transparent;}
        .d-section{display:flex;flex-direction:column;gap:1.2rem;}
        .desc-ar{font-size:1.05rem;color:var(--text);line-height:2.2;}
        .divider{text-align:center;color:var(--gold);opacity:0.4;font-size:1rem;}
        .desc-en{font-family:'Cormorant Garamond',serif;font-size:1rem;color:var(--text2);line-height:1.8;direction:ltr;text-align:left;}
        .tags-wrap{display:flex;flex-wrap:wrap;gap:0.4rem;}
        .tag{font-family:'Amiri',serif;font-size:0.78rem;padding:0.2rem 0.8rem;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:12px;color:var(--text2);}
        .verse-card{background:rgba(42,157,143,0.05);border:1px solid rgba(42,157,143,0.15);border-radius:var(--radius);padding:1.3rem;margin-bottom:0.5rem;}
        .verse-ref{font-family:'Amiri',serif;font-size:0.8rem;color:#2a9d8f;margin-bottom:0.8rem;font-weight:700;}
        .verse-text{color:var(--text);margin-bottom:0.8rem;}
        .verse-ctx{font-family:'Amiri',serif;font-size:0.82rem;color:var(--text3);background:rgba(0,0,0,0.2);border-radius:8px;padding:0.55rem 0.9rem;border-right:2px solid rgba(42,157,143,0.4);direction:rtl;}
        .ctx-label{color:#2a9d8f;font-weight:700;margin-left:0.3rem;}
        .hadith-card{background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.12);border-radius:var(--radius);padding:1.3rem;display:flex;flex-direction:column;gap:0.85rem;margin-bottom:0.5rem;}
        .hadith-ar{font-size:1.05rem;color:var(--text);}
        .hadith-en{font-family:'Cormorant Garamond',serif;font-size:0.93rem;color:var(--text2);font-style:italic;direction:ltr;text-align:left;line-height:1.7;padding-top:0.5rem;border-top:1px solid var(--border);}
        .hadith-src{font-family:'Amiri',serif;font-size:0.78rem;color:var(--text3);display:flex;align-items:center;gap:0.4rem;}
        .src-lbl{color:var(--gold);font-weight:700;}
        .src-name{color:var(--text2);}
        .src-num{color:var(--text3);}
        .empty-state{text-align:center;color:var(--text3);font-family:'Amiri',serif;font-size:1rem;padding:3rem;}

        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}

        @media(max-width:768px){
          .tl-row{grid-template-columns:24px 1fr;}
          .tl-year{display:none;}
          .tl-dot-col{order:1!important;}
          .tl-body{order:2!important;text-align:right!important;direction:rtl!important;}
          .tl-meta{justify-content:flex-end!important;}
          .tl-spine{left:12px;transform:none;}
          .topbar-inner{gap:0.7rem;}
          .search-input{width:150px;}
          .stats-bar{gap:1.2rem;}
          .detail-header{flex-wrap:wrap;}
          .detail-meta{display:none;}
        }
      `}</style>

      <StarField />
      <IslamicGeometry />
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent opacity-60 z-50" />

      <div className="app-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div>
              <div className="brand-ar">محرك السيرة المعرفي</div>
              <div className="brand-en">Islamic Knowledge Engine</div>
            </div>
            <div className="brand-sep"/>
            <div className="tagline">السيرة · القرآن · الحديث في سياقها الزمني</div>
            <div className="topbar-right">
              <Link href="/hadith" className="nav-link">☽ الحديث</Link>
              <Link href="/quran" className="nav-link">﴿ ترتيب النزول</Link>
              <SearchBar onSearch={setSearch}/>
            </div>
          </div>
        </header>

        <StatsBar stats={stats}/>

        <div style={{maxWidth:1400,margin:"0 auto",width:"100%"}}>
          <PeriodFilter periods={periods} active={activePeriod} onChange={setActivePeriod}/>
        </div>

        <main className="main">
          <div className="bismillah-header">
            <div className="bismillah-text">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <div className="header-title">The Prophetic Timeline</div>
            <div className="header-sub">{search?`نتائج البحث: "${search}"`:"خط زمني تفاعلي للسيرة النبوية المشرفة"}</div>
          </div>

          {loading?(
            <div className="loading-wrap">
              <div className="loading-crescent">☽</div>
              <div className="loading-text">جارٍ تحميل أحداث السيرة...</div>
            </div>
          ):events.length===0?(
            <div className="no-results">لا توجد نتائج — جرّب كلمة بحث أخرى</div>
          ):(
            <div className="timeline-wrap">
              <div className="tl-spine"/>
              {events.map((event,i)=>(
                <EventCard key={event.id} event={event} index={i}
                  isActive={selected?.id===event.id}
                  onClick={()=>setSelected(selected?.id===event.id?null:event)}/>
              ))}
            </div>
          )}
        </main>
      </div>

      {selected&&<DetailPanel event={selected} onClose={()=>setSelected(null)}/>}
    </>
  );
}

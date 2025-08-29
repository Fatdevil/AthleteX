import React, { useEffect, useMemo, useRef, useState } from "react";

// ------------------------------------------------------------
// AthleteX — ultra-clean dark UI training app (demo)
// Shows: AI Coach, Adaptive Onboarding, Progress Dashboard,
// Gamification (Level/Badges), Social Community.
// This version wires onboarding -> 4‑week plan generation.
// ------------------------------------------------------------

// -- Small inline SVG icons (lucide-like) --------------------
const Icon = {
  Home: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
    </svg>
  ),
  Dumbbell: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M1 10h5v4H1zM18 10h5v4h-5z" />
      <path d="M6 12h12" />
    </svg>
  ),
  Calendar: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Chart: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M4 20V8M10 20V4M16 20v-6M22 20V10" />
    </svg>
  ),
  User: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21c1.8-4.5 6.2-6 8-6s6.2 1.5 8 6" />
    </svg>
  ),
  Play: (p: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7z"/></svg>
  ),
  Pause: (p: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
  ),
  Check: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Flame: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M12 3s5 3 5 8a5 5 0 1 1-10 0c0-3 2-5 5-8Z" />
    </svg>
  ),
  Heart: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Star: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="m12 3 2.5 6.5L21 10l-5 4 1.5 6L12 17l-5.5 3 1.5-6-5-4 6.5-.5z" />
    </svg>
  ),
  Message: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M3 5h18v12H8l-5 4z"/>
    </svg>
  ),
  Trophy: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M8 4h8v3a4 4 0 0 0 4 4h1V6h-5"/>
      <path d="M16 4H8v3a4 4 0 0 1-4 4H3V6h5"/>
      <path d="M12 11v5"/>
      <path d="M8 21h8"/>
    </svg>
  ),
  Users: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"/>
      <path d="M3 21a7 7 0 0 1 18 0"/>
    </svg>
  ),
};

// -- Mock data / helpers ------------------------------
const today = new Date();
function fmtDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function clsx(...v: (string|false|undefined|null)[]) { return v.filter(Boolean).join(" "); }

function useInterval(cb: () => void, delay: number | null) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Progress ring
function ProgressRing({ value, size=92 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const bg = `conic-gradient(#60a5fa ${clamped*3.6}deg, #1f2937 0deg)`;
  return (
    <div className="grid place-items-center rounded-full" style={{ width: size, height: size, background: bg }}>
      <div className="rounded-full bg-[#0b0e14]" style={{ width: size-14, height: size-14 }} />
      <div className="absolute text-sm font-semibold text-slate-200">{Math.round(clamped)}%</div>
    </div>
  );
}

// Workout def (for player demo)
const workoutWOD = {
  id: "miniWOD",
  name: "Mini-WOD — Teknik & Flås",
  blocks: [
    { kind: "prep", title: "Uppvärmning", details: "5 min lätt rodd + mobility", seconds: 300 },
    { kind: "amrap", title: "3 Rounds for Time", details: "10 DL (lätt), 15 armhävningar, 20 air squats", seconds: 900 },
    { kind: "finisher", title: "Nedvarvning", details: "2 min cykel + stretch", seconds: 120 },
  ],
};

// Build 4‑week plan (28 dagar) enligt schemat
function buildFourWeekPlan() {
  const week = [
    { title: "Styrka – Baslyft", focus: "Böj/Bänk/Chins", duration: 52 },
    { title: "Intervall – Rodd", focus: "10×250m", duration: 28 },
    { title: "Vila / Lätt cykel", focus: "30 min zon 2", duration: 30 },
    { title: "Mini-WOD", focus: "DL/PU/AirSquat", duration: 20 },
    { title: "Accessory + Core", focus: "Hantel & bål", duration: 40 },
    { title: "Valfri – Lugn rörlighet", focus: "Stretch/Mobility 15–20 min", duration: 20 },
    { title: "Uthållighet (valfri)", focus: "Rodd/Cykel 40–60 min", duration: 50 },
  ] as const;
  const days: any[] = [];
  for (let w=0; w<4; w++) {
    for (let d=0; d<7; d++) {
      const base = week[d];
      days.push({ id: `w${w+1}d${d+1}`, day: d+1, week: w+1, title: base.title, focus: base.focus, duration: base.duration, kcal: Math.round(base.duration*9) });
    }
  }
  return days;
}

// localStorage helpers
const PLAN_KEY = "athletex.plan.v1";
function loadPlan(): any[] | null {
  try { const raw = localStorage.getItem(PLAN_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function savePlan(plan: any[]) { try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch {} }

// ----------------- Components ---------------------

// AI Coach Chat
function CoachChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState([
    { from: "coach", text: "Hej! 7/10 ansträngning idag – spara spurten till sista varvet." },
    { from: "you", text: "Hur ska böjen kännas i botten?" },
    { from: "coach", text: "Stabil core, knä över tå, hela foten i. Om tveksam: sänk 2,5 kg och perfekta tekniken." },
  ]);
  const [input, setInput] = useState("");
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#0b0f17]/95 backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/5 p-4">
        <div className="flex items-center gap-2 text-slate-200"><Icon.Message className="h-5 w-5"/> AI‑Coach</div>
        <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">Stäng</button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.map((m, i) => (
          <div key={i} className={clsx("max-w-[78%] rounded-2xl p-3 text-[13px]", m.from==='coach' ? "bg-white/5 text-slate-200" : "ml-auto bg-sky-500/20 text-slate-100")}>{m.text}</div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-white/5 p-3">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Fråga vad som helst…"
               className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-slate-100 placeholder:text-slate-400 outline-none"/>
        <button onClick={()=>{ if(!input.trim())return; setMsgs([...msgs,{from:'you',text:input.trim()},{from:'coach',text:'Noterat! Jag justerar nästa pass och skickar tips efteråt.'}]); setInput(""); }}
                className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">Skicka</button>
      </div>
    </div>
  );
}

// Adaptive Onboarding (calls onCreatePlan)
function Onboarding({ onDone, onCreatePlan }: { onDone: () => void; onCreatePlan: (p:any[]) => void }) {
  const [step, setStep] = useState(0);
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#0b0f17]/95 backdrop-blur">
      <div className="mx-auto mt-6 w-[86%] rounded-2xl border border-white/5 bg-white/5 p-5">
        <p className="text-sm text-slate-300">Steg {step+1} / 3</p>
        {step===0 && (
          <div>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">Mål & nivå</h3>
            <p className="text-[13px] text-slate-400">Vad siktar du på de närmaste 9 månaderna?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['Crossfit/atletisk','Styrka','Kondition/HIIT','Hybrid'].map(x=> (
                <button key={x} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-[13px] text-slate-200 hover:bg-white/10">{x}</button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[12px] text-slate-300">
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Nybörjare</button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Medel</button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Avancerad</button>
            </div>
          </div>
        )}
        {step===1 && (
          <div>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">Snabbt fitnesstest</h3>
            <p className="text-[13px] text-slate-400">Fyll i vad du klarar idag (uppskattning räcker).</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
              <label className="text-slate-300">Böj 5×5 (kg)
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none" placeholder="ex 70" />
              </label>
              <label className="text-slate-300">Rodd 500m (min:sek)
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none" placeholder="ex 1:55" />
              </label>
              <label className="text-slate-300">Max chins (st)
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none" placeholder="ex 8" />
              </label>
              <label className="text-slate-300">Burpees 3 min (st)
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none" placeholder="ex 42" />
              </label>
            </div>
          </div>
        )}
        {step===2 && (
          <div>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">Utrustning</h3>
            <p className="text-[13px] text-slate-400">Markera vad du har tillgång till.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[13px] text-slate-200">
              {['Roddmaskin','Cykel','Skivstång','Hantlar','Chinsräcke','Dipsställning'].map(u=> (
                <label key={u} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
                  <input type="checkbox" className="accent-sky-500" /> {u}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between">
          <button onClick={()=> step>0? setStep(step-1): onDone()} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">{step>0? 'Tillbaka':'Hoppa över'}</button>
          {step<2 ? (
            <button onClick={()=> setStep(step+1)} className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">Fortsätt</button>
          ) : (
            <button onClick={()=>{ const p = buildFourWeekPlan(); onCreatePlan(p); savePlan(p); onDone(); }}
              className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">
              Skapa min plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Badges & XP
function XPBar({ xp=380, next=500 }: { xp?: number; next?: number }) {
  const pct = Math.min(100, Math.round((xp/next)*100));
  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-3">
      <div className="flex items-center justify-between text-[12px] text-slate-300">
        <span>Nivå 7</span>
        <span>{xp}/{next} XP</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BadgesRow() {
  const badges = [
    { id: "b1", name: "5 dagar i rad" },
    { id: "b2", name: "PR Marklyft" },
    { id: "b3", name: "10k kcal" },
    { id: "b4", name: "500 Chins" },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {badges.map(b => (
        <div key={b.id} className="min-w-[120px] rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-center text-[12px] text-amber-200">
          <div className="mx-auto mb-1 h-6 w-6"><Icon.Trophy className="h-6 w-6"/></div>
          {b.name}
        </div>
      ))}
    </div>
  );
}

// Core screens
function HomeScreen({ onQuickStart, streak=6, onOpenCoach, plan, goPlan }: { onQuickStart: () => void; streak?: number; onOpenCoach: ()=>void; plan: any[]; goPlan: ()=>void }) {
  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">AthleteX</h1>
          <p className="mt-0.5 text-sm text-slate-400">{fmtDate(today)} • Hej Stellan 👋</p>
        </div>
        <button onClick={onOpenCoach} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-slate-200 hover:bg-white/10">
          <Icon.Message className="h-4 w-4"/> AI‑Coach
        </button>
      </div>

      {/* Level & XP */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-center">
          <p className="text-[11px] text-slate-400">Nivå</p>
          <p className="text-lg font-semibold text-slate-100">7</p>
        </div>
        <Stat label="Streak" value={`${streak} dagar`} />
        <Stat label="VO₂ est." value="49" suffix="ml/kg/min" />
      </div>
      <div className="mt-3"><XPBar/></div>

      {/* Hero card */}
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-[#0e1422] to-[#0b0e14] p-4 shadow-inner">
        <ProgressRing value={72} />
        <div className="flex-1">
          <p className="text-sm text-slate-400">Dagens pass</p>
          <h2 className="text-lg font-semibold text-slate-100">{plan[0]?.title || "Styrka — Baslyft"}</h2>
          <p className="text-[13px] text-slate-400">Fokus: {plan[0]?.focus || "Böj 5×5 • Bänk 5×5 • Chins 4×max"}</p>
          <div className="mt-3 flex gap-2">
            <button onClick={onQuickStart} className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-400">
              Starta nu
            </button>
            <button onClick={goPlan} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Visa schema</button>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-200">Märken</p>
        <BadgesRow/>
      </div>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Rodd 10×250", sub: "Intervall", icon: <Icon.Flame className="h-5 w-5" /> },
          { label: "Cykel Tabata", sub: "HIIT", icon: <Icon.Heart className="h-5 w-5" /> },
          { label: plan[3]?.title || "Mini‑WOD", sub: plan[3]?.focus || "DL/PU/SQ", icon: <Icon.Star className="h-5 w-5" /> },
        ].map((a) => (
          <button key={a.label} className="flex flex-col items-start gap-1 rounded-2xl border border-white/5 bg-white/5 p-3 text-left backdrop-blur hover:bg-white/10">
            <div className="flex items-center gap-2 text-slate-200">
              {a.icon}
              <span className="text-[13px] font-medium">{a.label}</span>
            </div>
            <span className="text-[11px] text-slate-400">{a.sub}</span>
          </button>
        ))}
      </div>

      {/* Week plan (first 5 days) */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0c111b] p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-200">Veckoplan</p>
          <button onClick={goPlan} className="text-xs text-slate-400 hover:text-slate-200">Se alla</button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {plan.slice(0,5).map((d) => (
            <div key={d.id} className="group rounded-xl border border-white/5 bg-white/5 p-2 text-center">
              <p className="text-[11px] text-slate-400">Dag {d.day}</p>
              <p className="mt-1 text-[12px] text-slate-200">{d.title.split(" ")[0]}</p>
              <p className="mt-1 text-[10px] text-slate-400">{d.duration} min</p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
                <div className="h-full w-1/2 bg-sky-500 transition-all group-hover:w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-100">{value} {suffix && <span className="text-[11px] text-slate-400">{suffix}</span>}</p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full w-3/4 bg-violet-500" />
      </div>
    </div>
  );
}

function TrainScreen({ onOpenPlayer }: { onOpenPlayer: (workoutId: string) => void }) {
  const items = [
    { id: "w1", title: "Styrka – Baslyft", detail: "Böj 5×5 • Bänk 5×5 • Chins", minutes: 52 },
    { id: "w2", title: "Intervall – Rodd", detail: "10×250m / 1:00 vila", minutes: 28 },
    { id: "w3", title: "Mini‑WOD (3RFT)", detail: "DL/PU/AirSquat", minutes: 20 },
  ];
  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-100">Träna</h2>
      <p className="text-sm text-slate-400">Välj ett pass att starta</p>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <button key={it.id} onClick={() => onOpenPlayer(it.id)} className="w-full rounded-2xl border border-white/5 bg-gradient-to-r from-white/5 to-transparent p-4 text-left hover:bg-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200">{it.title}</p>
                <p className="text-[12px] text-slate-400">{it.detail}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Icon.Play className="h-5 w-5" />
                <span className="text-[12px]">{it.minutes} min</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0c111b] p-4">
        <p className="text-sm font-medium text-slate-200">Coach-tips</p>
        <p className="mt-1 text-[13px] text-slate-400">Håll 7–8/10 ansträngning i första halvan, spurta på slutet. Teknik före tempo.</p>
      </div>
    </div>
  );
}

function PlanScreen({ plan, setActiveDay }: { plan: any[]; setActiveDay: (i:number)=>void }) {
  // Simple 7-day selector mock from the plan (first week)
  const days = plan.slice(0,7).map((p,i)=>({ label: new Date().toLocaleDateString(undefined,{weekday:"short"}), date: new Date().getDate()+i, id:i }));
  const [active, setActive] = useState(0);
  const schedule = useMemo(() => plan[(active % plan.length)], [active, plan]);

  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-100">Plan</h2>
      <p className="text-sm text-slate-400">Veckoschema & anpassningar</p>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((d, i) => (
          <button key={d.id} onClick={() => {setActive(i); setActiveDay(i);} } className={clsx("rounded-2xl border p-2 text-center", i===active ? "border-sky-500/60 bg-sky-500/10" : "border-white/5 bg-white/5") }>
            <p className="text-[11px] text-slate-400">{d.label}</p>
            <p className="text-sm font-semibold text-slate-200">{d.date}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/5 bg-[#0c111b] p-4">
        <p className="text-sm text-slate-400">Valt pass</p>
        <p className="text-base font-semibold text-slate-100">{schedule.title}</p>
        <p className="text-[13px] text-slate-400">Fokus: {schedule.focus}</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded-xl bg-violet-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400">Byt övning</button>
          <button className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Flytta till annan dag</button>
        </div>
      </div>
    </div>
  );
}

function ProgressScreen({ plan }: { plan: any[] }) {
  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-100">Progress</h2>
      <p className="text-sm text-slate-400">Volym, tider, kondition</p>

      {/* Volume chart mock */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-[#0c111b] p-4">
        <p className="text-sm text-slate-200">Träningsvolym (kg) senaste 6 pass</p>
        <div className="mt-3 flex items-end justify-between gap-2">
          {[12, 16, 10, 18, 22, 19].map((v, i) => (
            <div key={i} className="flex w-full flex-col items-center gap-2">
              <div className="h-28 w-full rounded bg-white/5">
                <div className="h-full w-full origin-bottom rounded bg-sky-500" style={{ transform: `scaleY(${v/24})` }} />
              </div>
              <span className="text-[11px] text-slate-400">P{i+1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time PRs */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Böj 5×5" value="85 kg" />
        <Stat label="Rodd 500m" value="1:43" />
        <Stat label="WOD 3RFT" value="7:58" />
      </div>

      {/* Next goal card */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-4">
        <p className="text-sm text-slate-200">Nästa mål</p>
        <p className="text-[13px] text-slate-400">Knäböj 5×5 till 90 kg inom 2 veckor. Rek: +2,5 kg varje vecka.</p>
      </div>

      {/* Coach insight */}
      <div className="mt-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-4">
        <p className="text-sm text-slate-200">Coach‑insikt</p>
        <p className="text-[13px] text-slate-400">Din syreupptagning trendar uppåt. Lägg till 1 intervallomgång nästa vecka.</p>
      </div>
    </div>
  );
}

// Social / Community
function SocialScreen() {
  const [tab, setTab] = useState<'feed'|'board'>('feed');
  const feed = [
    { user: 'Lisa', text: 'PR i böj 5×5 @75kg! 🔥', likes: 14 },
    { user: 'Johan', text: '3RFT klar på 7:42. Död men nöjd 😅', likes: 9 },
    { user: 'Stellan', text: 'Rodd 6×500m avklarat. Sista två på 1:45!', likes: 11 },
  ];
  const board = [
    { user: 'Lisa', score: '7:35' },
    { user: 'Stellan', score: '7:58' },
    { user: 'Johan', score: '8:10' },
  ];
  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={()=>setTab('feed')} className={clsx("rounded-xl px-3 py-1.5 text-sm", tab==='feed'? 'bg-white/10 text-slate-100':'border border-white/10 text-slate-300')}>Flöde</button>
        <button onClick={()=>setTab('board')} className={clsx("rounded-xl px-3 py-1.5 text-sm", tab==='board'? 'bg-white/10 text-slate-100':'border border-white/10 text-slate-300')}>Leaderboard</button>
      </div>

      {tab==='feed' && (
        <div className="space-y-3">
          {feed.map((p,i)=> (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-3">
              <div className="flex items-center justify-between text-[13px] text-slate-300"><div className="flex items-center gap-2"><Icon.Users className="h-4 w-4"/> {p.user}</div><span>+{p.likes} 👍</span></div>
              <p className="mt-2 text-[14px] text-slate-100">{p.text}</p>
              <div className="mt-2 flex gap-2 text-[12px] text-slate-300">
                <button className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/10">Gilla</button>
                <button className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/10">Kommentera</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='board' && (
        <div className="rounded-2xl border border-white/5 bg-[#0c111b] p-4">
          <p className="text-sm text-slate-200">Dagens WOD – 3RFT</p>
          <div className="mt-3 divide-y divide-white/5">
            {board.map((r,i)=> (
              <div key={i} className="flex items-center justify-between py-2 text-slate-200">
                <div className="flex items-center gap-2"><span className="w-6 text-center text-[12px] text-slate-400">{i+1}</span>{r.user}</div>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[12px]">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="h-full w-full overflow-y-auto p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-100">Profil</h2>
      <p className="text-sm text-slate-400">Preferenser & mål</p>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-200">Mål</p>
          <p className="text-[13px] text-slate-400">Crossfit/atletisk på 9 månader</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-200">Utrustning</p>
          <p className="text-[13px] text-slate-400">Rodd, cykel, skivstång, hantlar, chins, dips</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-sm font-medium text-slate-200">Meddelanden</p>
          <label className="mt-2 flex items-center justify-between text-[13px] text-slate-300">
            Push‑påminnelser
            <input type="checkbox" defaultChecked className="h-5 w-9 appearance-none rounded-full bg-white/10 outline-none transition peer checked:bg-sky-500" />
          </label>
        </div>
      </div>
    </div>
  );
}

// Workout Player
function WorkoutPlayer({ workout, onClose }: { workout: typeof workoutWOD; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [secsLeft, setSecsLeft] = useState(workout.blocks[0].seconds);
  const [running, setRunning] = useState(true);

  const step = workout.blocks[i];

  useInterval(() => {
    if (!running) return;
    setSecsLeft((s) => (s > 0 ? s - 1 : 0));
  }, 1000);

  useEffect(() => {
    if (secsLeft === 0) {
      if (i < workout.blocks.length - 1) {
        setI(i + 1);
        setSecsLeft(workout.blocks[i + 1].seconds);
      }
    }
  }, [secsLeft]);

  const pct = Math.round(((workout.blocks.slice(0, i).reduce((a, b) => a + b.seconds, 0) + (step.seconds - secsLeft)) / workout.blocks.reduce((a, b) => a + b.seconds, 0)) * 100);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#0b0f17]">
      <div className="flex items-center justify-between p-4">
        <button onClick={onClose} className="rounded-xl border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5">Stäng</button>
        <p className="text-sm text-slate-400">{workout.name}</p>
        <div />
      </div>

      <div className="mx-auto mt-6 w-72">
        <ProgressRing value={pct} size={140} />
      </div>

      <div className="mx-5 mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
        <p className="text-[12px] uppercase tracking-wide text-slate-400">Nuvarande block</p>
        <p className="mt-1 text-lg font-semibold text-slate-100">{step.title}</p>
        <p className="text-[13px] text-slate-400">{step.details}</p>
        <p className="mt-3 text-4xl font-bold tabular-nums text-slate-100">{Math.floor(secsLeft/60)}:{String(secsLeft%60).padStart(2, "0")}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setRunning(!running)} className="rounded-xl bg-sky-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400">
            {running ? "Pausa" : "Fortsätt"}
          </button>
          <button onClick={() => { if (i < workout.blocks.length - 1) { setI(i+1); setSecsLeft(workout.blocks[i+1].seconds); } }} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Nästa block</button>
        </div>
      </div>

      <div className="mx-5 mt-4 space-y-2">
        {workout.blocks.map((b, idx) => (
          <div key={idx} className={clsx("flex items-center justify-between rounded-2xl border p-3", idx===i ? "border-sky-500/60 bg-sky-500/10" : "border-white/5 bg-white/5") }>
            <div>
              <p className="text-sm font-medium text-slate-200">{b.title}</p>
              <p className="text-[12px] text-slate-400">{b.details}</p>
            </div>
            <span className="text-[12px] text-slate-400">{Math.round(b.seconds/60)} min</span>
          </div>
        ))}
      </div>

      <div className="mt-auto p-5">
        {i === workout.blocks.length - 1 && secsLeft === 0 ? (
          <button onClick={onClose} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500/90 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-400">
            <Icon.Check className="h-5 w-5" /> Klart — Logga pass
          </button>
        ) : (
          <div className="text-center text-[12px] text-slate-400">{pct}% klart • Keep going 🚀</div>
        )}
      </div>
    </div>
  );
}

// Tab bar
function TabBar({ current, setCurrent }: { current: string; setCurrent: (t: string) => void }) {
  const tabs = [
    { key: "home", label: "Hem", icon: Icon.Home },
    { key: "train", label: "Träna", icon: Icon.Dumbbell },
    { key: "plan", label: "Plan", icon: Icon.Calendar },
    { key: "progress", label: "Progress", icon: Icon.Chart },
    { key: "social", label: "Community", icon: Icon.Users },
    { key: "profile", label: "Profil", icon: Icon.User },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-black/40 backdrop-blur">
      <div className="mx-2 my-2 grid grid-cols-6 gap-1 rounded-2xl border border-white/5 bg-white/5 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setCurrent(t.key)}
            className={clsx(
              "flex flex-col items-center gap-1 rounded-xl py-2 text-[11px]",
              current === t.key ? "bg-sky-500/15 text-sky-400" : "text-slate-300 hover:bg-white/5"
            )}
          >
            <t.icon className="h-5 w-5" />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [tab, setTab] = useState("home");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const stored = loadPlan();
  const [plan, setPlan] = useState<any[]>(stored || buildFourWeekPlan());
  const [showOnb, setShowOnb] = useState(!stored);
  const goPlan = () => setTab("plan");
  const onCreatePlan = (p:any[]) => { setPlan(p); savePlan(p); setTab("plan"); };

  return (
    <MobileFrame>
      {/* subtle gradient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-sky-500/20 blur-[60px]" />
      <div className="pointer-events-none absolute -right-16 top-40 h-40 w-40 rounded-full bg-violet-500/20 blur-[60px]" />

      {/* Screens */}
      {tab === "home" && <HomeScreen plan={plan} goPlan={goPlan} onQuickStart={() => setPlayerOpen(true)} onOpenCoach={()=>setCoachOpen(true)} />}
      {tab === "train" && <TrainScreen onOpenPlayer={() => setPlayerOpen(true)} />}
      {tab === "plan" && <PlanScreen plan={plan} setActiveDay={()=>{}} />}
      {tab === "progress" && <ProgressScreen plan={plan} />}
      {tab === "social" && <SocialScreen />}
      {tab === "profile" && <ProfileScreen />}

      {/* Overlays */}
      {playerOpen && <WorkoutPlayer workout={workoutWOD} onClose={() => setPlayerOpen(false)} />}
      {coachOpen && <CoachChat onClose={()=>setCoachOpen(false)} />}
      {showOnb && <Onboarding onDone={()=> setShowOnb(false)} onCreatePlan={onCreatePlan} />}

      {/* Tab bar */}
      <TabBar current={tab} setCurrent={setTab} />

      {/* First-time coach nudge */}
      {!showOnb && (
        <div className="pointer-events-none absolute left-4 top-16 z-10 max-w-[260px] rounded-2xl border border-white/5 bg-black/40 p-3 text-[13px] text-slate-200 backdrop-blur">
          <span className="pointer-events-auto mr-2 inline-block rounded bg-sky-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">Coach</span>
          Starta dagens pass eller öppna AI‑Coach om du vill anpassa intensiteten. 💪
        </div>
      )}
    </MobileFrame>
  );
}

// Mobile frame wrapper
function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_20%_-20%,#0ea5e9,transparent),radial-gradient(900px_500px_at_90%_-10%,#8b5cf6,transparent),#070a10] grid place-items-center p-4">
      <div className="mx-auto w-[390px] max-w-full rounded-[2.2rem] border border-slate-700/40 bg-[#0b0f17] shadow-[0_12px_80px_-15px_rgba(0,0,0,0.8),inset_0_0_0_1px_rgba(255,255,255,0.04)] relative overflow-hidden">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-7 w-40 -translate-x-1/2 rounded-b-3xl bg-black/80" />
        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-5 text-[11px] text-slate-300/70">
          <span>09:41</span>
          <div className="flex items-center gap-2 opacity-80">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="h-2 w-4 rounded bg-slate-400" />
            <span className="h-2 w-6 rounded bg-slate-400" />
          </div>
        </div>
        {/* App content */}
        <div className="relative z-0 h-[760px] w-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

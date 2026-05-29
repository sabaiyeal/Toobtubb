import { useState, useRef, useEffect } from "react";
import "./index.css";

const INTENSITY_LABELS = ["เบามาก", "เบา", "พอดี", "แรง", "แรงมาก"];
const INTENSITY_EMOJIS = ["🍃", "⭐", "✨", "💪", "🔥"];

const BABY_POSES = ["/baby1.webp", "/baby2.webp", "/baby3.webp", "/baby4.webp"];

const WEEK_DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const MEAL_SLOTS = [
  { key: "breakfast", label: "🌅 เช้า" },
  { key: "lunch",     label: "☀️ กลางวัน" },
  { key: "dinner",    label: "🌙 เย็น" },
];
const DAILY_GOAL = 10;

function formatEnglishDate(date) {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

function getGaFromDueDate(dueDateStr) {
  const due = new Date(dueDateStr);
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToDue = Math.ceil((due.getTime() - today.getTime()) / msPerDay);
  const totalGaDays = 40 * 7 - daysToDue;
  const weeks = Math.floor(totalGaDays / 7);
  const days = totalGaDays % 7;
  return { weeks: Math.max(0, weeks), days: Math.max(0, days) };
}

function BabyImage({ isAnimating, currentPose }) {
  const src = BABY_POSES[currentPose % 4];
  return (
    <img
      src={src}
      alt={`Baby pose ${(currentPose % 4) + 1}`}
      className={`belly-svg ${isAnimating ? "kick-anim" : ""}`}
    />
  );
}

function KickGoalBar({ count }) {
  const pct = Math.min((count / DAILY_GOAL) * 100, 100);
  const done = count >= DAILY_GOAL;
  return (
    <div className="goal-bar-wrap">
      <div className="goal-bar-header">
        <span className="goal-bar-label">{done ? "🎉 ครบเป้าหมายแล้ว!" : "เป้าหมายวันนี้"}</span>
      </div>
      <div className="goal-bar-big-count">{count} / {DAILY_GOAL} ครั้ง</div>
      <div className="goal-bar-track">
        <div
          className="goal-bar-fill"
          style={{
            width: `${Math.max(pct, count > 0 ? 4 : 0)}%`,
            background: done
              ? "linear-gradient(90deg, #a8d8a8, #5cb85c)"
              : `linear-gradient(90deg, #f9a8c9 0%, #fbbf7c ${Math.min(pct, 60)}%, #a8d8a8 100%)`,
          }}
        />
        {Array.from({ length: DAILY_GOAL - 1 }, (_, i) => (
          <div key={i} className="goal-bar-tick" style={{ left: `${((i + 1) / DAILY_GOAL) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

function WeeklyChart({ kicks }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });

  const counts = days.map((d) =>
    kicks.filter((k) => new Date(k.time).toDateString() === d.toDateString()).length
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="week-chart">
      <div className="week-bars">
        {days.map((d, i) => {
          const isToday = d.toDateString() === today.toDateString();
          const heightPct = (counts[i] / maxCount) * 100;
          return (
            <div className="week-bar-col" key={i}>
              <div className="week-bar-track">
                <div
                  className={`week-bar-fill ${isToday ? "week-bar-today" : ""}`}
                  style={{ height: `${Math.max(heightPct, counts[i] > 0 ? 8 : 0)}%` }}
                />
              </div>
              <div className={`week-day-label ${isToday ? "week-day-today" : ""}`}>
                {WEEK_DAYS_TH[d.getDay()]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlotBars({ kicks }) {
  const counts = MEAL_SLOTS.map((s) => kicks.filter((k) => k.meal === s.key).length);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="timeslot-bars">
      {MEAL_SLOTS.map((slot, i) => {
        const pct = (counts[i] / maxCount) * 100;
        const isActive = counts[i] === Math.max(...counts) && counts[i] > 0;
        return (
          <div className="timeslot-row" key={i}>
            <div className="timeslot-label">{slot.label}</div>
            <div className="timeslot-track">
              <div
                className={`timeslot-fill ${isActive ? "timeslot-fill-active" : "timeslot-fill-soft"}`}
                style={{ width: `${Math.max(pct, counts[i] > 0 ? 6 : 3)}%` }}
              />
              {counts[i] > 0 && (
                <span className="timeslot-count">{counts[i]}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PatternSummary({ todayKicks }) {
  const mealCounts = MEAL_SLOTS.map((s) => todayKicks.filter((k) => k.meal === s.key).length);
  const maxMealIdx = mealCounts.indexOf(Math.max(...mealCounts));
  const mostActiveMeal = mealCounts[maxMealIdx] > 0 ? MEAL_SLOTS[maxMealIdx].label : "—";

  const avgIntensity = todayKicks.length
    ? (todayKicks.reduce((s, k) => s + k.intensity, 0) / todayKicks.length).toFixed(1)
    : "—";

  const sortedKicks = [...todayKicks].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  const lastKickTime = sortedKicks.length > 0
    ? new Date(sortedKicks[0].time).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const goalReached = todayKicks.length >= DAILY_GOAL;

  return (
    <div className="summary-card">
      <div className="summary-title">
        <span>📊</span> สรุปรูปแบบการดิ้น
      </div>
      <div className="summary-rows">
        <div className="summary-row">
          <span className="summary-icon">📈</span>
          <span className="summary-key">ลูกดิ้นวันนี้:</span>
          <span className="summary-val" style={{ fontWeight: 700, color: goalReached ? "#4caf50" : "#c96b9b" }}>
            {todayKicks.length} / {DAILY_GOAL} ครั้ง
          </span>
        </div>
        <div className="summary-row">
          <span className="summary-icon">🕐</span>
          <span className="summary-key">เวลาที่ดิ้นล่าสุด:</span>
          <span className="summary-val">{lastKickTime}</span>
        </div>
        <div className="summary-row">
          <span className="summary-icon">⏰</span>
          <span className="summary-key">ช่วงที่ดิ้นบ่อย:</span>
          <span className="summary-val">{mostActiveMeal}</span>
        </div>
        <div className="summary-row">
          <span className="summary-icon">💪</span>
          <span className="summary-key">ความรุนแรงเฉลี่ย:</span>
          <span className="summary-val">{avgIntensity !== "—" ? `${avgIntensity} / 5 ⭐` : "—"}</span>
        </div>
      </div>
      <div className={`summary-insight ${goalReached ? "summary-insight-done" : ""}`}>
        {goalReached
          ? "💡 Mission completed! วันนี้เจ้าตัวน้อยดิ้นครบ 10 ครั้งแล้วค่ะ 🎉"
          : "💡 หากรู้สึกว่าลูกดิ้นน้อยลงหรือผิดไปจากเดิม ควรปรึกษาแพทย์เพื่อความสบายใจนะคะ"}
      </div>
    </div>
  );
}

function SetupModal({ onSave }) {
  const [tempDate, setTempDate] = useState("");

  return (
    <div className="modal-backdrop" style={{ alignItems: "center" }}>
      <div className="modal" style={{ borderRadius: 24, maxHeight: "none" }}>
        <div className="setup-content">
          <div className="setup-emoji">🤰</div>
          <div className="setup-title">ยินดีต้อนรับ!</div>
          <div className="setup-sub">
            กรุณากรอกวันกำหนดคลอด (EDC) ของคุณแม่<br/>
            เพื่อคำนวณอายุครรภ์ได้ถูกต้องค่ะ
          </div>
          <input
            type="date"
            className="setup-input"
            value={tempDate}
            onChange={(e) => setTempDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
          <button
            className="kick-btn"
            style={{ marginTop: 16, marginBottom: 0 }}
            onClick={() => {
              if (tempDate) onSave(tempDate);
            }}
            disabled={!tempDate}
          >
            <span>🤍</span>
            <span className="kick-btn-text">เริ่มใช้งาน</span>
            <span>▶</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [kicks, setKicks] = useState(() => {
    try {
      const saved = localStorage.getItem("kick-counter-data");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dueDate, setDueDate] = useState(() => {
    return localStorage.getItem("kick-counter-duedate") || "";
  });
  const [showSetup, setShowSetup] = useState(false);

  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [showHistory, setShowHistory] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [poseIndex, setPoseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("record");
  const kickBtnRef = useRef(null);

  const today = new Date();
  const dateStr = formatEnglishDate(today);
  const ga = dueDate ? getGaFromDueDate(dueDate) : null;

  useEffect(() => {
    const saved = localStorage.getItem("kick-counter-duedate");
    if (!saved) {
      setShowSetup(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kick-counter-data", JSON.stringify(kicks));
  }, [kicks]);

  function saveDueDate(date) {
    setDueDate(date);
    localStorage.setItem("kick-counter-duedate", date);
    setShowSetup(false);
  }

  const todayKicks = kicks.filter((k) => {
    const d = new Date(k.time);
    return d.toDateString() === today.toDateString();
  });

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const last7DaysKicks = kicks.filter((k) => new Date(k.time) >= sevenDaysAgo);

  function handleKick(e) {
    const newKick = { time: new Date().toISOString(), intensity: selectedIntensity, meal: selectedMeal };
    setKicks((prev) => [...prev, newKick]);
    setPoseIndex((prev) => prev + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    if (kickBtnRef.current) {
      const rect = kickBtnRef.current.getBoundingClientRect();
      const x = (e.clientX || rect.left + rect.width / 2) - rect.left;
      const y = (e.clientY || rect.top + rect.height / 2) - rect.top;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.cssText = `left:${x}px;top:${y}px;width:60px;height:60px;margin:-30px`;
      kickBtnRef.current.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }

    const id = Date.now();
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.55;
    setFloaters((prev) => [...prev, { id, x: cx, y: cy }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 1100);
  }

  return (
    <>
      <div className="app">
        {floaters.map((f) => (
          <div key={f.id} className="float-plus" style={{ left: f.x, top: f.y }}>
            +1 💕
          </div>
        ))}

        <div className="header">
          <div className="header-title">
            <div className="greeting">ตุ๊บตั๊บ ตุ๊บตั๊บ! 👶🏻</div>
            <div className="subtitle">วันนี้เจ้าตัวน้อยดิ้นไปกี่ครั้งแล้วนะ 🤍</div>
          </div>
        </div>

        <div className="date-row">
          <div className="date-badge-item">
            <span>📅</span>
            <span>{dateStr}</span>
          </div>
          <div
            className="date-badge-item date-badge-ga"
            onClick={() => setShowSetup(true)}
            style={{ cursor: "pointer" }}
          >
            <span>🤰</span>
            <span>
              {ga
                ? `GA ${ga.weeks}w ${ga.days}d`
                : "ตั้งค่าอายุครรภ์"}
            </span>
          </div>
        </div>

        <div className="content">
          {activeTab === "record" && (
            <>
              <KickGoalBar count={todayKicks.length} />

              <div className="baby-area">
                <span className="deco star1">⭐</span>
                <span className="deco star2">✦</span>
                <span className="deco heart1">🩷</span>
                <span className="deco heart2">💛</span>
                <span className="deco leaf1">🌿</span>
                <span className="deco leaf2">🌿</span>
                <span className="deco spark1">✨</span>
                <span className="deco spark2">✦</span>
                <BabyImage isAnimating={isAnimating} currentPose={poseIndex} />
              </div>

              <div className="card">
                <div className="card-title">⏱ ช่วงเวลาที่นับลูกดิ้น</div>
                <div className="meal-tabs">
                  {MEAL_SLOTS.map((m) => (
                    <button
                      key={m.key}
                      className={`meal-tab ${selectedMeal === m.key ? "meal-tab-active" : ""}`}
                      onClick={() => setSelectedMeal(m.key)}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="card-title">🌿 ตุ๊บนี้แรงแค่ไหน? 🌿</div>
                <div className="card-sub">เลือกระดับตามความรู้สึกได้เลย⭐</div>
                <div className="intensity-row">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div className="intensity-item" key={i} onClick={() => setSelectedIntensity(i)}>
                      <div className={`intensity-circle i${i} ${selectedIntensity === i ? "selected" : ""}`}>{i}</div>
                      <div className="intensity-label">{INTENSITY_LABELS[i - 1]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="kick-btn" ref={kickBtnRef} onClick={handleKick}>
                <span className="kick-btn-heart">🤍</span>
                <span className="kick-btn-text">บันทึก</span>
                <span className="kick-btn-icon">▶</span>
              </button>
            </>
          )}

          {activeTab === "pattern" && (
            <div className="pattern-page">
              <div className="report-card">
                <div className="report-card-title">กิจกรรมรายสัปดาห์</div>
                <WeeklyChart kicks={kicks} />
              </div>

              <div className="report-card">
                <div className="report-card-title">ช่วงเวลาที่ดิ้นบ่อย (7 วันล่าสุด)</div>
                <TimeSlotBars kicks={last7DaysKicks} />
              </div>

              <PatternSummary todayKicks={todayKicks} />

              <button className="kick-btn" onClick={() => setShowHistory(true)} style={{ marginTop: 4 }}>
                <span>📜</span>
                <span className="kick-btn-text">ดูประวัติทั้งหมด</span>
                <span>›</span>
              </button>
            </div>
          )}
        </div>

        <div className="bottom-nav">
          {[
            { icon: "📝", label: "บันทึก", key: "record" },
            { icon: "📊", label: "สรุปผล", key: "pattern" },
          ].map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {showHistory && (
        <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">ประวัติการดิ้น 👣</div>
            {kicks.length === 0 ? (
              <div className="no-history">
                ยังไม่มีบันทึก 🌸
                <br />
                กดปุ่มบันทึกเพื่อเริ่ม!
              </div>
            ) : (
              [...kicks].reverse().map((k, i) => {
                const d = new Date(k.time);
                return (
                  <div className="history-

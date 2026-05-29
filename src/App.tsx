import { useState, useRef, useEffect } from "react";
import "./index.css";

const INTENSITY_LABELS = ["เบามาก", "เบา", "พอดี", "แรง", "แรงมาก"];
const INTENSITY_EMOJIS = ["🍃", "⭐", "✨", "💪", "🔥"];
const BABY_POSES = ["/baby1.webp", "/baby2.webp", "/baby3.webp", "/baby4.webp"];
const WEEK_DAYS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const MEAL_SLOTS = [
  { key: "breakfast", label: "🌅 เช้า" },
  { key: "lunch", label: "☀️ กลางวัน" },
  { key: "dinner", label: "🌙 เย็น" },
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

function SetupModal({ onSave }) {
  const [tempDate, setTempDate] = useState("");
  return (
    <div className="modal-backdrop" style={{ alignItems: "center" }}>
      <div className="modal" style={{ borderRadius: 24 }}>
        <div className="setup-content">
          <div className="setup-emoji">🤰</div>
          <div className="setup-title">ยินดีต้อนรับ!</div>
          <input type="date" className="setup-input" value={tempDate} onChange={(e) => setTempDate(e.target.value)} />
          <button className="kick-btn" onClick={() => tempDate && onSave(tempDate)}>เริ่มใช้งาน</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [kicks, setKicks] = useState(() => {
    try { const saved = localStorage.getItem("kick-counter-data"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [dueDate, setDueDate] = useState(() => localStorage.getItem("kick-counter-duedate") || "");
  const [showSetup, setShowSetup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [isAnimating, setIsAnimating] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("record");
  const kickBtnRef = useRef(null);

  useEffect(() => { if (!localStorage.getItem("kick-counter-duedate")) setShowSetup(true); }, []);
  useEffect(() => { localStorage.setItem("kick-counter-data", JSON.stringify(kicks)); }, [kicks]);

  function saveDueDate(date) { setDueDate(date); localStorage.setItem("kick-counter-duedate", date); setShowSetup(false); }
  const today = new Date();
  const todayKicks = kicks.filter((k) => new Date(k.time).toDateString() === today.toDateString());
  const ga = dueDate ? getGaFromDueDate(dueDate) : null;

  function handleKick() {
    const newKick = { time: new Date().toISOString(), intensity: selectedIntensity, meal: selectedMeal };
    setKicks((prev) => [...prev, newKick]);
    setPoseIndex((prev) => prev + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  }

  return (
    <div className="app">
      <div className="header">ตุ๊บตั๊บ ตุ๊บตั๊บ! 👶🏻</div>
      <div className="date-badge" onClick={() => setShowSetup(true)}>
        {ga ? `GA ${ga.weeks}w ${ga.days}d` : "ตั้งค่าวันกำหนดคลอด"}
      </div>

      {activeTab === "record" && (
        <>
          <div className="goal-bar">วันนี้ {todayKicks.length} / {DAILY_GOAL} ครั้ง</div>
          <img src={BABY_POSES[poseIndex % 4]} className={`belly-svg ${isAnimating ? "kick-anim" : ""}`} alt="baby" />
          <button className="kick-btn" onClick={handleKick}>บันทึกการดิ้น</button>
        </>
      )}

      <div className="bottom-nav">
        <div onClick={() => setActiveTab("record")}>📝 บันทึก</div>
        <div onClick={() => setActiveTab("pattern")}>📊 สรุปผล</div>
      </div>

      {showHistory && (
        <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="modal">
            <h3>ประวัติการดิ้น 👣</h3>
            {[...kicks].reverse().map((k, i) => (
              <div key={i} className="history-item">
                {new Date(k.time).toLocaleTimeString("th-TH")} - ระดับ {k.intensity}
              </div>
            ))}
          </div>
        </div>
      )}

      {showSetup && <SetupModal onSave={saveDueDate} />}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import "./index.css";

const INTENSITY_LABELS = ["เบามาก", "เบา", "พอดี", "แรง", "แรงมาก"];
const INTENSITY_EMOJIS = ["🍃", "⭐", "✨", "💪", "🔥"];
const BABY_POSES = ["/baby1.webp", "/baby2.webp", "/baby3.webp", "/baby4.webp"];
const MEAL_SLOTS = [
  { key: "breakfast", label: "🌅 เช้า" },
  { key: "lunch", label: "☀️ กลางวัน" },
  { key: "dinner", label: "🌙 เย็น" },
];

export default function App() {
  const [kicks, setKicks] = useState(() => {
    try { const saved = localStorage.getItem("kick-counter-data"); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [dueDate, setDueDate] = useState(() => localStorage.getItem("kick-counter-duedate") || "");
  const [showSetup, setShowSetup] = useState(!localStorage.getItem("kick-counter-duedate"));
  const [showHistory, setShowHistory] = useState(false);
  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const [activeTab, setActiveTab] = useState("record");
  const [poseIndex, setPoseIndex] = useState(0);

  useEffect(() => { localStorage.setItem("kick-counter-data", JSON.stringify(kicks)); }, [kicks]);

  function handleKick() {
    const newKick = { time: new Date().toISOString(), intensity: selectedIntensity };
    setKicks((prev) => [...prev, newKick]);
    setPoseIndex((prev) => prev + 1);
  }

  return (
    <div className="app">
      <div className="header">ตุ๊บตั๊บ ตุ๊บตั๊บ! 👶🏻</div>
      <div onClick={() => setShowSetup(true)}>📅 วันกำหนดคลอด: {dueDate || "ยังไม่ได้ตั้งค่า"}</div>

      {activeTab === "record" && (
        <>
          <div className="goal-bar">วันนี้ {kicks.length} / 10 ครั้ง</div>
          <img src={BABY_POSES[poseIndex % 4]} alt="baby" style={{width: '200px'}} />
          <div>เลือกระดับความแรง:</div>
          {INTENSITY_LABELS.map((l, i) => (
            <button key={i} onClick={() => setSelectedIntensity(i + 1)}>{INTENSITY_EMOJIS[i]}</button>
          ))}
          <button className="kick-btn" onClick={handleKick}>บันทึกการดิ้น</button>
        </>
      )}

      {activeTab === "pattern" && (
        <div className="report-card">
          <h3>ประวัติทั้งหมด</h3>
          {[...kicks].reverse().map((k, i) => (
            <div key={i}>{new Date(k.time).toLocaleString()} - ระดับ {k.intensity}</div>
          ))}
        </div>
      )}

      <div className="bottom-nav">
        <button onClick={() => setActiveTab("record")}>📝 บันทึก</button>
        <button onClick={() => setActiveTab("pattern")}>📊 สรุปผล</button>
      </div>

      {showSetup && (
        <div className="modal-backdrop">
          <input type="date" onChange={(e) => setDueDate(e.target.value)} />
          <button onClick={() => { localStorage.setItem("kick-counter-duedate", dueDate); setShowSetup(false); }}>ตกลง</button>
        </div>
      )}
    </div>
  );
}

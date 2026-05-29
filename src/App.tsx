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

// ... (คงฟังก์ชัน helper ไว้เหมือนเดิม)

export default function App() {
  // ... (state และ logic เดิมของคุณ)

  return (
    <>
      <div className="app">
        {/* ส่วน Header และ Content ของคุณ */}
        {/* ... */}
      </div>

      {showHistory && (
        <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">ประวัติการดิ้น 👣</div>
            {kicks.length === 0 ? (
              <div className="no-history">ยังไม่มีบันทึก 🌸<br />กดปุ่มบันทึกเพื่อเริ่ม!</div>
            ) : (
              [...kicks].reverse().map((k, i) => {
                const d = new Date(k.time);
                return (
                  <div className="history-item" key={i}>
                    <div className="history-time">{d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div className="history-intensity">{INTENSITY_EMOJIS[k.intensity - 1]}</div>
                    <div>
                      <div style={{ fontSize: 13, color: "#5a3e28", fontWeight: 500 }}>ระดับ {k.intensity}</div>
                      <div className="history-label">{INTENSITY_LABELS[k.intensity - 1]}</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: "#a08060" }}>
                      {formatEnglishDate(d)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showSetup && (
        <SetupModal onSave={saveDueDate} />
      )}
    </>
  );
}

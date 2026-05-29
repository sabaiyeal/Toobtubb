import React, { useState } from "react";

interface KickRecord {
  id: string;
  time: string;
  mealSlot: string;
  intensity: string;
}

function App() {
  const [kicks, setKicks] = useState<KickRecord[]>([]);
  const [intensity, setIntensity] = useState<string>("พอดี");
  const [mealSlot, setMealSlot] = useState<string>("กลางวัน");
  const [currentTab, setCurrentTab] = useState<"บันทึก" | "สรุปผล">("บันทึก");

  const todayCount = kicks.length;
  const goalCount = 10;

  // ฟังก์ชันกดที่ตัวน้องเด็กเพื่อบันทึกการดิ้น
  const handleKickClick = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newKick: KickRecord = {
      id: Math.random().toString(36).substr(2, 9),
      time: timeString,
      mealSlot: mealSlot,
      intensity: intensity,
    };

    setKicks([newKick, ...kicks]);
  };

  // คำนวณสถิติสำหรับหน้าสรุปผล
  const getMealCount = (slot: string) => kicks.filter((k) => k.mealSlot === slot).length;

  return (
    <div className="app-container">
      {/* ส่วนหัวแอป */}
      <div className="header-section">
        <h1 className="main-title">ตุ๊บตั๊บ ตุ๊บตั๊บ! 👶🏻</h1>
        <p className="sub-title">วันนี้เจ้าตัวน้อยดิ้นไปกี่ครั้งแล้วนะ 🤍</p>
      </div>

      {/* แถบข้อมูล วันที่ & GA */}
      <div className="info-badges">
        <div className="badge badge-date">📅 29 MAY 26</div>
        <div className="badge badge-ga">🤰 GA 32w 0d</div>
      </div>

      {/* หน้าแรก: บันทึก */}
      {currentTab === "บันทึก" && (
        <div className="tab-content">
          {/* การ์ดเป้าหมาย */}
          <div className="goal-card">
            <div className="goal-label">เป้าหมายวันนี้</div>
            <div className="goal-counter">{todayCount} / {goalCount} ครั้ง</div>
            <div className="goal-dots">
              {[...Array(goalCount)].map((_, i) => (
                <div 
                  key={i} 
                  className={`dot ${i < todayCount ? "dot-filled" : ""}`}
                ></div>
              ))}
            </div>
          </div>

          {/* โซนรูปน้องเด็กสำหรับกดนับ */}
          <div className="baby-container" onClick={handleKickClick}>
            <div className="decorations">
              <span className="star">⭐</span>
              <span className="leaf-left">🌿</span>
              <span className="leaf-right">🌿</span>
              <span className="heart">💖</span>
            </div>
            {/* ดึงรูปน้องนอนหลับปุ๋ยจากโฟลเดอร์โปรเจกต์คุณหมอ */}
            <img 
              src="/image_60.png" 
              alt="Baby sleeping in womb" 
              className="baby-womb-img"
              onError={(e) => {
                // กันเหนียวถ้ารูปไม่ขึ้น ให้ใช้ URL สากลแทนครับ
                e.currentTarget.src = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/People/Baby.png";
              }}
            />
          </div>

          {/* ฟอร์มเลือกช่วงเวลาด้านล่าง */}
          <div className="control-sheet">
            <h3 className="sheet-title">⏱️ ช่วงเวลาที่นับลูกดิ้น</h3>
            <div className="selector-grid">
              {["เช้า", "กลางวัน", "เย็น"].map((slot) => (
                <button
                  key={slot}
                  className={`select-btn ${mealSlot === slot ? "active" : ""}`}
                  onClick={() => setMealSlot(slot)}
                >
                  มื้อ{slot}
                </button>
              ))}
            </div>

            <h3 className="sheet-title" style={{ marginTop: "15px" }}>✨ ความแรง</h3>
            <div className="selector-grid intensity-grid">
              {["เบา", "พอดี", "แรง"].map((level) => (
                <button
                  key={level}
                  className={`select-btn ${intensity === level ? "active" : ""}`}
                  onClick={() => setIntensity(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* หน้าสอง: สรุปผล */}
      {currentTab === "สรุปผล" && (
        <div className="tab-content">
          <div className="control-sheet" style={{ marginTop: "20px" }}>
            <h3 className="sheet-title">📊 สรุปการดิ้นแยกตามมื้อ</h3>
            <div className="report-row">🌅 มื้อเช้า: <strong>{getMealCount("เช้า")} ครั้ง</strong></div>
            <div className="report-row">☀️ มื้อกลางวัน: <strong>{getMealCount("กลางวัน")} ครั้ง</strong></div>
            <div className="report-row">🌙 มื้อเย็น: <strong>{getMealCount("เย็น")} ครั้ง</strong></div>
          </div>

          <div className="control-sheet" style={{ marginTop: "15px" }}>
            <h3 className="sheet-title">👶🏻 ประวัติการดิ้นวันนี้</h3>
            <div className="history-list">
              {kicks.length === 0 ? (
                <p className="empty-text">ยังไม่มีบันทึกของวันนี้</p>
              ) : (
                kicks.map((k) => (
                  <div key={k.id} className="history-item">
                    <span>⏰ เวลา {k.time} น.</span>
                    <span>มื้อ{k.mealSlot} ({k.intensity})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* แถบเมนูด้านล่างสุด (Bottom Navigation) */}
      <div className="bottom-nav">
        <div 
          className={`nav-item ${currentTab === "บันทึก" ? "active" : ""}`}
          onClick={() => setCurrentTab("บันทึก")}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">บันทึก</span>
        </div>
        <div 
          className={`nav-item ${currentTab === "สรุปผล" ? "active" : ""}`}
          onClick={() => setCurrentTab("สรุปผล")}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">สรุปผล</span>
        </div>
      </div>
    </div>
  );
}

export default App;

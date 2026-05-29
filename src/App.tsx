import React, { useState, useEffect } from "react";

interface KickRecord {
  id: string;
  time: string;
  mealSlot: string;
  intensity: string;
}

export function App() {
  const [kicks, setKicks] = useState<KickRecord[]>([]);
  const [intensity, setIntensity] = useState<string>("พอดี");
  const [mealSlot, setMealSlot] = useState<string>("กลางวัน");
  const [isKicking, setIsKicking] = useState<boolean>(false);

  // คำนวณจำนวนการดิ้นของวันนี้
  const todayCount = kicks.length;
  const goalCount = 10;
  const progressPercent = Math.min((todayCount / goalCount) * 100, 100);

  // ฟังก์ชันกดนับลูกดิ้น
  const handleKickClick = () => {
    setIsKicking(true);
    setTimeout(() => setIsKicking(false), 400);

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

  // นับจำนวนแยกตามมื้ออาหาร
  const getMealCount = (slot: string) => kicks.filter((k) => k.mealSlot === slot).length;
  const morningCount = getMealCount("เช้า");
  const afternoonCount = getMealCount("กลางวัน");
  const eveningCount = getMealCount("เย็น");
  const maxMealCount = Math.max(morningCount, afternoonCount, eveningCount, 1);

  return (
    <>
      {/* ส่วนหัวของแอป */}
      <div className="header">
        <h1>ตุ๊บตั๊บ</h1>
        <p>บันทึกการดิ้นของเจ้าตัวเล็ก</p>
        <div className="date-badge">29 MAY 26</div>
      </div>

      {/* เนื้อหาหลักข้างใน */}
      <div className="main-content">
        {/* การ์ดเป้าหมายวันนี้ */}
        <div className="card goal-section">
          <div className="goal-title">เป้าหมายวันนี้</div>
          <div className="goal-count">
            {todayCount} / {goalCount} ครั้ง
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* ปุ่มวงกลมพุงน้องเด็กสำหรับกดนับ */}
        <div className="kick-btn-container">
          <div className={`kick-circle-btn ${isKicking ? "kick-anim" : ""}`} onClick={handleKickClick}>
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/main/Emojis/People/Baby.png" 
              alt="Baby" 
            />
          </div>
        </div>

        {/* ส่วนเลือกความแรงและมื้ออาหาร */}
        <div className="card">
          <span className="selector-label">ความแรงของการดิ้น</span>
          <div className="intensity-grid">
            {[
              { emoji: "🌱", text: "เบามาก" },
              { emoji: "⭐", text: "เบา" },
              { emoji: "✨", text: "พอดี" },
              { emoji: "💪", text: "แรง" },
              { emoji: "🔥", text: "แรงมาก" }
            ].map((item) => (
              <div
                key={item.text}
                className={`intensity-item ${intensity === item.text ? "active" : ""}`}
                onClick={() => setIntensity(item.text)}
              >
                <span className="emoji">{item.emoji}</span>
                <span className="text">{item.text}</span>
              </div>
            ))}
          </div>

          <span className="selector-label" style={{ marginTop: "20px" }}>
            ช่วงเวลามื้ออาหาร
          </span >
          <div className="meal-grid">
            {[
              { label: "🌅 เช้า", value: "เช้า" },
              { label: "☀️ กลางวัน", value: "กลางวัน" },
              { label: "🌙 เย็น", value: "เย็น" }
            ].map((item) => (
              <div
                key={item.value}
                className={`meal-item ${mealSlot === item.value ? "active" : ""}`}
                onClick={() => setMealSlot(item.value)}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* สถิติแยกตามมื้ออาหาร */}
        <div className="card">
          <h3 className="stats-title">📊 สรุปรูปแบบการดิ้น</h3>
          <div className="chart-container">
            {[
              { label: "🌅 เช้า", count: morningCount },
              { label: "☀️ กลางวัน", count: afternoonCount },
              { label: "🌙 เย็น", count: eveningCount }
            ].map((row) => (
              <div key={row.label} className="chart-row">
                <div className="chart-label">{row.label}</div>
                <div className="chart-bar-bg">
                  <div
                    className="chart-bar-fill"
                    style={{ width: `${(row.count / maxMealCount) * 100}%` }}
                  ></div>
                  <span className="chart-value">{row.count} ครั้ง</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ประวัติการกดดิ้นล่าสุด */}
        <div className="card">
          <h3 className="stats-title">👶🏻 ลูกดิ้นวันนี้</h3>
          <div className="history-list">
            {kicks.length === 0 ? (
              <div style={{ textAlign: "center", color: "#8a7a82", fontSize: "13px", padding: "10px 0" }}>
                ยังไม่มีข้อมูลการดิ้นของวันนี้
              </div>
            ) : (
              kicks.map((kick) => (
                <div key={kick.id} className="history-item">
                  <span>⏰ เวลา {kick.time} น.</span>
                  <span>
                    มื้อ {kick.mealSlot} ({kick.intensity})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ชาร์ตจำลองสถิติย้อนหลัง 7 วัน */}
        <div className="card">
          <h3 className="stats-title">📅 สถิติย้อนหลัง 7 วัน</h3>
          <div className="week-chart-container">
            {[
              { day: "ส", h: 40 },
              { day: "อา", h: 55 },
              { day: "จ", h: 30 },
              { day: "อ", h: 70 },
              { day: "พ", h: 45 },
              { day: "พฤ", h: 60 },
              { day: "ศ", h: progressPercent, isToday: true }
            ].map((item, idx) => (
              <div key={idx} className="week-column">
                <div className="week-bar-bg">
                  <div
                    className={`week-bar-fill ${item.isToday ? "today" : ""}`}
                    style={{ height: `${item.h}%` }}
                  ></div>
                </div>
                <span className={`week-label ${item.isToday ? "today" : ""}`}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

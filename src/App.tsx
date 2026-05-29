import { useState, useRef, useEffect } from "react";
import "./index.css";
// 1. เชื่อมฐานข้อมูลกลาง Firebase (เปิดประตูกุญแจ)
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// ประกาศให้ Type Window รู้จัก liff ของระบบ LINE พังจะได้ไม่เออเร่อ
declare global {
  interface Window {
    liff?: any;
  }
}

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

interface Kick {
  time: string;
  intensity: number;
  meal?: string;
}

interface Floater {
  id: number;
  x: number;
  y: number;
}

function formatEnglishDate(date: Date): string {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

function getGaFromDueDate(dueDateStr: string): { weeks: number; days: number } {
  const due = new Date(dueDateStr);
  const today = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysToDue = Math.ceil((due.getTime() - today.getTime()) / msPerDay);
  const totalGaDays = 40 * 7 - daysToDue;
  const weeks = Math.floor(totalGaDays / 7);
  const days = totalGaDays % 7;
  return { weeks: Math.max(0, weeks), days: Math.max(0, days) };
}

function BabyImage({ isAnimating, currentPose }: { isAnimating: boolean; currentPose: number }) {
  const src = BABY_POSES[currentPose % 4];
  return (
    <img
      src={src}
      alt={`Baby pose ${(currentPose % 4) + 1}`}
      className={`belly-svg ${isAnimating ? "kick-anim" : ""}`}
    />
  );
}

function getKicksInTimeSlot(kicks: Kick[], startHour: number, endHour: number): Kick[] {
  return kicks.filter((k) => {
    const hour = new Date(k.time).getHours();
    return hour >= startHour && hour < endHour;
  });
}

function KickGoalBar({ count }: { count: number }) {
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

function WeeklyChart({ kicks }: { kicks: Kick[] }) {
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

function TimeSlotBars({ kicks }: { kicks: Kick[] }) {
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

function PatternSummary({ todayKicks }: { todayKicks: Kick[] }) {
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
        <div className="

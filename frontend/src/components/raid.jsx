import React, { useEffect, useState } from "react";
import axios from "axios";
import "./milestone.css";

const ACTIVITY_CATEGORIES = {
  raid: {
    label: "레이드",
    color: "#9c27b0",
    keywords: ["왕의 몰락", "크로타의 최후", "딥스톤 무덤", "유리 금고", "신봉자의 서약", "구원의 정원", "마지막 소원", "구원의 경계"]
  },
  dungeon: {
    label: "던전",
    color: "#4f81bd",
    keywords: ["심해의 유령", "이단의 구덩이", "예언", "감시자의 첨탑", "베스퍼의 주인", "조각난 왕관", "찢어낸 교리", "이중성", "악몽의 뿌리", "전쟁군주의 폐허"]
  }
};

function classifyActivity(name) {
  for (const [key, { keywords }] of Object.entries(ACTIVITY_CATEGORIES)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return key;
    }
  }
  return null;
}

function RaidCard({ activityName, modifiers = [], rewards = [] }) {
  return (
    <div className="milestone">
      <h3 className="milestone-title">{activityName}</h3>

      {modifiers.length > 0 && (
        <div className="milestone-modifiers">
          <p>모디파이어</p>
          <ul className="modifier-list">
            {modifiers.map((mod, i) => (
              <li key={i} className="modifier-item">
                {mod.icon && (
                  <img
                    src={`https://www.bungie.net${mod.icon}`}
                    alt=""
                    className="modifier-icon"
                  />
                )}
                {mod.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rewards.length > 0 && (
        <div className="milestone-rewards">
          <p>보상:</p>
          <ul className="modifier-list">
            {rewards.map((reward, i) => <li key={i}>{reward}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Raid() {
  const [milestone, setMilestone] = useState(null);
  const [defs, setDefs] = useState({ milestone: {}, activity: {}, modifier: {} });
  const [expanded, setExpanded] = useState({ raid: true, dungeon: true });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/weekly`)
      .then((res) => {
        setMilestone(res.data.milestone);
        setDefs({
          milestone: res.data.milestone_def,
          activity: res.data.activity_def,
          modifier: res.data.modifier_def,
        });
      })
      .catch((err) => {
        console.error("로드 실패:", err);
        alert("데이터를 불러오지 못했습니다.");
      });
  }, []);

  if (!milestone) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const categorized = { raid: [], dungeon: [] };
  const seen = new Set();

  for (const [hash, data] of Object.entries(milestone)) {
    const rewards = Object.values(data.rewards || {}).flatMap(reward =>
      Object.values(reward.rewardEntries || {}).map(entry =>
        entry.displayProperties?.name || "이름 없음"
      )
    );

    for (const act of data.activities || []) {
      const activityHash = act.activityHash;
      if (seen.has(activityHash)) continue;
      seen.add(activityHash);

      const activity = defs.activity[activityHash];
      const activityName = activity?.displayProperties?.name || "활동 없음";
      const category = classifyActivity(activityName);
      if (!category) continue;

      const modifiers = (act.modifierHashes || [])
        .map(h => {
          const mod = defs.modifier[h]?.displayProperties;
          if (!mod?.name || mod.name === "???") return null;
          return { name: mod.name, icon: mod.icon || null };
        })
        .filter(Boolean);

      categorized[category].push(
        <RaidCard
          key={activityHash}
          activityName={activityName}
          modifiers={modifiers}
          rewards={rewards}
        />
      );
    }
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      {Object.entries(ACTIVITY_CATEGORIES).map(([key, { label, color }]) => (
        <div key={key}>
          <div
            className="milestone-header"
            style={{ backgroundColor: color, marginBottom: "10px" }}
            onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
          >
            {expanded[key] ? "▼" : "▶"} {label}
          </div>
          {expanded[key] && <div className="milestone-container">{categorized[key]}</div>}
        </div>
      ))}
    </div>
  );
}

export default Raid;

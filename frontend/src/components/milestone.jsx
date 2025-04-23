import React, { useEffect, useState } from "react";
import axios from "axios";
import "./milestone.css";

const ACTIVITY_CATEGORIES = {
  vanguard: {
    label: "선봉대",
    color: "#3b45d0",
    keywords: ["공격전", "황혼전", "맹공격", "전장"]
  },
  crucible: {
    label: "시련의 장",
    color: "#d03b3b",
    keywords: ["점령", "난투", "경쟁", "격돌", "아수라장", "소각", "탄력 제어", "카운트다운"]
  },
  gambit: {
    label: "갬빗",
    color: "#30b455",
    keywords: ["갬빗"]
  }
};

function classifyActivity(name) {
  for (const [key, { keywords }] of Object.entries(ACTIVITY_CATEGORIES)) {
    if (keywords.some(k => name.includes(k))) {
      return key;
    }
  }
  return null;
}

function MilestoneCard({ activityName, modifiers = [], rewards = [] }) {
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
                    alt={mod.name}
                    className="modifier-icon"
                  />
                )}
                <span>{mod.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {rewards.length > 0 && (
        <div className="milestone-rewards">
          <p>보상:</p>
          <ul>
            {rewards.map((reward, i) => <li key={i}>{reward}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Milestone() {
  const [milestone, setMilestone] = useState(null);
  const [defs, setDefs] = useState({ milestone: {}, activity: {}, modifier: {} });
  const [expanded, setExpanded] = useState({
    vanguard: true,
    crucible: true,
    gambit: true
  });

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
        console.error("마일스톤 로딩 실패:", err);
        alert("마일스톤 데이터를 불러오지 못했습니다.");
      });
  }, []);

  if (!milestone) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const categorized = {
    vanguard: [],
    crucible: [],
    gambit: []
  };

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
          const modDef = defs.modifier[h];
          const name = modDef?.displayProperties?.name;
          if (!name || name === "???") return null;
          return {
            name,
            icon: modDef?.displayProperties?.icon || null,
          };
        })
        .filter(Boolean);

      categorized[category].push(
        <MilestoneCard
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
            style={{ backgroundColor: color }}
            onClick={() => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))}
          >
            {expanded[key] ? "▼" : "▶"} {label}
          </div>
          {expanded[key] && (
            <div className="milestone-container">
              {categorized[key]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Milestone;

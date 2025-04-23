import React, { useEffect, useState } from "react";
import axios from "axios";
import "./milestone.css";

const ACTIVITY_TYPE_INFO = {
  3652020199: { label: "선봉대", color: "#3b45d0" },
  4088006058: { label: "시련의 장", color: "#d03b3b" },
  248695599:  { label: "갬빗", color: "#30b455" }
};

function MilestoneCard({ activityName, modifiers = [], rewards = [] }) {
  return (
    <div className="milestone">
      <h3 className="milestone-title">{activityName}</h3>
      {modifiers.length > 0 && (
        <div className="milestone-modifiers">
          <p>모디파이어:</p>
          <ul>{modifiers.map((mod, i) => <li key={i}>{mod}</li>)}</ul>
        </div>
      )}
      {rewards.length > 0 && (
        <div className="milestone-rewards">
          <p>보상:</p>
          <ul>{rewards.map((reward, i) => <li key={i}>{reward}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

function Milestone() {
  const [milestone, setMilestone] = useState(null);
  const [defs, setDefs] = useState({ milestone: {}, activity: {}, modifier: {} });
  const [activityTypeMap, setActivityTypeMap] = useState({});
  const [expanded, setExpanded] = useState({
    3652020199: true,
    4088006058: true,
    248695599: true
  });

  useEffect(() => {
    axios.get("http://localhost:5000/weekly")
      .then((res) => {
        setMilestone(res.data.milestone);
        setDefs({
          milestone: res.data.milestone_def,
          activity: res.data.activity_def,
          modifier: res.data.modifier_def,
        });
        setActivityTypeMap(res.data.activity_type_map || {});
      })
      .catch((err) => {
        console.error("마일스톤 로딩 실패:", err);
        alert("마일스톤 데이터를 불러오지 못했습니다.");
      });
  }, []);

  if (!milestone) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  const categorized = {
    3652020199: [],
    4088006058: [],
    248695599: []
  };

  for (const [hash, data] of Object.entries(milestone)) {
    const rewards = Object.values(data.rewards || {}).flatMap(reward =>
      Object.values(reward.rewardEntries || {}).map(entry =>
        entry.displayProperties?.name || "이름 없음"
      )
    );

    for (const act of data.activities || []) {
      const activityHash = act.activityHash;
      const typeHash = activityTypeMap[activityHash]; // 백엔드에서 받은 매핑 정보
      const activityName = defs.activity[activityHash]?.displayProperties?.name || "활동 없음";
      const modifiers = act.modifierHashes?.map(h => defs.modifier[h]?.displayProperties?.name || "???") || [];

      if ([3652020199, 4088006058, 248695599].includes(typeHash)) {
        categorized[typeHash].push(
          <MilestoneCard
            key={`${hash}-${activityHash}`}
            activityName={activityName}
            modifiers={modifiers}
            rewards={rewards}
          />
        );
      }
    }
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>플레이리스트</h2>
      {Object.entries(ACTIVITY_TYPE_INFO).map(([typeHash, { label, color }]) => (
        <div key={typeHash}>
          <div
            className="milestone-header"
            style={{ backgroundColor: color }}
            onClick={() => setExpanded(prev => ({ ...prev, [typeHash]: !prev[typeHash] }))}
          >
            ▶ {label}
          </div>
          {expanded[typeHash] && (
            <div className="milestone-container">
              {categorized[typeHash]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Milestone;

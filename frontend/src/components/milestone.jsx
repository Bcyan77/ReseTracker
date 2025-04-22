import React, { useEffect, useState } from "react";
import axios from "axios";
import "./milestone.css";

// 카드 UI
function MilestoneCard({ milestoneName, activityName, modifiers = [], startDate, endDate }) {
  return (
    <div className="milestone">
      <h3 className="milestone-title">{milestoneName}</h3>
      <p className="milestone-activity">활동: {activityName}</p>
      {modifiers.length > 0 && (
        <div className="milestone-modifiers">
          <p>모디파이어:</p>
          <ul>
            {modifiers.map((mod, i) => <li key={i}>{mod}</li>)}
          </ul>
        </div>
      )}
      <p className="milestone-period">
        기간: {startDate ? new Date(startDate).toLocaleString() : "?"} ~ {endDate ? new Date(endDate).toLocaleString() : "?"}
      </p>
    </div>
  );
}

// 전체 컴포넌트
function Milestone() {
  const [milestone, setMilestone] = useState(null);
  const [defs, setDefs] = useState({ milestone: {}, activity: {}, modifier: {} });
  const [whitelist, setWhitelist] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/weekly")
      .then((res) => {
        setMilestone(res.data.milestone.Response);
        setDefs({
          milestone: res.data.milestone_def,
          activity: res.data.activity_def,
          modifier: res.data.modifier_def
        });
        setWhitelist(res.data.powerfulMilestones);
      });
  }, []);

  if (!milestone) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>강력한 장비 또는 최고급 장비 주간 콘텐츠</h2>
      {Object.entries(milestone).map(([hash, data]) => {
        if (!whitelist.includes(hash)) return null;

        const milestoneName = defs.milestone[hash]?.displayProperties?.name || "이름 없음";
        const start = data.startDate;
        const end = data.endDate;
        const activities = data.activities || [];

        return activities.map((act, idx) => {
          const activityName = defs.activity[act.activityHash]?.displayProperties?.name || "활동 없음";
          const modifiers = act.modifierHashes?.map(
            h => defs.modifier[h]?.displayProperties?.name || "???"
          ) || [];

          return (
            <MilestoneCard
              key={`${hash}-${idx}`}
              milestoneName={milestoneName}
              activityName={activityName}
              modifiers={modifiers}
              startDate={start}
              endDate={end}
            />
          );
        });
      })}
    </div>
  );
}

export default Milestone;

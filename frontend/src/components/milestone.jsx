import React, { useEffect, useState } from "react";
import axios from "axios";
import "./milestone.css";

// 🧩 카드 UI
function MilestoneCard({ milestoneName, activityName, modifiers = [], rewards = [], rewardIcons = {} }) {
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

      {rewards.length > 0 && (
        <div className="milestone-rewards">
          <p>보상:</p>
          <ul>
            {rewards.map((reward, i) => (
              <li key={i}>
                {reward}
                {rewardIcons[reward] && (
                  <img 
                    src={rewardIcons[reward]} 
                    alt="보상 아이콘" 
                    className="reward-icon" 
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 🧩 전체 마일스톤 목록 컴포넌트
function Milestone() {
  const [milestone, setMilestone] = useState(null);
  const [defs, setDefs] = useState({ milestone: {}, activity: {}, modifier: {} });
  const [rewardIcons, setRewardIcons] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/weekly")
      .then((res) => {
        setMilestone(res.data.milestone.Response);
        setDefs({
          milestone: res.data.milestone_def,
          activity: res.data.activity_def,
          modifier: res.data.modifier_def
        });
        setRewardIcons(res.data.milestone_reward_icons);
      });
  }, []);
  
  const renderRewards = (rewards) => {
    return rewards.map((reward, index) => {
      const icon = rewardIcons[reward];
      return (
        <li key={index}>
          {reward} {icon && <img src={icon} alt="아이콘" className="reward-icon" />}
        </li>
      );
    });
  };  

  if (!milestone) return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>주간 마일스톤 활동</h2>
      <div className="milestone-container">
        {Object.entries(milestone).map(([hash, data]) => {
          const milestoneName = defs.milestone[hash]?.displayProperties?.name || "이름 없음";
          const activities = data.activities || [];

          // 🎁 보상 이름 추출
          const rewards = Object.values(data.rewards || {}).flatMap(reward =>
            Object.values(reward.rewardEntries || {}).map(entry =>
              entry.displayProperties?.name || "이름 없음"
            )
          );

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
                rewards={rewards}
              />
            );
          });
        })}
      </div>
    </div>
  );
}

export default Milestone;
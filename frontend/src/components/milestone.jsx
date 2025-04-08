import React, {useEffect, useState} from "react";
import axios from "axios";

function Milestone() {
  const [milestone, setMilestone] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/weekly")
      .then((res) => {
        setMilestone(res.data);
      })
      .catch((err) => {
        console.error("마일스톤 요청 실패:", err);
      });
  }, []);

  if (!milestone) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={{ color: "white" }}>
      <h2>주간 마일스톤</h2>
      <pre>{JSON.stringify(milestone, null, 2)}</pre>
    </div>
  );
}

export default Milestone;

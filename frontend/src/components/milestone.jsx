import React, { useEffect, useState } from "react";
import axios from "axios";

function Milestone() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/weekly")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("마일스톤 요청 실패:", err);
      });
  }, []); // 빈 배열이므로 처음 마운트될 때 1번 실행됨

  if (!data) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={{ color: "white" }}>
      <h2>주간 마일스톤</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Milestone;

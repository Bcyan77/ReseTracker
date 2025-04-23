import { useState } from "react"
import Milestone from "./components/milestone"
import Raid from "./components/raid"
import User from "./components/user"
import Vendor from "./components/vendor"

import "./App.css";

function App(){
  const [tab, setTab] = useState("milestone");

  return(
    <div>
      <div className="tab-container">
        <div className="logo">ReseTracker</div>

        <button
          className={`tab-button ${tab === "milestone" ? "active" : ""}`}
          onClick={() => setTab("milestone")}>
          플레이리스트
        </button>
        <button
          className={`tab-button ${tab === "raid" ? "active" : ""}`}
          onClick={() => setTab("raid")}>
          레이드/던전
        </button>
        {/*<button
          className={`tab-button ${tab === "vendor" ? "active" : ""}`}
          onClick={() => setTab("vendor")}>
          상인
        </button>*/}
        <button
          className={`tab-button ${tab === "user" ? "active" : ""}`}
          onClick={() => setTab("user")}>
          수호자 찾기
        </button>
      </div>

        {tab === "milestone" && <Milestone />}
        {tab === "raid" && <Raid />}
        {tab === "vendor" && <Vendor />}
        {tab === "user" && <User />}
    </div>
  )
}

export default App;
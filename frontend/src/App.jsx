import { useState } from "react"
import Milestone from "./components/milestone"
import User from "./components/user"
import Vendor from "./components/vendor"

import "./App.css";

function App(){
  const [tab, setTab] = useState("user");

  return(
    <div>
      <div className="tab-container">
        <div className="logo">ReseTracker</div>

        <button
          className={`tab-button ${tab === "milestone" ? "active" : ""}`}
          onClick={() => setTab("milestone")}>
          주간
        </button>
        <button
          className={`tab-button ${tab === "vendor" ? "active" : ""}`}
          onClick={() => setTab("vendor")}>
          상인
        </button>
        <button
          className={`tab-button ${tab === "user" ? "active" : ""}`}
          onClick={() => setTab("user")}>
          수호자 찾기
        </button>
      </div>

        {tab === "milestone" && <Milestone />}
        {tab === "vendor" && <Vendor />}
        {tab === "user" && <User />}
    </div>
  )
}

export default App;
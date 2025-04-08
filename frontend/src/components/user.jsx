import React, {useState} from "react";
import axios from "axios";

import "./user.css"

function User(){
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const searchUser = async() => {
    try{
      const res = await axios.get(`http://localhost:5000/user/${username}`);
      setResult(res.data);
    }
    catch(err){
      console.log(err);
    }
  }
  return(
    <div className="user-container">
      <input className="user-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="번지 이름(태그 제외)"
      />
      <button className="user-button" onClick={searchUser}>검색</button>
      {result?.Response?.searchResults?.length > 0 &&
        result.Response.searchResults.map((user, ind) => {
          const destiny = user.destinyMemberships?.[0];
          return (
            <div key={ind} className="user-card">
              <p>
                {user.bungieGlobalDisplayName}
                {user.bungieGlobalDisplayNameCode &&
                  `#${user.bungieGlobalDisplayNameCode}`}
              </p>
              {destiny?.iconPath && (
                <img
                  src={`https://www.bungie.net${destiny.iconPath}`}
                  alt="unknown"
                />
              )}
            </div>
          );
        })
      }
    </div>
  );
}

export default User;
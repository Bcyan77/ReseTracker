import React, { useState } from "react";
import axios from "axios";
import "./user.css";

const platformSlugs = {
  1: "xb",
  2: "ps",
  3: "steam",
  4: "blizzard",
  5: "stadia",
  6: "epic"
};

function User() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);

  const searchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/user/${username}`);
      setResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="user-wrapper">
      <div className="user-search">
        <input
          className="user-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="닉네임"
        />
        <button className="user-button" onClick={searchUser}>검색</button>
      </div>

      <div className="user-container">
        {result?.Response?.searchResults?.length > 0 &&
          result.Response.searchResults.map((user, ind) => {
            const destiny = user.destinyMemberships?.[0];
            const platform = platformSlugs[destiny?.membershipType];
            const id = destiny?.membershipId;

            const raidUrl = `https://raid.report/${platform}/${id}`;
            const dungeonUrl = `https://dungeon.report/${platform}/${id}`;

            return (
              <div key={ind} className="user-card">
                <p>
                  {user.bungieGlobalDisplayName}
                  {user.bungieGlobalDisplayNameCode && `#${user.bungieGlobalDisplayNameCode}`}
                </p>
                {destiny?.iconPath && (
                  <img
                    className="user-icon"
                    src={`https://www.bungie.net${destiny.iconPath}`}
                    alt="platform icon"
                  />
                )}
                {platform && id && (
                  <div className="user-links">
                    <a href={raidUrl} target="_blank" rel="noopener noreferrer">Raid Report</a>
                    <a href={dungeonUrl} target="_blank" rel="noopener noreferrer">Dungeon Report</a>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default User;
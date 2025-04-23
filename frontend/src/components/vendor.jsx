import React, {useEffect, useState} from "react";
import axios from "axios";

function Vendor(){
  const [vendor, setVendor] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/manifest`)
      .then((res) => {
        setVendor(res.data);
      })
      .catch((err) => {
        console.error("manifest 요청 실패:", err);
      });
  }, []);

  if (!vendor) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={{ color: "white" }}>
      <h2>manifest</h2>
      <pre>{JSON.stringify(vendor, null, 2)}</pre>
    </div>
  );
}

export default Vendor;
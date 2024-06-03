// create a page with a required form input for the user's name and submit button and save it to localStorage when the submit button is change and route to the next page
//
// Path: src/pages/Name.tsx
import { useState } from "react";

import "../styles/Name.css";
import { sendDeviceCommand } from "../Command";
import { useNavigate } from "react-router-dom";

export default function Name() {
  const [name, setName] = useState("");
  let navigate = useNavigate();

  return (
    <div style={{ marginTop: 200 }}>
      <h1 className="name-question"> What is your name? </h1>
      <input
        className="name-input"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />
      {name !== "" ? (
        <button
        className="big-button-name"
          onClick={() => {
            localStorage.setItem("name", name);
            if (name === "admin") {
              navigate("/admin")
            } else {
              sendDeviceCommand("?read:/home/mha/dc_tuning.cfg");
              navigate("/manual_fit")
              // pause 2 seconds
              setTimeout(() => {console.log('start program')}, 2000)
              sendDeviceCommand("cmd=start");
            }
          }}
        >Continue</button>
      ) : null}
    </div>
  );
}

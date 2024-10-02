import { NextButton } from "./NextButton";
import "../styles/StartMenu.css";
import "../styles/NextButton.css";
import { useState } from "react";

type HalfwayProps = {
  fadeIn: boolean;
  handleContinue: () => void; 
};

const Halfway = ({ fadeIn, handleContinue }: HalfwayProps) => {
  return (
    <div className={`halfway_message`}>
      <h3>You're doing great!</h3>
      <h3>Keep going for a few more rounds!</h3> 
      <button className="big-button" onClick={handleContinue}>Continue self-fitting</button>
    </div>
  );
};

export default Halfway;

import { NextButton } from "../components/NextButton";
import "../styles/FittingInstruction.css";

export default function FittingInstruction() {
  return (
    <div>

      <h1 className="title" >
        &#8594; Explore different sound adjustments by tapping each button on the screen.
        
      </h1>

      <h1 className="title" >
        &#8594; When you hear the talker most clearly and can listen to it comfortably, leave that button selected. Click "NEXT", and repeat this task on the following pages. 
      </h1>

      <NextButton to="/buttons" text="Begin" style={{ marginTop: 100 }} />
    </div>
  );
}

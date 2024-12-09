import { NextButton } from "../components/NextButton";
import "../styles/FittingInstruction.css";
import buttonss from "../assets/imgs/buttonss.jpg";
export default function FittingInstruction() {
  return (
      <div style={{ paddingTop: "20px" }}> {/* Add space here */}
      <h1 className="title">
        &#8594; During the procedure, explore different sound adjustments by tapping each button on the screen. It will look like this:
        
      </h1>

      <img
        src={buttonss}
        alt={"buttonss"}
        style={{ maxWidth: 270, marginBottom: -15, borderBlockColor: "white" , border: "5px solid white"}}
      />

      <h1 className="title">
        &#8594; When you find the sound that best matches your preference, leave that button selected and click "Next" to proceed. Repeat this process until the procedure is complete.
      </h1>

      <NextButton to="/buttons" text="Begin" style={{ marginTop: 10 }} />
    </div>
  );
}

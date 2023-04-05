import { resetG } from "../Command";
import { NextButton } from "../components/NextButton";

export default function Prompt() {
  return (
    <div>
      <h3>Would you like to exit the app or customize another scene?</h3>
      <NextButton onclick={() => resetG()} to="/fit-select" text="Customize" />
      <div className="top-space"></div>
      <NextButton onclick={() => resetG()} to="/finish" text="Exit" />
    </div>
  );
}

import { useEffect, useState } from "react";
import ButtonLayout, { MAX_DB_HF, MAX_DB_LF, MIN_DB_HF, MIN_DB_LF, matrixFormatter} from "../components/ButtonLayout";
import * as math from "mathjs";
import ReactSlider from "react-slider";
import { NextButton } from "../components/NextButton";
import "../styles/Fitting.css";
import "../styles/Slider.css";
import { sendStoreFinalStepCommand, sendSetDeviceGainButtonCommand, sendStoreStepCommand, sendStoreButtonStepCommand, sendResetDeviceGainCommand } from "../Command";
import Halfway from "../components/Halfway";
import { NAL_TABLE } from "./Manual_Fitting";


export var initialGain: number[][] = [[0, 0, 0],
                                      [0, 0, 0],
                                      [0, 0, 0],
                                      [0, 0, 0],
                                      [0, 0, 0],
                                      [0, 0, 0]];

export var finalGains = [[0, 0, 0],
                         [0, 0, 0],
                         [0, 0, 0],
                         [0, 0, 0],
                         [0, 0, 0],
                         [0, 0, 0]];

export var finalGains_afterSlider = [[0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0]];
                        
//let last_arr: number[][] = [];
let final_arr: number[] = [];
// let first_arr: number[][] = [ [0, 0, 0],
//                               [0, 0, 0],
//                               [0, 0, 0],
//                               [0, 0, 0],
//                               [6, 6, 6],
//                               [10, 10, 10]];
let slider_flag = 0
// export function getLast(arr: number[][]) {
//   last_arr = arr;
// }
export function setInitial(arr: number[][]){
  initialGain = arr;
  sendSetDeviceGainButtonCommand(matrixFormatter(initialGain))
}
export function getFinalG(arr: number[][]) {
  finalGains = arr;
}
export default function ButtonFitting(this: any) {
  // const [gAvg, setGAvg] = useState<math.Matrix>(math.matrix([]));
  const [fitted, setFitted] = useState<number>(0);
  const [half, setHalf] = useState(true);
  
  useEffect(() => {
    setInitial(NAL_TABLE);
    setHalf(false)
    console.log("initial table is ", initialGain)
  }, NAL_TABLE // Empty dependency array to execute the effect only once
  )

  const handleContinue = () => {
    setHalf(false); // Update the 'half' state when the button is clicked
  }

  function firstSlider(){
    let newGainCol = [];
    for(let i = 0; i < 6; i++){
      newGainCol.push(initialGain[i][1])
    }
    final_arr = newGainCol
    sendStoreStepCommand(math.matrix(final_arr),0)
    setFitted(1);
  }

  function finishButton(){
    let newGainCol = [];
    if (slider_flag == 0){
      // console.log("Final Button: " + finalGains)
      for(let i = 0; i < 6; i++){
        newGainCol.push(finalGains[i][1])
      }
      sendStoreFinalStepCommand(math.matrix(finalGains))
    } else {
      // console.log("Final Button: " + finalGains_afterSlider)
      for(let i = 0; i < 6; i++){
        newGainCol.push(finalGains_afterSlider[i][1])
        }
        sendStoreFinalStepCommand(math.matrix(finalGains_afterSlider))
    }
    // console.log("Final Button2: " + newGainCol)
    
  }

  return (
    <>
      {fitted == 0 && (
        <div>
        <h1 className="last-prompt" > First, adjust the slider to a comfortable sound level</h1>

          <div className="slider-container top-space" style={{marginTop: 80}}>
            <ReactSlider
              className="vertical-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
              renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
              orientation="vertical"
              pearling
              minDistance={2}
              min={-15}
              max={15}
              invert={true}
              onChange={(val) => {
                let gain_table: number[][] = JSON.parse(JSON.stringify(NAL_TABLE));
                for(let i = 0; i < gain_table.length; i++){
                  for(let j = 0; j < 3; j++){
                    if(i < 3){
                      var MAX_DB = MAX_DB_LF;
                      var MIN_DB = MIN_DB_LF;}
                    else{
                      var MAX_DB = MAX_DB_HF;
                      var MIN_DB = MIN_DB_HF;
                    }
                    gain_table[i][1] = Math.min(Math.max(gain_table[i][1] + val, MIN_DB), MAX_DB);
                    gain_table[i][0] = Math.min(gain_table[i][0] + val, gain_table[i][1]);
                    // if (gain_table[i][1] < gain_table[i][2]){
                    //   gain_table[i][2] = gain_table[i][1]
                    // }
                    //gain_table[i][2] = Math.min(Math.max(gain_table[i][2] + val, MIN_DB), MAX_DB);
                  }
                }
                //console.log("Initial Slider: " + gain_table)
                // finalGains_afterSlider = gain_table;
                setInitial(gain_table)
              }}
            />
          </div>
          <button className={'big-button-first-slider'} onClick={() => firstSlider()}>Continue</button>
        </div>
      )}
      {half && <Halfway fadeIn={true} handleContinue={handleContinue} />}
 
      {fitted === 1 && ( 
        <div className="flex-column">
          <div>
            <ButtonLayout setFitted={setFitted} setHalf={setHalf} />
          </div>
        </div>
      )}
      {fitted === 2 && (
        <>
          <h3 className="last-prompt" >
          Well Done! Now do one last adjustment with the slider, please. 
          </h3>
          <div className="slider-container top-space" style={{ marginTop: 120 }}>
            <ReactSlider
              className="vertical-slider"
              thumbClassName="example-thumb"
              trackClassName="example-track"
              renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
              orientation="vertical"
              pearling
              minDistance={2}
              min={-15}
              max={15}
              invert={true}
              onChange={(val) => {
                //console.log(finalGains)
                let gain_table: number[][] = JSON.parse(JSON.stringify(finalGains));
                for(let i = 0; i < finalGains.length; i++){
                  if(i < 3){
                    var MAX_DB = MAX_DB_LF;
                    var MIN_DB = MIN_DB_LF;}
                  else{
                    var MAX_DB = MAX_DB_HF;
                    var MIN_DB = MIN_DB_HF;
                  }
                  gain_table[i][1] = Math.min(Math.max(gain_table[i][1] + val, MIN_DB), MAX_DB);
                  gain_table[i][0] = Math.min(gain_table[i][0] + val, gain_table[i][1]);
                  // if (gain_table[i][1] < gain_table[i][2]){
                  //   gain_table[i][2] = gain_table[i][1]
                  // }
                  // gain_table[i][2] = Math.min(Math.max(finalGains[i][2] + val, MIN_DB), MAX_DB)
                }
                sendSetDeviceGainButtonCommand(matrixFormatter(gain_table));
                    // get first column of newGain
                let newGainCol = [];
                for(let i = 0; i < 6; i++){
                  newGainCol.push(gain_table[i][1]);
                }
    
                // final_arr = newGainCol
                // console.log("Final Slider: " + newGainCol);
                finalGains_afterSlider = gain_table;
                slider_flag = 1;
                
              }}
            />
          </div>

          <NextButton onclick={() => {
            finishButton();
            sendResetDeviceGainCommand();}} to="/prompt" text="Finish" />
        </>
      )}
    </>

  );
  
}
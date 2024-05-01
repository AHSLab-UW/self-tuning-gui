import React, { useEffect, useState } from 'react';
import '../styles/ButtonLayout.css';
import { ProgressBar } from "./ProgressBar";
import * as math from "mathjs";
import "../styles/NextButton.css";
import { getRandomColor } from "../Colors";
import { sendSetDeviceGainButtonCommand, sendStoreButtonClickCommand, sendStoreButtonStepCommand, sendStoreLogCommand } from '../Command';
import { send } from 'process';
import { getFinalG, initialGain } from '../pages/ButtonFitting';
import { getWindowDimensions } from './GridLayout';

interface Props {
    setFitted: (fitted: number) => void;
    setHalf: (half: boolean) => void;
}

let explored_set = new Set();
let trialNum = 1;

var aggregateGain: number[][] = initialGain

export var lastRounds = initialGain;
// buttons map to different gains
const VALUES = new Map<number, number>();
VALUES.set(0, 0);
VALUES.set(1, 1);
VALUES.set(2, 2);
VALUES.set(3, -1);
VALUES.set(4, -2);

export const BLANK_TABLE = math.matrix( [  [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0],
                                    [0, 0, 0]] )

export interface Coordinates {
  x: number;
  y: number;
}

export const MAX_STEP = 20;
export const DB_GAIN = 6;

export const MAX_DB_LF = 35;
export const MAX_DB_HF = 35;
export const MIN_DB_LF = -15;
export const MIN_DB_HF = -15;

export const db_indices = [ 10, 10, 
                            8, 8, 
                            5, 
                            7, 
                            7, 7, 
                            10, 10, 8, 8,
                            9, 9, 8, 8,
                            8, 7, 7, 8
                          ]

// gainIndex determines which frequency band (1-6) to adjust
const GAIN_INDICES = new Map<number, number[]>([
                [1, [3, 4, 5]], [2, [0, 1, 2]], 
                [3, [3, 4, 5]], [4, [0, 1, 2]], 
                [5, [0, 1, 2, 3, 4, 5]], 
                [6, [2, 3]], 
                [7, [3, 4, 5]], [8, [0, 1, 2]],
                [9, [0, 1]],[10, [4, 5]], [11,[3]], [12, [2]],
                [13, [4, 5]],[14,[0, 1]], [15, [2]], [16, [3]], 
                [17, [0 ,1]],[18,[2]], [19, [3]], [20, [4, 5]]
]);

// displays gain table on front end for debugging purposes
export function gainToString(arr: number[][]): string {
  let str = "";
  let freq = ["250hz: ", "500hz: ", "1khz: ", "2khz: ", "4khz: ", "8khz: "];
  for(let i = 0; i < arr.length; i++){
    str += freq[i];
    str += "[" + arr[i][0] + ", "+ arr[i][1] + ", "+ arr[i][2] + "]";
    str += "\n"
  }
  // console.log(str)
  return str;
}
// coverts a 1x6 to a 3x6 for matrixformatter
export function gridMatrixFormatter(arr: math.Matrix): math.Matrix{
  let a: number[][] = [[0, 0, 0], [0, 0, 0],[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for(let i = 0; i < 6; i++){
    a[i][0] = arr.get([i]);
    a[i][1] = arr.get([i])
    a[i][2] = arr.get([i])
  }
  return matrixFormatter(a)
}

// accepts a 6x3 2d array and returns it into a 12x19 matrix, properly 
// formatted for hearing aid device
export function matrixFormatter(arr: number[][]): math.Matrix {
  // if(arr[0][2] == null){
  //   for(let row = 0; row < 6; row++){
  //     arr[row][1] = arr[row][0];
  //     arr[row][2] = arr[row][0]
  //   }
  // }
  let matrix = BLANK_TABLE
  for(let i = 0; i < 6; i++){
    let left = arr[i][0]
    let mid = arr[i][1]
    let right = arr[i][2]
    matrix.set([i, 0], left)
    matrix.set([i + 6, 0], left)
    matrix.set([i, 1], mid)
    matrix.set([i, 2], right)
    matrix.set([i+6, 1], mid)
    matrix.set([i+6, 2], right)
  //   for(let j = 0; j < 11; j++){
  //     matrix.set([i, j], left)
  //     matrix.set([i + 6, j], left)
  //   }
  //   for(let j = 11; j < 15; j++){
  //     matrix.set([i, j], mid)
  //     matrix.set([i + 6, j], mid)
  //   }
  //   for(let j = 15; j < 19; j++){
  //     matrix.set([i, j], right)
  //     matrix.set([i + 6, j], right)
  //   }
  }
  console.log("Sending this matrix: " + matrix.toString());
  return matrix
}

function getCoords(): number[][]{
  let cx = getWindowDimensions().width / 2 - 100;
  let cy = getWindowDimensions().height / 2 - 150;
  //console.log(cx + " is cx. and cy is" + cy)
  let buttons: number[][] = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]
  let r = 200;

  for(let i = 0; i < 5; i++){
    let angle = (72 * i + 12 * trialNum) * (Math.PI / 180)
    buttons[i][0] = cx + r * Math.cos(angle) ;
    //console.log("math cos is " + Math.cos(72 * i * (Math.PI / 180)))
    buttons[i][1] = cy + r * Math.sin(angle) ;
  }
  //console.log("BUTTONS" + buttons)
  return buttons;
}

const ButtonLayout = ({setFitted, setHalf}: Props) => {
  // random color every trial, starts at red as default
  const [buttonColor, setButtonColor] = useState<string>('red');
  // if user has finished all trials 
  const [showContinue, setShowContinue] = useState<boolean>(false);
  // if user has finished all trials 
  const [isExplored, setIsExplored] = useState<boolean>(false);
  // which option did user click on last, is random to begin
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(0);
  // current summation of all gainDeltas
  const [aggregateGain, setAggregateGain] = useState<number[][]>(initialGain);
  // when user clicks two different options during the same trial, 
  // we can revert their previous selection by subtracting lastDelta
  const [newGain, setNewGain] = useState<number[][]>(initialGain);
  const [db_gain, setDbGain] = useState<number>(db_indices[0])
  const [gainShuffler, setGainShuffler] = useState<number[]>([0, 1, 2, 3, 4])
  const [blockedClick, setBlockedClick] = useState<boolean>(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const coords: number[][] = getCoords();
  
  const gainClick = (index: number): void => {
    if(trialNum == 1){
      explored_set.add(0)
    }
    explored_set.add(index);
    if(explored_set.size < 5){
      setIsExplored(false)
    } //<---- ensure exploration #1
    else{setIsExplored(true)}
    setLastClickedIndex(index)
    let gainIndex = GAIN_INDICES.get(trialNum) || [];
    let button_coeff= VALUES.get(gainShuffler[index]) || 0
    let delta_step = db_indices[trialNum-1]
    let delta = button_coeff * delta_step
    console.log(aggregateGain)
    let newGain = JSON.parse(JSON.stringify(aggregateGain));
    for (let i = 0; i < gainIndex.length; i++) {
      let gindex = gainIndex[i];
      if (!isNaN(gindex)) {
          // Determine MIN_DB and MAX_DB based on the condition
          let MAX_DB, MIN_DB;
          if (gindex < 3) {
            MAX_DB = MAX_DB_LF;
            MIN_DB = MIN_DB_LF;
          } else {
            MAX_DB = MAX_DB_HF;
            MIN_DB = MIN_DB_HF;
          }
          // Update the matrix elements
          // newGain[gindex][0] = Math.min(newGain[gindex][0] + delta, MAX_DB-7);
          let slope = (40 + aggregateGain[gindex][1] - aggregateGain[gindex][0]) / 40
          newGain[gindex][1] = JSON.parse(JSON.stringify(Math.min(Math.max(aggregateGain[gindex][1] + delta, MIN_DB), MAX_DB)));
          newGain[gindex][0] = JSON.parse(JSON.stringify(40 + newGain[gindex][1] - 40 * slope));
          if (newGain[gindex][1] < aggregateGain[gindex][2]){
            console.log('here')
            newGain[gindex][2] = JSON.parse(JSON.stringify(newGain[gindex][1]))
          }
          else{
            newGain[gindex][2] = JSON.parse(JSON.stringify(aggregateGain[gindex][2]))
          }
          //newGain[gindex][2] = Math.min(Math.max(newGain[gindex][2] + delta, MIN_DB), MAX_DB);
      } else {
        console.error(`Invalid index: ${gainIndex[i]}`);
      }
    }
    // console.log("now l" , newGain[0][0],newGain[1] [0], newGain[2][0], newGain[3][0],newGain[4][0], newGain[5][0])
    // console.log("now h" , newGain[0][1],newGain[1] [1], newGain[2][1], newGain[3][1],newGain[4][1], newGain[5][1])
    setNewGain(newGain)
    sendSetDeviceGainButtonCommand(matrixFormatter(newGain));
    
    // get first column of newGain amd store
    let newGainCol = [];
    for(let i = 0; i < 6; i++){
      newGainCol.push(newGain[i][1])
    }
    //console.log(newGainCol)
    //sendStoreButtonClickCommand(math.matrix(newGainCol), trialNum, index);
    sendStoreLogCommand(math.matrix([]), { x: 0, y: 0 }, index, math.matrix(newGainCol), math.matrix([]), trialNum);
  };

  const nextStep = () => {
    if(explored_set.size < 5){ //<---- ensure exploration # 2
      setBlockedClick(true);
      return;
    }
    setBlockedClick(false);
    if(trialNum > 8){
      let band: number[] = GAIN_INDICES.get(trialNum) || []
      let round = 0;
      if(trialNum > 12){ // starts getting the last ones to average
        round = 1
      }
      if(trialNum > 16){
        round = 2;
      }
      //console.log(band)
      // Iterate over the elements in band
      for (let i = 0; i < band.length; i++) {
        let index = band[i];
        // Check if index is a valid index for newGain and lastRounds
        if (index >= 0 && index < newGain.length && index < lastRounds.length) {
          lastRounds[index][round] = newGain[index][round];
        } else {
          console.error(`Invalid index: ${index}`);
        }
      }
      //console.log(lastRounds)
    }
    setAggregateGain(newGain)
    //aggregateGain = newGain;
     // get first column of newGain and store
     let newGainCol = [];
     for(let i = 0; i < 6; i++){
       newGainCol.push(aggregateGain[i][1])
     }
    sendStoreButtonStepCommand(math.matrix(newGainCol), trialNum);
    sendStoreLogCommand(math.matrix([]), { x: 0, y: 0 }, 6, math.matrix(newGainCol), math.matrix([]), trialNum);
    trialNum++;
    if(trialNum == 8){
      setHalf(true)
    }
    if(trialNum == MAX_STEP){
      // do averaging
      setShowContinue(true)
    }
    let randomIndex = Math.floor(Math.random() * 5)
    //random button
    while(randomIndex == lastClickedIndex) {randomIndex = Math.floor(Math.random() * 5)}
    let randomColor = Math.floor(Math.random() * 5)
    let color = buttonColor
    let colors = ["red", "orange", "green", "purple", "blue"]
    let randColor = colors[randomColor]
    while(randColor == color) {randColor = colors[Math.floor(Math.random() * 5)] }
    setButtonColor(randColor)
    explored_set = new Set();
    setIsExplored(false);
    // setDbGain(db_indices[trialNum - 1])
    // const newRotationAngle = (rotationAngle + 10) % 360;
    // setRotationAngle(newRotationAngle);
    setGainShuffler(gainShuffler.sort((a, b) => 0.5 - Math.random()))
    gainClick(randomIndex)
  }

  const continuePress = () => {
    if(explored_set.size < 5){
      setBlockedClick(true);
      return;
    }
    setBlockedClick(false);
    if(trialNum > 8){
      let band: number[] = GAIN_INDICES.get(trialNum) || []
      //console.log(band)
      // Iterate over the elements in band
      for (let i = 0; i < band.length; i++) {
        let index = band[i];
        // Check if index is a valid index for newGain and lastRounds
        if (index >= 0 && index < newGain.length && index < lastRounds.length) {
          lastRounds[index][2] = newGain[index][2];
        } else {
          console.error(`Invalid index: ${index}`);
        }
      }
      //console.log("last rounds", lastRounds)
    }
    // get first column of newGain
    let newGainCol = [];
    for(let i = 0; i < 6; i++){
      newGainCol.push(newGain[i][1])
    }
    sendStoreButtonStepCommand(math.matrix(newGainCol), trialNum);
    // Taking average
    for(let i = 0; i < 6; i++){
      //console.log("lastRounds = " + lastRounds)
      let avg = math.round((lastRounds[i][0] + lastRounds[i][1] + lastRounds[i][2]) / 3);
      let slope = (40 + aggregateGain[i][1] - aggregateGain[i][0]) / 40
      aggregateGain[i][0] = 40 + avg - 40 * slope;
      aggregateGain[i][1] = avg;
      if (aggregateGain[i][1] <= aggregateGain[i][2]){
        aggregateGain[i][2] = aggregateGain[i][1]
      }
      // aggregateGain[i][2] = avg;
    }
    console.log("avg = " + aggregateGain)
    setNewGain(aggregateGain)
    sendSetDeviceGainButtonCommand(matrixFormatter(aggregateGain));
    // getLast(aggregateGain); //<--send to the button fitting
    getFinalG(aggregateGain)
     // get first column of newGain
     let avgGainCol = [];
     for(let i = 0; i < 6; i++){
      avgGainCol.push(aggregateGain[i][1])
     }
    sendStoreButtonStepCommand(math.matrix(avgGainCol), 50);
    setFitted(2)
    trialNum = 1;
  }
 
  return (
    
    <div>
      <ProgressBar steps={MAX_STEP} currentStep={trialNum}/>
      <div className='instruct-container'
      >
        <p className='button-instructions'>Tap each button, and hit "Next" once you find the option that sounds the best to you.</p>
      </div>
      
      <div className="button-container">
        <button className={`grid-button ${lastClickedIndex === 0 ? (buttonColor) : ''}`} 
            style={{ position: `absolute`, left: `${coords[0][0]}px`, top: `${coords[0][1] - 37}px` }} onClick={() =>  gainClick(0)}></button>
        <button className={`grid-button2 ${lastClickedIndex === 1 ? (buttonColor) : ''}`} 
            style={{ position: `absolute`, left: `${coords[1][0]}px`, top: `${coords[1][1]}px` }} onClick={() => gainClick(1)}></button>
        <button className={`grid-button3 ${lastClickedIndex === 2 ? (buttonColor) : ''}`}
            style={{ position: `absolute`, left: `${coords[2][0]}px`, top: `${coords[2][1]}px` }} onClick={() => gainClick(2)}></button>
        <button className={`grid-button4 ${lastClickedIndex === 3 ? (buttonColor) : ''}`}
            style={{ position: `absolute`, left: `${coords[3][0]}px`, top: `${coords[3][1]}px` }} onClick={() => gainClick(3)}></button>
        <button className={`grid-button5 ${lastClickedIndex === 4 ? (buttonColor) : ''}`} 
            style={{position: `absolute`,  left: `${coords[4][0]}px`, top: `${coords[4][1]}px` }} onClick={() => gainClick(4)}></button>
      </div>
      <div className={'next-container'} style={{ marginTop: '55vh' }}>
        {showContinue ? (
          <button className={'continue-button-buttonlay'}onClick={() => continuePress()} style={{ backgroundColor: isExplored === true ? "#F3B71B" : "#808080" }}>Continue</button>
        ) : (
          <button onClick={nextStep} className="next-button-buttonlay" style={{ backgroundColor: isExplored === true ? "#F3B71B" : "#808080", color: isExplored === true ? "#000000" : "#363636"}}>Next</button>
        )}
        {(!isExplored && blockedClick) ? (<p className='button-instructions'>Please make sure you explore all five options before moving on</p>) : (<></>)}
      </div>
{/* 
      <div className='debugger'>
        <p className='g2s'>
            {gainToString(newGain)}
        </p>
        <p className='g2s'>
            trial number is {trialNum}
        </p>
      </div> */}
    </div>
    
  );
};

export default ButtonLayout;

export interface Coordinates { x: number; y: number; }
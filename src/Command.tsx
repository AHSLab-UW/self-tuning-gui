import * as math from "mathjs";
import { Coordinates, gridMatrixFormatter } from "./components/ButtonLayout";
// import { gainToString } from "./components/Grid";

// export const sendDeviceCommandGet = (command: string) => {
//   console.log("sending command: ", command);
//   return fetch(`/device?${command}`)
//     .then((data) => {
//       console.log(data)
//       return data;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };
export const sendDeviceCommandGet = async (command: string) => {
  try {
    console.log("sending command get: ", command);
    const response = await fetch(`/device?command=${encodeURIComponent(command)}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    console.log("Response from server:", data);

    // Extract the numbers from the message and calculate the average
    const numbers = data.message
      .replace(/[\[\]\n]/g, '') // Remove brackets and newlines
      .split(' ') // Split by spaces
      .map((num: string) => parseFloat(num)); // Convert strings to numbers

    const average = numbers.reduce((sum: any, num: any) => sum + num, 0) / numbers.length;
    // console.log("Average:", average);
    
    // Return the average
    return average;

  } catch (err: unknown) {  // Typing 'err' as 'unknown'
    if (err instanceof Error) {  // Narrowing down to Error type
      console.log("error message", err.message);
    } else {
      console.log("An unexpected error occurred");
    }
  }
};


export const sendDeviceCommand = (command: string) => {
  console.log("sending command: ", command);
  return fetch(`/device?command=${command}`)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      //console.log(err.message);
    });
};


export const sendStoreLogCommand = (
  a: math.Matrix,
  coordinate: { x: number; y: number },
  gainDelta: number,
  g: math.Matrix,
  glast: math.Matrix,
  step: number
) => {
  if (localStorage.getItem("name") === "admin") return new math.Matrix();

  // get the current time
  let date = new Date();
  let time = date.getTime();

  const name = localStorage.getItem("name");
  const scene = localStorage.getItem("scene");
  const fitType = localStorage.getItem("fitType");

  const file_name =
    (name ? name : "null") +
    "-" +
    (scene ? scene : "null") +
    "-" +
    (fitType ? fitType : "null");

  fetch(
    `/store?time=${time}&name=${file_name}&a=${a}&coordinate=[${coordinate.x},${coordinate.y}]&gainDelta=${gainDelta}&g=${g}&glast=${glast}&step=${step}`
  );
};

export const sendSetDeviceGainButtonCommand = (g: math.Matrix) => {
  if (localStorage.getItem("name") === "admin") return;
  let gaintable_og =
    "[" +
    g
      .toArray()
      .map((row) => "[" + (row as unknown as string[]).join(" ") + "]")
      .join(";") +
    "]";
  // send command to server at endpoint /store
  sendDeviceCommand(
    "mha.mhachain.overlapadd.mhachain.dc.gtdata=" + gaintable_og
  );
};

export const sendStoreButtonClickCommand = (g: math.Matrix, step: number, index: number) => {
  if (localStorage.getItem("name") === "admin") return;

  const name = localStorage.getItem("name");
  const scene = localStorage.getItem("scene");
  const fitType = localStorage.getItem("fitType");
  let date = new Date();
  let time = date.getTime();

  const file_name =
    (name ? name : "null") +
    "-" +
    (scene ? scene : "null") +
    "-" +
    (fitType ? fitType : "null");

  const g_clipped = g;

  fetch(
    // todo: FIX THIS
    // might want different functionalities so maybe add new api if necessary
    `/storestep?name=${file_name}&step=${step + "." + index}&g=${g_clipped}`
  );
};

export const sendStoreButtonStepCommand = (g: math.Matrix, step: number) => {
  if (localStorage.getItem("name") === "admin") return;

  const name = localStorage.getItem("name");
  const scene = localStorage.getItem("scene");
  const fitType = localStorage.getItem("fitType");
  let date = new Date();
  let time = date.getTime();

  const file_name =
    (name ? name : "null") +
    "-" +
    (scene ? scene : "null") +
    "-" +
    (fitType ? fitType : "null");

    const g_clipped = g;

  fetch(`/storestep?name=${file_name}&step=${step}&g=${g_clipped}`);
};

export const sendStoreStepCommand = (g: math.Matrix, step: number) => {
  if (localStorage.getItem("name") === "admin") return;

  const name = localStorage.getItem("name");
  const scene = localStorage.getItem("scene");
  const fitType = localStorage.getItem("fitType");
  let date = new Date();
  let time = date.getTime();

  const file_name =
    (name ? name : "null") +
    "-" +
    (scene ? scene : "null") +
    "-" +
    (fitType ? fitType : "null");

  fetch(`/storestep?name=${file_name}&step=${step}&g=${g}`);
};

export const sendStoreFinalStepCommand = (g: math.Matrix) => {
  sendStoreStepCommand(g, 100);
};

export const sendResetDeviceGainCommand = () => {
  sendSetDeviceGainButtonCommand(gridMatrixFormatter(math.zeros(6) as math.Matrix));
};

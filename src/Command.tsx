import { Coordinates } from "./components/Grid";
import * as math from "mathjs";

export const sendCommand = async(command: string) => {
  // console.log("sending command: ", command);
  return fetch(`/device?command=${command}`)
    .then((data) => {
      // console.log(data);
    })
    .catch((err) => {
      console.log(err.message);
    });
}

export function sendGridCommand(a: math.Matrix, coordinate: Coordinates, glast: math.Matrix) {
    // multiply a by coordinate
    const coord = [coordinate.x, coordinate.y];
    const b = math.multiply(a, math.matrix(coord));
    const g = math.add(b, glast);

    let gaintable_og = "";
    for (let i = 0; i < g.size()[0]; i++) {
        gaintable_og += `[${g.get([i])} ${g.get([i])} ${g.get([i])}];`;
    }
    gaintable_og += gaintable_og;
    gaintable_og = gaintable_og.substring(0, gaintable_og.length - 1);
    gaintable_og = "[" + gaintable_og + "]";

    sendCommand("mha.mhachain.overlapadd.mhachain.dc.gtdata=" + gaintable_og);
    return g;
}

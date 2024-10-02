import React, { useState } from 'react';
import '../styles/Manual_fitting.css'; // Make sure this path is correct
import { sendSetDeviceGainButtonCommand } from '../Command';
import { matrixFormatter } from '../components/ButtonLayout';

export var NAL_TABLE: number[][] = [[5, 10, 5],
                                    [5, 10, 5],
                                    [5, 10, 5],
                                    [5, 10, 6],
                                    [8, 16, 6],
                                    [10, 20, 10]];

// Function to update the matrix
export const setMatrix = (newMatrix: number[][]) => {
  NAL_TABLE = newMatrix;
  sendSetDeviceGainButtonCommand(matrixFormatter(NAL_TABLE))
};

interface FrequencyValues {
  expansionSlope: string; // Temporarily store as string
  fortyDb: string;
  seventyDb: string;
}
 
interface Values {
  [key: string]: FrequencyValues;
}
 
function ManualFitting() {
  const [values, setValues] = useState<Values>({
    "0.5 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '5' },
    "1 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '5' },
    "2 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '5' },
    "3 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '0' },
    "4 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '0' },
    "6 kHz": { expansionSlope: '2', fortyDb: '10', seventyDb: '0' }
  });
 
  const handleChange = (frequency: string, field: keyof FrequencyValues, value: string) => {
    setValues(prevValues => ({
      ...prevValues,
      [frequency]: {
        ...prevValues[frequency],
        [field]: value // Directly using the string value
      }
    }));
  };
 
  const handleSubmit = () => {
    const matrix: number[][] = Object.values(values).map(({ expansionSlope, fortyDb, seventyDb }) => {
      const expSlopeNum = parseFloat(expansionSlope);
      const fortyDbNum = parseFloat(fortyDb);
      const seventyDbNum = parseFloat(seventyDb);
      const calculatedValue = 40 + fortyDbNum - 40 * expSlopeNum;
      return [calculatedValue, fortyDbNum, seventyDbNum];
    });
    setMatrix(matrix);
    console.log(matrix); // Logging the matrix to the console as numbers
    sendSetDeviceGainButtonCommand(matrixFormatter(matrix));
  };
 
  return (
<div>
<table className="frequency-table" style={{ marginTop: '70px' }}>
<thead>
<tr>
<th> Frequency</th>
<th>Expansion Slope</th>
<th>40 dB</th>
<th>80 dB</th>
</tr>
</thead>
<tbody>
          {Object.entries(values).map(([frequency, data]) => (
<tr key={frequency}>
<td className="white-text">{frequency}</td>
<td>
<input
                  type="text" // Changed to text to allow negative sign and validation handling
                  value={data.expansionSlope}
                  onChange={(e) => handleChange(frequency, 'expansionSlope', e.target.value)}
                />
</td>
<td>
<input
                  type="text"
                  value={data.fortyDb}
                  onChange={(e) => handleChange(frequency, 'fortyDb', e.target.value)}
                />
</td>
<td>
<input
                  type="text"
                  value={data.seventyDb}
                  onChange={(e) => handleChange(frequency, 'seventyDb', e.target.value)}
                />
</td>
</tr>
          ))}
</tbody>
</table>
<button style={{ marginTop: '50px' }} className="big-button-admin" onClick={handleSubmit}>Apply</button>
</div>
  );
}
 
export default ManualFitting;
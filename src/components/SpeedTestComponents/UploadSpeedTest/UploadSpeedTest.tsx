"use client"
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import { IUploadSpeedTestProps } from "./UploadSpeedTest.models";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const UploadSpeedTest = ({uploadSpeed, uploadChartRef}:IUploadSpeedTestProps) => {
  
  return (
    <div>
      {uploadSpeed !== null ? (
        <p>Upload: {uploadSpeed.toFixed(2)} Mbps</p>
      ) : <p>Upload:</p>}
      <canvas ref={uploadChartRef} width={300} height={150}></canvas>
    </div>
  );
}

export default UploadSpeedTest;

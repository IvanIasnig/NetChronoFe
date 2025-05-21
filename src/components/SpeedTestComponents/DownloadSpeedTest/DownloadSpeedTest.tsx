import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from "chart.js";
import { IDownloadSpeedTestProps } from "./DownloadSpeedTest.models";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const DownloadSpeedTest = ({
  downloadSpeed,
  downloadChartRef,
}: IDownloadSpeedTestProps) => {
  return (
    <div>
      {downloadSpeed !== null ? (
        <p>Download: {downloadSpeed.toFixed(2)} Mbps</p>
      ) : (
        <p>Download: </p>
      )}
      <canvas ref={downloadChartRef} width={200} height={200}></canvas>
    </div>
  );
};

export default DownloadSpeedTest;

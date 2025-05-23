"use client";
import DownloadSpeedTest from "@/components/SpeedTestComponents/DownloadSpeedTest/DownloadSpeedTest";
import UploadSpeedTest from "@/components/SpeedTestComponents/UploadSpeedTest/UploadSpeedTest";
import styles from "./home.module.scss";
import { useWasm } from "@/hooks/useWasm";
import { useState, useRef, useEffect } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  ChartData,
  ChartOptions,
} from "chart.js";

import { useMetricsWebSocket } from "@/hooks/useMetricsWebSocket";
import LineMetricsChart from "@/components/SpeedTestComponents/LineChart/LineChart";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title
);

export default function Home() {
  const wasm = useWasm();
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const downloadChartRef = useRef<HTMLCanvasElement>(null);
  const uploadChartRef = useRef<HTMLCanvasElement>(null);
  const downloadChartInstanceRef = useRef<Chart<"doughnut"> | null>(null);
  const uploadChartInstanceRef = useRef<Chart<"doughnut"> | null>(null);

  const pingChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const jitterChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const packetLossChartInstanceRef = useRef<Chart<"bar"> | null>(null);

  const { ping, jitter, packetLoss } = useMetricsWebSocket();

  function calculateSpeed(bytesUploaded: number, elapsedMs: number): number {
    if (elapsedMs === 0) return 0;

    const bitsUploaded = bytesUploaded * 8;
    const seconds = elapsedMs / 1000;

    const speedBps = bitsUploaded / seconds;
    const speedMbps = speedBps / 1_000_000;

    return speedMbps;
  }

  async function testUploadSpeedStreaming() {
    setLoading(true);

    const fileSize = 1024 * 1024 * 30;
    const testFile = new Blob(["a".repeat(fileSize)], {
      type: "application/octet-stream",
    });

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const startTime = performance.now();

      let lastLoaded = 0;
      let lastTime = performance.now();

      let speedSum = 0;
      let speedCount = 0;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const currentLoaded = event.loaded;
          const currentTime = performance.now();

          const elapsed = currentTime - startTime;
          const progressRatio = currentLoaded / fileSize;

          // Ignora i primi 200ms e l'ultimo 10% dell'upload
          // fatto per evitare lo spike iniziale e il down finale
          if (elapsed < 200 || progressRatio > 0.9) {
            lastLoaded = currentLoaded;
            lastTime = currentTime;
            return;
          }

          const deltaBytes = currentLoaded - lastLoaded;
          const deltaTime = currentTime - lastTime;

          if (deltaTime > 0) {
            const speed = calculateSpeed(deltaBytes, deltaTime); // Mbps
            speedSum += speed;
            speedCount++;

            const averageSpeed = speedSum / speedCount;

            setUploadSpeed(averageSpeed);
            updateChart(averageSpeed);
          }

          lastLoaded = currentLoaded;
          lastTime = currentTime;
        }
      };

      xhr.onload = () => {
        setLoading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        reject(new Error("Network error during upload"));
      };

      xhr.open(
        "POST",
        "https://speedtest-server-production.up.railway.app/upload"
      );
      xhr.send(testFile);
    });
  }

  async function runTest() {
    if (!wasm) {
      return;
    }
    setUploadSpeed(null);
    setDownloadSpeed(null);

    await testDownloadSpeedStreaming(wasm);
    await testUploadSpeedStreaming();
  }

  useEffect(() => {
    if (uploadChartRef.current && !uploadChartInstanceRef.current) {
      const maxSpeed = 100;
      const data: ChartData<"doughnut"> = {
        labels: ["Velocità di upload", "Rimanente"],
        datasets: [
          {
            data: [0, maxSpeed],
            backgroundColor: ["#36A2EB", "#E0E0E0"],
            borderWidth: 0,
          },
        ],
      };
      const options: ChartOptions<"doughnut"> = {
        responsive: true,
        cutout: "80%",
        rotation: -90,
        circumference: 180,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      };

      uploadChartInstanceRef.current = new Chart(uploadChartRef.current, {
        type: "doughnut",
        data,
        options,
      });
    }
    return () => {
      uploadChartInstanceRef.current?.destroy();
      uploadChartInstanceRef.current = null;
    };
  }, []);

  function updateChart(speed: number) {
    if (!uploadChartInstanceRef.current) return;
    const maxSpeed = 100;
    const dataValue = Math.min(speed, maxSpeed);
    const remaining = maxSpeed - dataValue;

    uploadChartInstanceRef.current.data.datasets[0].data = [
      dataValue,
      remaining,
    ];
    uploadChartInstanceRef.current.update("none");
  }

  async function testDownloadSpeedStreaming(wasm: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    calculate_speed: Function;
  }) {
    setLoading(true);
    const response = await fetch(
      `https://speedtest-server-production.up.railway.app/download?nocache=${Date.now()}`
    );

    if (!response.body) {
      setLoading(false);
      throw new Error("ReadableStream non disponibile");
    }

    const reader = response.body.getReader();
    let bytesReceived = 0;
    const startTime = performance.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesReceived += value.byteLength;
      const currentTime = performance.now();
      const elapsed = Math.max(1, Math.round(currentTime - startTime));

      const speed = wasm.calculate_speed(
        BigInt(bytesReceived),
        BigInt(elapsed)
      );

      setDownloadSpeed(speed);
      updateUploadChart(speed);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (downloadChartRef.current && !downloadChartInstanceRef.current) {
      const maxSpeed = 100;
      const data: ChartData<"doughnut"> = {
        labels: ["Velocità di download", "Rimanente"],
        datasets: [
          {
            data: [0, maxSpeed],
            backgroundColor: ["#36A2EB", "#E0E0E0"],
            borderWidth: 0,
          },
        ],
      };
      const options: ChartOptions<"doughnut"> = {
        responsive: true,
        cutout: "80%",
        rotation: -90,
        circumference: 180,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      };

      downloadChartInstanceRef.current = new Chart(downloadChartRef.current, {
        type: "doughnut",
        data,
        options,
      });
    }
    return () => {
      downloadChartInstanceRef.current?.destroy();
      downloadChartInstanceRef.current = null;
    };
  }, []);

  function updateUploadChart(speed: number) {
    if (!downloadChartInstanceRef.current) return;
    const maxSpeed = 100;
    const dataValue = Math.min(speed, maxSpeed);
    const remaining = maxSpeed - dataValue;

    downloadChartInstanceRef.current.data.datasets[0].data = [
      dataValue,
      remaining,
    ];
    downloadChartInstanceRef.current.update("none");
  }

  useEffect(() => {
    if (pingChartInstanceRef.current && ping !== null) {
      pingChartInstanceRef.current.data.datasets[0].data = [ping];
      pingChartInstanceRef.current.update("none");
    }
  }, [ping]);

  useEffect(() => {
    if (jitterChartInstanceRef.current && jitter !== null) {
      jitterChartInstanceRef.current.data.datasets[0].data = [jitter];
      jitterChartInstanceRef.current.update("none");
    }
  }, [jitter]);

  useEffect(() => {
    if (packetLossChartInstanceRef.current && packetLoss !== null) {
      packetLossChartInstanceRef.current.data.datasets[0].data = [packetLoss];
      packetLossChartInstanceRef.current.update("none");
    }
  }, [packetLoss]);

  return (
    <>
      <button onClick={runTest} disabled={loading}>
        {loading ? "Test in corso..." : "Avvia Speed Test"}
      </button>
      <div className={styles.home}>
        <DownloadSpeedTest
          downloadSpeed={downloadSpeed}
          downloadChartRef={downloadChartRef}
        />
        <UploadSpeedTest
          uploadSpeed={uploadSpeed}
          uploadChartRef={uploadChartRef}
        />
        <div className={styles.metrics}>
          <LineMetricsChart
            ping={ping}
            jitter={jitter}
            packetLoss={packetLoss}
          />
        </div>
      </div>
    </>
  );
}

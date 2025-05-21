"use client";
import DownloadSpeedTest from "@/components/SpeedTestComponents/DownloadSpeedTest/DownloadSpeedTest";
import UploadSpeedTest from "@/components/SpeedTestComponents/UploadSpeedTest/UploadSpeedTest";
import styles from "./home.module.scss";
import { useWasm } from "@/hooks/useWasm";
import { useState, useRef, useEffect, RefObject } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  ArcElement,
  ChartData,
  ChartOptions,
} from "chart.js";

import { useMetricsWebSocket } from "@/hooks/useMetricsWebSocket";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  ArcElement
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
  const pingChartRef = useRef<HTMLCanvasElement>(null);
  const jitterChartRef = useRef<HTMLCanvasElement>(null);
  const packetLossChartRef = useRef<HTMLCanvasElement>(null);

  const pingChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const jitterChartInstanceRef = useRef<Chart<"bar"> | null>(null);
  const packetLossChartInstanceRef = useRef<Chart<"bar"> | null>(null);

  const { ping, jitter, packetLoss } = useMetricsWebSocket();

  async function testUploadSpeedStreaming(wasm: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    calculate_speed: Function;
  }) {
    setLoading(true);

    const fileSize = 1024 * 1024 * 30;
    const testFile = new Blob(["a".repeat(fileSize)], {
      type: "application/octet-stream",
    });
    const chunkSize = 64 * 1024;
    let offset = 0;

    const sendChunk = async (chunk: Blob): Promise<void> => {
      const startTime = performance.now();

      console.log(chunk);

      await fetch("https://speedtest-server-production.up.railway.app/upload", {
        method: "POST",
        body: chunk,
      });

      const endTime = performance.now();
      const elapsed = Math.max(1, Math.round(endTime - startTime));

      const chunkSpeed = wasm.calculate_speed(
        BigInt(chunk.size),
        BigInt(elapsed)
      );

      setUploadSpeed(chunkSpeed);
      updateChart(chunkSpeed);
    };

    while (offset < fileSize) {
      const chunk = testFile.slice(offset, offset + chunkSize);
      await sendChunk(chunk);
      offset += chunkSize;
    }

    setLoading(false);
    setLoading(false);
  }

  async function runTest() {
    if (!wasm) {
      return;
    }
    setUploadSpeed(null);
    setDownloadSpeed(null);

    await Promise.all([
      testDownloadSpeedStreaming(wasm),
      testUploadSpeedStreaming(wasm),
    ]);
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
    const createChart = (
      ref: React.RefObject<HTMLCanvasElement>,
      instanceRef: React.MutableRefObject<Chart<"bar"> | null>,
      label: string,
      color: string
    ) => {
      if (ref.current && !instanceRef.current) {
        const data: ChartData<"bar"> = {
          labels: [label],
          datasets: [
            {
              label,
              data: [0],
              backgroundColor: [color],
            },
          ],
        };

        const options: ChartOptions<"bar"> = {
          responsive: true,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              max: label === "Packet Loss" ? 100 : undefined,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
        };

        instanceRef.current = new Chart(ref.current, {
          type: "bar",
          data,
          options,
        });
      }
    };

    createChart(
      pingChartRef as RefObject<HTMLCanvasElement>,
      pingChartInstanceRef,
      "Ping",
      "#FF6384"
    );
    createChart(
      jitterChartRef as RefObject<HTMLCanvasElement>,
      jitterChartInstanceRef,
      "Jitter",
      "#FFCE56"
    );
    createChart(
      packetLossChartRef as RefObject<HTMLCanvasElement>,
      packetLossChartInstanceRef,
      "Packet Loss",
      "#4BC0C0"
    );

    return () => {
      pingChartInstanceRef.current?.destroy();
      jitterChartInstanceRef.current?.destroy();
      packetLossChartInstanceRef.current?.destroy();
      pingChartInstanceRef.current = null;
      jitterChartInstanceRef.current = null;
      packetLossChartInstanceRef.current = null;
    };
  }, []);

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
        <div></div>
        <div className={styles.metrics}>
          <div>
            <canvas ref={pingChartRef} width={200} height={60} />
          </div>
          <div>
            <canvas ref={jitterChartRef} width={200} height={60} />
          </div>
          <div>
            <canvas ref={packetLossChartRef} width={200} height={60} />
          </div>
        </div>
      </div>
    </>
  );
}

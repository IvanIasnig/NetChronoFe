"use client";

import { useWasm } from "@/hooks/useWasm";
import { useState, useRef, useEffect } from "react";
import {
  Chart,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const UploadSpeedTest = () => {
  const wasm = useWasm();
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<"doughnut"> | null>(null);

  async function testUploadSpeedStreaming(wasm: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    calculate_speed: Function;
  }) {setLoading(true);

  const fileSize = 1024 * 1024 * 30; // 30MB fil
  const testFile = new Blob(["a".repeat(fileSize)], { type: "application/octet-stream" });
  const chunkSize = 64 * 1024; 
  let offset = 0;

  const sendChunk = async (chunk: Blob): Promise<void> => {
    const startTime = performance.now();
    
    await fetch('/uploadEndpoint', {
      method: 'POST',
      body: chunk
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
    await testUploadSpeedStreaming(wasm);
  }

  useEffect(() => {
    if (chartRef.current && !chartInstanceRef.current) {
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

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: "doughnut",
        data,
        options,
      });
    }
    return () => {
      chartInstanceRef.current?.destroy();
      chartInstanceRef.current = null;
    };
  }, []);

  function updateChart(speed: number) {
    if (!chartInstanceRef.current) return;
    const maxSpeed = 100;
    const dataValue = Math.min(speed, maxSpeed);
    const remaining = maxSpeed - dataValue;

    chartInstanceRef.current.data.datasets[0].data = [dataValue, remaining];
    chartInstanceRef.current.update("none");
  }

  return (
    <div>
      <button onClick={runTest} disabled={loading}>
        {loading ? "Test in corso..." : "Avvia Speed Test Upload"}
      </button>
      {uploadSpeed !== null && (
        <p>Upload: {uploadSpeed.toFixed(2)} Mbps</p>
      )}
      <canvas ref={chartRef} width={300} height={150}></canvas>
    </div>
  );
}

export default UploadSpeedTest;

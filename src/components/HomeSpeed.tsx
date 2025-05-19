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

export default function SpeedTest() {
  const wasm = useWasm();
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart<"doughnut"> | null>(null);

  async function testDownloadSpeedStreaming(wasm: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    calculate_speed: Function;
  }) {
    setLoading(true);
    const response = await fetch(
      `/testFile/testfile.pdf?nocache=${Date.now()}`
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
      updateChart(speed);
    }

    setLoading(false);
  }

  async function runTest() {
    if (!wasm) {
      return;
    }
    setDownloadSpeed(null);
    await testDownloadSpeedStreaming(wasm);
  }

  useEffect(() => {
    if (chartRef.current && !chartInstanceRef.current) {
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

  // Funzione che aggiorna solo i dati del grafico senza ricrearlo
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
        {loading ? "Test in corso..." : "Avvia Speed Test"}
      </button>
      {downloadSpeed !== null && (
        <p>Download: {downloadSpeed.toFixed(2)} Mbps</p>
      )}
      <canvas ref={chartRef} width={300} height={150}></canvas>
    </div>
  );
}

"use client";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

type LineMetricsChartProps = {
  ping: number | null;
  jitter: number | null;
  packetLoss: number | null;
};

export default function LineMetricsChart({
  ping,
  jitter,
  packetLoss,
}: LineMetricsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);

  const pingData = useRef<number[]>([]);
  const jitterData = useRef<number[]>([]);
  const packetLossData = useRef<number[]>([]);

  useEffect(() => {
    if (canvasRef.current && !chartRef.current) {
      const data: ChartData<"line"> = {
        labels: [],
        datasets: [
          {
            label: "Ping (ms)",
            data: [],
            borderColor: "#FF6384",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            fill: false,
            tension: 0.3,
            pointRadius: 2,
          },
          {
            label: "Jitter (ms)",
            data: [],
            borderColor: "#FFCE56",
            backgroundColor: "rgba(255, 206, 86, 0.2)",
            fill: false,
            tension: 0.3,
            pointRadius: 2,
          },
          {
            label: "Packet Loss (%)",
            data: [],
            borderColor: "#4BC0C0",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: false,
            tension: 0.3,
            pointRadius: 2,
          },
        ],
      };

      const options: ChartOptions<"line"> = {
        responsive: true,
        animation: false,
        scales: {
          x: {
            display: false,
          },
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            enabled: true,
          },
        },
      };

      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data,
        options,
      });
    }

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    pingData.current.push(ping ?? 0);
    jitterData.current.push(jitter ?? 0);
    packetLossData.current.push(packetLoss ?? 0);

    if (pingData.current.length > 20) pingData.current.shift();
    if (jitterData.current.length > 20) jitterData.current.shift();
    if (packetLossData.current.length > 20) packetLossData.current.shift();

    chartRef.current.data.labels = pingData.current.map((_, i) => i.toString());
    chartRef.current.data.datasets[0].data = [...pingData.current];
    chartRef.current.data.datasets[1].data = [...jitterData.current];
    chartRef.current.data.datasets[2].data = [...packetLossData.current];

    chartRef.current.update("none");
  }, [ping, jitter, packetLoss]);

  return <canvas ref={canvasRef} width={600} height={250} />;
}

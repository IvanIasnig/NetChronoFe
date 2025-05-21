import { useEffect, useRef, useState } from "react";

export function useMetricsWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [packetLoss, setPacketLoss] = useState<number>(0);

  useEffect(() => {
    wsRef.current = new WebSocket(
      "wss://speedtest-server-production.up.railway.app/ws"
    );

    const ws = wsRef.current;
    const pingSamples: number[] = [];
    const startTimes = new Map<number, number>();
    const timeouts = new Map<number, NodeJS.Timeout>();
    let lostPackets = 0;
    let seq = 0;

    const sendPing = () => {
      if (ws.readyState !== WebSocket.OPEN) return;

      const startTime = performance.now();
      startTimes.set(seq, startTime);

      const message = JSON.stringify({ type: "ping", seq });
      ws.send(message);

      const timeout = setTimeout(() => {
        lostPackets++;
        setPacketLoss((lostPackets / (seq + 1)) * 100);
        startTimes.delete(seq);
        timeouts.delete(seq);
      }, 1000);

      timeouts.set(seq, timeout);
      seq++;
      setTimeout(sendPing, 200);
    };

    ws.onopen = () => {
      console.log("WebSocket connected");
      sendPing();
    };

    ws.onmessage = (event) => {
      const endTime = performance.now();
      const data = JSON.parse(event.data);

      if (data.type === "pong") {
        const { seq: respSeq } = data;
        const startTime = startTimes.get(respSeq);
        const timeout = timeouts.get(respSeq);

        if (timeout) clearTimeout(timeout);
        startTimes.delete(respSeq);
        timeouts.delete(respSeq);

        if (startTime != null) {
          const currentPing = endTime - startTime;
          pingSamples.push(currentPing);
          setPing(currentPing);

          if (pingSamples.length > 1) {
            const diffs = pingSamples
              .slice(1)
              .map((v, idx) => Math.abs(v - pingSamples[idx]));
            const avgJitter =
              diffs.reduce((acc, val) => acc + val, 0) / diffs.length;
            setJitter(avgJitter);
          }
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      // clear all timeouts
      timeouts.forEach((t) => clearTimeout(t));
    };

    ws.onerror = (event) => {
      console.error("WebSocket error event:", event);
    };

    return () => {
      ws.close();
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  return { ping, jitter, packetLoss };
}

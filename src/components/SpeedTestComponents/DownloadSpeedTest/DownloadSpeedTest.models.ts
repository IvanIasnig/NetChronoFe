import { RefObject } from "react";

export interface IDownloadSpeedTestProps{
    downloadSpeed: number | null;
    downloadChartRef: RefObject<HTMLCanvasElement | null>;
}
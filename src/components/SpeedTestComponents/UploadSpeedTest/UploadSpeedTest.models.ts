import { RefObject } from "react";

export  interface IUploadSpeedTestProps {
        uploadSpeed: number | null;
        uploadChartRef: RefObject<HTMLCanvasElement | null>;
}
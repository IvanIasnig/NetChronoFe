import DownloadSpeedTest from "@/components/SpeedTestComponents/DownloadSpeedTest/DownloadSpeedTest";
import UploadSpeedTest from "@/components/SpeedTestComponents/UploadSpeedTest/UploadSpeedTest";

export default function Home() {
  return (
    <>
      <DownloadSpeedTest />
      <UploadSpeedTest/>
    </>
  );
}

import DownloadSpeedTest from "@/components/SpeedTestComponents/DownloadSpeedTest/DownloadSpeedTest";
import UploadSpeedTest from "@/components/SpeedTestComponents/UploadSpeedTest/UploadSpeedTest";
import styles from './home.module.scss'

export default function Home() {
  return (
    <div className={styles.home}>
      <DownloadSpeedTest />
      <UploadSpeedTest/>
    </div>
  );
}

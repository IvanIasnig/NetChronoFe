import { useEffect, useState } from "react";
import initWasm, {
  calculate_speed,
} from "../../wasm-speedtest-wasm/pkg/wasm_speedtest_wasm";

export function useWasm() {
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    initWasm()
      .then(() => setWasmReady(true))
      .catch(console.error);
  }, []);

  return wasmReady ? { calculate_speed } : null;
}

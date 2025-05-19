use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn calculate_speed(bytes: u64, milliseconds: u64) -> f64 {
    // Calcola velocità in Mbps: (bytes * 8) / (milliseconds / 1000) / 1_000_000
    let seconds = milliseconds as f64 / 1000.0;
    let bits = bytes as f64 * 8.0;
    (bits / seconds) / 1_000_000.0
}

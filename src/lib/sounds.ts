let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", vol = 0.12) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = vol;
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

/** Short beep for scanned item */
export function beepScan() {
  playTone(1200, 0.08, "square", 0.08);
}

/** Success chime for payment confirmed */
export function chimeSuccess() {
  const ac = getCtx();
  const t = ac.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15 * (i + 1) + 0.2);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(t + 0.15 * i);
    osc.stop(t + 0.15 * (i + 1) + 0.2);
  });
}

/** Error buzz */
export function buzzError() {
  playTone(200, 0.2, "sawtooth", 0.06);
}

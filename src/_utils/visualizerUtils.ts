interface FreqConfig {
  bass: { min: number; max: number };
  mid: { min: number; max: number };
  tre: { min: number; max: number };
  amp: number;
}

interface Frequency {
  bass: Uint8Array;
  mid: Uint8Array;
  tre: Uint8Array;
}

function fractionate(val: number, minVal: number, maxVal: number) {
  return (val - minVal) / (maxVal - minVal);
}

function modulate(
  val: number,
  minVal: number,
  maxVal: number,
  outMin: number,
  outMax: number,
) {
  const fr = fractionate(val, minVal, maxVal);
  const delta = outMax - outMin;
  return outMin + fr * delta;
}

function avg(arr: Uint8Array) {
  const total = arr.reduce((sum, b) => {
    return sum + b;
  });
  return total / arr.length;
}

function max(arr: Uint8Array) {
  return arr.reduce((a, b) => {
    return Math.max(a, b);
  });
}

export const freqConfig: FreqConfig = {
  bass: {
    min: 0.0,
    max: 8.0,
  },
  mid: {
    min: 0.0,
    max: 4.0,
  },
  tre: {
    min: 0.0,
    max: 2.0,
  },
  amp: 7,
};

export function getFrequencies(
  { bass, mid, tre }: Frequency,
  config: FreqConfig,
) {
  const b = max(bass) / bass.length;
  const m = avg(mid) / tre.length;
  const t = avg(tre) / tre.length;

  const bassFr = modulate(
    Math.pow(b, 0.8),
    0.0,
    1.0,
    config.bass.min,
    config.bass.max,
  );
  const midFr = modulate(m, 0.0, 1.0, config.mid.min, config.mid.max);
  const treFr = modulate(t, 0.0, 1.0, config.tre.min, config.tre.max);

  return [bassFr * config.amp, midFr * config.amp, treFr * config.amp];
}

export function getFrequencyData(analyser: AnalyserNode) {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  return dataArray;
}

export function getAllFrequencyData(analysers: {
  aBass: AnalyserNode;
  aMid: AnalyserNode;
  aTreble: AnalyserNode;
}) {
  return {
    bass: getFrequencyData(analysers.aBass),
    mid: getFrequencyData(analysers.aMid),
    tre: getFrequencyData(analysers.aTreble),
  };
}

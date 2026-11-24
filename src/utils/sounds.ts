// Web Audio API synthesized sound effects (zero external asset dependencies)

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  return sharedAudioCtx;
}

/**
 * Call synchronously inside a click handler so the browser unlocks AudioContext
 * before an async timeout triggers the sound.
 */
export function primeAudioContext(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  } catch {
    // Ignore audio context errors on restricted devices
  }
}

/**
 * Crisp card/Visa payment approval chime (warm double bell + sparkle)
 */
export function playVisaPurchaseSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const notes = [
      { freq: 880, start: 0, dur: 0.14, gain: 0.16, type: 'sine' as OscillatorType },
      { freq: 1318.51, start: 0.08, dur: 0.24, gain: 0.18, type: 'triangle' as OscillatorType },
      { freq: 1760, start: 0.16, dur: 0.32, gain: 0.12, type: 'sine' as OscillatorType },
    ];

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = n.type;
      osc.frequency.setValueAtTime(n.freq, now + n.start);

      gainNode.gain.setValueAtTime(0.0001, now + n.start);
      gainNode.gain.exponentialRampToValueAtTime(n.gain, now + n.start + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + n.start + n.dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + n.start);
      osc.stop(now + n.start + n.dur + 0.02);
    }
  } catch {
    // Ignore audio errors gracefully
  }
}

/**
 * Upbeat Robux transfer swoosh + two-note confirmation chime
 */
export function playSendRobuxSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    // Subtle upward transfer sweep
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sine';
    sweepOsc.frequency.setValueAtTime(340, now);
    sweepOsc.frequency.exponentialRampToValueAtTime(780, now + 0.09);

    sweepGain.gain.setValueAtTime(0.0001, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

    sweepOsc.connect(sweepGain);
    sweepGain.connect(ctx.destination);
    sweepOsc.start(now);
    sweepOsc.stop(now + 0.11);

    // Clean two-note confirmation chime
    const chimes = [
      { freq: 1046.5, start: 0.07, dur: 0.16, gain: 0.15 },
      { freq: 1567.98, start: 0.15, dur: 0.28, gain: 0.16 },
    ];

    for (const c of chimes) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(c.freq, now + c.start);

      gainNode.gain.setValueAtTime(0.0001, now + c.start);
      gainNode.gain.exponentialRampToValueAtTime(c.gain, now + c.start + 0.014);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + c.start + c.dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + c.start);
      osc.stop(now + c.start + c.dur + 0.02);
    }
  } catch {
    // Ignore audio errors gracefully
  }
}

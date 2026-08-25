// Studio Web Audio Engine for Melofy
// Generates rich polyphonic musical themes with custom filters, reverbs, and scale tunings
// Also handles standard HTML5 audio elements seamlessly.

class StudioAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentTrackId: string | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private currentHtmlAudio: HTMLAudioElement | null = null;
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private pauseOffset: number = 0;
  private trackDuration: number = 54;
  private isLooping: boolean = true;
  private onTimeUpdateCallback: ((currentTime: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean, trackId: string | null) => void) | null = null;
  private onMuteChangeCallback: ((isMuted: boolean) => void) | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];
  private currentPreset: string = 'romantic_piano';
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private freqArray: Uint8Array | null = null;
  private timeArray: Uint8Array | null = null;
  private sequenceTimer: any = null;
  private currentTrackData: {
    id: string;
    audioUrl?: string;
    synthPreset?: string;
    duration?: number;
  } | null = null;

  constructor() {
    // Audio context is lazily initialized or unlocked on first user interaction
  }

  public initContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      this.audioCtx = new AudioCtxClass();
      
      this.masterGain = this.audioCtx.createGain();
      const gainVal = this.isMuted ? 0 : 0.75;
      this.masterGain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.78;

      this.freqArray = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.timeArray = new Uint8Array(this.analyserNode.frequencyBinCount);

      // Connect: masterGain -> analyserNode -> destination
      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public getAudioAnalysis(): {
    isPlaying: boolean;
    bass: number;
    mid: number;
    treble: number;
    overall: number;
    rawFrequencies: Uint8Array | null;
    rawWaveform: Uint8Array | null;
  } {
    if (!this.isPlaying || !this.analyserNode || !this.freqArray || !this.timeArray) {
      return {
        isPlaying: this.isPlaying,
        bass: 0,
        mid: 0,
        treble: 0,
        overall: 0,
        rawFrequencies: null,
        rawWaveform: null
      };
    }

    this.analyserNode.getByteFrequencyData(this.freqArray);
    this.analyserNode.getByteTimeDomainData(this.timeArray);

    const binCount = this.freqArray.length;
    const bassEnd = Math.floor(binCount * 0.15);
    const midEnd = Math.floor(binCount * 0.6);

    let bassSum = 0;
    for (let i = 0; i < bassEnd; i++) bassSum += this.freqArray[i];
    const bass = bassSum / (bassEnd * 255 || 1);

    let midSum = 0;
    for (let i = bassEnd; i < midEnd; i++) midSum += this.freqArray[i];
    const mid = midSum / ((midEnd - bassEnd) * 255 || 1);

    let trebleSum = 0;
    for (let i = midEnd; i < binCount; i++) trebleSum += this.freqArray[i];
    const treble = trebleSum / ((binCount - midEnd) * 255 || 1);

    const overall = (bass * 0.45 + mid * 0.35 + treble * 0.2);

    return {
      isPlaying: true,
      bass: Math.min(1, bass * 1.4),
      mid: Math.min(1, mid * 1.5),
      treble: Math.min(1, treble * 1.6),
      overall: Math.min(1, overall * 1.4),
      rawFrequencies: this.freqArray,
      rawWaveform: this.timeArray
    };
  }

  public setCallbacks(
    onTimeUpdate: (currentTime: number, duration: number) => void,
    onEnded: () => void,
    onStateChange: (isPlaying: boolean, trackId: string | null) => void,
    onMuteChange?: (isMuted: boolean) => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
    this.onStateChangeCallback = onStateChange;
    if (onMuteChange) this.onMuteChangeCallback = onMuteChange;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(muted ? 0.0001 : 0.75, now);
    }
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.muted = muted;
    }
    if (this.onMuteChangeCallback) {
      this.onMuteChangeCallback(muted);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLooping(loop: boolean) {
    this.isLooping = loop;
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.loop = loop;
    }
  }

  public playTrack(track: {
    id: string;
    audioUrl?: string;
    synthPreset?: string;
    duration?: number;
  }) {
    this.currentTrackData = track;
    this.initContext();

    // If already playing this track, toggle or resume
    if (this.currentTrackId === track.id && this.isPlaying) {
      this.pause();
      return;
    }

    // Stop any existing playback
    this.stop();

    this.currentTrackId = track.id;
    this.trackDuration = track.duration || 54;
    this.currentPreset = track.synthPreset || 'romantic_piano';

    // If real audio file / URL is present
    if (track.audioUrl && (track.audioUrl.startsWith('http') || track.audioUrl.startsWith('blob:') || track.audioUrl.startsWith('data:') || track.audioUrl.endsWith('.mp3'))) {
      this.playHtmlAudio(track.audioUrl);
      return;
    }

    // Otherwise play through our high fidelity Web Audio Studio Synthesizer
    this.playSyntheticStudioTrack();
  }

  private playHtmlAudio(url: string) {
    this.currentHtmlAudio = new Audio(url);
    this.currentHtmlAudio.muted = this.isMuted;
    this.currentHtmlAudio.loop = this.isLooping;
    this.currentHtmlAudio.currentTime = this.pauseOffset;

    this.currentHtmlAudio.addEventListener('timeupdate', () => {
      if (this.currentHtmlAudio && this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(
          this.currentHtmlAudio.currentTime,
          this.currentHtmlAudio.duration || this.trackDuration
        );
      }
    });

    this.currentHtmlAudio.addEventListener('ended', () => {
      if (!this.isLooping) {
        this.isPlaying = false;
        this.pauseOffset = 0;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false, this.currentTrackId);
        if (this.onEndedCallback) this.onEndedCallback();
      }
    });

    this.currentHtmlAudio.play().then(() => {
      this.isPlaying = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true, this.currentTrackId);
    }).catch(err => {
      console.warn("HTML audio play error, falling back to studio synth:", err);
      this.playSyntheticStudioTrack();
    });
  }

  private playSyntheticStudioTrack() {
    if (!this.audioCtx || !this.masterGain) return;

    this.isPlaying = true;
    this.startTime = this.audioCtx.currentTime - this.pauseOffset;
    if (this.onStateChangeCallback) this.onStateChangeCallback(true, this.currentTrackId);

    this.startMusicalPattern(this.currentPreset);

    // Track progression ticker with throttled state notification (~200ms)
    let lastNotifyTime = 0;
    const tick = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const current = this.audioCtx.currentTime - this.startTime;
      
      if (current >= this.trackDuration) {
        if (this.isLooping) {
          // Seamless loop back to beginning
          this.startTime = this.audioCtx.currentTime;
          this.pauseOffset = 0;
          this.startMusicalPattern(this.currentPreset);
        } else {
          this.stop();
          this.pauseOffset = 0;
          if (this.onEndedCallback) this.onEndedCallback();
          return;
        }
      }

      const nowMs = performance.now();
      if (this.onTimeUpdateCallback && (nowMs - lastNotifyTime >= 200 || current < 0.2)) {
        lastNotifyTime = nowMs;
        this.onTimeUpdateCallback(current % this.trackDuration, this.trackDuration);
      }

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private startMusicalPattern(preset: string) {
    if (!this.audioCtx || !this.masterGain) return;

    // Musical patterns: notes in Hz
    // Frequencies: C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25, D5=587.33, E5=659.25, F#4=369.99, G#4=415.30
    let noteSequences: number[][] = [];
    let tempo = 110;
    let waveType: OscillatorType = 'sine';

    switch (preset) {
      case 'romantic_piano':
        // Lush E-major romantic ballad arpeggios
        tempo = 80;
        waveType = 'sine';
        noteSequences = [
          [329.63, 392.00, 493.88, 587.33, 659.25], // E4 - G4 - B4 - D5 - E5
          [261.63, 329.63, 392.00, 523.25],         // C4 - E4 - G4 - C5
          [293.66, 369.99, 440.00, 587.33],         // D4 - F#4 - A4 - D5
          [246.94, 329.63, 392.00, 493.88]          // B3 - E4 - G4 - B4
        ];
        break;

      case 'indo_fusion':
        // Raag Yaman / Bhairavi inspired fusion scale
        tempo = 105;
        waveType = 'triangle';
        noteSequences = [
          [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25],
          [523.25, 493.88, 440.00, 369.99, 329.63, 293.66, 261.63],
          [293.66, 369.99, 440.00, 523.25, 587.33]
        ];
        break;

      case 'retro_classical':
        // Warm 70s Bollywood strings & melody
        tempo = 90;
        waveType = 'sine';
        noteSequences = [
          [220.00, 261.63, 329.63, 440.00], // Am
          [174.61, 220.00, 261.63, 349.23], // F
          [196.00, 246.94, 293.66, 392.00], // G
          [164.81, 196.00, 246.94, 329.63]  // Em
        ];
        break;

      case 'dance_pop':
        // Punchy 128 BPM electronic pop groove
        tempo = 126;
        waveType = 'sawtooth';
        noteSequences = [
          [261.63, 329.63, 392.00, 523.25],
          [220.00, 261.63, 329.63, 440.00],
          [174.61, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 392.00]
        ];
        break;

      case 'bollywood_orchestra':
        // Grand emotive Bollywood progression
        tempo = 96;
        waveType = 'triangle';
        noteSequences = [
          [261.63, 329.63, 392.00, 493.88, 587.33],
          [220.00, 261.63, 349.23, 440.00, 523.25],
          [174.61, 220.00, 261.63, 329.63, 392.00],
          [196.00, 246.94, 293.66, 369.99, 440.00]
        ];
        break;

      case 'acoustic_guitar':
      default:
        // Fingerpicked acoustic folk warmth
        tempo = 94;
        waveType = 'sine';
        noteSequences = [
          [196.00, 246.94, 293.66, 392.00, 493.88], // G
          [164.81, 196.00, 246.94, 329.63, 392.00], // Em
          [174.61, 220.00, 261.63, 349.23, 440.00], // C
          [146.83, 220.00, 293.66, 369.99, 440.00]  // D
        ];
        break;
    }

    const intervalMs = (60 / tempo) * 1000 * 0.5; // Eighth note timing
    let seqIndex = 0;
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isPlaying || !this.audioCtx || !this.masterGain) return;

      const currentSeq = noteSequences[seqIndex % noteSequences.length];
      const freq = currentSeq[noteIndex % currentSeq.length];

      this.triggerNote(freq, waveType, 0.45, preset);

      // Add ambient bass root note on first beat
      if (noteIndex % 4 === 0) {
        this.triggerNote(freq * 0.5, 'sine', 0.8, 'bass');
      }

      noteIndex++;
      if (noteIndex >= currentSeq.length) {
        noteIndex = 0;
        seqIndex++;
      }

      this.sequenceTimer = setTimeout(playNextNote, intervalMs);
    };

    playNextNote();
  }

  private triggerNote(freq: number, type: OscillatorType, duration: number, style: string) {
    if (!this.audioCtx || !this.masterGain) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // Warm low-pass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'dance_pop' ? 2400 : 1600, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

      // Envelope ADSR
      const now = this.audioCtx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(style === 'bass' ? 0.22 : 0.16, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.05);

      this.activeOscillators.push(osc);
      this.activeGainNodes.push(gain);

      // Cleanup
      setTimeout(() => {
        const oscIdx = this.activeOscillators.indexOf(osc);
        if (oscIdx > -1) this.activeOscillators.splice(oscIdx, 1);
        const gainIdx = this.activeGainNodes.indexOf(gain);
        if (gainIdx > -1) this.activeGainNodes.splice(gainIdx, 1);
      }, (duration + 0.2) * 1000);
    } catch (e) {
      console.warn("Audio trigger error:", e);
    }
  }

  public seek(seconds: number) {
    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.currentTime = seconds;
      this.pauseOffset = seconds;
    } else if (this.audioCtx) {
      this.pauseOffset = Math.max(0, Math.min(seconds, this.trackDuration));
      if (this.isPlaying) {
        this.startTime = this.audioCtx.currentTime - this.pauseOffset;
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  public pause() {
    this.isPlaying = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.sequenceTimer) clearTimeout(this.sequenceTimer);

    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.pause();
      this.pauseOffset = this.currentHtmlAudio.currentTime;
    } else if (this.audioCtx) {
      this.pauseOffset = Math.max(0, this.audioCtx.currentTime - this.startTime);
    }

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false, this.currentTrackId);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.sequenceTimer) clearTimeout(this.sequenceTimer);

    if (this.currentHtmlAudio) {
      this.currentHtmlAudio.pause();
      this.currentHtmlAudio.currentTime = 0;
      this.currentHtmlAudio = null;
    }

    this.activeOscillators.forEach(osc => {
      try { osc.stop(); } catch (_) {}
    });
    this.activeOscillators = [];
    this.activeGainNodes = [];

    this.pauseOffset = 0;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false, null);
    }
  }

  /**
   * Subtle, high-quality harmonic resonance sound on hovering CD artwork
   */
  public playUiHover() {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Soft dual harmonic shimmer (E5 + B5) with gentle envelope
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, now); // B5

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(0.032, now + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(filter);
      filter.connect(this.masterGain || ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.12);
      osc2.stop(now + 0.12);
    } catch (_) {
      // Audio policies fallback
    }
  }

  /**
   * Crisp, tactile analog cue click for play/pause interaction
   */
  public playUiClick(actionType: 'play' | 'pause' | 'button' = 'button') {
    try {
      this.initContext();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      if (actionType === 'play') {
        // Needle drop / Play chirp: rising warm tone with crisp initial transient
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.065, now + 0.008);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      } else if (actionType === 'pause') {
        // Soft analog release click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.006);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      } else {
        // Micro tactile click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.03);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.04, now + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      }

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {
      // Audio policies fallback
    }
  }
}

export const studioAudio = new StudioAudioEngine();

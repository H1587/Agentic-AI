/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class CosmicAudioManager {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;

  // Passive Drone Synthesis Handles
  private droneOscs: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;
  private spaceWindFilter: BiquadFilterNode | null = null;
  private spaceWindNoise: AudioBufferSourceNode | null = null;
  private radioWavesNoise: AudioBufferSourceNode | null = null;
  private radioWavesFilter: BiquadFilterNode | null = null;
  private melodicIntervalId: number | null = null;
  private radioWavesIntervalId: number | null = null;

  // Active Effects Handles
  private activeFXNode: GainNode | null = null;
  private lfoInterval: number | null = null;
  private activeTimeouts: any[] = [];

  public isMuted: boolean = false; // default standard state

  constructor() {
    // Lazy initialization on user click is required by modern browser security standards
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Setup master gain
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
      this.primaryGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API is not supported in this environment:", e);
    }
  }

  // Generate a buffer containing white noise for cosmic wind effects
  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of noise loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Synth sound for general app buttons on hover: elegant short high frequency chime beep
   */
  public playHover() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

      gain.gain.setValueAtTime(0.015, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.primaryGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {}
  }

  /**
   * Synth sound for tactile button clicks
   */
  public playClick() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.1);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.primaryGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.11);
    } catch (e) {}
  }

  /**
   * Fast sweeping frequency filter sound for navigation changes (Entering simulations / portal jumps)
   */
  public playNavigate() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(1600, t + 0.25);

      gain.gain.setValueAtTime(0.02, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.primaryGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    } catch (e) {}
  }

  /**
   * Deep zoom sweep sound going inwards
   */
  public playZoomIn() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(850, t + 0.4);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.primaryGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.41);
    } catch (e) {}
  }

  /**
   * Deep zoom sweep sound releasing outwards
   */
  public playZoomOut() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.4);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.primaryGain || this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.41);
    } catch (e) {}
  }

  /**
   * Synthesizes a high-tech telemetry blip with an ascending minor-chord arpeggio for human space milestones.
   */
  public playExplorationBeep() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const t = this.ctx.currentTime;
      // Synthesize 3 ascending chimes representing progress/ascension
      const notes = [587.33, 659.25, 880.00]; // D5, E5, A5
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const delay = idx * 0.08;
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + delay + 0.15);
        
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.04, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.15);
        
        osc.connect(gain);
        gain.connect(this.primaryGain || this.ctx!.destination);
        
        osc.start(t + delay);
        osc.stop(t + delay + 0.16);
      });
    } catch (e) {}
  }

  /**
   * Warm, deep stellar space drone synthesis, now augmented with a lush cosmic pad melody
   */
  public startPassiveDrone() {
    this.initContext();
    if (!this.ctx || !this.primaryGain) return;

    // Resume context if suspended (browser security check)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop existing drone if running to refresh cleanly
    this.stopPassiveDrone();

    const t = this.ctx.currentTime;

    // 1. Create Drone Gain and fade it in gently
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, t);
    this.droneGain.gain.linearRampToValueAtTime(0.18, t + 2.5); // Warm ambient volume
    this.droneGain.connect(this.primaryGain);

    // 2. Synthesize deep bass sub-oscillators with beat frequency variations
    const freqs = [55.0, 55.4, 82.4, 110.0]; // Sub bass and perfect fifth
    this.droneOscs = [];

    freqs.forEach((freq, idx) => {
      const scaleGain = this.ctx!.createGain();
      // Lower volume for higher harmonics
      scaleGain.gain.setValueAtTime(idx === 0 || idx === 1 ? 0.35 : 0.15, t);
      scaleGain.connect(this.droneGain!);

      const osc = this.ctx!.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      
      osc.connect(scaleGain);
      osc.start(t);
      this.droneOscs.push(osc);
    });

    // 3. Ambient Solar wind noise layer
    try {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      noise.loop = true;

      this.spaceWindFilter = this.ctx.createBiquadFilter();
      this.spaceWindFilter.type = 'lowpass';
      this.spaceWindFilter.Q.setValueAtTime(1.5, t);
      
      // Sweep cutoff frequency dynamically to simulate cosmic radiation drift
      this.spaceWindFilter.frequency.setValueAtTime(120, t);
      this.spaceWindFilter.frequency.linearRampToValueAtTime(260, t + 4.0);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.02, t);

      noise.connect(this.spaceWindFilter);
      this.spaceWindFilter.connect(windGain);
      windGain.connect(this.droneGain);
      
      noise.start(t);
      this.spaceWindNoise = noise;
    } catch (e) {
      // safe fallback if buffer fails
    }

    // 4. Lush, slow celestial pad chords drifting in background of main menu (ambient space background music)
    this.startCelestialMelody();

    // 5. High-tech, cozy cosmic radio wave frequency sweeps and pulsar transmissions
    this.startRadioWaves();
  }

  /**
   * Plays deep celestial space chords in a slow-drifting, ambient loop for the main menu background sound
   */
  private startCelestialMelody() {
    if (!this.ctx || !this.droneGain) return;
    
    // List of gorgeous spaced seventh/fifth chords to cycle through in the main menu (Hz)
    const chordsList = [
      [220.0, 277.18, 329.63, 440.0], // A Major chord (Warm, open)
      [196.0, 246.94, 293.66, 392.0], // G Major (Deep, celestial)
      [220.0, 261.63, 329.63, 392.0], // Am7 (Introspective, cosmic)
      [174.61, 220.0, 261.63, 349.23] // F Major (Distant dream)
    ];
    
    let chordIndex = 0;
    
    const playNextChord = () => {
      if (!this.ctx || !this.droneGain) return;
      
      const t = this.ctx.currentTime;
      const notes = chordsList[chordIndex];
      chordIndex = (chordIndex + 1) % chordsList.length;
      
      // Play each note of the chord as a soft, sweeping sine pad
      notes.forEach((freq) => {
        if (!this.ctx || !this.droneGain) return;
        
        const osc = this.ctx.createOscillator();
        const chordGain = this.ctx.createGain();
        const lpFilter = this.ctx.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(150, t);
        lpFilter.frequency.exponentialRampToValueAtTime(450, t + 3.0); // slow opening of pad filter
        
        // Soft volume envelope for drifting space pad (slow attack, slow decay)
        chordGain.gain.setValueAtTime(0, t);
        chordGain.gain.linearRampToValueAtTime(0.015, t + 3.0); // soft fade in
        chordGain.gain.setValueAtTime(0.015, t + 4.5);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, t + 7.5); // long fade out
        
        osc.connect(lpFilter);
        lpFilter.connect(chordGain);
        chordGain.connect(this.droneGain);
        
        osc.start(t);
        osc.stop(t + 7.6);
        
        this.droneOscs.push(osc); // keep for tracking teardown
      });
    };
    
    // Initial triggers
    playNextChord();
    this.melodicIntervalId = window.setInterval(playNextChord, 8000);
  }

  /**
   * Spooky radio waves background static sweeper & pulsar tick telemetry sounds
   */
  private startRadioWaves() {
    if (!this.ctx || !this.droneGain) return;
    const t = this.ctx.currentTime;

    try {
      // 1. Radio Static Sweeper (White Noise through resonant Bandpass Filter)
      const radioNoise = this.ctx.createBufferSource();
      radioNoise.buffer = this.createNoiseBuffer();
      radioNoise.loop = true;

      this.radioWavesFilter = this.ctx.createBiquadFilter();
      this.radioWavesFilter.type = 'bandpass';
      this.radioWavesFilter.Q.setValueAtTime(9.0, t); // High resonance for characteristic whistling wave
      this.radioWavesFilter.frequency.setValueAtTime(450, t);

      const radioGain = this.ctx.createGain();
      radioGain.gain.setValueAtTime(0.006, t); // Subtly and gently embedded into background context

      radioNoise.connect(this.radioWavesFilter);
      this.radioWavesFilter.connect(radioGain);
      radioGain.connect(this.droneGain);

      radioNoise.start(t);
      this.radioWavesNoise = radioNoise;

      // 2. Slow cyclic swept LFO to modulate cutoff frequency (simulating searching for cosmic radio frequencies)
      let phase = 0;
      this.radioWavesIntervalId = window.setInterval(() => {
        if (!this.ctx || !this.radioWavesFilter) return;
        phase += 0.055;
        const targetFreq = 480 + Math.sin(phase) * 320 + Math.cos(phase * 0.4) * 80;
        const now = this.ctx.currentTime;
        try {
          this.radioWavesFilter.frequency.linearRampToValueAtTime(targetFreq, now + 0.1);
        } catch (e) {}

        // Beep/pulsar signal pattern: occasionally emit a soft interstellar beep
        if (Math.random() < 0.13) {
          const beepOsc = this.ctx.createOscillator();
          const beepGain = this.ctx.createGain();
          
          beepOsc.type = 'sine';
          beepOsc.frequency.setValueAtTime(920 + Math.sin(phase) * 100, now);
          
          beepGain.gain.setValueAtTime(0, now);
          beepGain.gain.linearRampToValueAtTime(0.007, now + 0.05);
          beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
          
          beepOsc.connect(beepGain);
          beepGain.connect(this.droneGain!);
          
          beepOsc.start(now);
          beepOsc.stop(now + 0.6);
          
          this.droneOscs.push(beepOsc);
        }
      }, 160);

    } catch (e) {
      console.warn("Failed to initialize cosmic radio waves:", e);
    }
  }

  public stopPassiveDrone(fadeDuration: number = 0.8) {
    if (this.melodicIntervalId) {
      clearInterval(this.melodicIntervalId);
      this.melodicIntervalId = null;
    }

    if (this.radioWavesIntervalId) {
      clearInterval(this.radioWavesIntervalId);
      this.radioWavesIntervalId = null;
    }

    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    if (this.droneGain) {
      try {
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, t);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, t + fadeDuration);
      } catch (e) {
        this.droneGain.gain.setValueAtTime(0, t + fadeDuration);
      }
    }

    // Schedule actual hardware oscillator teardown after fade
    const oscsToStop = [...this.droneOscs];
    const noiseToStop = this.spaceWindNoise;
    const radioNoiseToStop = this.radioWavesNoise;
    
    this.droneOscs = [];
    this.spaceWindNoise = null;
    this.radioWavesNoise = null;
    this.radioWavesFilter = null;

    setTimeout(() => {
      oscsToStop.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      if (noiseToStop) {
        try { noiseToStop.stop(); } catch(e) {}
      }
      if (radioNoiseToStop) {
        try { radioNoiseToStop.stop(); } catch(e) {}
      }
    }, fadeDuration * 1000 + 100);
  }

  /**
   * BLACKHOLE ABSORPTION: Massive gravitational inward pull sweep
   */
  public playBlackholeSingularity() {
    this.initContext();
    if (!this.ctx || !this.primaryGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Stop ambient drone and current FX
    this.stopPassiveDrone(0.4);
    this.stopActiveFX();

    const t = this.ctx.currentTime;
    const fxGain = this.ctx.createGain();
    fxGain.gain.setValueAtTime(0, t);
    fxGain.gain.linearRampToValueAtTime(0.35, t + 1.0); // ramp up pulling wind sound
    fxGain.connect(this.primaryGain);
    this.activeFXNode = fxGain;

    // 1. Dark matter sub-bass rumble sucking energy down (Pitch slide from 130Hz -> 18Hz)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(130, t);
    // Gravity pulls harder and compresses waves down
    subOsc.frequency.exponentialRampToValueAtTime(18, t + 8.8);
    
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(160, t);
    subFilter.frequency.linearRampToValueAtTime(45, t + 8.8);

    subOsc.connect(subFilter);
    subFilter.connect(fxGain);
    subOsc.start(t);

    this.droneOscs.push(subOsc); // ensure tracking for early cleanup

    // 2. Gravitational lensing whistle: swirling wind noise sweeping down
    try {
      const swirlerSrc = this.ctx.createBufferSource();
      swirlerSrc.buffer = this.createNoiseBuffer();
      swirlerSrc.loop = true;

      const swirlerFilter = this.ctx.createBiquadFilter();
      swirlerFilter.type = 'bandpass';
      swirlerFilter.Q.setValueAtTime(6.0, t); // High resonance for spiral whistling
      swirlerFilter.frequency.setValueAtTime(1400, t);
      swirlerFilter.frequency.exponentialRampToValueAtTime(220, t + 8.5);

      const swirlerGain = this.ctx.createGain();
      swirlerGain.gain.setValueAtTime(0.06, t);

      swirlerSrc.connect(swirlerFilter);
      swirlerFilter.connect(swirlerGain);
      swirlerGain.connect(fxGain);
      
      swirlerSrc.start(t);
      this.spaceWindNoise = swirlerSrc; // safe storage for early termination
    } catch (e) {}

    // 3. Spaghettification matter tearing loops (LFO beating faster as it gets compressed)
    const ripOsc = this.ctx.createOscillator();
    ripOsc.type = 'square';
    ripOsc.frequency.setValueAtTime(90, t);
    
    const ripFilter = this.ctx.createBiquadFilter();
    ripFilter.type = 'peaking';
    ripFilter.frequency.setValueAtTime(400, t);

    const ripGain = this.ctx.createGain();
    ripGain.gain.setValueAtTime(0.04, t);

    ripOsc.connect(ripFilter);
    ripFilter.connect(ripGain);
    ripGain.connect(fxGain);
    ripOsc.start(t);

    this.droneOscs.push(ripOsc);

    // Interval to accelerate frequency beating as time contracts
    let elapsed = 0;
    this.lfoInterval = window.setInterval(() => {
      if (!this.ctx) return;
      elapsed += 0.1;
      const beatFreq = 4 + Math.pow(elapsed, 1.8) * 1.5; // faster oscillations
      const now = this.ctx.currentTime;
      try {
        ripFilter.frequency.setValueAtTime(600 + Math.sin(now * beatFreq) * 250, now);
      } catch (e) {}
    }, 100);

    // 4. THERMONUCLEAR BLINDING FLASH STRIKE (at 8.8 seconds)
    const tId = window.setTimeout(() => {
      this.activeTimeouts = this.activeTimeouts.filter(id => id !== tId);
      if (!this.ctx || !this.primaryGain) return;
      const strikeTime = this.ctx.currentTime;
      
      // Stop old tearing sounds instantly
      this.stopActiveFX(0.1);

      // Create enormous supernova boom sound!
      const boomGain = this.ctx.createGain();
      boomGain.gain.setValueAtTime(0.65, strikeTime);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 1.2); // decays to absolute silence
      boomGain.connect(this.primaryGain);

      // Exploding sub base rumble sound
      const boomOsc = this.ctx.createOscillator();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(120, strikeTime);
      boomOsc.frequency.exponentialRampToValueAtTime(10, strikeTime + 1.0);

      boomOsc.connect(boomGain);
      boomOsc.start(strikeTime);

      // Static laser-like flash noise burst
      try {
        const whiteBurst = this.ctx.createBufferSource();
        whiteBurst.buffer = this.createNoiseBuffer();
        
        const burstFilter = this.ctx.createBiquadFilter();
        burstFilter.type = 'highpass';
        burstFilter.frequency.setValueAtTime(1800, strikeTime);

        const burstGain = this.ctx.createGain();
        burstGain.gain.setValueAtTime(0.18, strikeTime);
        burstGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.6);

        whiteBurst.connect(burstFilter);
        burstFilter.connect(burstGain);
        burstGain.connect(boomGain);
        
        whiteBurst.start(strikeTime);
      } catch(e) {}

    }, 8800);
    this.activeTimeouts.push(tId);
  }

  /**
   * WHITEHOLE BIRTH: Infinite compression tension, then explosive big bang expander
   */
  public playWhiteholeSingularity() {
    this.initContext();
    if (!this.ctx || !this.primaryGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Eradicate other sounds instantly
    this.stopPassiveDrone(0.1);
    this.stopActiveFX();

    const t = this.ctx.currentTime;
    
    // Initial silent tension state (0s to 10.0s): high frequency crystalline hum shaking
    const tensionGain = this.ctx.createGain();
    tensionGain.gain.setValueAtTime(0.1, t);
    tensionGain.gain.exponentialRampToValueAtTime(0.01, t + 9.95); // shrinks inwards
    tensionGain.connect(this.primaryGain);
    this.activeFXNode = tensionGain;

    const tensionOsc = this.ctx.createOscillator();
    tensionOsc.type = 'triangle';
    tensionOsc.frequency.setValueAtTime(120, t);
    tensionOsc.frequency.linearRampToValueAtTime(650, t + 9.95); // Pitch climbs to intense point
    tensionOsc.connect(tensionGain);
    tensionOsc.start(t);

    this.droneOscs.push(tensionOsc);

    // ==========================================
    // BIG BANG SHOCKWAVE TRIGGER (at 10.0 seconds)
    // ==========================================
    const tId = window.setTimeout(() => {
      this.activeTimeouts = this.activeTimeouts.filter(id => id !== tId);
      if (!this.ctx || !this.primaryGain) return;
      const bangTime = this.ctx.currentTime;
      
      // Stop the tension rise instantly
      this.stopActiveFX(0.05);

      // Create gigantic galactic inflation explosion!
      const bangGain = this.ctx.createGain();
      bangGain.gain.setValueAtTime(0.8, bangTime);
      bangGain.gain.exponentialRampToValueAtTime(0.0001, bangTime + 5.5); // long grand space decay
      bangGain.connect(this.primaryGain);
      this.activeFXNode = bangGain;

      // 1. Core massive kinetic sub-harmonic wave
      const baseOsc = this.ctx.createOscillator();
      baseOsc.type = 'sawtooth';
      baseOsc.frequency.setValueAtTime(220, bangTime);
      baseOsc.frequency.exponentialRampToValueAtTime(28, bangTime + 2.5); // expand down into sub bass

      const baseFilter = this.ctx.createBiquadFilter();
      baseFilter.type = 'lowpass';
      baseFilter.frequency.setValueAtTime(280, bangTime);
      baseFilter.frequency.linearRampToValueAtTime(80, bangTime + 2.5);

      baseOsc.connect(baseFilter);
      baseFilter.connect(bangGain);
      baseOsc.start(bangTime);

      this.droneOscs.push(baseOsc);

      // 2. Exploding massive cosmic wind dust dispersion
      try {
        const explosionWind = this.ctx.createBufferSource();
        explosionWind.buffer = this.createNoiseBuffer();
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1.0, bangTime);
        filter.frequency.setValueAtTime(6000, bangTime);
        filter.frequency.exponentialRampToValueAtTime(180, bangTime + 4.5); // wide sweep of hot matter spreading

        const windVolume = this.ctx.createGain();
        windVolume.gain.setValueAtTime(0.28, bangTime);
        windVolume.gain.exponentialRampToValueAtTime(0.0001, bangTime + 5.0);

        explosionWind.connect(filter);
        filter.connect(windVolume);
        windVolume.connect(bangGain);
        
        explosionWind.start(bangTime);
      } catch(e) {}

      // 3. Shimmering stellar clouds birth synthesis (chime bell high frequency)
      const starBell = this.ctx.createOscillator();
      starBell.type = 'sine';
      starBell.frequency.setValueAtTime(1200, bangTime + 0.1);
      
      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0.0, bangTime);
      bellGain.gain.linearRampToValueAtTime(0.12, bangTime + 0.3); // delay peak slightly to match visual spark flare
      bellGain.gain.exponentialRampToValueAtTime(0.0001, bangTime + 2.8);

      starBell.connect(bellGain);
      bellGain.connect(this.primaryGain!);
      starBell.start(bangTime);

      this.droneOscs.push(starBell);

    }, 10000);
    this.activeTimeouts.push(tId);
  }

  public stopActiveFX(fadeDuration: number = 0.3) {
    if (this.lfoInterval) {
      clearInterval(this.lfoInterval);
      this.lfoInterval = null;
    }

    // Clear all scheduled timeouts preventing phantom bangs
    this.activeTimeouts.forEach(id => clearTimeout(id));
    this.activeTimeouts = [];

    if (this.activeFXNode) {
      try {
        const t = this.ctx ? this.ctx.currentTime : 0;
        if (this.ctx) {
          this.activeFXNode.gain.setValueAtTime(this.activeFXNode.gain.value, t);
          this.activeFXNode.gain.exponentialRampToValueAtTime(0.0001, t + fadeDuration);
        }
      } catch (e) {}
      
      this.activeFXNode = null;
    }

    // Tear down any hardware oscillators scheduled during the active simulation
    const oscToClean = [...this.droneOscs];
    this.droneOscs = [];
    setTimeout(() => {
      oscToClean.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
    }, fadeDuration * 1000 + 100);
  }

  /**
   * Set general simulator volume control
   * @param volume ratio between 0 and 1
   */
  public setVolume(volume: number) {
    this.initContext();
    if (this.primaryGain && this.ctx) {
      const val = Math.max(0, Math.min(1, volume));
      this.primaryGain.gain.linearRampToValueAtTime(val * 0.7, this.ctx.currentTime + 0.2);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(muted ? 0 : 0.5);
  }
}

// Export single shared manager instance
export const audioManager = new CosmicAudioManager();


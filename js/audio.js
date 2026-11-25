/* ============================================================
   RunnerCat — Retro 8-Bit Web Audio Synthesizer
   ============================================================ */
(function (RC) {
  let ctx = null;
  let enabled = RC.Storage ? RC.Storage.getState().soundEnabled : true;
  let musicEnabled = RC.Storage ? RC.Storage.isMusicEnabled() : true;
  let musicTimer = null;
  let musicStep = 0;
  let currentTheme = "menu";

  const MUSIC_THEMES = {
    menu: { tempo: 240, wave: "triangle", notes: [262, 330, 392, 523, 392, 330, 294, 392] },
    city: { tempo: 185, wave: "square", notes: [330, 392, 440, 523, 440, 392, 330, 294] },
    ocean: { tempo: 240, wave: "sine", notes: [262, 311, 392, 466, 392, 311, 294, 349] },
    sky: { tempo: 170, wave: "square", notes: [392, 494, 587, 784, 587, 494, 440, 523] },
    spooky: { tempo: 210, wave: "sawtooth", notes: [220, 233, 262, 311, 294, 262, 233, 196] },
    space: { tempo: 200, wave: "triangle", notes: [330, 494, 659, 587, 440, 523, 659, 784] },
    snow: { tempo: 195, wave: "triangle", notes: [392, 440, 523, 659, 523, 440, 349, 440] },
    jungle: { tempo: 180, wave: "square", notes: [294, 349, 440, 523, 440, 392, 349, 330] },
    boss: { tempo: 145, wave: "sawtooth", notes: [196, 233, 262, 294, 262, 233, 220, 175] }
  };

  function ensureContext() {
    if (!enabled && !musicEnabled) return null;
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function playMusicNote(freq, wave, durSec) {
    if (!musicEnabled || !freq) return;
    const audio = ensureContext();
    if (!audio) return;
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = wave || "triangle";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.032, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + durSec + 0.01);
  }

  function playTone(opts) {
    const audio = ensureContext();
    if (!audio) return;

    const now = audio.currentTime + (opts.delay || 0);
    const dur = opts.duration || 0.1;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = opts.type || "square";
    osc.frequency.setValueAtTime(opts.freq || 440, now);
    if (opts.freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.freqEnd), now + dur);
    }

    const vol = opts.volume != null ? opts.volume : 0.12;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  function playNoise(duration, volume, highpassFreq) {
    const audio = ensureContext();
    if (!audio) return;
    const bufferSize = Math.floor(audio.sampleRate * duration);
    const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audio.createBufferSource();
    source.buffer = buffer;

    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = highpassFreq || 900;

    const gain = audio.createGain();
    const now = audio.currentTime;
    gain.gain.setValueAtTime(volume || 0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start(now);
  }

  const SFX = {
    isEnabled: () => enabled,
    setEnabled(val) {
      enabled = Boolean(val);
      if (RC.Storage) RC.Storage.setSoundEnabled(enabled);
    },
    toggle() {
      this.setEnabled(!enabled);
      if (enabled) this.uiClick();
      return enabled;
    },
    isMusicEnabled: () => musicEnabled,
    toggleMusic() {
      musicEnabled = !musicEnabled;
      if (RC.Storage) RC.Storage.setMusicEnabled(musicEnabled);
      if (!musicEnabled) {
        this.stopMusic();
      } else {
        this.startMusic(currentTheme);
      }
      return musicEnabled;
    },
    startMusic(theme) {
      currentTheme = theme || "menu";
      this.stopMusic();
      if (!musicEnabled) return;
      const cfg = MUSIC_THEMES[currentTheme] || MUSIC_THEMES.menu;
      musicStep = 0;
      musicTimer = window.setInterval(() => {
        if (!musicEnabled) return;
        const f = cfg.notes[musicStep % cfg.notes.length];
        playMusicNote(f, cfg.wave, (cfg.tempo / 1000) * 0.85);
        musicStep += 1;
      }, cfg.tempo);
    },
    stopMusic() {
      if (musicTimer) {
        window.clearInterval(musicTimer);
        musicTimer = null;
      }
    },

    uiClick() {
      playTone({ type: "square", freq: 520, freqEnd: 740, duration: 0.05, volume: 0.08 });
    },

    jump() {
      playTone({ type: "square", freq: 260, freqEnd: 580, duration: 0.11, volume: 0.11 });
    },

    doubleJump() {
      playTone({ type: "square", freq: 420, freqEnd: 880, duration: 0.09, volume: 0.11 });
      playTone({ type: "triangle", freq: 660, freqEnd: 1120, duration: 0.1, delay: 0.04, volume: 0.09 });
    },

    claw() {
      playNoise(0.08, 0.13, 1400);
      playTone({ type: "sawtooth", freq: 620, freqEnd: 180, duration: 0.09, volume: 0.09 });
    },

    scratchHit() {
      playNoise(0.11, 0.15, 700);
      playTone({ type: "square", freq: 340, freqEnd: 680, duration: 0.07, volume: 0.12 });
      playTone({ type: "square", freq: 680, freqEnd: 920, duration: 0.08, delay: 0.05, volume: 0.1 });
    },

    fish() {
      playTone({ type: "square", freq: 660, freqEnd: 990, duration: 0.07, volume: 0.1 });
      playTone({ type: "square", freq: 990, freqEnd: 1320, duration: 0.09, delay: 0.05, volume: 0.09 });
    },

    goldFish() {
      playTone({ type: "square", freq: 784, duration: 0.06, volume: 0.11 });
      playTone({ type: "square", freq: 988, duration: 0.06, delay: 0.05, volume: 0.11 });
      playTone({ type: "square", freq: 1175, duration: 0.07, delay: 0.1, volume: 0.11 });
      playTone({ type: "square", freq: 1568, duration: 0.13, delay: 0.16, volume: 0.12 });
    },

    powerup() {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, idx) => {
        playTone({ type: "triangle", freq: f, duration: 0.08, delay: idx * 0.05, volume: 0.13 });
      });
    },

    slowOn() {
      playTone({ type: "sine", freq: 440, freqEnd: 180, duration: 0.16, volume: 0.1 });
    },

    slowOff() {
      playTone({ type: "sine", freq: 220, freqEnd: 480, duration: 0.1, volume: 0.07 });
    },

    shieldBreak() {
      playNoise(0.15, 0.16, 600);
      playTone({ type: "sawtooth", freq: 380, freqEnd: 110, duration: 0.18, volume: 0.12 });
    },

    milestone() {
      playTone({ type: "square", freq: 587, duration: 0.07, volume: 0.09 });
      playTone({ type: "square", freq: 880, duration: 0.16, delay: 0.08, volume: 0.1 });
    },

    victory() {
      const melody = [523, 659, 784, 1046, 784, 1046];
      const delays = [0, 0.09, 0.18, 0.27, 0.42, 0.52];
      const durs = [0.08, 0.08, 0.08, 0.13, 0.08, 0.28];
      melody.forEach((f, i) => {
        playTone({ type: "square", freq: f, duration: durs[i], delay: delays[i], volume: 0.12 });
      });
    },

    gameOver() {
      playNoise(0.14, 0.14, 400);
      playTone({ type: "sawtooth", freq: 300, freqEnd: 190, duration: 0.14, volume: 0.12 });
      playTone({ type: "sawtooth", freq: 190, freqEnd: 95, duration: 0.26, delay: 0.13, volume: 0.13 });
    },

    shoot() {
      playTone({ type: "square", freq: 880, freqEnd: 320, duration: 0.06, volume: 0.08 });
    },

    swim() {
      playTone({ type: "sine", freq: 240, freqEnd: 460, duration: 0.08, volume: 0.08 });
    },

    wallSmash() {
      playNoise(0.16, 0.18, 450);
      playTone({ type: "square", freq: 220, freqEnd: 85, duration: 0.14, volume: 0.13 });
    },

    bossHit() {
      playNoise(0.12, 0.16, 600);
      playTone({ type: "sawtooth", freq: 520, freqEnd: 240, duration: 0.12, volume: 0.13 });
      playTone({ type: "square", freq: 760, freqEnd: 980, duration: 0.09, delay: 0.05, volume: 0.1 });
    },

    bossAlert() {
      playTone({ type: "square", freq: 440, duration: 0.07, volume: 0.1 });
      playTone({ type: "square", freq: 660, duration: 0.12, delay: 0.08, volume: 0.1 });
    },

    eggDrop() {
      playTone({ type: "triangle", freq: 520, freqEnd: 210, duration: 0.12, volume: 0.08 });
    },

    mineBeep() {
      playTone({ type: "square", freq: 880, duration: 0.05, volume: 0.09 });
    },

    mineExplode() {
      playNoise(0.22, 0.2, 260);
      playTone({ type: "sawtooth", freq: 180, freqEnd: 45, duration: 0.24, volume: 0.15 });
    }
  };

  RC.Audio = SFX;
})(window.RunnerCat = window.RunnerCat || {});

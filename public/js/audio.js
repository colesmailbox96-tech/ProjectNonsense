/* ========= AUDIO SYSTEM (Web Audio API chiptune) ========= */
const AudioSystem = (() => {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let currentTrack = null;
  let trackNodes = [];
  let muted = false;
  let musicVolume = 0.25;
  let sfxVolume = 0.4;

  // Note frequencies (octave 3-5)
  const NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  };

  // Music tracks — each track is { tempo, loop, melody: [{note, dur}], bass: [{note, dur}] }
  const tracks = {
    village: {
      tempo: 140,
      loop: true,
      melody: [
        { n: 'E4', d: 2 }, { n: 'G4', d: 1 }, { n: 'A4', d: 2 }, { n: 'G4', d: 1 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 }, { n: 'C4', d: 2 },
        { n: 'D4', d: 2 }, { n: 'E4', d: 1 }, { n: 'G4', d: 2 }, { n: 'A4', d: 1 },
        { n: 'G4', d: 2 }, { n: 'E4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'C4', d: 2 }, { n: 'E4', d: 1 }, { n: 'D4', d: 2 }, { n: 'C4', d: 1 },
        { n: 'D4', d: 2 }, { n: 'E4', d: 2 }, { n: 'G4', d: 2 },
        { n: 'A4', d: 2 }, { n: 'G4', d: 1 }, { n: 'E4', d: 2 }, { n: 'D4', d: 1 },
        { n: 'C4', d: 4 },
      ],
      bass: [
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'F3', d: 4 }, { n: 'C3', d: 4 },
        { n: 'G3', d: 4 }, { n: 'C3', d: 4 },
      ],
    },
    forest: {
      tempo: 110,
      loop: true,
      melody: [
        { n: 'E4', d: 3 }, { n: 'D4', d: 1 }, { n: 'C4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'E4', d: 2 }, { n: 'G4', d: 2 }, { n: 'A4', d: 2 }, { n: 'G4', d: 2 },
        { n: 'E4', d: 3 }, { n: 'D4', d: 1 }, { n: 'C4', d: 2 }, { n: 'E4', d: 2 },
        { n: 'D4', d: 4 }, { n: 'C4', d: 4 },
        { n: 'A3', d: 2 }, { n: 'C4', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 2 },
        { n: 'D4', d: 3 }, { n: 'C4', d: 1 }, { n: 'A3', d: 4 },
      ],
      bass: [
        { n: 'A3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'F3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'A3', d: 4 },
      ],
    },
    dungeon: {
      tempo: 90,
      loop: true,
      melody: [
        { n: 'E3', d: 2 }, { n: 'E3', d: 2 }, { n: 'G3', d: 2 }, { n: 'A3', d: 2 },
        { n: 'B3', d: 2 }, { n: 'A3', d: 2 }, { n: 'G3', d: 4 },
        { n: 'E3', d: 2 }, { n: 'D3', d: 2 }, { n: 'C3', d: 4 },
        { n: 'D3', d: 2 }, { n: 'E3', d: 2 }, { n: 'D3', d: 4 },
        { n: 'E3', d: 2 }, { n: 'G3', d: 2 }, { n: 'A3', d: 2 }, { n: 'B3', d: 2 },
        { n: 'C4', d: 4 }, { n: 'B3', d: 4 },
      ],
      bass: [
        { n: 'C3', d: 4 }, { n: 'C3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'C3', d: 8 },
      ],
    },
    battle: {
      tempo: 170,
      loop: true,
      melody: [
        { n: 'E4', d: 1 }, { n: 'E4', d: 1 }, { n: 'G4', d: 1 }, { n: 'A4', d: 1 },
        { n: 'B4', d: 2 }, { n: 'A4', d: 1 }, { n: 'G4', d: 1 },
        { n: 'E4', d: 1 }, { n: 'D4', d: 1 }, { n: 'E4', d: 1 }, { n: 'G4', d: 1 },
        { n: 'A4', d: 2 }, { n: 'G4', d: 2 },
        { n: 'E4', d: 1 }, { n: 'E4', d: 1 }, { n: 'G4', d: 1 }, { n: 'A4', d: 1 },
        { n: 'C5', d: 2 }, { n: 'B4', d: 1 }, { n: 'A4', d: 1 },
        { n: 'G4', d: 1 }, { n: 'E4', d: 1 }, { n: 'D4', d: 1 }, { n: 'E4', d: 1 },
        { n: 'E4', d: 4 },
      ],
      bass: [
        { n: 'A3', d: 2 }, { n: 'A3', d: 2 }, { n: 'E3', d: 2 }, { n: 'E3', d: 2 },
        { n: 'A3', d: 2 }, { n: 'A3', d: 2 }, { n: 'G3', d: 2 }, { n: 'G3', d: 2 },
        { n: 'A3', d: 2 }, { n: 'A3', d: 2 }, { n: 'E3', d: 2 }, { n: 'E3', d: 2 },
        { n: 'A3', d: 2 }, { n: 'E3', d: 2 }, { n: 'A3', d: 4 },
      ],
    },
    boss: {
      tempo: 180,
      loop: true,
      melody: [
        { n: 'E4', d: 1 }, { n: 'E4', d: 1 }, { n: 'E4', d: 1 }, { n: 'G4', d: 1 },
        { n: 'A4', d: 1 }, { n: 'A4', d: 1 }, { n: 'B4', d: 2 },
        { n: 'C5', d: 1 }, { n: 'B4', d: 1 }, { n: 'A4', d: 1 }, { n: 'G4', d: 1 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'E4', d: 1 }, { n: 'G4', d: 1 }, { n: 'A4', d: 1 }, { n: 'C5', d: 1 },
        { n: 'B4', d: 2 }, { n: 'A4', d: 2 },
        { n: 'G4', d: 1 }, { n: 'E4', d: 1 }, { n: 'D4', d: 1 }, { n: 'E4', d: 1 },
        { n: 'E4', d: 4 },
      ],
      bass: [
        { n: 'E3', d: 2 }, { n: 'E3', d: 2 }, { n: 'A3', d: 2 }, { n: 'A3', d: 2 },
        { n: 'C3', d: 2 }, { n: 'D3', d: 2 }, { n: 'E3', d: 2 }, { n: 'E3', d: 2 },
        { n: 'A3', d: 2 }, { n: 'A3', d: 2 }, { n: 'E3', d: 2 }, { n: 'E3', d: 2 },
        { n: 'A3', d: 2 }, { n: 'E3', d: 2 }, { n: 'E3', d: 4 },
      ],
    },
    ruins: {
      tempo: 100,
      loop: true,
      melody: [
        { n: 'D4', d: 3 }, { n: 'E4', d: 1 }, { n: 'G4', d: 2 }, { n: 'A4', d: 2 },
        { n: 'G4', d: 2 }, { n: 'E4', d: 2 }, { n: 'D4', d: 4 },
        { n: 'C4', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 2 }, { n: 'G4', d: 2 },
        { n: 'A4', d: 3 }, { n: 'G4', d: 1 }, { n: 'E4', d: 4 },
        { n: 'D4', d: 2 }, { n: 'C4', d: 2 }, { n: 'D4', d: 4 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 }, { n: 'C4', d: 4 },
      ],
      bass: [
        { n: 'D3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'D3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'D3', d: 4 },
      ],
    },
    peaks: {
      tempo: 90,
      loop: true,
      melody: [
        { n: 'E4', d: 3 }, { n: 'B3', d: 1 }, { n: 'E4', d: 2 }, { n: 'G4', d: 2 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 }, { n: 'B3', d: 4 },
        { n: 'C4', d: 2 }, { n: 'E4', d: 2 }, { n: 'G4', d: 2 }, { n: 'A4', d: 2 },
        { n: 'G4', d: 3 }, { n: 'E4', d: 1 }, { n: 'D4', d: 4 },
        { n: 'B3', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 4 },
        { n: 'G4', d: 2 }, { n: 'E4', d: 2 }, { n: 'B3', d: 4 },
      ],
      bass: [
        { n: 'E3', d: 4 }, { n: 'B3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'A3', d: 4 },
        { n: 'E3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'E3', d: 4 }, { n: 'E3', d: 4 },
      ],
    },
    sanctum: {
      tempo: 120,
      loop: true,
      melody: [
        { n: 'G4', d: 2 }, { n: 'A4', d: 1 }, { n: 'B4', d: 2 }, { n: 'A4', d: 1 },
        { n: 'G4', d: 2 }, { n: 'E4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'E4', d: 2 }, { n: 'G4', d: 1 }, { n: 'A4', d: 2 }, { n: 'B4', d: 1 },
        { n: 'C5', d: 2 }, { n: 'B4', d: 2 }, { n: 'A4', d: 2 },
        { n: 'G4', d: 2 }, { n: 'B4', d: 1 }, { n: 'A4', d: 2 }, { n: 'G4', d: 1 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 2 },
        { n: 'G4', d: 3 }, { n: 'A4', d: 1 }, { n: 'G4', d: 4 },
      ],
      bass: [
        { n: 'G3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'D3', d: 4 },
        { n: 'G3', d: 4 }, { n: 'G3', d: 4 },
      ],
    },
    abyss: {
      tempo: 80,
      loop: true,
      melody: [
        { n: 'E3', d: 3 }, { n: 'D3', d: 1 }, { n: 'C3', d: 2 }, { n: 'D3', d: 2 },
        { n: 'E3', d: 2 }, { n: 'G3', d: 2 }, { n: 'E3', d: 4 },
        { n: 'D3', d: 2 }, { n: 'C3', d: 2 }, { n: 'B3', d: 4 },
        { n: 'C3', d: 2 }, { n: 'E3', d: 2 }, { n: 'D3', d: 4 },
        { n: 'C3', d: 2 }, { n: 'D3', d: 2 }, { n: 'E3', d: 2 }, { n: 'G3', d: 2 },
        { n: 'E3', d: 4 }, { n: 'D3', d: 4 },
      ],
      bass: [
        { n: 'C3', d: 4 }, { n: 'C3', d: 4 },
        { n: 'E3', d: 4 }, { n: 'D3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'C3', d: 4 },
      ],
    },
    volcano: {
      tempo: 100,
      loop: true,
      melody: [
        { n: 'A3', d: 2 }, { n: 'C4', d: 1 }, { n: 'D4', d: 2 }, { n: 'E4', d: 1 },
        { n: 'D4', d: 2 }, { n: 'C4', d: 2 }, { n: 'A3', d: 2 },
        { n: 'G3', d: 2 }, { n: 'A3', d: 1 }, { n: 'C4', d: 2 }, { n: 'D4', d: 1 },
        { n: 'E4', d: 2 }, { n: 'D4', d: 2 }, { n: 'C4', d: 2 },
        { n: 'A3', d: 2 }, { n: 'G3', d: 2 }, { n: 'A3', d: 4 },
        { n: 'C4', d: 2 }, { n: 'A3', d: 2 }, { n: 'G3', d: 4 },
      ],
      bass: [
        { n: 'A3', d: 4 }, { n: 'A3', d: 4 },
        { n: 'G3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'D3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'A3', d: 4 },
      ],
    },
    gardens: {
      tempo: 120,
      loop: true,
      melody: [
        { n: 'E4', d: 2 }, { n: 'G4', d: 2 }, { n: 'A4', d: 1 }, { n: 'B4', d: 2 }, { n: 'A4', d: 1 },
        { n: 'G4', d: 2 }, { n: 'E4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'E4', d: 2 }, { n: 'G4', d: 1 }, { n: 'A4', d: 2 }, { n: 'B4', d: 1 },
        { n: 'A4', d: 2 }, { n: 'G4', d: 2 }, { n: 'E4', d: 2 },
        { n: 'D4', d: 2 }, { n: 'E4', d: 2 }, { n: 'G4', d: 4 },
        { n: 'A4', d: 2 }, { n: 'G4', d: 2 }, { n: 'E4', d: 4 },
      ],
      bass: [
        { n: 'E3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'E3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'A3', d: 4 }, { n: 'E3', d: 4 },
      ],
    },
    citadel: {
      tempo: 90,
      loop: true,
      melody: [
        { n: 'D4', d: 3 }, { n: 'C4', d: 1 }, { n: 'A3', d: 2 }, { n: 'C4', d: 2 },
        { n: 'D4', d: 2 }, { n: 'E4', d: 2 }, { n: 'D4', d: 4 },
        { n: 'C4', d: 2 }, { n: 'A3', d: 2 }, { n: 'G3', d: 4 },
        { n: 'A3', d: 2 }, { n: 'C4', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 2 },
        { n: 'D4', d: 3 }, { n: 'C4', d: 1 }, { n: 'A3', d: 4 },
        { n: 'G3', d: 2 }, { n: 'A3', d: 2 }, { n: 'C4', d: 4 },
      ],
      bass: [
        { n: 'D3', d: 4 }, { n: 'A3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'A3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'D3', d: 4 },
      ],
    },
    nexus: {
      tempo: 85,
      loop: true,
      melody: [
        { n: 'E4', d: 3 }, { n: 'D4', d: 1 }, { n: 'B3', d: 2 }, { n: 'D4', d: 2 },
        { n: 'E4', d: 2 }, { n: 'F#4', d: 2 }, { n: 'E4', d: 4 },
        { n: 'D4', d: 2 }, { n: 'B3', d: 2 }, { n: 'A3', d: 4 },
        { n: 'B3', d: 2 }, { n: 'D4', d: 2 }, { n: 'E4', d: 2 }, { n: 'F#4', d: 2 },
        { n: 'E4', d: 3 }, { n: 'D4', d: 1 }, { n: 'B3', d: 4 },
      ],
      bass: [
        { n: 'E3', d: 4 }, { n: 'B3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'A3', d: 4 },
        { n: 'E3', d: 4 }, { n: 'B3', d: 4 },
        { n: 'D3', d: 4 }, { n: 'E3', d: 4 },
      ],
    },
    rift: {
      tempo: 80,
      loop: true,
      melody: [
        { n: 'C4', d: 3 }, { n: 'B3', d: 1 }, { n: 'G3', d: 2 }, { n: 'B3', d: 2 },
        { n: 'C4', d: 2 }, { n: 'D4', d: 2 }, { n: 'C4', d: 4 },
        { n: 'B3', d: 2 }, { n: 'G3', d: 2 }, { n: 'F3', d: 4 },
        { n: 'G3', d: 2 }, { n: 'B3', d: 2 }, { n: 'C4', d: 2 }, { n: 'D4', d: 2 },
        { n: 'C4', d: 3 }, { n: 'B3', d: 1 }, { n: 'G3', d: 4 },
      ],
      bass: [
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
        { n: 'F3', d: 4 }, { n: 'C3', d: 4 },
        { n: 'G3', d: 4 }, { n: 'D3', d: 4 },
        { n: 'C3', d: 4 }, { n: 'G3', d: 4 },
      ],
    },
  };

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : 1;
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = musicVolume;
      musicGain.connect(masterGain);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(masterGain);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function stopTrack() {
    trackNodes.forEach(n => { try { n.stop(); } catch (_e) { /* already stopped */ } });
    trackNodes = [];
    currentTrack = null;
  }

  function playTrack(name) {
    ensureContext();
    if (currentTrack === name) return;
    stopTrack();
    currentTrack = name;

    const track = tracks[name];
    if (!track) return;

    const beatLen = 60 / track.tempo;
    scheduleVoice(track.melody, beatLen, 'triangle', musicGain, 0.5, track.loop);
    scheduleVoice(track.bass, beatLen, 'square', musicGain, 0.25, track.loop);
  }

  function scheduleVoice(notes, beatLen, wave, dest, vol, loop) {
    let totalDur = 0;
    notes.forEach(n => { totalDur += n.d * beatLen; });

    function schedule(startOffset) {
      let t = ctx.currentTime + startOffset;
      const oscs = [];
      notes.forEach(n => {
        const dur = n.d * beatLen;
        const freq = NOTES[n.n];
        if (!freq) { t += dur; return; }

        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = wave;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.02);
        osc.connect(g);
        g.connect(dest);
        osc.start(t);
        osc.stop(t + dur);
        trackNodes.push(osc);
        oscs.push(osc);
        t += dur;
      });

      if (loop) {
        const loopTimeout = setTimeout(() => {
          if (currentTrack) schedule(0);
        }, totalDur * 1000);
        // Store cleanup reference
        const sentinel = { stop() { clearTimeout(loopTimeout); } };
        trackNodes.push(sentinel);
      }
    }

    schedule(0);
  }

  // --- SFX helpers ---
  function playSFX(type) {
    ensureContext();
    const now = ctx.currentTime;

    switch (type) {
      case 'hit': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        g.gain.setValueAtTime(sfxVolume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'crit': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);
        g.gain.setValueAtTime(sfxVolume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'heal': {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.001, now + i * 0.08);
          g.gain.linearRampToValueAtTime(sfxVolume * 0.6, now + i * 0.08 + 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.2);
        });
        break;
      }
      case 'skill': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        osc.frequency.linearRampToValueAtTime(400, now + 0.2);
        g.gain.setValueAtTime(sfxVolume * 0.7, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'levelup': {
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(sfxVolume * 0.5, now + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.3);
        });
        break;
      }
      case 'flee': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        g.gain.setValueAtTime(sfxVolume * 0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'chest': {
        [392.00, 493.88, 587.33].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(sfxVolume * 0.5, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.25);
        });
        break;
      }
      case 'defeat': {
        [329.63, 261.63, 196.00, 130.81].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(sfxVolume * 0.4, now + i * 0.2);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.35);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.2);
          osc.stop(now + i * 0.2 + 0.35);
        });
        break;
      }
      case 'questComplete': {
        [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(sfxVolume * 0.55, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.4);
        });
        break;
      }
      case 'menu': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(660, now + 0.08);
        g.gain.setValueAtTime(sfxVolume * 0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(g);
        g.connect(sfxGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'achievement': {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(sfxVolume * 0.45, now + i * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
          osc.connect(g);
          g.connect(sfxGain);
          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.35);
        });
        break;
      }
    }
  }

  function playMapMusic(mapName) {
    const trackMap = {
      village: 'village',
      forest: 'forest',
      dungeon: 'dungeon',
      ruins: 'ruins',
      peaks: 'peaks',
      sanctum: 'sanctum',
      abyss: 'abyss',
      volcano: 'volcano',
      gardens: 'gardens',
      citadel: 'citadel',
      nexus: 'nexus',
      rift: 'rift',
    };
    const name = trackMap[mapName];
    if (name) playTrack(name);
  }

  function playBattleMusic(isBoss) {
    playTrack(isBoss ? 'boss' : 'battle');
  }

  function toggleMute() {
    muted = !muted;
    if (masterGain) masterGain.gain.value = muted ? 0 : 1;
    return muted;
  }

  function isMuted() { return muted; }

  function setMusicVolume(v) {
    musicVolume = Math.max(0, Math.min(1, v));
    if (musicGain) musicGain.gain.value = musicVolume;
  }

  function setSFXVolume(v) {
    sfxVolume = Math.max(0, Math.min(1, v));
    if (sfxGain) sfxGain.gain.value = sfxVolume;
  }

  function getMusicVolume() { return musicVolume; }
  function getSFXVolume() { return sfxVolume; }

  return {
    playTrack, stopTrack, playMapMusic, playBattleMusic,
    playSFX, toggleMute, isMuted,
    setMusicVolume, setSFXVolume, getMusicVolume, getSFXVolume,
  };
})();

(() => {
  const storageKey = 'portfolio-sound-enabled';
  let enabled = localStorage.getItem(storageKey) !== 'false';
  let audioContext;
  let lastPlayedAt = 0;
  let musicTimer;
  let musicBus;
  let nextChordTime = 0;
  let chordIndex = 0;

  // 68 BPM의 C major 로파이 진행: Cmaj7 - Am7 - Dm7 - G7
  const chordProgression = [
    [130.81, 164.81, 196.00, 246.94],
    [110.00, 130.81, 164.81, 196.00],
    [146.83, 174.61, 220.00, 261.63],
    [98.00, 123.47, 146.83, 174.61]
  ];
  const melody = [329.63, 293.66, 261.63, 246.94];

  const getContext = () => {
    if (!audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioContext = new AudioContext();
    }
    return audioContext;
  };

  const playClick = (frequency = 520) => {
    if (!enabled || Date.now() - lastPlayedAt < 70) return;
    const context = getContext();
    if (!context) return;
    lastPlayedAt = Date.now();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.18, context.currentTime + 0.07);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.09);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);
  };

  const playSoftTone = (context, destination, frequency, start, duration, volume, type = 'sine') => {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime((Math.random() - 0.5) * 7, start);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(type === 'triangle' ? 900 : 1400, start);
    filter.Q.setValueAtTime(0.4, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.65);
    gain.gain.setValueAtTime(volume, start + Math.max(0.7, duration - 1.4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  };

  const scheduleChord = (context, start, index) => {
    chordProgression[index].forEach((frequency, noteIndex) => {
      playSoftTone(context, musicBus, frequency, start + noteIndex * 0.035, 5.15, 0.022, 'triangle');
    });

    // 햇살처럼 가볍게 떠오르는 한 음의 멜로디
    playSoftTone(context, musicBus, melody[index], start + 1.7, 2.35, 0.018);
    playSoftTone(context, musicBus, melody[(index + 1) % melody.length] / 2, start + 3.55, 1.45, 0.012);
  };

  const scheduleMusic = () => {
    const context = getContext();
    if (!context || !musicBus) return;
    while (nextChordTime < context.currentTime + 6) {
      scheduleChord(context, nextChordTime, chordIndex);
      nextChordTime += 5.3;
      chordIndex = (chordIndex + 1) % chordProgression.length;
    }
  };

  const startBackgroundMusic = () => {
    if (!enabled || musicTimer) return;
    const context = getContext();
    if (!context) return;
    context.resume();

    musicBus = context.createGain();
    musicBus.gain.setValueAtTime(0.0001, context.currentTime);
    musicBus.gain.exponentialRampToValueAtTime(0.72, context.currentTime + 1.4);
    musicBus.connect(context.destination);
    nextChordTime = context.currentTime + 0.08;
    chordIndex = 0;
    scheduleMusic();
    musicTimer = window.setInterval(scheduleMusic, 1200);
  };

  const stopBackgroundMusic = () => {
    if (musicTimer) window.clearInterval(musicTimer);
    musicTimer = undefined;
    if (!audioContext || !musicBus) return;
    const busToStop = musicBus;
    busToStop.gain.cancelScheduledValues(audioContext.currentTime);
    busToStop.gain.setValueAtTime(Math.max(busToStop.gain.value, 0.0001), audioContext.currentTime);
    busToStop.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);
    window.setTimeout(() => busToStop.disconnect(), 7000);
    musicBus = undefined;
  };

  const toggle = document.createElement('button');
  toggle.className = 'sound-toggle';
  toggle.type = 'button';
  document.body.append(toggle);

  const updateToggle = () => {
    toggle.textContent = enabled ? 'BGM ON' : 'BGM OFF';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '배경음악과 효과음 끄기' : '배경음악과 효과음 켜기');
  };

  updateToggle();

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    localStorage.setItem(storageKey, String(enabled));
    updateToggle();
    if (enabled) {
      startBackgroundMusic();
      playClick(660);
    } else {
      stopBackgroundMusic();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    startBackgroundMusic();
    const interactive = event.target.closest('a, button');
    if (!interactive || interactive === toggle) return;
    playClick(interactive.classList.contains('youtube-button') ? 620 : 520);
  });
})();

(() => {
  const storageKey = 'portfolio-sound-enabled';
  let enabled = localStorage.getItem(storageKey) !== 'false';
  let audioContext;
  let lastPlayedAt = 0;

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

  const toggle = document.createElement('button');
  toggle.className = 'sound-toggle';
  toggle.type = 'button';
  document.body.append(toggle);

  const updateToggle = () => {
    toggle.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.setAttribute('aria-label', enabled ? '효과음 끄기' : '효과음 켜기');
  };

  updateToggle();

  toggle.addEventListener('click', () => {
    enabled = !enabled;
    localStorage.setItem(storageKey, String(enabled));
    updateToggle();
    if (enabled) playClick(660);
  });

  document.addEventListener('pointerdown', (event) => {
    const interactive = event.target.closest('a, button');
    if (!interactive || interactive === toggle) return;
    playClick(interactive.classList.contains('youtube-button') ? 620 : 520);
  });
})();

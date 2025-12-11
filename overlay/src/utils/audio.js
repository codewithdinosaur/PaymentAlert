export const playDonationSound = (tier = 'basic') => {
  try {
    // Placeholder audio - in production, replace with actual sound files
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different tiers
    const frequencies = {
      basic: 440,
      silver: 523.25,
      gold: 659.25,
      ultra: 783.99,
    };

    oscillator.frequency.value = frequencies[tier] || frequencies.basic;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const speakDonation = (donorName, amount, currency = 'INR') => {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Thank you ${donorName} for donating ${amount} ${currency}!`
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error('Error with TTS:', error);
  }
};

export const config = {
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  theme: import.meta.env.VITE_THEME || 'basic',
  donationGoal: parseInt(import.meta.env.VITE_DONATION_GOAL || '10000'),
  recentDonationsLimit: parseInt(import.meta.env.VITE_RECENT_DONATIONS_LIMIT || '5'),
  enableAudio: import.meta.env.VITE_ENABLE_AUDIO !== 'false',
  enableTTS: import.meta.env.VITE_ENABLE_TTS === 'true',
  animationDuration: parseInt(import.meta.env.VITE_ANIMATION_DURATION || '5000'),
};

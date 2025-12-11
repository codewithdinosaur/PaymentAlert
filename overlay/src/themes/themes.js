export const themes = {
  basic: {
    name: 'Basic',
    colors: {
      primary: '#4CAF50',
      secondary: '#45a049',
      background: 'rgba(0, 0, 0, 0.85)',
      text: '#ffffff',
      border: '#4CAF50',
      progressBg: 'rgba(76, 175, 80, 0.2)',
      progressFill: '#4CAF50',
    },
    fonts: {
      primary: 'Arial, sans-serif',
      size: {
        small: '14px',
        medium: '16px',
        large: '24px',
        xlarge: '32px',
      },
    },
    animation: {
      entrance: 'slideInRight',
      exit: 'slideOutRight',
      duration: '0.5s',
    },
    shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  silver: {
    name: 'Silver',
    colors: {
      primary: '#C0C0C0',
      secondary: '#A8A8A8',
      background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.95) 0%, rgba(169, 169, 169, 0.95) 100%)',
      text: '#1a1a1a',
      border: '#FFFFFF',
      progressBg: 'rgba(192, 192, 192, 0.3)',
      progressFill: 'linear-gradient(90deg, #C0C0C0 0%, #FFFFFF 100%)',
    },
    fonts: {
      primary: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      size: {
        small: '14px',
        medium: '18px',
        large: '26px',
        xlarge: '36px',
      },
    },
    animation: {
      entrance: 'bounceIn',
      exit: 'fadeOut',
      duration: '0.6s',
    },
    shadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  },
  gold: {
    name: 'Gold',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.95) 0%, rgba(255, 165, 0, 0.95) 100%)',
      text: '#1a1a1a',
      border: '#FFED4E',
      progressBg: 'rgba(255, 215, 0, 0.3)',
      progressFill: 'linear-gradient(90deg, #FFD700 0%, #FFED4E 50%, #FFD700 100%)',
    },
    fonts: {
      primary: '"Georgia", "Times New Roman", serif',
      size: {
        small: '16px',
        medium: '20px',
        large: '28px',
        xlarge: '40px',
      },
    },
    animation: {
      entrance: 'zoomIn',
      exit: 'zoomOut',
      duration: '0.7s',
    },
    shadow: '0 12px 24px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
  },
  ultra: {
    name: 'Ultra',
    colors: {
      primary: '#8B00FF',
      secondary: '#FF00FF',
      background: 'linear-gradient(135deg, rgba(139, 0, 255, 0.95) 0%, rgba(255, 0, 255, 0.95) 50%, rgba(0, 191, 255, 0.95) 100%)',
      text: '#ffffff',
      border: '#FFFFFF',
      progressBg: 'rgba(139, 0, 255, 0.3)',
      progressFill: 'linear-gradient(90deg, #8B00FF 0%, #FF00FF 50%, #00BFFF 100%)',
    },
    fonts: {
      primary: '"Impact", "Arial Black", sans-serif',
      size: {
        small: '16px',
        medium: '22px',
        large: '32px',
        xlarge: '48px',
      },
    },
    animation: {
      entrance: 'flipIn',
      exit: 'flipOut',
      duration: '0.8s',
    },
    shadow: '0 16px 32px rgba(139, 0, 255, 0.6), 0 0 60px rgba(255, 0, 255, 0.4)',
  },
};

export const getThemeByTier = (tier) => {
  const tierThemeMap = {
    basic: 'basic',
    silver: 'silver',
    gold: 'gold',
    ultra: 'ultra',
  };
  return themes[tierThemeMap[tier]] || themes.basic;
};

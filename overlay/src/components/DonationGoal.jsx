import React, { useEffect, useState } from 'react';
import { themes } from '../themes/themes';
import { config } from '../config';

const DonationGoal = ({ currentAmount, goalAmount, donationsCount, theme = 'basic' }) => {
  const [progress, setProgress] = useState(0);
  const currentTheme = themes[theme] || themes.basic;

  useEffect(() => {
    const percentage = Math.min(100, (currentAmount / goalAmount) * 100);
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [currentAmount, goalAmount]);

  return (
    <div
      className="donation-goal"
      style={{
        background: currentTheme.colors.background,
        borderColor: currentTheme.colors.border,
        color: currentTheme.colors.text,
        fontFamily: currentTheme.fonts.primary,
        boxShadow: currentTheme.shadow,
      }}
    >
      <div className="goal-header" style={{ fontSize: currentTheme.fonts.size.large }}>
        Donation Goal
      </div>
      <div className="goal-progress-container" style={{ background: currentTheme.colors.progressBg }}>
        <div
          className="goal-progress-bar"
          style={{
            width: `${progress}%`,
            background: currentTheme.colors.progressFill,
          }}
        />
      </div>
      <div className="goal-stats" style={{ fontSize: currentTheme.fonts.size.medium }}>
        <div className="goal-current">
          <span style={{ color: currentTheme.colors.primary }}>₹{currentAmount.toLocaleString()}</span>
          <span> / ₹{goalAmount.toLocaleString()}</span>
        </div>
        <div className="goal-percentage" style={{ fontSize: currentTheme.fonts.size.large }}>
          {progress.toFixed(1)}%
        </div>
      </div>
      <div className="goal-donations-count" style={{ fontSize: currentTheme.fonts.size.small }}>
        {donationsCount} {donationsCount === 1 ? 'donation' : 'donations'}
      </div>
    </div>
  );
};

export default DonationGoal;

import React, { useEffect, useState } from 'react';
import { getThemeByTier } from '../themes/themes';
import { playDonationSound, speakDonation } from '../utils/audio';
import { config } from '../config';

const DonationPopup = ({ donation, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = getThemeByTier(donation.tier);

  useEffect(() => {
    setIsVisible(true);

    if (config.enableAudio) {
      playDonationSound(donation.tier);
    }

    if (config.enableTTS) {
      setTimeout(() => {
        speakDonation(donation.donor_name, donation.amount, donation.currency);
      }, 500);
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, config.animationDuration);

    return () => clearTimeout(timer);
  }, [donation, onComplete]);

  return (
    <div
      className={`donation-popup ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        background: theme.colors.background,
        borderColor: theme.colors.border,
        color: theme.colors.text,
        fontFamily: theme.fonts.primary,
        boxShadow: theme.shadow,
      }}
    >
      <div className="donation-popup-header">
        <span className="donation-tier" style={{ color: theme.colors.primary }}>
          {donation.tier.toUpperCase()}
        </span>
        <span className="donation-amount" style={{ fontSize: theme.fonts.size.xlarge }}>
          ₹{donation.amount}
        </span>
      </div>
      <div className="donation-popup-body">
        <div className="donor-name" style={{ fontSize: theme.fonts.size.large }}>
          {donation.donor_name}
        </div>
        {donation.message && (
          <div className="donation-message" style={{ fontSize: theme.fonts.size.medium }}>
            "{donation.message}"
          </div>
        )}
      </div>
      <div className="donation-popup-footer" style={{ fontSize: theme.fonts.size.small }}>
        via {donation.payment_method}
      </div>
    </div>
  );
};

export default DonationPopup;

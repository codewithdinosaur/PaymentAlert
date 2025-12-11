import React from 'react';
import { themes } from '../themes/themes';
import { config } from '../config';

const RecentDonations = ({ donations, theme = 'basic' }) => {
  const currentTheme = themes[theme] || themes.basic;
  const recentDonations = donations.slice(0, config.recentDonationsLimit);

  if (recentDonations.length === 0) {
    return null;
  }

  return (
    <div
      className="recent-donations"
      style={{
        background: currentTheme.colors.background,
        borderColor: currentTheme.colors.border,
        color: currentTheme.colors.text,
        fontFamily: currentTheme.fonts.primary,
        boxShadow: currentTheme.shadow,
      }}
    >
      <div className="recent-donations-header" style={{ fontSize: currentTheme.fonts.size.large }}>
        Recent Donations
      </div>
      <div className="recent-donations-list">
        {recentDonations.map((donation, index) => (
          <div
            key={donation.razorpay_order_id || index}
            className="recent-donation-item"
            style={{
              borderColor: currentTheme.colors.border,
              fontSize: currentTheme.fonts.size.medium,
            }}
          >
            <div className="recent-donation-info">
              <span className="recent-donation-name">{donation.contact || 'Anonymous'}</span>
              <span className="recent-donation-amount" style={{ color: currentTheme.colors.primary }}>
                ₹{donation.amount}
              </span>
            </div>
            {donation.description && (
              <div className="recent-donation-message" style={{ fontSize: currentTheme.fonts.size.small }}>
                {donation.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentDonations;

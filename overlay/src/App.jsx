import React, { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import DonationPopup from './components/DonationPopup';
import RecentDonations from './components/RecentDonations';
import DonationGoal from './components/DonationGoal';
import ConnectionStatus from './components/ConnectionStatus';
import { config } from './config';
import './App.css';

function App() {
  const { connected, donations, stats, recentDonations, requestRecentDonations, requestStats } = useSocket();
  const [currentDonation, setCurrentDonation] = useState(null);
  const [donationQueue, setDonationQueue] = useState([]);
  const [goalData, setGoalData] = useState({ current: 0, goal: config.donationGoal, donationsCount: 0 });

  useEffect(() => {
    if (connected) {
      requestRecentDonations();
      requestStats();
      fetchGoalData();
    }
  }, [connected]);

  useEffect(() => {
    if (donations.length > 0) {
      setDonationQueue((prev) => [...prev, donations[0]]);
    }
  }, [donations]);

  useEffect(() => {
    if (!currentDonation && donationQueue.length > 0) {
      setCurrentDonation(donationQueue[0]);
      setDonationQueue((prev) => prev.slice(1));
    }
  }, [currentDonation, donationQueue]);

  useEffect(() => {
    if (stats) {
      setGoalData({
        current: stats.total_amount || 0,
        goal: config.donationGoal,
        donationsCount: stats.total_donations || 0,
      });
    }
  }, [stats]);

  const fetchGoalData = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/donation-goal`);
      const data = await response.json();
      if (data.success) {
        setGoalData({
          current: data.data.current,
          goal: data.data.goal,
          donationsCount: data.data.donations_count,
        });
      }
    } catch (error) {
      console.error('Error fetching goal data:', error);
    }
  };

  const handleDonationComplete = () => {
    setCurrentDonation(null);
  };

  return (
    <div className="overlay-container" data-theme={config.theme}>
      <ConnectionStatus connected={connected} />
      
      {currentDonation && (
        <DonationPopup donation={currentDonation} onComplete={handleDonationComplete} />
      )}

      <div className="overlay-sidebar">
        <DonationGoal
          currentAmount={goalData.current}
          goalAmount={goalData.goal}
          donationsCount={goalData.donationsCount}
          theme={config.theme}
        />
        <RecentDonations donations={recentDonations} theme={config.theme} />
      </div>
    </div>
  );
}

export default App;

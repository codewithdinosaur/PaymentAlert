import React from 'react';

const ConnectionStatus = ({ connected }) => {
  return (
    <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
      <div className="status-indicator" />
      <span>{connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
};

export default ConnectionStatus;

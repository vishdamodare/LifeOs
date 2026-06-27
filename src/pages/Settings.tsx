import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="screen">
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>← Back</button>
        <div className="page-title" style={{ marginTop: '8px' }}>Settings</div>
        <div className="page-sub">App Configurations</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Application theme, notifications toggle, and currency configurations will be implemented in a future sprint.
        </p>
      </div>
    </div>
  );
};

export default Settings;

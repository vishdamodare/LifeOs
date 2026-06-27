import React from 'react';

export const Notifications: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">Notifications</div>
        <div className="page-sub">Sprint 3 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Notification activity log and actions will be implemented in Sprint 3.
        </p>
      </div>
    </div>
  );
};

export default Notifications;

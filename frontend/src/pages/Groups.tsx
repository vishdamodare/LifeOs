import React from 'react';

export const Groups: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">Groups</div>
        <div className="page-sub">Sprint 2 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Groups list and details will be implemented in Sprint 2.
        </p>
      </div>
    </div>
  );
};

export default Groups;

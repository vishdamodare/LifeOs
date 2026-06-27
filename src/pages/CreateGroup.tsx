import React from 'react';

export const CreateGroup: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">New Group</div>
        <div className="page-sub">Sprint 2 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Creating groups will be implemented in Sprint 2.
        </p>
      </div>
    </div>
  );
};

export default CreateGroup;

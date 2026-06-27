import React from 'react';

export const CreateFriend: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">Add Friend</div>
        <div className="page-sub">Sprint 2 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Adding friends will be implemented in Sprint 2.
        </p>
      </div>
    </div>
  );
};

export default CreateFriend;

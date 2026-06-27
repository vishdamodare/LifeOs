import React from 'react';

export const CreateExpense: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">New Expense</div>
        <div className="page-sub">Sprint 2 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Creating expenses and selecting split modes will be implemented in Sprint 2.
        </p>
      </div>
    </div>
  );
};

export default CreateExpense;

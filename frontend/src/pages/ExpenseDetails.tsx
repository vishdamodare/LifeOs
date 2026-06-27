import React from 'react';

export const ExpenseDetails: React.FC = () => {
  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">Expense Details</div>
        <div className="page-sub">Sprint 3 Implementation</div>
      </div>
      <div className="scroll">
        <p style={{ padding: '20px 0', color: 'var(--color-text-sub)' }}>
          Detailed view of split shares and UPI payments will be implemented in Sprint 3.
        </p>
      </div>
    </div>
  );
};

export default ExpenseDetails;

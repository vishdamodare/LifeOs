import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, UserPlus, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { useFriendStore } from '../store/friendStore';
import { useNotificationStore } from '../store/notificationStore';
import { formatCurrency } from '../utils/currency';
import { getTodayLabel } from '../utils/date';
import expenseRepository from '../repositories/expenseRepository';
import authRepository from '../repositories/authRepository';
import type { Expense } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const expenses = useExpenseStore((state) => state.expenses);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);
  const isLoadingExpenses = useExpenseStore((state) => state.isLoading);
  
  const fetchFriends = useFriendStore((state) => state.fetchFriends);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);

  // Dynamic balance calculations
  const [toReceive, setToReceive] = useState(0);
  const [youOwe, setYouOwe] = useState(0);
  const [receiveFromCount, setReceiveFromCount] = useState(0);
  const [oweToCount, setOweToCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchExpenses(currentUser.id);
      fetchFriends(currentUser.id);
      fetchNotifications(currentUser.id);
    }
  }, [currentUser, fetchExpenses, fetchFriends, fetchNotifications]);

  useEffect(() => {
    if (!currentUser || expenses.length === 0) {
      setToReceive(0);
      setYouOwe(0);
      setReceiveFromCount(0);
      setOweToCount(0);
      return;
    }

    const allParticipants = expenseRepository.getParticipants();
    const userId = currentUser.id;

    // 1. Calculate You Owe (to others)
    // Find all participant records for me where status is not 'paid' and I am not the payer
    const oweShares = allParticipants.filter((p) => {
      if (p.user_id !== userId || p.payment_status === 'paid') return false;
      const expense = expenses.find((e) => e.id === p.expense_id);
      return expense && expense.paid_by !== userId;
    });

    const totalOwe = oweShares.reduce((sum, p) => sum + p.amount, 0);
    setYouOwe(totalOwe);
    
    // Count unique people I owe
    const uniquePayees = new Set<string>();
    oweShares.forEach((p) => {
      const exp = expenses.find((e) => e.id === p.expense_id);
      if (exp) uniquePayees.add(exp.paid_by);
    });
    setOweToCount(uniquePayees.size);

    // 2. Calculate To Receive (from others)
    // Expenses paid by me
    const myPaidExpenses = expenses.filter((e) => e.paid_by === userId);
    const myPaidExpenseIds = myPaidExpenses.map((e) => e.id);
    
    // Find pending participant records for those expenses (excluding myself)
    const receiveShares = allParticipants.filter((p) => {
      return (
        myPaidExpenseIds.includes(p.expense_id) && 
        p.user_id !== userId && 
        p.payment_status !== 'paid'
      );
    });

    const totalReceive = receiveShares.reduce((sum, p) => sum + p.amount, 0);
    setToReceive(totalReceive);
    
    // Count unique people who owe me
    const uniquePayers = new Set<string>();
    receiveShares.forEach((p) => uniquePayers.add(p.user_id));
    setReceiveFromCount(uniquePayers.size);

  }, [expenses, currentUser]);

  const netBalance = toReceive - youOwe;

  // Render split-bar graph segments
  const renderSplitBar = (expense: Expense) => {
    const participants = expenseRepository.getExpenseParticipants(expense.id);
    const totalAmount = expense.amount;
    
    return (
      <div className="split-bar">
        {participants.map((p, i) => {
          const percentage = (p.amount / totalAmount) * 100;
          const colors = ['#7C6EF5', '#34C48B', '#F5954B', '#EF5DA8', '#F5444B', '#4BAFF5'];
          const color = colors[i % colors.length];
          return (
            <div 
              key={p.id}
              className="split-seg" 
              style={{ flex: percentage / 100, backgroundColor: color }}
            />
          );
        })}
      </div>
    );
  };

  // Render initials avatar list
  const renderAvatars = (expense: Expense) => {
    const participants = expenseRepository.getExpenseParticipants(expense.id);
    const usersDb = authRepository.getUsers();
    
    return (
      <div className="avatars">
        {participants.slice(0, 4).map((p) => {
          const user = usersDb[p.user_id];
          if (!user) return null;
          const initials = user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          const colors = [
            { bg: '#EEF0FF', color: '#4C52D9' },
            { bg: '#E8FBF3', color: '#0E9E5F' },
            { bg: '#FEF0E5', color: '#C07A00' },
            { bg: '#FFF0F7', color: '#C2306A' }
          ];
          const styling = colors[Math.abs(user.id.charCodeAt(0)) % colors.length];
          return (
            <div 
              key={p.id}
              className="av" 
              style={{ backgroundColor: styling.bg, color: styling.color }}
            >
              {initials}
            </div>
          );
        })}
        {participants.length > 4 && (
          <div className="av" style={{ backgroundColor: '#ECEEFF', color: 'var(--color-text-sub)' }}>
            +{participants.length - 4}
          </div>
        )}
      </div>
    );
  };

  // Compute total pending amount for a specific expense excluding paid shares
  const getPendingExpenseAmount = (expense: Expense) => {
    const participants = expenseRepository.getExpenseParticipants(expense.id);
    const pendingShares = participants.filter((p) => p.user_id !== expense.paid_by && p.payment_status !== 'paid');
    return pendingShares.reduce((sum, p) => sum + p.amount, 0);
  };

  const getOverdueCount = (expense: Expense) => {
    const participants = expenseRepository.getExpenseParticipants(expense.id);
    return participants.filter((p) => p.payment_status === 'overdue').length;
  };

  return (
    <div className="screen">
      {/* Top Header Bar */}
      <div className="topbar">
        <div className="topbar-row">
          <div>
            <div className="page-title">Hi, {currentUser?.name.split(' ')[0] || 'Guest'} 👋</div>
            <div className="page-sub">{getTodayLabel()}</div>
          </div>
          <div className="avatar-sm">
            {currentUser?.name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'GU'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="scroll" style={{ paddingTop: '2px' }}>
        
        {/* Net Balance Widgets */}
        <div className="balance-cards">
          <div className="bal-card receive">
            <div className="bal-label">TO RECEIVE</div>
            <div className="bal-val">{formatCurrency(toReceive)}</div>
            <div className="bal-sub">
              {receiveFromCount > 0 ? `from ${receiveFromCount} people` : 'all clear'}
            </div>
          </div>
          <div className="bal-card owe">
            <div className="bal-label">YOU OWE</div>
            <div className="bal-val">{formatCurrency(youOwe)}</div>
            <div className="bal-sub">
              {oweToCount > 0 ? `to ${oweToCount} people` : 'no debts'}
            </div>
          </div>
        </div>

        {/* Net Summary Indicator */}
        <div 
          style={{
            background: netBalance >= 0 ? 'var(--bal-receive-bg)' : 'var(--bal-owe-bg)',
            border: `1px solid ${netBalance >= 0 ? 'var(--bal-receive-border)' : 'var(--bal-owe-border)'}`,
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: netBalance >= 0 ? 'var(--bal-receive-text)' : 'var(--bal-owe-text)'
          }}
        >
          <span>Net Balance Summary:</span>
          <span style={{ fontSize: '15px', fontWeight: 800 }}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
          </span>
        </div>

        {/* Quick Access Actions Row */}
        <div className="quick-row">
          <div className="q-btn" onClick={() => navigate('/expenses/new')} role="button" aria-label="New expense">
            <Plus size={20} />
            <span>New expense</span>
          </div>
          <div className="q-btn" onClick={() => navigate('/groups/new')} role="button" aria-label="New group">
            <Users size={20} />
            <span>New group</span>
          </div>
          <div className="q-btn" onClick={() => navigate('/friends/new')} role="button" aria-label="Add friend">
            <UserPlus size={20} />
            <span>Add friend</span>
          </div>
        </div>

        {/* Dynamic Pending Settlements Section */}
        <div className="section-label">pending to receive</div>
        
        {isLoadingExpenses ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-sub)' }}>
            Loading expenses...
          </div>
        ) : expenses.filter((e) => e.paid_by === currentUser?.id && e.status !== 'paid').length === 0 ? (
          /* Empty state for pending */
          <div 
            style={{
              background: '#fff',
              border: '1px dashed var(--border-card)',
              borderRadius: '14px',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--color-text-sub)',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ClipboardList size={28} style={{ color: 'var(--color-text-sub)', opacity: 0.6 }} />
            <span>No pending collections. You are all settled!</span>
          </div>
        ) : (
          expenses
            .filter((e) => e.paid_by === currentUser?.id && e.status !== 'paid')
            .map((expense) => {
              const pendingAmt = getPendingExpenseAmount(expense);
              const overdueCount = getOverdueCount(expense);
              const isVerifying = expense.status === 'verification_pending';
              
              return (
                <div 
                  key={expense.id}
                  className="exp-card"
                  onClick={() => navigate(`/expenses/${expense.id}`)}
                >
                  <div className="exp-head">
                    <div className="exp-icon">
                      {expense.category === 'Food' ? '🍽️' : 
                       expense.category === 'Travel' ? '🏨' : 
                       expense.category === 'Rent' ? '🏠' : 
                       expense.category === 'Shopping' ? '🛍️' : 
                       expense.category === 'Bills' ? '⚡' : '📝'}
                    </div>
                    <div className="exp-text">
                      <div className="exp-title">{expense.title}</div>
                      <div className="exp-meta">
                        {expense.category} · {expense.created_at ? new Date(expense.created_at).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </div>
                    <div className="exp-right">
                      <div className="exp-amount">{formatCurrency(expense.amount)}</div>
                      <div className="exp-share" style={{ color: 'var(--color-text-sub)' }}>you paid</div>
                    </div>
                  </div>
                  
                  {renderSplitBar(expense)}
                  
                  <div className="ppl-foot">
                    {renderAvatars(expense)}
                    <span className="foot-note">{formatCurrency(pendingAmt)} pending</span>
                    {isVerifying ? (
                      <span className="pill pill-verification">verifying</span>
                    ) : overdueCount > 0 ? (
                      <span className="pill pill-overdue">{overdueCount} overdue</span>
                    ) : (
                      <span className="pill pill-pending">pending</span>
                    )}
                  </div>
                </div>
              );
            })
        )}

        {/* Dynamic Settled Expenses Section */}
        <div className="section-label">settled expenses</div>
        {expenses.filter((e) => e.status === 'paid').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: 'var(--color-text-sub)' }}>
            No settled expenses yet.
          </div>
        ) : (
          expenses
            .filter((e) => e.status === 'paid')
            .map((expense) => (
              <div 
                key={expense.id}
                className="exp-card"
                onClick={() => navigate(`/expenses/${expense.id}`)}
              >
                <div className="exp-head">
                  <div className="exp-icon">
                    {expense.category === 'Food' ? '🍽️' : 
                     expense.category === 'Travel' ? '✈️' : 
                     expense.category === 'Rent' ? '🏠' : 
                     expense.category === 'Shopping' ? '🛍️' : 
                     expense.category === 'Bills' ? '⚡' : '📝'}
                  </div>
                  <div className="exp-text">
                    <div className="exp-title">{expense.title}</div>
                    <div className="exp-meta">Settled</div>
                  </div>
                  <div className="exp-right">
                    <div className="exp-amount">{formatCurrency(expense.amount)}</div>
                    <div 
                      className="exp-share" 
                      style={{ color: expense.paid_by === currentUser?.id ? 'var(--bal-receive-text)' : 'var(--color-text-sub)' }}
                    >
                      {expense.paid_by === currentUser?.id ? 'you paid' : 'settled'}
                    </div>
                  </div>
                </div>
                
                {renderSplitBar(expense)}
                
                <div className="ppl-foot">
                  {renderAvatars(expense)}
                  <span className="pill pill-paid">all settled</span>
                </div>
              </div>
            ))
        )}

        {/* Spacer for bottom navigation */}
        <div style={{ height: '24px' }}></div>
      </div>
    </div>
  );
};

export default Dashboard;

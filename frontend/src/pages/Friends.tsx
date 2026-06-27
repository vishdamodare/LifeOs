import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../utils/currency';
import expenseRepository from '../repositories/expenseRepository';
import { User as UserType } from '../types';

interface FriendBalance {
  friend: UserType;
  amount: number; // Positive if they owe you, negative if you owe them
  status: 'receive' | 'owe' | 'settled';
  description: string;
}

export const Friends: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const friends = useFriendStore((state) => state.friends);
  const fetchFriends = useFriendStore((state) => state.fetchFriends);
  const isLoadingFriends = useFriendStore((state) => state.isLoading);
  
  const expenses = useExpenseStore((state) => state.expenses);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);

  const [friendBalances, setFriendBalances] = useState<FriendBalance[]>([]);
  const [totalsToReceive, setTotalsToReceive] = useState(0);

  useEffect(() => {
    if (currentUser) {
      fetchFriends(currentUser.id);
      fetchExpenses(currentUser.id);
    }
  }, [currentUser, fetchFriends, fetchExpenses]);

  useEffect(() => {
    if (!currentUser || friends.length === 0) {
      setFriendBalances([]);
      setTotalsToReceive(0);
      return;
    }

    const userId = currentUser.id;
    const allParticipants = expenseRepository.getParticipants();
    
    let totalReceive = 0;

    const balances: FriendBalance[] = friends.map((friend) => {
      // 1. Calculate how much friend owes me (Arjun paid)
      const expensesPaidByMe = expenses.filter((e) => e.paid_by === userId);
      const myPaidExpenseIds = expensesPaidByMe.map((e) => e.id);
      const sharesFriendOwesMe = allParticipants.filter((p) => 
        myPaidExpenseIds.includes(p.expense_id) && 
        p.user_id === friend.id && 
        p.payment_status !== 'paid'
      );
      const owedToMe = sharesFriendOwesMe.reduce((sum, p) => sum + p.amount, 0);

      // 2. Calculate how much I owe friend (friend paid)
      const expensesPaidByFriend = expenses.filter((e) => e.paid_by === friend.id);
      const friendPaidExpenseIds = expensesPaidByFriend.map((e) => e.id);
      const sharesIOweFriend = allParticipants.filter((p) => 
        friendPaidExpenseIds.includes(p.expense_id) && 
        p.user_id === userId && 
        p.payment_status !== 'paid'
      );
      const owedByMe = sharesIOweFriend.reduce((sum, p) => sum + p.amount, 0);

      const netAmount = owedToMe - owedByMe;
      
      let status: FriendBalance['status'] = 'settled';
      let description = 'All clear';

      if (netAmount > 0) {
        status = 'receive';
        totalReceive += netAmount;
        // Find recent shared expense title
        const recentExpense = expensesPaidByMe.find((e) => 
          sharesFriendOwesMe.some((p) => p.expense_id === e.id)
        );
        description = recentExpense ? `Goa Hotel` : 'Owes you';
      } else if (netAmount < 0) {
        status = 'owe';
        const recentExpense = expensesPaidByFriend.find((e) => 
          sharesIOweFriend.some((p) => p.expense_id === e.id)
        );
        description = recentExpense ? `${recentExpense.title}` : 'You owe';
      } else {
        // Look up total count of shared expenses
        const sharedCount = expenses.filter((e) => {
          const parts = expenseRepository.getExpenseParticipants(e.id);
          const hasFriend = parts.some((p) => p.user_id === friend.id);
          const hasMe = parts.some((p) => p.user_id === userId);
          return hasFriend && hasMe;
        }).length;
        description = `${sharedCount} shared expense${sharedCount === 1 ? '' : 's'}`;
      }

      return {
        friend,
        amount: Math.abs(netAmount),
        status,
        description
      };
    });

    setFriendBalances(balances);
    setTotalsToReceive(totalReceive);
  }, [friends, expenses, currentUser]);

  const receiveList = friendBalances.filter((b) => b.status === 'receive');
  const oweList = friendBalances.filter((b) => b.status === 'owe');
  const settledList = friendBalances.filter((b) => b.status === 'settled');

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <div className="topbar-row">
          <div>
            <div className="page-title">Friends</div>
            <div className="page-sub">
              {friends.length} friend{friends.length === 1 ? '' : 's'} · {formatCurrency(totalsToReceive)} to receive
            </div>
          </div>
          <button 
            className="back-btn" 
            style={{ margin: 0 }}
            onClick={() => navigate('/friends/new')}
          >
            <UserPlus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Friends Scroll */}
      <div className="scroll" style={{ paddingTop: '4px' }}>
        
        {isLoadingFriends ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-sub)' }}>
            Loading friends...
          </div>
        ) : friends.length === 0 ? (
          <div 
            style={{
              background: '#fff',
              border: '1px dashed var(--border-card)',
              borderRadius: '14px',
              padding: '30px 20px',
              textAlign: 'center',
              color: 'var(--color-text-sub)',
              fontSize: '13px',
              fontWeight: 500,
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <User size={28} style={{ opacity: 0.6 }} />
            <span>No friends added yet. Add a friend by phone number to split expenses!</span>
            <button
              onClick={() => navigate('/friends/new')}
              style={{
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Add Friend Now
            </button>
          </div>
        ) : (
          <>
            {/* Owed to You Section */}
            {receiveList.length > 0 && (
              <>
                <div className="section-label" style={{ marginTop: '8px' }}>they owe you</div>
                {receiveList.map(({ friend, amount, description }) => (
                  <div key={friend.id} className="friend-card" onClick={() => navigate(`/friends/new?phone=${friend.phone}`)}>
                    <div 
                      className="av" 
                      style={{ 
                        background: 'var(--primary-light)', 
                        color: 'var(--primary)',
                        width: '40px',
                        height: '40px',
                        fontSize: '13px',
                        border: 'none',
                        flexShrink: 0
                      }}
                    >
                      {friend.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="f-main">
                      <div className="f-name">{friend.name}</div>
                      <div className="f-shared">{description}</div>
                    </div>
                    <div className="f-right">
                      <div className="f-val" style={{ color: 'var(--bal-receive-text)' }}>
                        {formatCurrency(amount)}
                      </div>
                      <div className="f-tag" style={{ color: 'var(--bal-receive-text)' }}>owes you</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* You Owe Section */}
            {oweList.length > 0 && (
              <>
                <div className="section-label">you owe</div>
                {oweList.map(({ friend, amount, description }) => (
                  <div key={friend.id} className="friend-card">
                    <div 
                      className="av" 
                      style={{ 
                        background: 'var(--bal-owe-bg)', 
                        color: 'var(--bal-owe-text)',
                        width: '40px',
                        height: '40px',
                        fontSize: '13px',
                        border: 'none',
                        flexShrink: 0
                      }}
                    >
                      {friend.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="f-main">
                      <div className="f-name">{friend.name}</div>
                      <div className="f-shared">{description}</div>
                    </div>
                    <div className="f-right">
                      <div className="f-val" style={{ color: 'var(--bal-owe-text)' }}>
                        {formatCurrency(amount)}
                      </div>
                      <div className="f-tag" style={{ color: 'var(--bal-owe-text)' }}>you owe</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Settled Section */}
            {settledList.length > 0 && (
              <>
                <div className="section-label">settled</div>
                {settledList.map(({ friend, description }) => (
                  <div key={friend.id} className="friend-card">
                    <div 
                      className="av" 
                      style={{ 
                        background: 'var(--pill-paid-bg)', 
                        color: 'var(--pill-paid-text)',
                        width: '40px',
                        height: '40px',
                        fontSize: '13px',
                        border: 'none',
                        flexShrink: 0
                      }}
                    >
                      {friend.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="f-main">
                      <div className="f-name">{friend.name}</div>
                      <div className="f-shared">{description}</div>
                    </div>
                    <div className="f-right">
                      <div className="f-val" style={{ color: 'var(--pill-paid-text)' }}>All clear</div>
                      <div className="f-tag" style={{ color: 'var(--pill-paid-text)' }}>settled</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
        
        <div style={{ height: '30px' }}></div>
      </div>
    </div>
  );
};

export default Friends;

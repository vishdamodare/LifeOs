import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BellRing, ClipboardCheck, AlertCircle, Sparkles, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useUiStore } from '../store/uiStore';
import paymentRepository from '../repositories/paymentRepository';
import expenseRepository from '../repositories/expenseRepository';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const isLoading = useNotificationStore((state) => state.isLoading);
  
  const showToast = useUiStore((state) => state.showToast);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.id);
    }
  }, [currentUser, fetchNotifications]);

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await markAllAsRead(currentUser.id);
    showToast('All notifications marked as read', 'success');
  };

  const handleNotificationClick = async (notifId: string, refId?: string, refType?: string) => {
    // 1. Mark as read in store
    await markAsRead(notifId);
    
    // 2. Navigate based on references
    if (!refId || !refType) return;
    
    if (refType === 'Expense') {
      navigate(`/expenses/${refId}`);
    } else if (refType === 'Payment') {
      // Find expense matching the payment
      const payments = paymentRepository.getPayments();
      const payment = payments.find((p) => p.id === refId);
      if (payment) {
        const participants = expenseRepository.getParticipants();
        const part = participants.find((p) => p.id === payment.expense_participant_id);
        if (part) {
          navigate(`/expenses/${part.expense_id}`);
          return;
        }
      }
      navigate('/');
    } else if (refType === 'Group') {
      navigate('/groups');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ClipboardCheck size={18} style={{ color: 'var(--primary)' }} />;
      case 'payment_verified':
        return <Sparkles size={18} style={{ color: 'var(--bal-receive-text)' }} />;
      case 'reminder':
        return <AlertCircle size={18} style={{ color: 'var(--bal-owe-text)' }} />;
      default:
        return <BellRing size={18} style={{ color: 'var(--color-text-sub)' }} />;
    }
  };

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <div className="topbar-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="back-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Home
            </button>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button 
              className="back-btn" 
              style={{ margin: 0, border: 'none', background: 'none' }}
              onClick={handleMarkAllRead}
            >
              <CheckSquare size={16} /> Read All
            </button>
          )}
        </div>
        <div className="page-title" style={{ marginTop: '8px' }}>Notifications</div>
        <div className="page-sub">Alerts and activity updates</div>
      </div>

      {/* Notifications List */}
      <div className="scroll" style={{ paddingTop: '4px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-sub)' }}>
            Loading alerts...
          </div>
        ) : notifications.length === 0 ? (
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
            <BellRing size={28} style={{ opacity: 0.6 }} />
            <span>All quiet! No notifications or split alerts to show.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => handleNotificationClick(n.id, n.reference_id, n.reference_type)}
              className="notif-card"
              style={{ 
                cursor: 'pointer',
                borderColor: !n.is_read ? 'var(--primary-border)' : 'var(--border-card)',
                background: !n.is_read ? 'var(--primary-light)' : '#fff',
                transition: 'all 0.15s'
              }}
            >
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: !n.is_read ? '#fff' : 'var(--bg-field)',
                  flexShrink: 0
                }}
              >
                {getNotifIcon(n.type)}
              </div>
              <div className="notif-body">
                <div 
                  className="notif-text"
                  style={{ fontWeight: !n.is_read ? 700 : 500 }}
                  dangerouslySetInnerHTML={{ __html: n.message }}
                />
                <div className="notif-time">
                  {new Date(n.created_at).toLocaleDateString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
              {!n.is_read && (
                <div 
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    alignSelf: 'center',
                    flexShrink: 0
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;

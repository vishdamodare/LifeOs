import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clipboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore';
import { formatCurrency } from '../utils/currency';
import authRepository from '../repositories/authRepository';

export const PaymentHistory: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const payments = usePaymentStore((state) => state.payments);
  const fetchPayments = usePaymentStore((state) => state.fetchPayments);
  const isLoading = usePaymentStore((state) => state.isLoading);

  useEffect(() => {
    if (currentUser) {
      fetchPayments(currentUser.id);
    }
  }, [currentUser, fetchPayments]);

  const usersDb = authRepository.getUsers();

  const getPayerName = (payerId: string) => {
    if (payerId === currentUser?.id) return 'You';
    return usersDb[payerId]?.name || 'Unknown';
  };

  const getReceiverName = (receiverId: string) => {
    if (receiverId === currentUser?.id) return 'You';
    return usersDb[receiverId]?.name || 'Unknown';
  };

  const completedPayments = payments.filter((p) => p.status === 'completed');

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={16} /> Profile
        </button>
        <div className="page-title" style={{ marginTop: '8px' }}>Payment History</div>
        <div className="page-sub">Audits of past settlements</div>
      </div>

      {/* History scroll */}
      <div className="scroll" style={{ paddingTop: '4px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-sub)' }}>
            Loading payments...
          </div>
        ) : completedPayments.length === 0 ? (
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
            <Clipboard size={28} style={{ opacity: 0.6 }} />
            <span>No settlements completed yet.</span>
          </div>
        ) : (
          completedPayments.map((p) => {
            const date = p.paid_at ? new Date(p.paid_at) : new Date(p.created_at);
            return (
              <div 
                key={p.id} 
                className="friend-card"
                style={{ cursor: 'default', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div 
                  className="av" 
                  style={{ 
                    background: '#EDFAF4', 
                    color: '#0E9E5F',
                    width: '38px',
                    height: '38px',
                    fontSize: '16px',
                    border: 'none',
                    flexShrink: 0
                  }}
                >
                  ✓
                </div>
                <div className="f-main">
                  <div className="f-name" style={{ fontSize: '13px', fontWeight: 700 }}>
                    {getPayerName(p.payer_id)} paid {getReceiverName(p.receiver_id)}
                  </div>
                  <div className="f-shared" style={{ fontSize: '10px', color: 'var(--color-text-sub)', marginTop: '2px' }}>
                    {date.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} 
                    {p.transaction_id && ` · Ref: ${p.transaction_id}`}
                  </div>
                </div>
                <div className="f-right" style={{ alignSelf: 'center' }}>
                  <div className="f-val" style={{ color: 'var(--bal-receive-text)', fontSize: '14px', fontWeight: 800 }}>
                    {formatCurrency(p.amount)}
                  </div>
                  <div className="f-tag" style={{ color: 'var(--bal-receive-text)', fontSize: '9px', fontWeight: 700 }}>
                    {p.payment_method}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, X, QrCode } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useExpenseStore } from '../store/expenseStore';
import { usePaymentStore } from '../store/paymentStore';
import { useUiStore } from '../store/uiStore';
import { formatCurrency } from '../utils/currency';
import { buildUpiUrl, isValidUpiId } from '../utils/upi';
import { getQrCodeUrl } from '../utils/qr';
import authRepository from '../repositories/authRepository';
import paymentRepository from '../repositories/paymentRepository';
import { ExpenseParticipant, User } from '../types';

export const ExpenseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const expenses = useExpenseStore((state) => state.expenses);
  const fetchExpenses = useExpenseStore((state) => state.fetchExpenses);
  
  const activeExpenseParticipants = useExpenseStore((state) => state.activeExpenseParticipants);
  const fetchExpenseParticipants = useExpenseStore((state) => state.fetchExpenseParticipants);
  
  const submitPayment = usePaymentStore((state) => state.submitPayment);
  const verifyPayment = usePaymentStore((state) => state.verifyPayment);
  const cancelPayment = usePaymentStore((state) => state.cancelPayment);
  const paymentStoreError = usePaymentStore((state) => state.error);
  
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [selectedParticipant, setSelectedParticipant] = useState<(ExpenseParticipant & { user: User }) | null>(null);
  const [verificationDrawerOpen, setVerificationDrawerOpen] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [txnId, setTxnId] = useState('');

  const expense = expenses.find((e) => e.id === id);

  useEffect(() => {
    if (id && currentUser) {
      fetchExpenses(currentUser.id);
      fetchExpenseParticipants(id);
    }
  }, [id, currentUser, fetchExpenses, fetchExpenseParticipants]);

  if (!expense || !currentUser) {
    return (
      <div className="screen">
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
          <div className="page-title" style={{ marginTop: '8px' }}>Details</div>
        </div>
        <div className="scroll" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--color-text-sub)' }}>Expense details not found.</p>
        </div>
      </div>
    );
  }

  const isOrganizer = expense.paid_by === currentUser.id;
  const organizerUser = authRepository.findUserById(expense.paid_by);

  // My own participant record
  const myParticipantRecord = activeExpenseParticipants.find((p) => p.user_id === currentUser.id);

  // Open pay share drawer
  const handleOpenPay = (participant: ExpenseParticipant & { user: User }) => {
    setSelectedParticipant(participant);
    setPaymentDrawerOpen(true);
    setQrOpen(false);
  };

  // Launch UPI Deep Link
  const handleLaunchUpi = () => {
    if (!organizerUser) return;
    
    if (!isValidUpiId(organizerUser.upi_id)) {
      showToast('Recipient has an invalid UPI ID format.', 'error');
      return;
    }

    const upiUrl = buildUpiUrl({
      payeeAddress: organizerUser.upi_id,
      payeeName: organizerUser.name,
      amount: myParticipantRecord?.amount || 0,
      transactionNote: `Split for ${expense.title}`
    });

    showToast('Redirecting to your mobile UPI apps...', 'info');
    // Open in native UPI client
    window.location.href = upiUrl;
  };

  // User clicks "I Have Paid"
  const handleIHavePaid = async () => {
    if (!currentUser || !myParticipantRecord) return;
    
    const success = await submitPayment(
      myParticipantRecord.id,
      currentUser.id,
      expense.paid_by,
      myParticipantRecord.amount,
      'UPI',
      txnId
    );

    if (success) {
      showToast('Settlement submitted for payee verification.', 'success');
      setPaymentDrawerOpen(false);
      setTxnId('');
      // Refresh
      fetchExpenseParticipants(expense.id);
      fetchExpenses(currentUser.id);
    } else {
      showToast(paymentStoreError || 'Failed to submit payment', 'error');
    }
  };

  // Organizer opens verification drawer
  const handleOpenVerify = (participant: ExpenseParticipant & { user: User }) => {
    setSelectedParticipant(participant);
    setVerificationDrawerOpen(true);
  };

  // Organizer clicks "Confirm Settlement"
  const handleConfirmVerify = async () => {
    if (!selectedParticipant) return;
    
    // Find the pending payment ID from database
    const payments = paymentRepository.getPayments();
    const pendingPayment = payments.find((p) => 
      p.expense_participant_id === selectedParticipant.id && 
      p.status === 'verification_pending'
    );

    if (!pendingPayment) {
      showToast('No pending settlement log found to verify.', 'error');
      return;
    }

    const success = await verifyPayment(pendingPayment.id, txnId);
    if (success) {
      showToast('Payment verified! Balance updated.', 'success');
      setVerificationDrawerOpen(false);
      setTxnId('');
      // Refresh
      fetchExpenseParticipants(expense.id);
      fetchExpenses(currentUser.id);
    } else {
      showToast(paymentStoreError || 'Verification failed', 'error');
    }
  };

  // Organizer clicks "Reject / Cancel Settlement"
  const handleRejectVerify = async () => {
    if (!selectedParticipant) return;
    
    const payments = paymentRepository.getPayments();
    const pendingPayment = payments.find((p) => 
      p.expense_participant_id === selectedParticipant.id && 
      p.status === 'verification_pending'
    );

    if (!pendingPayment) return;

    const success = await cancelPayment(pendingPayment.id);
    if (success) {
      showToast('Settlement request rejected and reset.', 'info');
      setVerificationDrawerOpen(false);
      // Refresh
      fetchExpenseParticipants(expense.id);
      fetchExpenses(currentUser.id);
    } else {
      showToast(paymentStoreError || 'Rejection failed', 'error');
    }
  };

  // Generate QR Code URL
  const qrCodePayload = organizerUser ? buildUpiUrl({
    payeeAddress: organizerUser.upi_id,
    payeeName: organizerUser.name,
    amount: myParticipantRecord?.amount || 0,
    transactionNote: `Split for ${expense.title}`
  }) : '';

  const qrImageUrl = getQrCodeUrl(qrCodePayload, 160);

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div className="page-title" style={{ marginTop: '8px' }}>Expense Details</div>
      </div>

      {/* Details Scroll */}
      <div className="scroll" style={{ paddingTop: '4px' }}>
        
        {/* Main Amount Card */}
        <div className="hero-amt-section">
          <div className="hero-label">
            {expense.category} · split {expense.split_type === 'equal' ? 'equally' : expense.split_type === 'percent' ? 'by percentage' : 'customly'}
          </div>
          <div className="hero-amt">{formatCurrency(expense.amount)}</div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '8px' }}>
            {expense.title}
          </h2>
          {expense.description && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-sub)', marginTop: '4px' }}>
              {expense.description}
            </p>
          )}
          
          <div 
            style={{ 
              marginTop: '16px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'var(--color-text-sub)',
              fontWeight: 500
            }}
          >
            <span>Paid by: <strong>{isOrganizer ? 'You' : organizerUser?.name}</strong></span>
            <span>{new Date(expense.created_at).toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Action button for user if they owe */}
        {myParticipantRecord && myParticipantRecord.user_id !== expense.paid_by && myParticipantRecord.payment_status === 'pending' && (
          <button 
            className="cta" 
            style={{ position: 'static', width: '100%', marginBottom: '14px', borderRadius: '12px' }}
            onClick={() => handleOpenPay(myParticipantRecord)}
          >
            Settle Your Share ({formatCurrency(myParticipantRecord.amount)}) →
          </button>
        )}

        {myParticipantRecord && myParticipantRecord.payment_status === 'verification_pending' && (
          <div 
            style={{
              background: 'var(--pill-pending-bg)',
              border: '1px solid var(--pill-pending-border)',
              color: 'var(--pill-pending-text)',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '14px'
            }}
          >
            <Clock size={16} />
            <span>Your share of {formatCurrency(myParticipantRecord.amount)} is pending payee verification.</span>
          </div>
        )}

        {/* Splits Breakdown */}
        <div className="section-label">splits status</div>
        <div className="detail-card">
          {activeExpenseParticipants.map((p) => {
            const isMe = p.user_id === currentUser.id;
            const isPayer = p.user_id === expense.paid_by;
            
            return (
              <div key={p.id} className="d-row">
                <div 
                  className="av" 
                  style={{ 
                    background: isMe ? 'var(--primary-light)' : 'var(--bg-field)', 
                    color: isMe ? 'var(--primary)' : 'var(--color-text-sub)',
                    width: '32px',
                    height: '32px',
                    fontSize: '10px',
                    border: 'none',
                    marginRight: '4px'
                  }}
                >
                  {p.user?.name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'GU'}
                </div>
                
                <div className="d-name">
                  <div className="d-name-main">{p.user?.name} {isMe ? '(You)' : ''}</div>
                  <div className="d-name-sub">
                    {isPayer ? 'Paid full amount' : isOrganizer ? `Owes you ${formatCurrency(p.amount)}` : `Owes ${organizerUser?.name}`}
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="d-amt" style={{ marginRight: 0 }}>
                    {formatCurrency(p.amount)}
                  </div>
                  
                  {isPayer ? (
                    <span className="pill pill-paid">Organizer</span>
                  ) : p.payment_status === 'paid' ? (
                    <span className="pill pill-paid">Settled</span>
                  ) : p.payment_status === 'verification_pending' ? (
                    /* Show verification button for organizer, otherwise just badge */
                    isOrganizer ? (
                      <button 
                        onClick={() => handleOpenVerify(p)}
                        style={{
                          background: 'var(--pill-verification-bg)',
                          border: '1px solid var(--pill-verification-border)',
                          color: 'var(--pill-verification-text)',
                          borderRadius: '100px',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Verify ✎
                      </button>
                    ) : (
                      <span className="pill pill-verification">Verifying</span>
                    )
                  ) : p.payment_status === 'overdue' ? (
                    <span className="pill pill-overdue">Overdue</span>
                  ) : (
                    <span className="pill pill-pending">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pay Share Drawer Overlay (Payer perspective) */}
      <div className={`overlay ${paymentDrawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setPaymentDrawerOpen(false)}>
        <div className="sheet">
          <div className="sheet-handle"></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="sheet-title" style={{ margin: 0 }}>Settle Expense</div>
            <button className="back-btn" style={{ padding: '4px', border: 'none', background: 'none' }} onClick={() => setPaymentDrawerOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>sending to</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{organizerUser?.name}</h3>
            <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600, background: 'var(--primary-light)', padding: '3px 12px', borderRadius: '100px', display: 'inline-block', marginTop: '6px' }}>
              UPI ID: {organizerUser?.upi_id}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '16px', letterSpacing: '-1px' }}>
              {formatCurrency(myParticipantRecord?.amount || 0)}
            </div>
          </div>

          {!qrOpen ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleLaunchUpi}
                style={{
                  width: '100%',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Pay via Mobile UPI App ↗
              </button>

              <button 
                onClick={() => setQrOpen(true)}
                type="button"
                style={{
                  width: '100%',
                  background: '#fff',
                  border: '1px solid var(--border-card)',
                  color: 'var(--color-text-main)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <QrCode size={16} /> Show UPI QR Code
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', margin: '10px 0' }}>
              <div 
                style={{ 
                  background: '#fff', 
                  border: '1px solid var(--border-card)', 
                  borderRadius: '14px', 
                  padding: '12px', 
                  display: 'inline-block',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}
              >
                <img src={qrImageUrl} alt="UPI QR Code" style={{ width: '160px', height: '160px', display: 'block' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-sub)', marginTop: '8px', lineHeight: '1.4' }}>
                Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to make the transfer.
              </p>
              <button 
                onClick={() => setQrOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                ← Back to App Links
              </button>
            </div>
          )}

          <div 
            style={{ 
              borderTop: '1px solid var(--border-card)', 
              marginTop: '20px', 
              paddingTop: '16px',
              textAlign: 'left'
            }}
          >
            <div className="field-group" style={{ marginBottom: '10px' }}>
              <label className="field-label" htmlFor="payer-txn">Optional UPI Ref / Transaction ID</label>
              <input
                id="payer-txn"
                className="field-input"
                placeholder="E.g. 618290374182"
                type="text"
                value={txnId}
                onChange={(e) => setTxnId(e.target.value)}
              />
            </div>

            <button
              onClick={handleIHavePaid}
              style={{
                width: '100%',
                background: '#EDFAF4',
                color: '#0E9E5F',
                border: '1px solid #C6F0DC',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Confirm: I Have Transferred the Money
            </button>
          </div>
        </div>
      </div>

      {/* Verify Settlement Drawer Overlay (Organizer perspective) */}
      <div className={`overlay ${verificationDrawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setVerificationDrawerOpen(false)}>
        <div className="sheet">
          <div className="sheet-handle"></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="sheet-title" style={{ margin: 0 }}>Verify Settlement</div>
            <button className="back-btn" style={{ padding: '4px', border: 'none', background: 'none' }} onClick={() => setVerificationDrawerOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0 20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-text-sub)', textTransform: 'uppercase', fontWeight: 600 }}>verify payment from</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{selectedParticipant?.user?.name}</h3>
            <div style={{ fontSize: '12px', color: 'var(--color-text-sub)', marginTop: '2px' }}>{selectedParticipant?.user?.phone}</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--bal-receive-text)', marginTop: '16px', letterSpacing: '-1px' }}>
              {formatCurrency(selectedParticipant?.amount || 0)}
            </div>
            
            {/* Find and show transactions details */}
            {(() => {
              const payments = paymentRepository.getPayments();
              const pPay = payments.find((p) => 
                p.expense_participant_id === selectedParticipant?.id && 
                p.status === 'verification_pending'
              );
              if (pPay?.transaction_id) {
                return (
                  <div style={{ marginTop: '10px', fontSize: '11px', background: 'var(--bg-field)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--border-card)' }}>
                    Provided Ref ID: <strong>{pPay.transaction_id}</strong>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div style={{ background: 'var(--pill-pending-bg)', border: '1px solid var(--pill-pending-border)', color: 'var(--pill-pending-text)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.4', marginBottom: '20px', textAlign: 'left' }}>
            ⚠️ <strong>Verification Check</strong>: Please open your bank account or UPI application (GPay, Paytm, etc.) and verify that you have received <strong>{formatCurrency(selectedParticipant?.amount || 0)}</strong> from {selectedParticipant?.user?.name} before clicking confirm.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleConfirmVerify}
              style={{
                width: '100%',
                background: 'var(--bal-receive-text)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '13px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} /> Yes, I Have Received the Money
            </button>

            <button
              onClick={handleRejectVerify}
              style={{
                width: '100%',
                background: 'var(--bal-owe-bg)',
                color: 'var(--bal-owe-text)',
                border: '1px solid var(--bal-owe-border)',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <X size={16} /> No / Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;

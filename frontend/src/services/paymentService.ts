import apiClient from '../api/client';
import paymentRepository from '../repositories/paymentRepository';
import expenseRepository from '../repositories/expenseRepository';
import authRepository from '../repositories/authRepository';
import notificationRepository from '../repositories/notificationRepository';
import { Payment } from '../types';

export const paymentService = {
  getPayments: async (userId: string): Promise<Payment[]> => {
    const allPayments = paymentRepository.getPayments();
    const filtered = allPayments.filter((p) => p.payer_id === userId || p.receiver_id === userId);
    return apiClient.get(`/payments?userId=${userId}`, filtered);
  },
  
  submitPaymentNotification: async (
    expenseParticipantId: string,
    payerId: string,
    receiverId: string,
    amount: number,
    paymentMethod = 'UPI',
    transactionId?: string
  ): Promise<Payment> => {
    // 1. Validate participant record
    const allParticipants = expenseRepository.getParticipants();
    const participantIndex = allParticipants.findIndex((p) => p.id === expenseParticipantId);
    if (participantIndex === -1) throw new Error('Expense participant record not found.');
    
    const participant = allParticipants[participantIndex];
    if (participant.payment_status === 'paid') throw new Error('This expense share has already been settled.');
    if (participant.payment_status === 'verification_pending') throw new Error('Verification is already pending for this payment.');
    
    // 2. Set participant status to verification_pending
    participant.payment_status = 'verification_pending';
    expenseRepository.saveParticipants(allParticipants);
    
    // 3. Create a pending Payment record
    const newPayment: Payment = {
      id: Math.random().toString(36).substring(2, 9),
      expense_participant_id: expenseParticipantId,
      payer_id: payerId,
      receiver_id: receiverId,
      amount,
      status: 'verification_pending',
      payment_method: paymentMethod,
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    paymentRepository.addPayment(newPayment);
    
    // 4. Update the parent expense status
    const expense = expenseRepository.getExpenseById(participant.expense_id);
    if (expense && expense.status === 'pending') {
      expense.status = 'verification_pending';
      expense.updated_at = new Date().toISOString();
      const allExpenses = expenseRepository.getExpenses();
      const idx = allExpenses.findIndex((e) => e.id === expense.id);
      if (idx > -1) {
        allExpenses[idx] = expense;
        expenseRepository.saveExpenses(allExpenses);
      }
    }
    
    // 5. Notify the receiver
    const payerName = authRepository.findUserById(payerId)?.name || 'Someone';
    notificationRepository.addNotification({
      user_id: receiverId,
      type: 'payment',
      title: 'Payment Settlement Requested',
      message: `${payerName} marked ₹${amount.toLocaleString('en-IN')} as paid. Tap to verify.`,
      reference_id: newPayment.id,
      reference_type: 'Payment',
      is_read: false
    });
    
    return apiClient.post(`/payments/submit`, { expenseParticipantId, payerId, receiverId }, newPayment);
  },
  
  verifyPayment: async (paymentId: string, transactionId?: string): Promise<Payment> => {
    const payments = paymentRepository.getPayments();
    const paymentIndex = payments.findIndex((p) => p.id === paymentId);
    if (paymentIndex === -1) throw new Error('Payment record not found.');
    
    const payment = payments[paymentIndex];
    if (payment.status === 'completed') throw new Error('This payment is already verified.');
    if (payment.status === 'cancelled') throw new Error('This payment has been cancelled.');
    
    // Update payment record
    payment.status = 'completed';
    payment.paid_at = new Date().toISOString();
    payment.updated_at = new Date().toISOString();
    if (transactionId) payment.transaction_id = transactionId;
    paymentRepository.savePayments(payments);
    
    // Update participant record
    const allParticipants = expenseRepository.getParticipants();
    const pIdx = allParticipants.findIndex((p) => p.id === payment.expense_participant_id);
    if (pIdx > -1) {
      allParticipants[pIdx].payment_status = 'paid';
      allParticipants[pIdx].paid_at = new Date().toISOString();
      if (transactionId) allParticipants[pIdx].transaction_id = transactionId;
      allParticipants[pIdx].payment_method = payment.payment_method;
      expenseRepository.saveParticipants(allParticipants);
      
      // Check if all participants for this expense are settled
      const expenseId = allParticipants[pIdx].expense_id;
      const expenseParticipants = allParticipants.filter((p) => p.expense_id === expenseId);
      const allPaid = expenseParticipants.every((p) => p.payment_status === 'paid');
      
      const expense = expenseRepository.getExpenseById(expenseId);
      if (expense) {
        expense.status = allPaid ? 'paid' : 'partial';
        expense.updated_at = new Date().toISOString();
        if (allPaid) expense.settled_at = new Date().toISOString();
        
        const allExpenses = expenseRepository.getExpenses();
        const eIdx = allExpenses.findIndex((e) => e.id === expense.id);
        if (eIdx > -1) {
          allExpenses[eIdx] = expense;
          expenseRepository.saveExpenses(allExpenses);
        }
      }
    }
    
    // Notify the payer
    const receiverName = authRepository.findUserById(payment.receiver_id)?.name || 'Someone';
    notificationRepository.addNotification({
      user_id: payment.payer_id,
      type: 'payment_verified',
      title: 'Payment Verified',
      message: `${receiverName} verified your payment of ₹${payment.amount.toLocaleString('en-IN')}.`,
      reference_id: payment.expense_participant_id,
      reference_type: 'ExpenseParticipant',
      is_read: false
    });
    
    return apiClient.patch(`/payments/${paymentId}/verify`, { transactionId }, payment);
  },
  
  cancelPayment: async (paymentId: string): Promise<Payment> => {
    const payments = paymentRepository.getPayments();
    const paymentIndex = payments.findIndex((p) => p.id === paymentId);
    if (paymentIndex === -1) throw new Error('Payment record not found.');
    
    const payment = payments[paymentIndex];
    if (payment.status === 'completed') throw new Error('Cannot cancel a completed/verified payment.');
    
    payment.status = 'cancelled';
    payment.updated_at = new Date().toISOString();
    paymentRepository.savePayments(payments);
    
    // Restore participant status back to pending
    const allParticipants = expenseRepository.getParticipants();
    const pIdx = allParticipants.findIndex((p) => p.id === payment.expense_participant_id);
    if (pIdx > -1) {
      allParticipants[pIdx].payment_status = 'pending';
      expenseRepository.saveParticipants(allParticipants);
      
      // Update parent expense status if needed
      const expenseId = allParticipants[pIdx].expense_id;
      const expense = expenseRepository.getExpenseById(expenseId);
      if (expense && expense.status === 'verification_pending') {
        const hasOthersPendingVerification = allParticipants
          .filter((p) => p.expense_id === expenseId && p.id !== payment.expense_participant_id)
          .some((p) => p.payment_status === 'verification_pending');
          
        if (!hasOthersPendingVerification) {
          expense.status = 'pending';
          expense.updated_at = new Date().toISOString();
          const allExpenses = expenseRepository.getExpenses();
          const eIdx = allExpenses.findIndex((e) => e.id === expense.id);
          if (eIdx > -1) {
            allExpenses[eIdx] = expense;
            expenseRepository.saveExpenses(allExpenses);
          }
        }
      }
    }
    
    return apiClient.patch(`/payments/${paymentId}/cancel`, {}, payment);
  }
};

export default paymentService;

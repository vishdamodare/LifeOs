import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { useUiStore } from '../store/uiStore';
import { ArrowLeft, UserPlus, Check, X } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { isValidUpiId } from '../utils/upi';
import authRepository from '../repositories/authRepository';
import groupRepository from '../repositories/groupRepository';
import { ExpenseCategory, User } from '../types';

interface ExpenseForm {
  title: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  groupId: string;
}

export const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const friends = useFriendStore((state) => state.friends);
  const fetchFriends = useFriendStore((state) => state.fetchFriends);
  const addFriend = useFriendStore((state) => state.addFriend);
  const registerAndAddFriend = useFriendStore((state) => state.registerAndAddFriend);
  
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const createExpense = useExpenseStore((state) => state.createExpense);
  const isLoading = useExpenseStore((state) => state.isLoading);
  const expenseStoreError = useExpenseStore((state) => state.error);
  
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percent' | 'custom'>('equal');
  
  // Custom split values: mapped by userId to percentage or custom amount value
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  
  // Quick Add Friend within Drawer
  const [quickPhone, setQuickPhone] = useState('');
  const [quickName, setQuickName] = useState('');
  const [quickUpi, setQuickUpi] = useState('');
  const [quickLookupPerformed, setQuickLookupPerformed] = useState(false);
  const [quickUserFound, setQuickUserFound] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchFriends(currentUser.id);
      fetchGroups(currentUser.id);
      // Select myself by default
      setSelectedUserIds([currentUser.id]);
    }
  }, [currentUser, fetchFriends, fetchGroups]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseForm>({
    defaultValues: {
      title: '',
      description: '',
      amount: 0,
      category: 'Food',
      groupId: ''
    }
  });

  const amountWatch = watch('amount') || 0;
  const groupIdWatch = watch('groupId') || '';

  // Auto-select group members if a group is chosen
  useEffect(() => {
    if (groupIdWatch) {
      const memberIds = groupRepository.getGroupMembers(groupIdWatch);
      setSelectedUserIds(memberIds);
    } else if (currentUser) {
      setSelectedUserIds([currentUser.id]);
    }
  }, [groupIdWatch, currentUser]);

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) => 
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Perform quick phone search inside the overlay drawer
  const handleQuickLookup = () => {
    if (!quickPhone.trim()) return;
    
    let formattedPhone = quickPhone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = `+91 ${formattedPhone}`;
    }
    
    const user = authRepository.findUserByPhone(formattedPhone);
    setQuickUserFound(user);
    setQuickLookupPerformed(true);
    
    if (user) {
      setQuickName(user.name);
      setQuickUpi(user.upi_id);
    } else {
      setQuickName('');
      setQuickUpi('');
    }
  };

  const handleQuickAdd = async () => {
    if (!currentUser) return;
    
    let formattedPhone = quickPhone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = `+91 ${formattedPhone}`;
    }

    try {
      if (quickUserFound) {
        // Just add existing
        const success = await addFriend(currentUser.id, quickUserFound.phone);
        if (success) {
          showToast(`${quickUserFound.name} added!`, 'success');
          // Add to selections
          if (!selectedUserIds.includes(quickUserFound.id)) {
            setSelectedUserIds((prev) => [...prev, quickUserFound.id]);
          }
        }
      } else {
        // Register and add
        if (!quickName.trim() || !quickUpi.trim()) {
          showToast('Please enter Name and UPI ID for new contact', 'error');
          return;
        }
        if (!isValidUpiId(quickUpi)) {
          showToast('Invalid UPI ID format', 'error');
          return;
        }
        const success = await registerAndAddFriend(currentUser.id, quickName, formattedPhone, quickUpi);
        if (success) {
          const registered = authRepository.findUserByPhone(formattedPhone);
          if (registered) {
            showToast(`${quickName} registered and added!`, 'success');
            if (!selectedUserIds.includes(registered.id)) {
              setSelectedUserIds((prev) => [...prev, registered.id]);
            }
          }
        }
      }
      
      // Clear quick inputs
      setQuickPhone('');
      setQuickName('');
      setQuickUpi('');
      setQuickLookupPerformed(false);
      setQuickUserFound(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to add contact', 'error');
    }
  };

  // Perform split math calculations for equal split (incorporating remainder adjustments)
  const getCalculatedShares = () => {
    const totalAmount = amountWatch;
    const count = selectedUserIds.length;
    if (count === 0 || totalAmount <= 0) return {};
    
    const shares: Record<string, number> = {};
    
    if (splitMethod === 'equal') {
      const baseShare = Math.floor((totalAmount / count) * 100) / 100;
      const allocatedSum = baseShare * count;
      const remainder = Math.round((totalAmount - allocatedSum) * 100) / 100;
      
      selectedUserIds.forEach((id, index) => {
        shares[id] = index === count - 1 ? baseShare + remainder : baseShare;
      });
    } else if (splitMethod === 'percent') {
      let allocatedSum = 0;
      selectedUserIds.forEach((id) => {
        const pct = splitValues[id] || 0;
        const val = Math.floor(totalAmount * (pct / 100) * 100) / 100;
        shares[id] = val;
        allocatedSum += val;
      });
      // Adjust remainder on last participant
      const remainder = Math.round((totalAmount - allocatedSum) * 100) / 100;
      if (remainder !== 0 && selectedUserIds.length > 0) {
        const lastId = selectedUserIds[selectedUserIds.length - 1];
        shares[lastId] = parseFloat((shares[lastId] + remainder).toFixed(2));
      }
    } else {
      // Custom splits are entered directly
      selectedUserIds.forEach((id) => {
        shares[id] = splitValues[id] || 0;
      });
    }
    
    return shares;
  };

  const calculatedShares = getCalculatedShares();

  const handleSplitValueChange = (userId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setSplitValues((prev) => ({ ...prev, [userId]: num }));
  };

  const onSubmit = async (data: ExpenseForm) => {
    if (!currentUser) return;
    
    if (selectedUserIds.length === 0) {
      showToast('Please select at least one participant', 'error');
      return;
    }
    
    // Prepare split values parameters
    const splitInputs = selectedUserIds.map((userId) => ({
      userId,
      value: splitMethod === 'equal' ? undefined : splitValues[userId] || 0
    }));
    
    const success = await createExpense(
      data.title,
      data.description,
      data.amount,
      data.category,
      currentUser.id,
      data.groupId ? data.groupId : undefined,
      splitMethod,
      splitInputs
    );
    
    if (success) {
      showToast('Expense created and payment request enqueued!', 'success');
      navigate('/');
    } else {
      showToast(expenseStoreError || 'Failed to create expense', 'error');
    }
  };

  const usersDb = authRepository.getUsers();

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>
        <div className="page-title" style={{ marginTop: '8px' }}>New Expense</div>
        <div className="page-sub">Split dinner, cabs, or group trips</div>
      </div>

      {/* Main View Scroll */}
      <div className="scroll">
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '14px' }}>
          
          {/* Amount Card Wrapper */}
          <div className="amount-wrap">
            <div className="amount-hint">total expense amount</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>₹</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  width: '180px',
                  textAlign: 'center',
                  fontFamily: 'inherit'
                }}
                {...register('amount', { 
                  required: 'Amount is required', 
                  min: { value: 0.01, message: 'Amount must be greater than zero' }
                })}
              />
            </div>
            {errors.amount && (
              <span style={{ fontSize: '11px', color: 'var(--bal-owe-text)', marginTop: '4px', display: 'block' }}>
                {errors.amount.message}
              </span>
            )}
          </div>

          {/* Form details */}
          <div className="field-group">
            <label className="field-label" htmlFor="expense-title">Expense Title</label>
            <input
              id="expense-title"
              className="field-input"
              placeholder="E.g. Sunday Dinner, Cab to Airport"
              type="text"
              {...register('title', { required: 'Expense title is required' })}
            />
            {errors.title && (
              <span style={{ fontSize: '11px', color: 'var(--bal-owe-text)', marginTop: '4px', display: 'block' }}>
                {errors.title.message}
              </span>
            )}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="expense-desc">Description (optional)</label>
            <input
              id="expense-desc"
              className="field-input"
              placeholder="Add more details..."
              type="text"
              {...register('description')}
            />
          </div>

          <div 
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '14px'
            }}
          >
            {/* Category dropdown */}
            <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="field-label" htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                className="field-input"
                {...register('category')}
              >
                <option value="Food">🍽️ Food</option>
                <option value="Travel">🏨 Travel</option>
                <option value="Rent">🏠 Rent</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">⚡ Bills</option>
                <option value="Other">📝 Other</option>
              </select>
            </div>

            {/* Group dropdown */}
            <div className="field-group" style={{ flex: 1, marginBottom: 0 }}>
              <label className="field-label" htmlFor="expense-group">Group (optional)</label>
              <select
                id="expense-group"
                className="field-input"
                {...register('groupId')}
              >
                <option value="">No Group (Friends)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.profile_picture || '👥'} {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participant Select Button */}
          <div 
            onClick={() => setDrawerOpen(true)}
            style={{
              background: '#fff',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-sub)', textTransform: 'uppercase' }}>Splitting With</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                {selectedUserIds.length} person{selectedUserIds.length === 1 ? '' : 's'}
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>Edit List ✎</span>
          </div>

          {/* Split Methodology Selection Row */}
          <div className="field-group">
            <label className="field-label">Split Method</label>
            <div className="method-row">
              <button 
                type="button" 
                className={`method-btn ${splitMethod === 'equal' ? 'active' : ''}`}
                onClick={() => setSplitMethod('equal')}
              >
                Equally
              </button>
              <button 
                type="button" 
                className={`method-btn ${splitMethod === 'percent' ? 'active' : ''}`}
                onClick={() => setSplitMethod('percent')}
              >
                Percentages
              </button>
              <button 
                type="button" 
                className={`method-btn ${splitMethod === 'custom' ? 'active' : ''}`}
                onClick={() => setSplitMethod('custom')}
              >
                Custom Shares
              </button>
            </div>
          </div>

          {/* Split Calculations Breakdown Cards */}
          <div className="section-label">Split Breakdown</div>
          <div className="detail-card" style={{ marginBottom: '24px' }}>
            {selectedUserIds.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-sub)' }}>
                No participants selected.
              </div>
            ) : (
              selectedUserIds.map((userId) => {
                const user = usersDb[userId];
                if (!user) return null;
                const isMe = userId === currentUser?.id;
                
                return (
                  <div key={userId} className="d-row">
                    <div 
                      className="av" 
                      style={{ 
                        background: isMe ? 'var(--primary-light)' : 'var(--bg-field)', 
                        color: isMe ? 'var(--primary)' : 'var(--color-text-sub)',
                        width: '30px',
                        height: '30px',
                        fontSize: '9px',
                        border: 'none',
                        marginRight: '2px'
                      }}
                    >
                      {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="d-name">
                      <div className="d-name-main">{user.name} {isMe ? '(You)' : ''}</div>
                    </div>
                    
                    {splitMethod === 'equal' ? (
                      <div className="d-amt" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(calculatedShares[userId] || 0)}
                      </div>
                    ) : splitMethod === 'percent' ? (
                      /* Percent inputs block */
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '70px' }}>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            className="field-input"
                            style={{ padding: '6px 16px 6px 6px', fontSize: '12px', textAlign: 'right' }}
                            value={splitValues[userId] || ''}
                            onChange={(e) => handleSplitValueChange(userId, e.target.value)}
                          />
                          <span style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-sub)' }}>%</span>
                        </div>
                        <div className="d-amt" style={{ color: 'var(--primary)', width: '60px', textAlign: 'right', fontSize: '13px', alignSelf: 'center' }}>
                          {formatCurrency(calculatedShares[userId] || 0)}
                        </div>
                      </div>
                    ) : (
                      /* Custom shares inputs block */
                      <div style={{ position: 'relative', width: '90px' }}>
                        <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: 'bold', color: 'var(--color-text-sub)' }}>₹</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          className="field-input"
                          style={{ padding: '6px 6px 6px 18px', fontSize: '12px', textAlign: 'right' }}
                          value={splitValues[userId] || ''}
                          onChange={(e) => handleSplitValueChange(userId, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || selectedUserIds.length === 0}
            className="cta"
            style={{ position: 'static', width: '100%' }}
          >
            {isLoading ? 'Sending requests...' : `Create & Split ${formatCurrency(amountWatch)} →`}
          </button>
        </form>
      </div>

      {/* Slide-over Bottom Sheet Drawer Overlay for Participant Selection */}
      <div className={`overlay ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
        <div className="sheet">
          <div className="sheet-handle"></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div className="sheet-title" style={{ margin: 0 }}>Select Participants</div>
            <button 
              onClick={() => setDrawerOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-sub)' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Add Friend form within the drawer */}
          <div 
            style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--primary-border)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              ⚡ Quick-Add Contact
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                placeholder="Friend Phone Number"
                className="field-input"
                style={{ flex: 1, padding: '8px 10px', fontSize: '13px' }}
                value={quickPhone}
                onChange={(e) => setQuickPhone(e.target.value)}
              />
              <button
                type="button"
                onClick={handleQuickLookup}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Lookup
              </button>
            </div>

            {quickLookupPerformed && (
              <div style={{ marginTop: '10px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                {quickUserFound ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{quickUserFound.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-sub)' }}>UPI ID: {quickUserFound.upi_id}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickAdd}
                      style={{
                        background: '#EDFAF4',
                        color: '#0E9E5F',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Add Friend
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--bal-owe-sub)', marginBottom: '8px' }}>
                      Contact not registered. Enter details below:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Contact Name (e.g. Rahul)"
                        className="field-input"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="UPI ID (e.g. rahul@upi)"
                        className="field-input"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        value={quickUpi}
                        onChange={(e) => setQuickUpi(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleQuickAdd}
                        style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <UserPlus size={12} /> Register & Add Friend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checklist of friends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
            {currentUser && (
              <div 
                className="contact-row" 
                onClick={() => toggleSelectUser(currentUser.id)}
                style={{
                  background: selectedUserIds.includes(currentUser.id) ? 'var(--primary-light)' : '#fff',
                  border: '1px solid',
                  borderColor: selectedUserIds.includes(currentUser.id) ? '#C0C4FF' : 'var(--border-card)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                  margin: 0
                }}
              >
                <div className="av" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '28px', height: '28px', fontSize: '9px', border: 'none', marginRight: '8px' }}>
                  {currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="p-name" style={{ fontSize: '12px', fontWeight: 600 }}>{currentUser.name} (You)</div>
                </div>
                <div className={`contact-check ${selectedUserIds.includes(currentUser.id) ? 'checked' : ''}`}>
                  {selectedUserIds.includes(currentUser.id) && <Check size={10} />}
                </div>
              </div>
            )}

            {friends.map((friend) => {
              const isSelected = selectedUserIds.includes(friend.id);
              return (
                <div 
                  key={friend.id} 
                  className="contact-row"
                  onClick={() => toggleSelectUser(friend.id)}
                  style={{
                    background: isSelected ? 'var(--primary-light)' : '#fff',
                    border: '1px solid',
                    borderColor: isSelected ? '#C0C4FF' : 'var(--border-card)',
                    borderRadius: '12px',
                    padding: '8px 12px',
                    margin: 0
                  }}
                >
                  <div className="av" style={{ background: 'var(--bg-app)', color: 'var(--color-text-sub)', width: '28px', height: '28px', fontSize: '9px', border: 'none', marginRight: '8px' }}>
                    {friend.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="p-name" style={{ fontSize: '12px', fontWeight: 600 }}>{friend.name}</div>
                    <div className="p-sub" style={{ fontSize: '9px', color: 'var(--color-text-sub)', marginTop: '1px' }}>{friend.upi_id}</div>
                  </div>
                  <div className={`contact-check ${isSelected ? 'checked' : ''}`}>
                    {isSelected && <Check size={10} />}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            type="button" 
            className="add-sheet-btn"
            onClick={() => setDrawerOpen(false)}
          >
            Done Selecting ({selectedUserIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExpense;

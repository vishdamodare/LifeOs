import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useUiStore } from '../store/uiStore';
import { Search, ArrowLeft, User, CreditCard } from 'lucide-react';
import authRepository from '../repositories/authRepository';
import { User as UserType } from '../types';
import { isValidUpiId } from '../utils/upi';

interface SearchForm {
  phone: string;
}

interface RegisterForm {
  name: string;
  upiId: string;
}

export const CreateFriend: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  
  const currentUser = useAuthStore((state) => state.user);
  
  const addFriend = useFriendStore((state) => state.addFriend);
  const registerAndAddFriend = useFriendStore((state) => state.registerAndAddFriend);
  const friendStoreError = useFriendStore((state) => state.error);
  const isLoading = useFriendStore((state) => state.isLoading);
  
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [searchPhone, setSearchPhone] = useState(phoneParam);
  const [searchedUser, setSearchedUser] = useState<UserType | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const { register: registerSearch, handleSubmit: handleSearchSubmit, setValue } = useForm<SearchForm>({
    defaultValues: { phone: phoneParam }
  });

  const { register: registerNewFriend, handleSubmit: handleRegisterSubmit, formState: { errors: formErrors }, reset: resetRegisterForm } = useForm<RegisterForm>({
    defaultValues: { name: '', upiId: '' }
  });

  useEffect(() => {
    if (phoneParam) {
      setValue('phone', phoneParam);
      onSearch({ phone: phoneParam });
    }
  }, [phoneParam]);

  const onSearch = (data: SearchForm) => {
    if (!currentUser) return;
    
    let formattedPhone = data.phone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = `+91 ${formattedPhone}`;
    }
    
    setSearchPhone(formattedPhone);
    setSearchPerformed(true);
    
    // Query local mock database
    const user = authRepository.findUserByPhone(formattedPhone);
    setSearchedUser(user);
    resetRegisterForm();
  };

  const handleAddExistingFriend = async () => {
    if (!currentUser || !searchedUser) return;
    
    const success = await addFriend(currentUser.id, searchedUser.phone);
    if (success) {
      showToast(`${searchedUser.name} added as friend!`, 'success');
      navigate('/friends');
    } else {
      showToast(friendStoreError || 'Failed to add friend', 'error');
    }
  };

  const handleRegisterAndAdd = async (data: RegisterForm) => {
    if (!currentUser) return;
    
    const success = await registerAndAddFriend(currentUser.id, data.name, searchPhone, data.upiId);
    if (success) {
      showToast(`${data.name} registered and added to splits!`, 'success');
      navigate('/friends');
    } else {
      showToast(friendStoreError || 'Failed to register contact', 'error');
    }
  };

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn" onClick={() => navigate('/friends')}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="page-title" style={{ marginTop: '8px' }}>Add Friend</div>
        <div className="page-sub">Connect by phone or register contact</div>
      </div>

      <div className="scroll">
        
        {/* Step 1: Phone Search Form */}
        <form onSubmit={handleSearchSubmit(onSearch)} style={{ marginTop: '14px' }}>
          <div className="field-group">
            <label className="field-label" htmlFor="search-phone">Find by phone number</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--color-text-sub)' 
                  }} 
                />
                <input
                  id="search-phone"
                  className="field-input"
                  placeholder="Enter 10-digit mobile number"
                  type="tel"
                  style={{ paddingLeft: '36px' }}
                  {...registerSearch('phone', { required: true })}
                />
              </div>
              <button 
                type="submit"
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid var(--primary-border)',
                  borderRadius: '10px',
                  padding: '0 16px',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Step 2: Results Display */}
        {searchPerformed && (
          <div style={{ marginTop: '20px' }}>
            {searchedUser ? (
              /* User exists in database */
              <div 
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-card)',
                  borderRadius: '14px',
                  padding: '16px',
                  textAlign: 'center'
                }}
              >
                <div 
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800,
                    marginBottom: '10px'
                  }}
                >
                  {searchedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{searchedUser.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-sub)', marginTop: '2px' }}>{searchedUser.phone}</p>
                <div 
                  style={{
                    display: 'inline-block',
                    background: '#EDFAF4',
                    color: '#0E9E5F',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '100px',
                    padding: '2px 10px',
                    marginTop: '8px'
                  }}
                >
                  Registered User
                </div>
                
                <div 
                  style={{ 
                    borderTop: '1px solid var(--border-card)', 
                    marginTop: '16px', 
                    paddingTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--color-text-sub)' }}>UPI ID (Resolved automatically)</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>{searchedUser.upi_id}</span>
                </div>
                
                <button
                  onClick={handleAddExistingFriend}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '16px'
                  }}
                >
                  {isLoading ? 'Adding Friend...' : 'Confirm & Add Friend'}
                </button>
              </div>
            ) : (
              /* User does not exist, show input fields for custom contact registration */
              <div 
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-card)',
                  borderRadius: '14px',
                  padding: '16px'
                }}
              >
                <div 
                  style={{
                    background: 'var(--pill-pending-bg)',
                    border: '1px solid var(--pill-pending-border)',
                    color: 'var(--pill-pending-text)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    fontWeight: 500,
                    marginBottom: '16px'
                  }}
                >
                  ⚠️ <strong>Not registered on LifeOS</strong>: Enter their name and UPI address below. We'll register this contact locally so you can request money from them.
                </div>

                <form onSubmit={handleRegisterSubmit(handleRegisterAndAdd)}>
                  {/* Name field */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-name">Contact Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          left: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: 'var(--color-text-sub)' 
                        }} 
                      />
                      <input
                        id="reg-name"
                        className="field-input"
                        placeholder="E.g. Karan Mehta"
                        type="text"
                        style={{ paddingLeft: '34px' }}
                        {...registerNewFriend('name', { 
                          required: 'Contact name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                      />
                    </div>
                    {formErrors.name && (
                      <span style={{ fontSize: '11px', color: 'var(--bal-owe-text)', marginTop: '4px', display: 'block' }}>
                        {formErrors.name.message}
                      </span>
                    )}
                  </div>

                  {/* UPI ID field */}
                  <div className="field-group">
                    <label className="field-label" htmlFor="reg-upi">UPI ID (VPA)</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard 
                        size={16} 
                        style={{ 
                          position: 'absolute', 
                          left: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: 'var(--color-text-sub)' 
                        }} 
                      />
                      <input
                        id="reg-upi"
                        className="field-input"
                        placeholder="username@bank"
                        type="text"
                        style={{ paddingLeft: '34px' }}
                        {...registerNewFriend('upiId', { 
                          required: 'UPI ID is required to route payment links',
                          validate: (v) => isValidUpiId(v) || 'Please enter a valid UPI ID (e.g. name@okhdfcbank)'
                        })}
                      />
                    </div>
                    {formErrors.upiId && (
                      <span style={{ fontSize: '11px', color: 'var(--bal-owe-text)', marginTop: '4px', display: 'block' }}>
                        {formErrors.upiId.message}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    {isLoading ? 'Creating Contact...' : 'Register Contact & Add Friend'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateFriend;

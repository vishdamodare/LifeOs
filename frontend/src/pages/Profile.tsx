import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

export const Profile: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="screen">
      <div className="topbar">
        <div className="page-title">Profile</div>
        <div className="page-sub">Your account details</div>
      </div>
      <div className="scroll" style={{ padding: '20px 14px' }}>
        <div 
          style={{ 
            background: '#fff', 
            borderRadius: '14px', 
            border: '1px solid var(--border-card)', 
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <div 
            style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '50%', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '12px'
            }}
          >
            {currentUser?.name.split(' ').map((n) => n[0]).join('').toUpperCase() || 'GU'}
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>{currentUser?.name}</h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-sub)', marginTop: '2px' }}>{currentUser?.phone}</p>
          <div 
            style={{ 
              display: 'inline-block',
              background: 'var(--primary-light)', 
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              borderRadius: '100px',
              padding: '4px 12px',
              marginTop: '10px'
            }}
          >
            UPI ID: {currentUser?.upi_id}
          </div>
        </div>

        <button 
          onClick={() => navigate('/settings')}
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid var(--border-card)',
            color: 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '13px',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: '10px'
          }}
        >
          ⚙️ App Settings
        </button>

        <button 
          onClick={() => navigate('/payment-history')}
          style={{
            width: '100%',
            background: '#fff',
            border: '1px solid var(--border-card)',
            color: 'var(--color-text-main)',
            fontWeight: 600,
            fontSize: '13px',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: '10px'
          }}
        >
          📜 Payment History
        </button>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'var(--bal-owe-bg)',
            border: '1px solid var(--bal-owe-border)',
            color: 'var(--bal-owe-text)',
            fontWeight: 700,
            fontSize: '13px',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;

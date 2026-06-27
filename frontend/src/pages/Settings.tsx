import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Shield, Database } from 'lucide-react';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const logout = useAuthStore((state) => state.logout);

  // States for toggles
  const [reminders, setReminders] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  const handleResetDb = () => {
    if (window.confirm('Are you sure you want to clear the local database? This will reset all expenses, groups, and contacts to defaults.')) {
      localStorage.clear();
      showToast('Database reset to defaults. Logging out...', 'success');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1000);
    }
  };

  const renderToggle = (label: string, value: boolean, onChange: (v: boolean) => void, icon: React.ReactNode) => {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#fff',
          borderBottom: '1px solid var(--border-card)',
          cursor: 'pointer'
        }}
        onClick={() => onChange(!value)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ color: 'var(--primary)' }}>{icon}</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>{label}</span>
        </div>
        <div 
          style={{
            width: '42px',
            height: '22px',
            borderRadius: '100px',
            background: value ? 'var(--primary)' : '#D1D5DB',
            position: 'relative',
            transition: 'background 0.2s',
          }}
        >
          <div 
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '3px',
              left: value ? '23px' : '3px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          <ArrowLeft size={16} /> Profile
        </button>
        <div className="page-title" style={{ marginTop: '8px' }}>Settings</div>
        <div className="page-sub">Configure preference layers</div>
      </div>

      {/* Settings list */}
      <div className="scroll" style={{ paddingTop: '10px' }}>
        
        <div style={{ borderRadius: '14px', border: '1px solid var(--border-card)', overflow: 'hidden', marginBottom: '20px' }}>
          {renderToggle('Automatic UPI Reminders (1, 3, 7 days)', reminders, setReminders, <Calendar size={18} />)}
          {renderToggle('Push notifications alerts', pushNotifs, setPushNotifs, <Bell size={18} />)}
          {renderToggle('Enable Biometric FaceID/Fingerprint lock', biometrics, setBiometrics, <Shield size={18} />)}
        </div>

        <div className="section-label">Developer Controls</div>
        
        <button
          onClick={handleResetDb}
          style={{
            width: '100%',
            background: 'var(--bal-owe-bg)',
            border: '1px solid var(--bal-owe-border)',
            color: 'var(--bal-owe-text)',
            fontWeight: 700,
            fontSize: '13px',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Database size={16} /> Reset Local Database (Clear localStorage)
        </button>

      </div>
    </div>
  );
};

export default Settings;

import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Bell, User } from 'lucide-react';
import { useUiStore } from '../store/uiStore';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/friends')) return 'friends';
    if (path.startsWith('/notifications')) return 'alerts';
    if (path.startsWith('/profile') || path.startsWith('/settings')) return 'profile';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <div className="app">
      {/* Toast Notification Portal */}
      <div 
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
              background: 
                toast.type === 'success' ? 'var(--bal-receive-text)' :
                toast.type === 'error' ? 'var(--bal-owe-text)' :
                'var(--primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              animation: 'popIn 0.3s ease'
            }}
          >
            <span>{toast.message}</span>
            <span style={{ fontSize: '10px', marginLeft: '10px', opacity: 0.8 }}>✕</span>
          </div>
        ))}
      </div>

      <div className="screen">
        <Outlet />
      </div>

      {/* Bottom Navigation Frame (only visible on main screens) */}
      {activeTab && (
        <div className="bottom-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => navigate('/')}
            aria-label="Home"
          >
            <div className="nav-dot"></div>
            <Home size={20} />
            <span>Home</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => navigate('/friends')}
            aria-label="Friends"
          >
            <div className="nav-dot"></div>
            <Users size={20} />
            <span>Friends</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
            aria-label="Alerts"
          >
            <div className="nav-dot"></div>
            <Bell size={20} />
            <span>Alerts</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
            aria-label="Profile"
          >
            <div className="nav-dot"></div>
            <User size={20} />
            <span>Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AppLayout;

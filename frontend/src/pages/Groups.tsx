import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useGroupStore } from '../store/groupStore';
import groupRepository from '../repositories/groupRepository';

export const Groups: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  const isLoadingGroups = useGroupStore((state) => state.isLoading);

  useEffect(() => {
    if (currentUser) {
      fetchGroups(currentUser.id);
    }
  }, [currentUser, fetchGroups]);

  const getMemberCount = (groupId: string) => {
    return groupRepository.getGroupMembers(groupId).length;
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
          <button 
            className="back-btn" 
            style={{ margin: 0 }}
            onClick={() => navigate('/groups/new')}
          >
            <Plus size={16} /> New
          </button>
        </div>
        <div className="page-title" style={{ marginTop: '8px' }}>Groups</div>
        <div className="page-sub">Create shared trip or flatmate groups</div>
      </div>

      {/* List */}
      <div className="scroll" style={{ paddingTop: '4px' }}>
        {isLoadingGroups ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-text-sub)' }}>
            Loading groups...
          </div>
        ) : groups.length === 0 ? (
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
            <Users size={28} style={{ opacity: 0.6 }} />
            <span>No groups created yet. Create a group to track shared expenses between multiple roommates or friends!</span>
            <button
              onClick={() => navigate('/groups/new')}
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
              Create Group Now
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const memberCount = getMemberCount(group.id);
            return (
              <div 
                key={group.id} 
                className="friend-card"
                style={{ cursor: 'default' }}
              >
                <div 
                  className="av" 
                  style={{ 
                    background: 'var(--primary-light)', 
                    color: 'var(--primary)',
                    width: '40px',
                    height: '40px',
                    fontSize: '18px',
                    border: 'none',
                    flexShrink: 0
                  }}
                >
                  {group.profile_picture || '👥'}
                </div>
                <div className="f-main">
                  <div className="f-name">{group.name}</div>
                  <div className="f-shared" style={{ fontSize: '11px', color: 'var(--color-text-sub)' }}>
                    {group.description || 'Shared expense group'}
                  </div>
                </div>
                <div className="f-right" style={{ alignSelf: 'center' }}>
                  <div 
                    style={{
                      background: 'var(--bg-field)',
                      border: '1px solid var(--border-card)',
                      borderRadius: '100px',
                      padding: '2px 10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {memberCount} member{memberCount === 1 ? '' : 's'}
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

export default Groups;

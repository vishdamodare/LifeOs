import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useFriendStore } from '../store/friendStore';
import { useGroupStore } from '../store/groupStore';
import { useUiStore } from '../store/uiStore';
import { ArrowLeft, Users, FileText, CheckCircle2 } from 'lucide-react';

interface GroupForm {
  name: string;
  description: string;
  icon: string;
}

export const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  
  const friends = useFriendStore((state) => state.friends);
  const fetchFriends = useFriendStore((state) => state.fetchFriends);
  
  const createGroup = useGroupStore((state) => state.createGroup);
  const isLoading = useGroupStore((state) => state.isLoading);
  const groupStoreError = useGroupStore((state) => state.error);
  
  const showToast = useUiStore((state) => state.showToast);

  // States
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [iconEmoji, setIconEmoji] = useState('👥');

  useEffect(() => {
    if (currentUser) {
      fetchFriends(currentUser.id);
    }
  }, [currentUser, fetchFriends]);

  const { register, handleSubmit, formState: { errors } } = useForm<GroupForm>({
    defaultValues: {
      name: '',
      description: '',
      icon: '👥'
    }
  });

  const toggleMemberSelection = (friendId: string) => {
    setSelectedMemberIds((prev) => 
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const onSubmit = async (data: GroupForm) => {
    if (!currentUser) return;
    
    if (selectedMemberIds.length === 0) {
      showToast('Select at least one member to create group', 'error');
      return;
    }
    
    const success = await createGroup(
      data.name,
      data.description,
      currentUser.id,
      selectedMemberIds,
      iconEmoji
    );
    
    if (success) {
      showToast(`Group '${data.name}' created successfully!`, 'success');
      navigate('/groups');
    } else {
      showToast(groupStoreError || 'Failed to create group', 'error');
    }
  };

  const emojiList = ['👥', '🌴', '🏠', '🍔', '✈️', '🎮', '🚗', '🎓', '💸'];

  return (
    <div className="screen">
      {/* Top Header */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn" onClick={() => navigate('/groups')}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <div className="page-title" style={{ marginTop: '8px' }}>New Group</div>
        <div className="page-sub">Create split pool for roommates/trips</div>
      </div>

      {/* Main Form Scroll */}
      <div className="scroll">
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '14px' }}>
          
          {/* Group Icon emoji selection */}
          <div className="field-group">
            <label className="field-label">Group Icon / Emoji</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {emojiList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIconEmoji(emoji)}
                  style={{
                    fontSize: '20px',
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: iconEmoji === emoji ? 'var(--primary)' : 'var(--border-card)',
                    background: iconEmoji === emoji ? 'var(--primary-light)' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name input */}
          <div className="field-group">
            <label className="field-label" htmlFor="group-name">Group Name</label>
            <div style={{ position: 'relative' }}>
              <Users 
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
                id="group-name"
                className="field-input"
                placeholder="E.g. Flatmates, Goa 2026"
                type="text"
                style={{ paddingLeft: '34px' }}
                {...register('name', { required: 'Group name is required' })}
              />
            </div>
            {errors.name && (
              <span style={{ fontSize: '11px', color: 'var(--bal-owe-text)', marginTop: '4px', display: 'block' }}>
                {errors.name.message}
              </span>
            )}
          </div>

          {/* Description input */}
          <div className="field-group">
            <label className="field-label" htmlFor="group-desc">Description</label>
            <div style={{ position: 'relative' }}>
              <FileText 
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
                id="group-desc"
                className="field-input"
                placeholder="E.g. Monthly rent and house splits"
                type="text"
                style={{ paddingLeft: '34px' }}
                {...register('description')}
              />
            </div>
          </div>

          {/* Members Checklist */}
          <div className="section-label">Select Group Members</div>
          {friends.length === 0 ? (
            <div 
              style={{
                background: '#fff',
                border: '1px dashed var(--border-card)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--color-text-sub)'
              }}
            >
              No friends to select. Add friends in the Friends tab first!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              {friends.map((friend) => {
                const isSelected = selectedMemberIds.includes(friend.id);
                return (
                  <div 
                    key={friend.id} 
                    className="contact-row"
                    onClick={() => toggleMemberSelection(friend.id)}
                    style={{
                      background: isSelected ? 'var(--primary-light)' : '#fff',
                      border: '1px solid',
                      borderColor: isSelected ? '#C0C4FF' : 'var(--border-card)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div 
                      className="av" 
                      style={{ 
                        background: 'var(--bg-app)', 
                        color: 'var(--color-text-sub)',
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        marginRight: '10px'
                      }}
                    >
                      {friend.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="p-name" style={{ fontSize: '13px', fontWeight: 600 }}>{friend.name}</div>
                      <div className="p-sub" style={{ fontSize: '10px', color: 'var(--color-text-sub)' }}>{friend.upi_id}</div>
                    </div>
                    <div className={`contact-check ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <CheckCircle2 size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="cta"
            style={{ position: 'static', width: '100%', marginTop: '8px' }}
          >
            {isLoading ? 'Creating Group...' : 'Create Group →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;

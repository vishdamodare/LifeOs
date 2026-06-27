import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { User, CreditCard, Image } from 'lucide-react';
import { isValidUpiId } from '../utils/upi';

interface SignupForm {
  name: string;
  upiId: string;
  profilePicture?: string;
}

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loginError = useAuthStore((state) => state.loginError);
  const tempPhone = useAuthStore((state) => state.tempPhone);
  const showToast = useUiStore((state) => state.showToast);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    defaultValues: {
      name: '',
      upiId: '',
      profilePicture: ''
    }
  });

  const onSubmit = async (data: SignupForm) => {
    const success = await signup(data.name, data.upiId, data.profilePicture);
    if (success) {
      showToast('Account created successfully! Welcome to LifeOS.', 'success');
      navigate('/');
    }
  };

  if (!tempPhone) {
    navigate('/login');
    return null;
  }

  return (
    <div className="screen" style={{ background: '#fff', justifyContent: 'center' }}>
      <div style={{ padding: '30px 24px' }}>
        
        {/* Brand Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.3px' }}>
            Complete your profile
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-sub)', marginTop: '4px' }}>
            Provide your details to split and receive payments instantly.
          </p>
        </div>

        {/* Errors Display */}
        {(loginError || errors.name || errors.upiId) && (
          <div 
            style={{ 
              background: 'var(--bal-owe-bg)', 
              border: '1px solid var(--bal-owe-border)', 
              color: 'var(--bal-owe-text)',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '20px'
            }}
          >
            {loginError || errors.name?.message || errors.upiId?.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name Field */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-name">Full name</label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--color-text-sub)' 
                }} 
              />
              <input
                id="signup-name"
                className="field-input"
                placeholder="E.g. Arjun Kumar"
                type="text"
                style={{ paddingLeft: '38px' }}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />
            </div>
          </div>

          {/* UPI ID Field */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-upi">UPI ID (For Settlements)</label>
            <div style={{ position: 'relative' }}>
              <CreditCard 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--color-text-sub)' 
                }} 
              />
              <input
                id="signup-upi"
                className="field-input"
                placeholder="E.g. arjun@upi"
                type="text"
                style={{ paddingLeft: '38px' }}
                {...register('upiId', {
                  required: 'UPI ID is required for settlements',
                  validate: (value) => isValidUpiId(value) || 'Please enter a valid UPI ID (e.g. username@bank)'
                })}
              />
            </div>
          </div>

          {/* Profile Picture Field */}
          <div className="field-group">
            <label className="field-label" htmlFor="signup-pic">Profile picture URL (optional)</label>
            <div style={{ position: 'relative' }}>
              <Image 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--color-text-sub)' 
                }} 
              />
              <input
                id="signup-pic"
                className="field-input"
                placeholder="Paste image URL here"
                type="url"
                style={{ paddingLeft: '38px' }}
                {...register('profilePicture')}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="cta" 
            style={{ position: 'static', width: '100%', marginTop: '16px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating profile...' : 'Complete Profile & Log In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

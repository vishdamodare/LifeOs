import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Smartphone, ShieldCheck } from 'lucide-react';

interface LoginForm {
  phone: string;
}

interface OtpForm {
  otp: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loginError = useAuthStore((state) => state.loginError);
  const tempPhone = useAuthStore((state) => state.tempPhone);
  
  const showToast = useUiStore((state) => state.showToast);

  const { register: registerPhone, handleSubmit: handlePhoneSubmit, formState: { errors: phoneErrors } } = useForm<LoginForm>({
    defaultValues: { phone: '' }
  });
  
  const { register: registerOtp, handleSubmit: handleOtpSubmit, formState: { errors: otpErrors } } = useForm<OtpForm>({
    defaultValues: { otp: '' }
  });

  const onPhoneSubmit = async (data: LoginForm) => {
    // Format to standard: add country code prefix if not present
    let formattedPhone = data.phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+91 ${formattedPhone}`;
    }
    
    const success = await sendOtp(formattedPhone);
    if (success) {
      showToast('OTP sent! Use verification code: 123456', 'success');
      setStep('otp');
    }
  };

  const onOtpSubmit = async (data: OtpForm) => {
    const hasAccount = await verifyOtp(data.otp);
    if (hasAccount) {
      showToast('Welcome back to LifeOS!', 'success');
      navigate('/');
    } else {
      // No account, redirect to signup
      showToast('Verify successful. Complete your profile details.', 'info');
      navigate('/signup');
    }
  };

  return (
    <div className="screen" style={{ background: '#fff', justifyContent: 'center' }}>
      <div style={{ padding: '30px 24px', textAlign: 'center' }}>
        
        {/* Brand Header */}
        <div style={{ marginBottom: '40px' }}>
          <div 
            style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '16px', 
              background: 'var(--primary-light)', 
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              marginBottom: '16px'
            }}
          >
            L
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.5px' }}>LifeOS</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-sub)', marginTop: '6px' }}>
            Pay once. Split instantly. Get paid back effortlessly.
          </p>
        </div>

        {/* Errors Display */}
        {(loginError || phoneErrors.phone || otpErrors.otp) && (
          <div 
            style={{ 
              background: 'var(--bal-owe-bg)', 
              border: '1px solid var(--bal-owe-border)', 
              color: 'var(--bal-owe-text)',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'left',
              marginBottom: '20px'
            }}
          >
            {loginError || phoneErrors.phone?.message || otpErrors.otp?.message}
          </div>
        )}

        {step === 'phone' ? (
          /* Step 1: Phone Submission */
          <form onSubmit={handlePhoneSubmit(onPhoneSubmit)}>
            <div className="field-group" style={{ textAlign: 'left' }}>
              <label className="field-label" htmlFor="phone-input">Phone number</label>
              <div style={{ position: 'relative' }}>
                <Smartphone 
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
                  id="phone-input"
                  className="field-input"
                  placeholder="Enter 10-digit mobile number"
                  type="tel"
                  style={{ paddingLeft: '38px' }}
                  {...registerPhone('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Please enter a valid 10-digit mobile number'
                    }
                  })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="cta" 
              style={{ position: 'static', width: '100%', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send OTP →'}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-main)', fontWeight: 600 }}>
                Verifying {tempPhone}
              </p>
              <button 
                type="button" 
                onClick={() => setStep('phone')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--primary)', 
                  fontSize: '12px', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  padding: '2px 0',
                  marginTop: '2px'
                }}
              >
                Change number
              </button>
            </div>

            <div className="field-group" style={{ textAlign: 'left' }}>
              <label className="field-label" htmlFor="otp-input">Enter OTP</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck 
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
                  id="otp-input"
                  className="field-input"
                  placeholder="Enter OTP (e.g. 123456)"
                  type="text"
                  maxLength={6}
                  style={{ paddingLeft: '38px', letterSpacing: '2px', fontWeight: 'bold' }}
                  {...registerOtp('otp', {
                    required: 'OTP code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'OTP must be a 6-digit number'
                    }
                  })}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="cta" 
              style={{ position: 'static', width: '100%', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP & Log In →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

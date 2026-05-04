import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

export default function Login({ onLogin, onSwitchToSignup }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate a successful login immediately as per previous discussions
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side: Hero Image & Text */}
        <div className="login-left">
          <div className="login-image-bg"></div>
          <div className="login-gradient-overlay"></div>
          <div className="login-hero-text">
            <h1>Welcome Back</h1>
            <p>Your contribution helps us rescue surplus food and build a sustainable community. Log in to continue your impact.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="login-right">
          <div className="login-form-card">
            
            <div className="login-header">
              <h2>Sign In</h2>
              <p>Enter your details to access your account</p>
            </div>
            
            <form className="login-form" onSubmit={handleLogin}>
              
              <div className="form-group">
                <label>EMAIL ADDRESS</label>
                <div className="input-wrapper">
                  <input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label>PASSWORD</label>
                  <a href="#" className="forgot-password">Forgot Password?</a>
                </div>
                <div className="input-wrapper password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="22" height="15" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login-submit">Login</button>
            </form>

            <div className="login-divider">
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </div>

            <button type="button" className="btn-create-account" onClick={onSwitchToSignup}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#191C1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              <span>Create Account</span>
            </button>

            <div className="login-badges">
              <div className="login-badge badge-green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0F5238" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 014 13c0-3.5 3-7 8-11 5 4 8 7.5 8 11a7 7 0 01-7 7z"/></svg>
                <span>1.2M kg Saved</span>
              </div>
              <div className="login-badge badge-brown">
                <svg width="14" height="13" viewBox="0 0 24 24" fill="none" stroke="#A04100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                <span>5k Rescuers</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import './Signup.css';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    street: '',
    residentialName: '',
    barangay: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const [allergens, setAllergens] = useState({
    gluten: false,
    dairy: false,
    nuts: false,
    soy: false,
    eggs: false,
    shellfish: false,
    vegan: false,
    siAno: false
  });

  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAllergenChange = (name: keyof typeof allergens) => {
    setAllergens(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!waiverAgreed) {
      setError('Please agree to the Buyer Waiver and Terms of Service');
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);

    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        residentialName: formData.residentialName,
        barangay: formData.barangay,
        city: formData.city,
        becomeSeller: false,
      };

      const response = await fetch('http://localhost:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful signup, auto-login the user
        // For now, just switch to login view
        alert('Account created successfully! Please log in.');
        onSwitchToLogin();
      } else {
        setError(data.detail || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        
        <div className="signup-header">
          <h1>Join the Food Rescue</h1>
          <p>Create your account to start saving surplus food today.</p>
        </div>

        <div className="signup-content">
          {/* Left Column: Forms */}
          <div className="signup-left">
            {error && <div className="error-message" style={{color: '#D32F2F', marginBottom: '20px', padding: '12px', backgroundColor: '#FFEBEE', borderRadius: '8px'}}>{error}</div>}
            <form id="signup-form" onSubmit={handleSignup}>
              
              {/* Personal Information */}
              <div className="signup-card">
                <h2>Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name</label>
                    <div className="input-wrapper">
                      <input type="text" name="firstName" placeholder="Dana Jill" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <div className="input-wrapper">
                      <input type="text" name="lastName" placeholder="Santiago" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className='form-group'>
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <input type="tel" name="phoneNumber" placeholder="0981 xxx xxxx" value={formData.phoneNumber} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <input type="email" name="email" placeholder="danajill@example.com" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  
                    <label>Delivery Address</label>
                    <div className='form-group full-width'>
                      <label>Street</label>
                      <div className='input-wrapper'>
                        <input type="text" name="street" placeholder="Diamond St." value={formData.street} onChange={handleInputChange} required/>
                      </div>
                    </div>
                    <div className='form-group'>
                      <label>Residential Name</label>
                      <div className='input-wrapper'>
                        <input type="text" name="residentialName" placeholder="Pearl Village" value={formData.residentialName} onChange={handleInputChange} required/>
                      </div>
                    </div>
                    <div className='form-group'>
                      <label>Barangay</label>
                      <div className='input-wrapper'>
                        <input type="text" name="barangay" placeholder="Mintal" value={formData.barangay} onChange={handleInputChange} required/>
                      </div>
                    </div>
                    <div className='form-group full-width'>
                      <label>City</label>
                      <div className='input-wrapper'>
                        <input type="text" name="city" placeholder="Davao City" value={formData.city} onChange={handleInputChange} required/>
                      </div>
                    </div>
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Allergen Selection */}
              <div className="signup-card">
                <h2>Buyer Allergen Selection</h2>
                <p className="card-subtitle">Please select any food allergies or dietary requirements you have. This helps us flag items in your local marketplace.</p>
                <div className="allergen-grid">
                  {Object.keys(allergens).map((key) => {
                    const typedKey = key as keyof typeof allergens;
                    const label = key === 'siAno' ? 'Si Ano' : key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <label key={key} className="allergen-checkbox">
                        <input 
                          type="checkbox" 
                          checked={allergens[typedKey]}
                          onChange={() => handleAllergenChange(typedKey)} 
                        />
                        <span className="checkbox-custom"></span>
                        <span className="allergen-label">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Buyer Waiver */}
              <div className="signup-card">
                <h2>Buyer Waiver</h2>
                <div className="waiver-box">
                  <p>By registering for Sureplus, I acknowledge that the food items listed are surplus and may be near their "best before" date. I understand that Sureplus acts as a marketplace and is not the producer of the food. I agree to inspect all items upon receipt and consume them responsibly according to safety guidelines provided by the seller and local health authorities. I release Sureplus from any liability related to the consumption of food obtained through this platform.</p>
                </div>
                <label className="waiver-checkbox">
                  <input 
                    type="checkbox" 
                    checked={waiverAgreed}
                    onChange={(e) => setWaiverAgreed(e.target.checked)}
                    required
                  />
                  <span className="checkbox-custom"></span>
                  <span className="waiver-label">I have read and agree to the Buyer Waiver and the Terms of Service.</span>
                </label>
              </div>

            </form>
          </div>

          {/* Right Column: Sidebar */}
          <div className="signup-right">
            
            <div className="signup-notes-card">
              <h2>Sign Up Notes</h2>
              <ul className="notes-list">
                <li>
                  <span className="note-number">1</span>
                  <p>Accurate address is vital for showing you the most relevant local surplus food options in your neighborhood.</p>
                </li>
                <li>
                  <span className="note-number">2</span>
                  <p>Defining your allergens ensures that our "Rescue Radar" automatically highlights items that are safe for you to consume.</p>
                </li>
                <li>
                  <span className="note-number">3</span>
                  <p>Your phone number is only used for transactional updates and urgent notifications regarding your food rescues.</p>
                </li>
              </ul>
            </div>

            <div className="signup-impact-card">
              <div className="impact-image" style={{ backgroundImage: 'url(https://placehold.co/400x300/2d6a4f/ffffff?text=Veggies)' }}>
                <div className="impact-overlay">
                  <p>By joining, you've helped save over 4,000 lbs of food this month!</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="signup-footer">
            {loading ? 'Creating Account...' : 'Create Account'}
          
          <button type="submit" form="signup-form" className="btn-create-account-main" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
          <p className="login-prompt">
            Already have an account? <button type="button" className="btn-link" onClick={onSwitchToLogin}>Log In</button>
          </p>
        </div>

      </div>
    </div>
  );
}

import { useState, type ChangeEvent, type FormEvent } from 'react';
import './Signup.css';
import type { User } from '../types/user';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onSignup, onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    deliveryAddress: '',
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
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAllergenChange = (name: keyof typeof allergens) => {
    setAllergens(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!waiverAgreed) {
      alert("Please agree to the Buyer Waiver and Terms of Service.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';

      const signupData = {
        firstName,
        lastName,
        emailAddress: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        street: formData.deliveryAddress,
        residentialName: formData.deliveryAddress, // fallback
        barangay: 'Not Specified',
        city: 'Not Specified',
        becomeSeller: false
      };

      // 1. Signup
      const res = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Signup failed");
      }

      // 2. Auto-login
      const loginRes = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress: formData.email, password: formData.password }),
      });

      if (!loginRes.ok) {
        throw new Error("Signup succeeded but auto-login failed. Please log in manually.");
      }

      const loginData = await loginRes.json();
      localStorage.setItem("token", loginData.access_token);
      localStorage.setItem("user", JSON.stringify(loginData.user));
      onSignup(loginData.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
            <form id="signup-form" onSubmit={handleSignup}>
              
              {/* Personal Information */}
              <div className="signup-card">
                <h2>Personal Information</h2>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <input type="text" name="fullName" placeholder="Dana Jill" value={formData.fullName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <input type="tel" name="phoneNumber" placeholder="+63 981 xxx xxxx" value={formData.phoneNumber} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                      <input type="email" name="email" placeholder="imissu@example.com" value={formData.email} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Delivery Address</label>
                    <div className="input-wrapper address-wrapper">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#707973" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <input type="text" name="deliveryAddress" placeholder="Start typing your address..." value={formData.deliveryAddress} onChange={handleInputChange} required />
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
          <button type="submit" form="signup-form" className="btn-create-account-main" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
          <p className="login-prompt">
            Already have an account? <button type="button" className="btn-link" onClick={onSwitchToLogin}>Log In</button>
          </p>
        </div>

      </div>
    </div>
  );
}

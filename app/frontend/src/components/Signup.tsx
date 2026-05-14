import React, { useEffect, useState } from 'react';
import axios from 'axios';

import api from '../api/apis';
import './Signup.css';

interface SignupProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

interface Allergen {
  allergenID: string;
  name: string;
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

  // const [allergens, setAllergens] = useState({
  //   milk: false,
  //   eggs: false,
  //   seafood: false,
  //   nuts: false,
  //   wheat: false,
  //   soy: false,
  //   sesame: false
  // });

  const [allergenList, setAllergenList] = useState<Allergen[]>([]);
  const [allergens, setAllergens] = useState<Record<string, boolean>>({});

  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [becomeSeller, setBecomeSeller] = useState(false);
  const [sellerFormData, setSellerFormData] = useState({ sellerType: '', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllergens = async () => {
      try {
        const response = await api.get('/safety/allergens');
        const data = response.data;
        if (Array.isArray(data)) {
          setAllergenList(data);
          const allergenMap: Record<string, boolean> = {};
          data.forEach((allergen: Allergen) => {
            allergenMap[allergen.allergenID] = false;
          });
          setAllergens(allergenMap);
        }
      } catch (error) {
        console.error('Failed to fetch allergens:', error);
      }
    };
    fetchAllergens();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAllergenChange = (allergenId: string) => {
    setAllergens(prev => ({ ...prev, [allergenId]: !prev[allergenId] }));
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

    if (becomeSeller) {
      if (!sellerFormData.sellerType) {
        setError('Please select a seller type.');
        return;
      }
      if (!sellerFormData.companyName.trim()) {
        setError('Please enter your company / trade name.');
        return;
      }
    }

    setLoading(true);

    try {
      const signupData: Record<string, any> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailAddress: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        residentialName: formData.residentialName,
        barangay: formData.barangay,
        city: formData.city,
        becomeSeller,
      };
      if (becomeSeller) {
        signupData.sellerInfo = {
          sellerType: sellerFormData.sellerType,
          companyName: sellerFormData.companyName,
        };
      }

      // Sign up user
      await api.post('/auth/signup', signupData);

      // Auto login after signup
      const loginFormData = new URLSearchParams();
      loginFormData.append('username', formData.email);
      loginFormData.append('password', formData.password);

      const loginResponse = await api.post('/auth/login', loginFormData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
      });

      const loginData = loginResponse.data;

      localStorage.setItem('token', loginData.access_token);
      localStorage.setItem('token_type', loginData.token_type);
      
      // Save selected allergens
      const selectedAllergenIds = Object.keys(allergens).filter(id => allergens[id]);
      for (const allergenId of selectedAllergenIds) {
        try {
          await api.post(`/safety/me/allergies/${allergenId}`, undefined, {
            headers: {
              'Authorization': `Bearer ${loginData.access_token}`
            },
          });
        } catch {
          console.warn(`Failed to save allergen ${allergenId}, but account was created.`);
        }
      }

      onSignup();
    } catch (err) {
      const detail = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      setError(detail || 'Connection error. Please try again.');
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
                  {allergenList.map((allergen) => (
                      <label key={allergen.allergenID} className="allergen-checkbox">
                        <input 
                          type="checkbox" 
                          checked={allergens[allergen.allergenID] || false}
                          onChange={() => handleAllergenChange(allergen.allergenID)} 
                        />
                        <span className="checkbox-custom"></span>
                        <span className="allergen-label">{allergen.name.charAt(0).toUpperCase() + allergen.name.slice(1)}</span>
                      </label>
                  ))}
                </div>
                {allergenList.length === 0 && (
                  <p style={{ color: '#999', fontSize: '14px' }}>Loading allergens...</p>
                )}
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

              {/* Become a Seller */}
              <div className="signup-card">
                <div className="seller-toggle-row">
                  <div>
                    <h2 style={{ margin: 0 }}>Become a Seller</h2>
                    <p className="card-subtitle" style={{ margin: '8px 0 0 0' }}>List your surplus food items and help reduce food waste in your community.</p>
                  </div>
                  <button
                    type="button"
                    className={`signup-toggle ${becomeSeller ? 'signup-toggle--on' : ''}`}
                    onClick={() => setBecomeSeller(prev => !prev)}
                    aria-pressed={becomeSeller}
                  >
                    <span className="signup-toggle-knob" />
                  </button>
                </div>

                <div className={`seller-fields ${becomeSeller ? 'seller-fields--visible' : ''}`}>
                  <div className="form-grid" style={{ marginTop: '24px' }}>
                    <div className="form-group">
                      <label>Seller Type <span className="field-required">*</span></label>
                      <div className="input-wrapper select-input-wrapper">
                        <select
                          value={sellerFormData.sellerType}
                          onChange={(e) => setSellerFormData(prev => ({ ...prev, sellerType: e.target.value }))}
                          tabIndex={becomeSeller ? 0 : -1}
                        >
                          <option value="">Select type...</option>
                          <option value="individual">Individual</option>
                          <option value="business">Business</option>
                          <option value="distributor">Distributor</option>
                          <option value="restaurant">Restaurant</option>
                          <option value="bakery">Bakery</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Company / Trade Name <span className="field-required">*</span></label>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder="e.g. Harvest Bakery"
                          value={sellerFormData.companyName}
                          onChange={(e) => setSellerFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          tabIndex={becomeSeller ? 0 : -1}
                        />
                      </div>
                    </div>
                  </div>
                </div>
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

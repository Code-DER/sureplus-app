import { useState } from 'react'
import ListingsFeed from './components/ListingsFeed'
import SellerDashboard from './components/SellerDashboard'
import CharityDashboard from './components/CharityDashboard'
import AdminApplicationReview from './components/AdminApplicationReview'
import Login from './components/Login'
import Signup from './components/Signup'
import type { User } from './types/user'
import './index.css'

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<'buyer' | 'seller' | 'charity' | 'admin'>(
    user?.role === 'admin' ? 'admin' : user?.role === 'seller' ? 'seller' : user?.role === 'charity' ? 'charity' : 'buyer'
  );

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setIsAuthenticated(true);
    setView(
      loggedUser.role === 'admin' ? 'admin' :
      loggedUser.role === 'seller' ? 'seller' : 
      loggedUser.role === 'charity' ? 'charity' : 
      'buyer'
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setView('buyer');
  };

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <Signup 
          onSignup={handleLogin} 
          onSwitchToLogin={() => setAuthView('login')} 
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }


  if (view === 'seller' && user) {
    return <SellerDashboard onSwitchRole={() => setView('buyer')} />
  }

  if (view === 'charity' && user) {
    return <CharityDashboard user={user} onSwitchRole={() => setView('buyer')} />
  }

  if (view === 'admin' && user) {
    return <AdminApplicationReview />
  }

  return (
    <>
      <ListingsFeed user={user} />
      {/* Temporary developer button to toggle views since accounts are unified */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleLogout}
          style={{
            background: '#A04100', color: 'white', border: 'none', 
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          Logout
        </button>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setView('admin')}
            style={{
              background: '#0F5238', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Admin Panel
          </button>
        )}
        {user?.role === 'charity' && (
          <button 
            onClick={() => setView('charity')}
            style={{
              background: '#0F5238', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            View Charity Dashboard
          </button>
        )}
        <button 
          onClick={() => setView('seller')}
          style={{
            background: '#0F5238', color: 'white', border: 'none', 
            padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
            fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          View as Seller
        </button>
      </div>
    </>
  )
}

export default App

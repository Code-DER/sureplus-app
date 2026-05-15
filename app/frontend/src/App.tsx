import { useState } from 'react'
import ListingsFeed from './components/ListingsFeed'
import SellerDashboard from './components/SellerDashboard'
import AdminDashboard from './components/AdminDashboard'
import CharityDashboard from './components/CharityDashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import './index.css'
import { jwtDecode, type JwtPayload } from 'jwt-decode'

interface SureplusJwtPayload extends JwtPayload {
  userID: string;
  role: string;
}

const getAuthUser = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<SureplusJwtPayload>(token);
    return decoded;
  } catch {
    return null;
  }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'buyer' | 'seller' | 'admin' | 'charity'>('buyer')
  // const [message, setMessage] = useState("");

  // useEffect(() => {
  //   fetch("http://localhost:8000/")
  //   .then(res => res.json())
  //   .then(data => setMessage(data.message));
  // }, []);

  const user = getAuthUser();
  const isSeller = user?.role === 'seller';
  const isCharity = user?.role === 'charity';

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return (
        <Signup 
          onSignup={() => setIsAuthenticated(true)} 
          onSwitchToLogin={() => setAuthView('login')} 
        />
      );
    }
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  if (view === 'seller' && isSeller) {
    return <SellerDashboard onSwitchRole={() => setView('buyer')} />
  }

  if (view === 'admin') {
    return <AdminDashboard onSwitchRole={() => setView('buyer')} />
  }

  if (view === 'charity' && isCharity) {
    return <CharityDashboard onSwitchRole={() => setView('buyer')} />
  }

  return (
    <>
      <ListingsFeed />
      {/* Temporary developer button to toggle views since accounts are unified */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {isSeller && (
          <button 
            onClick={() => setView('seller')}
            style={{
              background: '#66B018', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Open Seller Dashboard
          </button>
        )}
        {isCharity && (
          <button 
            onClick={() => setView('charity')}
            style={{
              background: '#66B018', color: 'white', border: 'none', 
              padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            Open Charity Dashboard
          </button>
        )}
      </div>
    </>
  )
}

export default App

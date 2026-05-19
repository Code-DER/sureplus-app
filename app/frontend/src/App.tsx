import { useState } from 'react'
import ListingsFeed from './components/ListingsFeed'
import SellerDashboard from './components/SellerDashboard'
import AdminDashboard from './components/AdminDashboard'
import CharityDashboard from './components/CharityDashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import './index.css'
import { getAuthUser } from './api/apis'

function App() {
  // Authentication Variables
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // For Dashboard View of the User
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')

  // View Options
  const [view, setView] = useState<'buyer' | 'seller' | 'admin' | 'charity'>(() => {
    const u = getAuthUser();
    if (u?.role === 'charity') return 'charity';
    if (u?.role === 'admin') return 'admin';
    if (u?.role === 'seller') return 'seller';
    return 'buyer';
  });

  // Handle Login depending on user
  const handleLogin = () => {
    setIsAuthenticated(true);
    const u = getAuthUser();
    if (u?.role === 'charity') setView('charity');
    else if (u?.role === 'admin') setView('admin');
    else if (u?.role === 'seller') setView('seller');
    else setView('buyer');
  };

  const user = getAuthUser();
  const isSeller = user?.role === 'seller';
  const isCharity = user?.role === 'charity';

  if (!isAuthenticated) {
    // Go to signup page if user wants to sign up
    if (authView === 'signup') {
      return (
        <Signup 
          onSignup={handleLogin} 
          onSwitchToLogin={() => setAuthView('login')} 
        />
      );
    }
    // Go to login page if user is not authenticated
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToSignup={() => setAuthView('signup')}
      />
    );
  }

  // Go to seller dashboard if user is a seller
  if (view === 'seller' && isSeller) {
    return <SellerDashboard onSwitchRole={() => setView('buyer')} />
  }

  // Go to admin dashboard if user is an admin
  if (view === 'admin') {
    return <AdminDashboard onSwitchRole={() => setView('buyer')} />
  }

  // Go to charity dashboard if user is a charity
  if (view === 'charity' && isCharity) {
    return <CharityDashboard />
  }

  // Go to listings feed if user is a buyer
  return (
    <>
      <ListingsFeed
        isSeller={isSeller}
        onOpenSellerDashboard={() => setView('seller')}
      />
    </>
  )
}

export default App

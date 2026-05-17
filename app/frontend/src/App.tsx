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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const [authView, setAuthView] = useState<'login' | 'signup'>('login')

  const [view, setView] = useState<'buyer' | 'seller' | 'admin' | 'charity'>(() => {
    const u = getAuthUser();
    if (u?.role === 'charity') return 'charity';
    if (u?.role === 'admin') return 'admin';
    if (u?.role === 'seller') return 'seller';
    return 'buyer';
  });

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
      <ListingsFeed
        isSeller={isSeller}
        onOpenSellerDashboard={() => setView('seller')}
      />
    </>
  )
}

export default App

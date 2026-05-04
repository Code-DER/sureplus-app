import { useState } from 'react'
import ListingsFeed from './components/ListingsFeed'
import SellerDashboard from './components/SellerDashboard'
import Login from './components/Login'
import Signup from './components/Signup'
import './index.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')
  const [view, setView] = useState<'buyer' | 'seller'>('buyer')

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

  if (view === 'seller') {
    return <SellerDashboard onSwitchRole={() => setView('buyer')} />
  }

  return (
    <>
      <ListingsFeed />
      {/* Temporary developer button to toggle views since accounts are unified */}
      <button 
        onClick={() => setView('seller')}
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 9999, 
          background: '#0F5238', color: 'white', border: 'none', 
          padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
          fontFamily: 'Work Sans, sans-serif', fontWeight: 600, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      >
        View as Seller
      </button>
    </>
  )
}

export default App

import { useState } from 'react'
import ListingsFeed from './components/ListingsFeed'
import SellerDashboard from './components/SellerDashboard'
import RoleSelector from './components/RoleSelector'
import './index.css'

function App() {
  const [role, setRole] = useState<'none' | 'buyer' | 'seller'>('none')

  if (role === 'none') {
    return <RoleSelector onSelect={(r) => setRole(r)} />
  }

  if (role === 'seller') {
    return <SellerDashboard onSwitchRole={() => setRole('none')} />
  }

  return <ListingsFeed />
}

export default App

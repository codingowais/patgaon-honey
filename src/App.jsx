import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Places from './pages/Places.jsx'
import About from './pages/About.jsx'
import Login from './pages/Login.jsx'
import Cart from './pages/Cart.jsx'
import Admin from './pages/Admin.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Orders from './pages/Orders.jsx'

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/places" element={<Places />} />
          <Route path="/about" element={<About />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/orders" element={<Orders />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/Home';
import { CheckoutPageWithStripe } from './pages/Checkout';
import { ShopPage } from './pages/Shop';
import { ProductDetailPage } from './pages/ProductDetail';
import { CollectionsPage } from './pages/Collections';
import { CategoriesPage } from './pages/Categories';
import { AccountPage } from './pages/Account';
import { WishlistPage } from './pages/Wishlist';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { OurStoryPage } from './pages/OurStory';

export default function App() {
  const { items, totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header 
          onCartToggle={() => setIsCartOpen(true)} 
          cartCount={totalItems} 
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/about" element={<OurStoryPage />} />
            <Route path="/checkout" element={<CheckoutPageWithStripe />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <Footer />

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={items}
        />
      </div>
    </HashRouter>
  );
}

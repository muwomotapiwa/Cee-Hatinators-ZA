import { useState } from 'react';
import { Search, Heart, ShoppingBag, X, LogIn, LogOut, Menu } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';

interface HeaderProps {
  onCartToggle: () => void;
  cartCount: number;
}

export function Header({ onCartToggle, cartCount }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    // Pass current path as redirect so user returns here after signing in
    const redirect = location.pathname !== '/login' && location.pathname !== '/register'
      ? location.pathname
      : '/account';
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  const handleLogout = () => signOut(auth);

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Categories', to: '/categories' },
    { label: 'Collections', to: '/collections' },
  ];

  return (
    <header className="bg-offwhite border-b border-silver sticky top-0 z-[100] backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -ml-2 text-charcoal hover:text-crimson transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={20} />
        </button>

        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map(link => (
            <Link key={link.label} to={link.to} className="nav-link">{link.label}</Link>
          ))}
        </nav>
        
        <div className="flex justify-center">
          <Link to="/" aria-label="Cee Hatinators home" className="no-underline">
            <BrandMark />
          </Link>
        </div>
        
        <div className="flex gap-2 md:gap-6 items-center justify-end">
          <div className="relative flex items-center">
            <div className={`overflow-hidden transition-all duration-300 flex items-center absolute right-full ${isSearchOpen ? 'w-48 md:w-64 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-b border-crimson py-1 text-xs outline-none font-sans"
              />
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="ml-2 text-mid-gray hover:text-crimson"
              >
                <X size={14} />
              </button>
            </div>
            <button 
              className="icon-btn border-none md:border" 
              title="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={16} />
            </button>
          </div>
          <Link to="/wishlist" className="hidden md:flex icon-btn" title="Wishlist"><Heart size={16} /></Link>
          
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="My Account">
                  {user.photoURL
                    ? <img src={user.photoURL} alt={user.displayName || 'Account'} className="w-8 h-8 rounded-full border border-silver" />
                    : <span className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center text-[12px] font-semibold">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                  }
                </Link>
                <button className="icon-btn" title="Sign Out" onClick={handleLogout}><LogOut size={16} /></button>
              </div>
            ) : (
              <button className="icon-btn" title="Sign In" onClick={handleLogin}><LogIn size={16} /></button>
            )}
          </div>

          <button 
            className="bg-crimson border-crimson text-white px-3 md:px-[18px] py-1.5 md:py-2 h-auto flex items-center justify-center cursor-pointer transition-all duration-200 text-[9px] md:text-[10px] tracking-[1px] md:tracking-[2px] uppercase font-sans hover:bg-crimson-dark"
            onClick={onCartToggle}
          >
            <span className="hidden xs:inline mr-1">Bag</span>
            <ShoppingBag size={14} className="xs:hidden" />
            <span className="inline-flex items-center justify-center bg-gold text-crimson-dark w-4 h-4 md:w-[18px] md:h-[18px] text-[9px] md:text-[10px] font-semibold ml-1 md:ml-1.5">{cartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-crimson-dark/60 backdrop-blur-md z-[200] md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div 
        className={`fixed top-0 left-0 bottom-0 w-64 bg-offwhite z-[201] md:hidden transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-silver flex justify-between items-center">
          <span className="text-[10px] tracking-[2px] uppercase font-semibold text-charcoal">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav className="p-6 flex flex-col gap-6">
          {navLinks.map(link => (
            <Link 
              key={link.label} 
              to={link.to} 
              className="text-sm tracking-[2px] uppercase text-charcoal hover:text-crimson"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-silver" />
          {user ? (
            <>
              <div className="flex items-center gap-3">
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.displayName || 'Account'} className="w-8 h-8 rounded-full" />
                  : <span className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center text-[12px] font-semibold">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                }
                <span className="text-xs uppercase tracking-widest">{user.displayName || user.email}</span>
              </div>
              <Link to="/account" className="text-left text-xs uppercase tracking-[2px] text-charcoal hover:text-crimson" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
              <button 
                className="text-left text-xs uppercase tracking-[2px] text-crimson"
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button 
                className="text-left text-xs uppercase tracking-[2px] text-charcoal"
                onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }}
              >
                Sign In
              </button>
              <Link to="/register" className="text-left text-xs uppercase tracking-[2px] text-charcoal hover:text-crimson" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </nav>
      </div>

      <style>{`
        .nav-link {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--color-charcoal);
          text-decoration: none;
          font-weight: 400;
          transition: color 0.2s;
          position: relative;
        }
        .nav-link:hover {
          color: var(--color-crimson);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-crimson);
          transform: scaleX(0);
          transition: transform 0.25s;
        }
        .nav-link:hover::after {
          transform: scaleX(1);
        }
        .icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-silver);
          background: transparent;
          cursor: pointer;
          color: var(--color-charcoal);
          transition: all 0.2s;
        }
        .icon-btn:hover {
          border-color: var(--color-crimson);
          color: var(--color-crimson);
        }
      `}</style>
    </header>
  );
}

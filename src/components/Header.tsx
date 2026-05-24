import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Search, Heart, ShoppingBag, X, LogIn, LogOut, Menu } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { SafeImage } from './SafeImage';

interface HeaderProps {
  onCartToggle: () => void;
  cartCount: number;
}

export function Header({ onCartToggle, cartCount }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, isSuperUser, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleLogin = () => {
    // Pass current path as redirect so user returns here after signing in
    const redirect = location.pathname !== '/login' && location.pathname !== '/register'
      ? location.pathname
      : '/account';
    navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Categories', to: '/categories' },
    { label: 'Collections', to: '/collections' },
  ];

  const toggleSearch = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen((open) => !open);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      navigate('/shop');
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-white border-b border-silver sticky top-0 z-[100] shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
        
        {/* Mobile Menu Toggle */}
        <button 
          className={`md:hidden p-2 -ml-2 rounded-full transition-colors ${isMobileMenuOpen ? 'bg-crimson text-gold' : 'text-charcoal hover:text-crimson'}`}
          onClick={() => {
            closeSearch();
            setIsMobileMenuOpen(true);
          }}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden md:flex gap-8 items-center">
          {navLinks.map(link => (
            <Link key={link.label} to={link.to} className="nav-link">{link.label}</Link>
          ))}
          {isSuperUser && (
            <Link to="/portal" className="nav-link text-crimson">
              Portal
            </Link>
          )}
        </nav>
        
        <div className="flex justify-center">
          <Link to="/" aria-label="Cee Hatinators home" className="no-underline">
            <BrandMark />
          </Link>
        </div>
        
        <div className="flex gap-2 md:gap-6 items-center justify-end">
          <div className="flex items-center">
            <button 
              className={`icon-btn border-none md:border ${isSearchOpen ? 'border-crimson text-crimson' : ''}`}
              title="Search"
              aria-label="Search"
              onClick={toggleSearch}
            >
              <Search size={16} />
            </button>
          </div>
          <Link to="/wishlist" className="hidden md:flex icon-btn" title="Wishlist"><Heart size={16} /></Link>
          
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0" title="My Account">
                  {user.photoURL
                      ? <SafeImage src={user.photoURL} alt={user.displayName || 'Account'} className="w-8 h-8 rounded-full border border-silver object-cover" />
                      : <span className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center text-[12px] font-semibold">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                    }
                    <span className="hidden xl:block max-w-[120px] truncate text-[10px] tracking-[1.5px] uppercase text-dark">
                      {user.displayName || user.email}
                    </span>
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

      <div
        className={`overflow-hidden border-t border-silver bg-white transition-all duration-300 ${
          isSearchOpen ? 'max-h-36 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-3 md:py-4">
          <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[2px] text-mid-gray">
            <span>Home / Search</span>
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[2px] text-charcoal hover:text-crimson"
              onClick={() => {
                closeSearch();
                setSearchQuery('');
              }}
            >
              <X size={13} /> Close
            </button>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="mt-3 flex items-center gap-3 border border-crimson bg-white px-3 py-3 md:px-4"
          >
            <Search size={16} className="shrink-0 text-crimson" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hats, fascinators, collections..."
              className="min-w-0 flex-1 bg-transparent text-[13px] text-dark outline-none placeholder:text-mid-gray"
            />
            <button
              type="submit"
              className="shrink-0 text-[10px] uppercase tracking-[2px] text-crimson hover:text-dark"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-crimson-dark/70 z-[300] md:hidden backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div 
        className={`fixed top-0 left-0 bottom-0 w-full sm:w-[400px] bg-white z-[400] md:hidden flex flex-col border-r border-silver shadow-[8px_0_32px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 px-7 border-b border-silver bg-white flex justify-between items-center">
          <span className="text-[11px] tracking-[3px] uppercase text-dark font-medium">Menu</span>
          <button className="bg-transparent border-none text-xl cursor-pointer text-charcoal w-8 h-8 flex items-center justify-center hover:text-crimson" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-7 py-5 bg-white flex flex-col gap-6">
          {navLinks.map(link => (
            <Link 
              key={link.label} 
              to={link.to} 
              className="text-sm tracking-[2px] uppercase text-dark font-medium hover:text-crimson"
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
                  ? <SafeImage src={user.photoURL} alt={user.displayName || 'Account'} className="w-8 h-8 rounded-full object-cover" />
                  : <span className="w-8 h-8 rounded-full bg-crimson text-white flex items-center justify-center text-[12px] font-semibold">{(user.displayName || user.email || 'U')[0].toUpperCase()}</span>
                }
                <span className="text-xs uppercase tracking-widest text-dark">{user.displayName || user.email}</span>
              </div>
              <Link to="/account" className="text-left text-xs uppercase tracking-[2px] text-dark font-medium hover:text-crimson" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
              {isSuperUser && (
                <Link to="/portal" className="text-left text-xs uppercase tracking-[2px] text-crimson font-medium hover:text-dark" onClick={() => setIsMobileMenuOpen(false)}>
                  Portal
                </Link>
              )}
              <button 
                className="text-left text-xs uppercase tracking-[2px] text-dark font-medium hover:text-crimson"
                onClick={() => { void handleLogout(); setIsMobileMenuOpen(false); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button 
                className="text-left text-xs uppercase tracking-[2px] text-dark font-medium hover:text-crimson"
                onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }}
              >
                Sign In
              </button>
              <Link to="/register" className="text-left text-xs uppercase tracking-[2px] text-dark font-medium hover:text-crimson" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
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

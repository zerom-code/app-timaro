import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User as UserIcon, History, LogOut, Settings as SettingsIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems } = useCart();
  const { user, loading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const toggleMenu = () => setIsMenuOpen(o => !o);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
      <header className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="ТиМаРо" className="w-10 h-10 rounded-full object-cover mr-2 border border-gray-100 shadow-sm" />
            <span className="font-heading font-bold text-xl md:text-2xl text-text">Шаурма ТиМаРо</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium text-text-muted hover:text-primary transition-colors">Головна</Link>
            <Link to="/menu" className="font-medium text-text-muted hover:text-primary transition-colors">Меню</Link>
            <Link to="/promotions" className="font-medium text-text-muted hover:text-primary transition-colors">Акції</Link>
            <Link to="/about" className="font-medium text-text-muted hover:text-primary transition-colors">Про нас</Link>
            <Link to="/contacts" className="font-medium text-text-muted hover:text-primary transition-colors">Контакти</Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Shopping Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {loading ? (
                <div>Loading...</div>
            ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <UserIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {isAdmin && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/adminpanel" className="flex items-center space-x-2 w-full text-primary font-bold">
                              <Shield className="h-4 w-4" />
                              <span>Адмінпанель</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2 w-full">
                        <UserIcon className="h-4 w-4" />
                        <span>Особистий кабінет</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/order-history" className="flex items-center space-x-2 w-full">
                        <History className="h-4 w-4" />
                        <span>Історія</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center space-x-2 w-full">
                        <SettingsIcon className="h-4 w-4" />
                        <span>Налаштування</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout} className="flex items-center space-x-2">
                      <LogOut className="h-4 w-4" />
                      <span>Вийти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" size="icon">
                      <UserIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth/login">
                    <Button variant="outline" size="sm">Увійти</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button className="bg-primary hover:bg-primary-light" size="sm">Реєстрація</Button>
                  </Link>
                </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center space-x-4">
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 animate-fade-in bg-white shadow-lg border-x border-b border-gray-100 rounded-b-2xl max-h-[calc(100vh-100px)] overflow-y-auto z-50">
              <div className="flex flex-col space-y-1 p-4">
                <Link to="/" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Головна</Link>
                <Link to="/menu" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Меню</Link>
                <Link to="/promotions" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Акції</Link>
                <Link to="/settings" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Налаштування</Link>
                <Link to="/about" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Про нас</Link>
                <Link to="/contacts" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-text-muted hover:text-primary hover:bg-gray-50 rounded-xl transition-colors">Контакти</Link>
                <div className="h-px bg-gray-100 my-2 mx-4" />

                {user ? (
                    <>
                      {isAdmin && (
                          <Link to="/adminpanel" onClick={toggleMenu} className="px-4 py-2.5 flex items-center space-x-2 text-primary font-bold hover:bg-gray-50 rounded-xl transition-colors">
                            <Shield className="h-4 w-4" />
                            <span>Адмінпанель</span>
                          </Link>
                      )}
                      <Link to="/profile" onClick={toggleMenu} className="px-4 py-2.5 flex items-center space-x-2 hover:bg-gray-50 rounded-xl transition-colors text-text-muted">
                        <UserIcon className="h-4 w-4" />
                        <span>Профіль</span>
                      </Link>
                      <Link to="/order-history" onClick={toggleMenu} className="px-4 py-2.5 flex items-center space-x-2 hover:bg-gray-50 rounded-xl transition-colors text-text-muted">
                        <History className="h-4 w-4" />
                        <span>Історія</span>
                      </Link>
                      <button
                          onClick={() => { handleLogout(); toggleMenu(); }}
                          className="mx-2 mt-2 px-4 py-3 text-white bg-primary hover:bg-primary-dark font-bold rounded-xl text-center shadow-md shadow-primary/20 transition-all active:scale-95"
                      >
                        Вийти
                      </button>
                    </>
                ) : (
                    <>
                      <Link to="/auth/login" onClick={toggleMenu} className="px-4 py-2.5 font-medium text-primary hover:bg-gray-50 rounded-xl text-center transition-colors">Увійти</Link>
                      <Link to="/auth/register" onClick={toggleMenu} className="mx-2 mt-2 px-4 py-3 bg-primary text-white font-bold rounded-xl text-center shadow-md shadow-primary/20 transition-all active:scale-95">Реєстрація</Link>
                    </>
                )}
              </div>
            </div>
        )}
      </header>
  );
};

export default Header;

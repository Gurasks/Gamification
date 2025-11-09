import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, anonymousUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
    setShowDropdown(false);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    if (anonymousUser) {
      navigate('/name-entry');
    } else {
      toast.success('Funcionalidade em desenvolvimento!');
    }
    setShowDropdown(false);
  };

  const hideNavbarPaths = ['/login', '/register', '/name-entry'];

  if (hideNavbarPaths.includes(location.pathname) || !user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e Nome do App */}
          <div className="flex items-center">
            <button
              className="flex items-center cursor-pointer"
              onClick={handleHomeClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleHomeClick();
                }
              }}
              aria-label="Ir para página inicial"
              tabIndex={0}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <img
                  src="/controller.svg"
                  alt="Gamified Retro"
                  className="w-6 h-6 text-white"
                />
              </div>
              <span className="text-xl font-bold text-gray-800">
                Gamification
              </span>
            </button>
          </div>

          {/* Menu do Usuário */}
          <div className="flex items-center space-x-4">
            {/* Indicador de Usuário Anônimo */}
            {anonymousUser && (
              <span
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                aria-label="Modo convidado ativo"
              >
                Modo Convidado
              </span>
            )}

            {/* Dropdown do Usuário */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 transition-all duration-200 hover:bg-gray-100"
                aria-label="Menu do usuário"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-medium text-gray-700">
                      {user.displayName || 'Usuário'}
                    </p>
                    {user.email && (
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {anonymousUser ? 'Alterar Nome' : 'Meu Perfil'}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                    role="menuitem"
                    tabIndex={0}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para fechar dropdown ao clicar fora */}
      {showDropdown && (
        <button
          className="fixed inset-0 z-40 cursor-default focus:outline-none"
          onClick={() => setShowDropdown(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDropdown(false);
            }
          }}
          aria-label="Fechar menu"
          tabIndex={0}
        />
      )}
    </nav>
  );
};

export default Navbar;
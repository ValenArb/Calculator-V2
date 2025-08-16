import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calculator, FolderOpen, User, Copy, LogOut, Mail, Hash, Edit3, Menu, ChevronLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../../services/firebase/auth';
import { setUser } from '../../../store/slices/authSlice';

const MainSidebar = ({ defaultCollapsed = false, activeSection = 'projects' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      id: 'projects',
      name: 'Proyectos',
      icon: FolderOpen,
      path: '/dashboard'
    },
    {
      id: 'calculator', 
      name: 'Calculadora',
      icon: Calculator,
      path: '/calculator'
    },
    {
      id: 'error-codes',
      name: 'Códigos de Error',
      icon: AlertTriangle,
      path: '/dashboard'
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const copyUUID = async () => {
    if (!user?.uid) return;
    
    try {
      await navigator.clipboard.writeText(user.uid);
      toast.success('ID copiado al portapapeles');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar ID');
    }
  };

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  // Determine active section based on current path
  const getCurrentActiveSection = () => {
    if (location.pathname.startsWith('/project/')) {
      return 'projects';
    }
    if (location.pathname === '/calculator') {
      return 'calculator';
    }
    if (location.pathname === '/dashboard') {
      return activeSection || 'projects';
    }
    return activeSection;
  };

  const currentActiveSection = getCurrentActiveSection();

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm border-r flex flex-col h-screen transition-all duration-300 fixed left-0 top-0 z-40`}>
      {/* Toggle Button */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
        </button>
      </div>

      {/* User Information Section - Fixed at top */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {sidebarCollapsed ? (
            // Collapsed view - just photo
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold overflow-hidden">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={user.photoURL ? 'hidden' : 'text-xs'}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {user.displayName || 'Usuario'}
                </div>
              </div>
            </div>
          ) : (
            // Expanded view - full info
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold overflow-hidden">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span className={user.photoURL ? 'hidden' : ''}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || 'Usuario'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-500">ID:</span>
                  <span className="text-xs text-gray-600 font-mono flex-1 truncate">
                    {user.uid?.substring(0, 12)}...
                  </span>
                  <button
                    onClick={copyUUID}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                    title="Copiar ID completo"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Header */}
      {!sidebarCollapsed && (
        <div className="p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        </div>
      )}

      {/* Navigation Menu - Scrollable content */}
      <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActiveSection === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-left hover:bg-gray-100 transition-colors rounded-lg mb-2 ${
                  isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
              
              {/* Tooltip for collapsed mode */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout Button - Fixed at bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="relative group">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-left hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors rounded-lg`}
              title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
            >
              <LogOut className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} />
              {!sidebarCollapsed && <span>Cerrar Sesión</span>}
            </button>
            
            {/* Tooltip for collapsed mode */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Cerrar Sesión
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSidebar;
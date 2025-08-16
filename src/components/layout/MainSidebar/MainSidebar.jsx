import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calculator, FolderOpen, User, Copy, LogOut, Mail, Hash, Edit3, Menu, ChevronLeft, AlertTriangle, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../../services/firebase/auth';
import notificationsService from '../../../services/firebase/notifications';
import { setUser } from '../../../store/slices/authSlice';

const MainSidebar = ({ defaultCollapsed = false, activeSection = 'projects' }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  // Estado para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user?.email || !user?.uid) return;

    const unsubscribe = notificationsService.onNotificationsChange(
      user.email,
      (notificationsData) => {
        setNotifications(notificationsData);
        const unread = notificationsData.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      },
      user.uid
    );

    return () => unsubscribe();
  }, [user?.email, user?.uid]);

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

  // Manejar notificaciones
  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      await notificationsService.markAsRead(notification.id);
    }
  };

  const handleAcceptInvitation = async (notification) => {
    try {
      // Responder a la invitación
      await notificationsService.respondToProjectInvitation(
        notification.id,
        'accepted',
        user.uid
      );

      // Crear notificación de respuesta para el remitente
      await notificationsService.createInvitationResponse({
        recipientUid: notification.metadata.senderUid,
        senderName: user.displayName || user.email,
        projectId: notification.metadata.projectId,
        projectName: notification.metadata.projectName,
        response: 'accepted'
      });

      toast.success('Invitación aceptada');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Error al aceptar la invitación');
    }
  };

  const handleRejectInvitation = async (notification) => {
    try {
      // Responder a la invitación
      await notificationsService.respondToProjectInvitation(
        notification.id,
        'rejected',
        user.uid
      );

      // Crear notificación de respuesta para el remitente
      await notificationsService.createInvitationResponse({
        recipientUid: notification.metadata.senderUid,
        senderName: user.displayName || user.email,
        projectId: notification.metadata.projectId,
        projectName: notification.metadata.projectName,
        response: 'rejected'
      });

      toast.success('Invitación rechazada');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      toast.error('Error al rechazar la invitación');
    }
  };

  const handleMenuClick = (item) => {
    // Si estamos en un proyecto, navegar al dashboard con la sección correspondiente
    if (location.pathname.startsWith('/project/')) {
      if (item.id === 'calculator') {
        navigate('/dashboard', { state: { activeSection: 'calculator' } });
      } else if (item.id === 'error-codes') {
        navigate('/dashboard', { state: { activeSection: 'error-codes' } });
      } else if (item.id === 'projects') {
        navigate('/dashboard', { state: { activeSection: 'projects' } });
      } else {
        navigate('/dashboard');
      }
    } else {
      // Comportamiento normal cuando no estamos en un proyecto
      if (item.id === 'calculator') {
        navigate('/calculator');
      } else if (item.path) {
        navigate(item.path);
      }
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

      {/* Notifications Bell - Fixed at bottom */}
      {user && (
        <div className="p-2 border-t border-gray-200 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {!sidebarCollapsed && <span className="ml-3">Notificaciones</span>}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <div className="absolute left-0 bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-500">{unreadCount} sin leer</p>
                  )}
                </div>
                
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No tienes notificaciones</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.createdAt?.toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>
                        
                        {/* Botones para invitaciones de proyecto */}
                        {notification.type === 'project_invitation' && notification.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptInvitation(notification);
                              }}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectInvitation(notification);
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Information Section - Fixed above logout */}
      {user && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
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
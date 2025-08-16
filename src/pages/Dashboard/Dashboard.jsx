import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Calculator, FolderOpen, User, Copy, LogOut, Mail, Hash, Edit3, X, Upload, Menu, ChevronLeft, AlertTriangle, BookOpen, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import ProjectsGrid from '../../components/projects/ProjectsGrid';
import CalculatorApp from '../../components/calculator/CalculatorApp';
import ErrorCodesApp from '../../components/error-codes/ErrorCodesApp';
import DocumentTypeSidebar from '../../components/layout/DocumentTypeSidebar';
import { Modal } from '../../components/ui';
import { authService } from '../../services/firebase/auth';
import notificationsService from '../../services/firebase/notifications';
import { setUser } from '../../store/slices/authSlice';

const Dashboard = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('projects');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [showDocumentSidebar, setShowDocumentSidebar] = useState(false);
  
  // Estado para notificaciones
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Manejar navegación desde proyectos con sección específica
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveSection(location.state.activeSection);
      // Limpiar el estado para evitar que persista en navegaciones futuras
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user?.email) return;

    const unsubscribe = notificationsService.onNotificationsChange(
      user.email,
      (notificationsData) => {
        setNotifications(notificationsData);
        const unread = notificationsData.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    );

    return () => unsubscribe();
  }, [user?.email]);
  const [editForm, setEditForm] = useState({
    displayName: '',
    photoURL: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      id: 'projects',
      name: 'Proyectos',
      icon: FolderOpen,
    },
    {
      id: 'calculator', 
      name: 'Calculadora',
      icon: Calculator,
    },
    {
      id: 'error-codes',
      name: 'Códigos de Error',
      icon: AlertTriangle,
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

  const openEditProfile = () => {
    setEditForm({
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || ''
    });
    setPhotoFile(null);
    setShowEditProfile(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Por favor selecciona una imagen válida (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      setPhotoFile(file);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({ ...prev, photoURL: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    let uploadedPhotoURL = null;
    
    try {
      // Validate inputs
      if (!editForm.displayName.trim()) {
        toast.error('El nombre no puede estar vacío');
        return;
      }
      
      let photoURL = user.photoURL; // Keep existing photo by default
      
      // Photo upload functionality temporarily disabled
      // Will be implemented with new storage solution
      if (photoFile) {
        toast.error('La subida de fotos será implementada en la próxima versión');
        return;
      }
      
      // If user removed photo
      if (!photoFile && !editForm.photoURL) {
        photoURL = null;
      }
      
      console.log('Updating profile with:', { 
        displayName: editForm.displayName.trim(), 
        photoURL: photoURL ? 'URL present' : 'No photo' 
      });
      
      // Update Firebase Auth profile
      await authService.updateProfile({
        displayName: editForm.displayName.trim(),
        photoURL: photoURL
      });
      
      // Update Redux state
      dispatch(setUser({
        ...user,
        displayName: editForm.displayName.trim(),
        photoURL: photoURL
      }));
      
      toast.success('Perfil actualizado correctamente');
      setShowEditProfile(false);
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Photo cleanup not needed in simplified version
      
      let errorMessage = 'Error al actualizar perfil';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Necesitas iniciar sesión nuevamente para actualizar tu perfil';
      } else if (error.code === 'auth/invalid-profile-attribute') {
        errorMessage = 'Datos de perfil inválidos';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
    console.log('Selected document type:', documentType);
  };

  // Manejar notificaciones
  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      await notificationsService.markAsRead(notification.id);
    }

    // Si es una invitación de proyecto, no hacer nada más aquí
    // La funcionalidad de aceptar/rechazar se manejará en el componente de notificaciones
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

  const renderContent = () => {
    console.log('Current activeSection:', activeSection);
    switch (activeSection) {
      case 'calculator':
        return <CalculatorApp />;
      case 'error-codes':
        return <ErrorCodesApp />;
      case 'projects':
        return <ProjectsGrid />;
      default:
        return <ProjectsGrid />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar simple - Fixed position */}
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

        {/* Notifications Bell */}
        <div className="p-2 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
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
                  <button
                    onClick={openEditProfile}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Editar perfil"
                  >
                    <Edit3 className="w-2.5 h-2.5 text-gray-600" />
                  </button>
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
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => {
                    console.log('Clicked on:', item.id);
                    setActiveSection(item.id);
                  }}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-left hover:bg-gray-100 transition-colors rounded-lg mb-2 ${
                    activeSection === item.id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700'
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

      {/* Contenido principal */}
      <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} ${showDocumentSidebar ? 'mr-72' : 'mr-0'} transition-all duration-300 flex-1`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>

      {/* Document Type Sidebar */}
      {showDocumentSidebar && (
        <DocumentTypeSidebar
          onDocumentTypeSelect={handleDocumentTypeSelect}
          selectedType={selectedDocumentType}
          defaultCollapsed={false}
        />
      )}

      {/* Profile Edit Modal */}
      <Modal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)}
        title="Editar Perfil"
      >
        <div className="space-y-6">
          {/* Photo Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-semibold overflow-hidden">
                {editForm.photoURL ? (
                  <img 
                    src={editForm.photoURL} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {editForm.displayName ? editForm.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Subir Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              
              {editForm.photoURL && (
                <button
                  onClick={() => setEditForm(prev => ({ ...prev, photoURL: '' }))}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Quitar Foto
                </button>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre para mostrar
            </label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ingresa tu nombre"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowEditProfile(false)}
              disabled={isUpdating}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={updateProfile}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
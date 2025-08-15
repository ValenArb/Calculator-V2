import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Calculator, 
  Zap, 
  Thermometer, 
  TrendingDown, 
  AlertTriangle, 
  Settings,
  FolderOpen,
  Home,
  User,
  Hash,
  Mail,
  Copy,
  Edit3,
  LogOut,
  Menu,
  ChevronLeft,
  Upload,
  X
} from 'lucide-react';
import { fetchProject } from '../../store/slices/projectsSlice';
import { setCalculationsData, setActiveModule } from '../../store/slices/calculationsSlice';
import { setUser } from '../../store/slices/authSlice';
import Header from '../../components/layout/Header';
import DPMSTable from '../../features/calculations/dpms/components/DPMSTable';
import LoadsByPanelTable from '../../features/calculations/loads-per-panel/components/LoadsByPanelTable';
import useRealTimeSync from '../../features/collaboration/hooks/useRealTimeSync';
import { Loading, Modal } from '../../components/ui';
import { authService } from '../../services/firebase/auth';
import { storageService } from '../../services/firebase/storage';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentProject, loading } = useSelector((state) => state.projects);
  const { activeModule } = useSelector((state) => state.calculations);
  const { user } = useSelector((state) => state.auth);
  
  // State for sidebar and profile editing
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    photoURL: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  
  // Enable real-time synchronization
  useRealTimeSync(projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (currentProject && currentProject.data) {
      dispatch(setCalculationsData(currentProject.data));
    }
  }, [dispatch, currentProject]);

  // Menu items for the sidebar
  const menuItems = [
    {
      id: 'projects',
      name: 'Proyectos',
      icon: FolderOpen,
      action: () => navigate('/dashboard')
    },
  ];

  // Calculation modules
  const calculationModules = [
    {
      id: 'dpms',
      name: 'DPMS',
      description: 'Determinación Potencia Máxima Simultánea',
      icon: Calculator
    },
    {
      id: 'loads-per-panel',
      name: 'Cargas por Tablero',
      description: 'Gestión de cargas por tablero',
      icon: Zap
    },
    {
      id: 'thermal',
      name: 'Cálculo Térmico',
      description: 'Verificación térmica de conductores',
      icon: Thermometer
    },
    {
      id: 'voltage-drop',
      name: 'Caída de Tensión',
      description: 'Verificación de caída de tensión',
      icon: TrendingDown
    },
    {
      id: 'short-circuit',
      name: 'Cortocircuito',
      description: 'Cálculo de corriente de cortocircuito',
      icon: AlertTriangle
    },
    {
      id: 'power-center',
      name: 'Centro de Potencia',
      description: 'Determinación del centro de potencia',
      icon: Settings
    }
  ];

  const handleModuleChange = (moduleId) => {
    dispatch(setActiveModule(moduleId));
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      navigate('/login');
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
      if (storageService.getFileSizeInMB(file) > 5) {
        toast.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      
      // Validate file type
      if (!storageService.isValidImageFile(file)) {
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
      
      // If there's a new photo file, upload it to Firebase Storage
      if (photoFile) {
        const loadingToast = toast.loading('Subiendo imagen...');
        try {
          uploadedPhotoURL = await storageService.uploadProfilePhoto(user.uid, photoFile);
          photoURL = uploadedPhotoURL;
          toast.dismiss(loadingToast);
        } catch (uploadError) {
          toast.dismiss(loadingToast);
          console.error('Error uploading photo:', uploadError);
          toast.error('Error al subir la imagen: ' + uploadError.message);
          return;
        }
      }
      
      // If user removed photo
      if (!photoFile && !editForm.photoURL) {
        photoURL = null;
      }
      
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
      console.error('Error updating profile:', error);
      
      // If photo was uploaded but profile update failed, try to clean it up
      if (uploadedPhotoURL) {
        try {
          await storageService.deleteProfilePhoto(uploadedPhotoURL);
        } catch (deleteError) {
          console.error('Error cleaning up uploaded photo:', deleteError);
        }
      }
      
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

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dpms':
        return <DPMSTable />;
      case 'loads-per-panel':
        return <LoadsByPanelTable />;
      case 'thermal':
        return <div className="p-8 text-center text-gray-500">Módulo de Cálculo Térmico - En desarrollo</div>;
      case 'voltage-drop':
        return <div className="p-8 text-center text-gray-500">Módulo de Caída de Tensión - En desarrollo</div>;
      case 'short-circuit':
        return <div className="p-8 text-center text-gray-500">Módulo de Cortocircuito - En desarrollo</div>;
      case 'power-center':
        return <div className="p-8 text-center text-gray-500">Módulo de Centro de Potencia - En desarrollo</div>;
      default:
        return <DPMSTable />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Cargando proyecto..." />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
          <p className="text-gray-600">El proyecto que buscas no existe o no tienes permisos para acceder a él.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar unificado - Fixed position */}
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

        {/* Project Info */}
        {currentProject && !sidebarCollapsed && (
          <div className="p-4 border-b border-gray-200 bg-blue-50 flex-shrink-0">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Proyecto Actual</h3>
            <p className="text-sm text-blue-700 truncate">{currentProject.name}</p>
            <p className="text-xs text-blue-600 capitalize">{currentProject.type}</p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
          {/* General Menu */}
          {!sidebarCollapsed && (
            <div className="py-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                General
              </h4>
            </div>
          )}
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={item.action}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-left hover:bg-gray-100 transition-colors rounded-lg mb-2 text-gray-700`}
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

          {/* Calculation Modules */}
          {!sidebarCollapsed && (
            <div className="py-2">
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                Módulos de Cálculo
              </h4>
            </div>
          )}

          {calculationModules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <div key={module.id} className="relative group">
                <button
                  onClick={() => handleModuleChange(module.id)}
                  className={`w-full flex items-start ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'} text-left transition-colors rounded-lg mb-2 ${
                    isActive 
                      ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={sidebarCollapsed ? module.name : ''}
                >
                  <Icon className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} mt-0.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {!sidebarCollapsed && (
                    <div>
                      <div className={`font-medium ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
                        {module.name}
                      </div>
                      <div className={`text-sm ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                        {module.description}
                      </div>
                    </div>
                  )}
                </button>
                
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {module.name}
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

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 flex-1`}>
        <Header />
        
        <main className="p-6">
          {renderActiveModule()}
        </main>
      </div>

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

export default ProjectDetails;
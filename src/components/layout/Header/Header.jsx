import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Users } from 'lucide-react';
import { signOut } from '../../../store/slices/authSlice';
import ExportButton from '../../common/ExportButton';
import CollaborationIndicator from '../../common/CollaborationIndicator';
import NotificationBell from '../../notifications/NotificationBell';
import toast from 'react-hot-toast';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { currentProject } = useSelector((state) => state.projects);
  const calculations = useSelector((state) => state.calculations);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const handleSignOut = async () => {
    try {
      await dispatch(signOut());
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-2xl font-bold text-primary-600 hover:text-primary-700"
          >
            ⚡ Calculadora Eléctrica
          </button>
          
          {currentProject && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>›</span>
              <span className="font-medium">{currentProject.name}</span>
              {currentProject.collaborators && currentProject.collaborators.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{currentProject.collaborators.length}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentProject && (
            <>
              <CollaborationIndicator projectId={currentProject.id} />
              <ExportButton 
                projectData={currentProject} 
                calculationsData={calculations}
                size="sm"
              />
            </>
          )}

          <NotificationBell />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {user?.displayName || user?.email}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{user?.displayName}</div>
                    <div className="text-gray-500">{user?.email}</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // TODO: Open settings modal
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
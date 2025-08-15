import { 
  Home, 
  Calculator, 
  FolderOpen, 
  Settings,
  FileText,
  Download,
  User,
  LogOut
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { signOut } from '../../../services/firebase/auth';

const DashboardSidebar = ({ activeSection, onSectionChange }) => {
  const dispatch = useDispatch();

  const mainSections = [
    {
      id: 'projects',
      name: 'Proyectos',
      description: 'Gestión de proyectos eléctricos',
      icon: FolderOpen
    },
    {
      id: 'calculator',
      name: 'Calculadora',
      description: 'Calculadora eléctrica sencilla',
      icon: Calculator
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Panel principal',
      icon: Home
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">ElectriCalc</h1>
            <p className="text-xs text-gray-500">Calculadora Profesional</p>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Principal
          </h3>
          {mainSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className={`w-5 h-5 mt-0.5 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium truncate ${
                      isActive ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {section.name}
                    </div>
                    <div className={`text-sm truncate ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {section.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tools Section */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Herramientas
          </h3>
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group">
              <FileText className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span className="text-sm">Generar Reporte</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group">
              <Download className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span className="text-sm">Exportar Datos</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group">
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              <span className="text-sm">Configuración</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors group">
            <User className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            <span className="text-sm">Mi Perfil</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors group"
          >
            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
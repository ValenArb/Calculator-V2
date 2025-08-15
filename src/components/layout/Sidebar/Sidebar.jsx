import { useDispatch, useSelector } from 'react-redux';
import { 
  Calculator, 
  Zap, 
  Thermometer, 
  TrendingDown, 
  AlertTriangle, 
  Settings,
  FileText,
  Download
} from 'lucide-react';
import { setActiveModule } from '../../../store/slices/calculationsSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { activeModule } = useSelector((state) => state.calculations);

  const modules = [
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

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Módulos de Cálculo</h2>
      </div>
      
      <nav className="p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => handleModuleChange(module.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                <div>
                  <div className={`font-medium ${isActive ? 'text-primary-900' : 'text-gray-900'}`}>
                    {module.name}
                  </div>
                  <div className={`text-sm ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                    {module.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Generar Reporte</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm">Exportar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
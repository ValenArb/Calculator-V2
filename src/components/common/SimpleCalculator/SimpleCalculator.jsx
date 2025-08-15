import { useState } from 'react';
import { Calculator, Zap, Cpu, Cable, Gauge } from 'lucide-react';
import BasicCircuits from './modules/BasicCircuits';
import PowerCalculations from './modules/PowerCalculations';
import CableCalculations from './modules/CableCalculations';
import ResistanceCalculations from './modules/ResistanceCalculations';

const SimpleCalculator = () => {
  const [activeModule, setActiveModule] = useState('basic-circuits');

  const modules = [
    {
      id: 'basic-circuits',
      name: 'Circuitos Básicos',
      description: 'Cálculos de corriente, tensión y caída de tensión',
      icon: Zap,
      component: BasicCircuits
    },
    {
      id: 'power',
      name: 'Potencia',
      description: 'Cálculos de potencia activa, aparente y reactiva',
      icon: Cpu,
      component: PowerCalculations
    },
    {
      id: 'cables',
      name: 'Cables y Conductores',
      description: 'Calibre, temperatura y capacidad de conductores',
      icon: Cable,
      component: CableCalculations
    },
    {
      id: 'resistance',
      name: 'Resistencia',
      description: 'Cálculos de resistencia, reactancia e impedancia',
      icon: Gauge,
      component: ResistanceCalculations
    }
  ];

  const activeModuleData = modules.find(m => m.id === activeModule);
  const ActiveComponent = activeModuleData?.component;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calculadora Eléctrica</h1>
            <p className="text-gray-600">Herramientas de cálculo para ingeniería eléctrica</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Module Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Módulos</h2>
            </div>
            <nav className="p-2">
              {modules.map((module) => {
                const Icon = module.icon;
                const isActive = activeModule === module.id;
                
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 mb-1 group ${
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
                        <div className={`font-medium text-sm ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {module.name}
                        </div>
                        <div className={`text-xs mt-1 leading-tight ${
                          isActive ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {module.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px]">
            {ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <div className="p-8 text-center">
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona un módulo
                </h3>
                <p className="text-gray-500">
                  Elige un módulo de cálculo para comenzar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCalculator;
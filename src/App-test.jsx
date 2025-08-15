import { useState } from 'react';
import { Calculator } from 'lucide-react';
import SimpleCalculator from './components/common/SimpleCalculator';

function AppTest() {
  const [activeSection, setActiveSection] = useState('calculator');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header simple */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Calculadora Eléctrica</h1>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => setActiveSection('calculator')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'calculator' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Calculadora
              </button>
              <button 
                onClick={() => setActiveSection('test')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'test' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeSection === 'calculator' ? (
          <SimpleCalculator />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Test de Funcionamiento</h2>
            <p className="text-gray-600 mb-6">
              Si puedes ver este contenido, la aplicación está funcionando correctamente.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-green-700">React OK</div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">⚡</div>
                <div className="text-sm text-blue-700">Componentes OK</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">🎨</div>
                <div className="text-sm text-purple-700">Estilos OK</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppTest;
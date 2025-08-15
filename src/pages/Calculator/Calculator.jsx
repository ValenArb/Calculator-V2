import { useState } from 'react';
import { Calculator as CalculatorIcon, LogIn, User } from 'lucide-react';
import CalculatorApp from '../../components/calculator/CalculatorApp';

const Calculator = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <CalculatorIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Calculadora Eléctrica</h1>
                <p className="text-sm text-gray-600">Versión de prueba - Sin proyectos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-xs text-gray-500 text-right">
                <p>Acceso limitado</p>
                <p>Solo calculadoras disponibles</p>
              </div>
              <button
                onClick={() => window.location.href = '/login'}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Acceso como invitado</h3>
              <p className="text-xs text-blue-700 mt-1">
                Tienes acceso completo a todas las calculadoras eléctricas. 
                Para guardar proyectos y acceder a funciones colaborativas, 
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="underline hover:text-blue-800 ml-1"
                >
                  inicia sesión aquí
                </button>.
              </p>
            </div>
          </div>
        </div>
        
        <CalculatorApp />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Calculadora Eléctrica Profesional</p>
            <p className="mt-1">
              <button 
                onClick={() => window.location.href = '/login'}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Crear cuenta gratuita
              </button>
              {' '}para acceder a proyectos y colaboración
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Calculator;
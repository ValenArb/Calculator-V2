import React from 'react';
import './styles/globals.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">⚡</h1>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Calculadora Eléctrica</h1>
        <p className="text-gray-600">Aplicación funcionando correctamente</p>
        <div className="mt-8">
          <button className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { Wrench, Database, Code } from 'lucide-react';

const ProjectsPlaceholder = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-16">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <Wrench className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Gestión de Proyectos
        </h2>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Esta sección está siendo rediseñada desde cero para ofrecerte una mejor experiencia 
          de gestión de proyectos eléctricos con nuevas funcionalidades y base de datos optimizada.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Database className="w-8 h-8 text-blue-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Nueva Base de Datos</h3>
            <p className="text-sm text-gray-600">
              Migración a base de datos SQL para mejor rendimiento y escalabilidad
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Wrench className="w-8 h-8 text-green-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Nuevas Funcionalidades</h3>
            <p className="text-sm text-gray-600">
              Sistema de proyectos completamente renovado con mejor UX
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <Code className="w-8 h-8 text-purple-600 mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Arquitectura Mejorada</h3>
            <p className="text-sm text-gray-600">
              Código optimizado y estructura modular para fácil mantenimiento
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">¿Qué puedes hacer mientras tanto?</h4>
          <p className="text-blue-800 text-sm">
            Utiliza la sección de <strong>Calculadora</strong> para realizar todos tus cálculos eléctricos. 
            Los cálculos son completamente funcionales y están disponibles para uso inmediato.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPlaceholder;
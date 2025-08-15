import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, FileText } from 'lucide-react';
import RecentProjectsGrid from '../RecentProjectsCard';
import StatisticsSection from '../StatisticsSection';
import CreateProjectModal from '../CreateProjectModal';

const ProjectsGrid = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Proyectos
          </h1>
          <p className="text-lg text-gray-600">
            Administra tus proyectos eléctricos de forma eficiente.
          </p>
        </div>
        
        <button
          onClick={handleCreateProject}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Crear Proyecto
        </button>
      </div>

      {/* Recent Projects Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Proyectos Recientes
        </h2>
        <RecentProjectsGrid userId={user?.uid} />
      </div>

      {/* Statistics and KPI Section */}
      <StatisticsSection userId={user?.uid} />

      {/* Bottom Note */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Sistema de Gestión Renovado
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                El nuevo sistema de proyectos incluye almacenamiento local, mayor rendimiento 
                y nuevas funcionalidades para una gestión más eficiente de tus proyectos eléctricos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userId={user?.uid}
          defaultType="residential"
        />
      )}
    </div>
  );
};

export default ProjectsGrid;
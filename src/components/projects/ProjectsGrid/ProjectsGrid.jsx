import React from 'react';
import { useSelector } from 'react-redux';
import CreateProjectCard from '../CreateProjectCard';
import RecentProjectsCard from '../RecentProjectsCard';
import ProjectTemplatesCard from '../ProjectTemplatesCard';
import StatisticsSection from '../StatisticsSection';

const ProjectsGrid = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestión de Proyectos
        </h1>
        <p className="text-lg text-gray-600">
          Administra tus proyectos eléctricos de forma eficiente. Crea nuevos proyectos, 
          utiliza plantillas predefinidas y mantén un seguimiento completo de tu trabajo.
        </p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Create New Project */}
        <div className="lg:col-span-1">
          <CreateProjectCard userId={user?.uid} />
        </div>

        {/* Card 2: Recent Projects */}
        <div className="lg:col-span-1">
          <RecentProjectsCard userId={user?.uid} />
        </div>

        {/* Card 3: Project Templates */}
        <div className="lg:col-span-1">
          <ProjectTemplatesCard />
        </div>
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
    </div>
  );
};

export default ProjectsGrid;
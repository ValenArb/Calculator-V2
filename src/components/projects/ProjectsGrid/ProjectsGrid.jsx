import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, FileText, Shuffle } from 'lucide-react';
import RecentProjectsGrid from '../RecentProjectsCard';
import CreateProjectModal from '../CreateProjectModal';
import projectsService from '../../../services/firebase/projects';
import toast from 'react-hot-toast';

const ProjectsGrid = () => {
  const { user } = useSelector((state) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = () => {
    // Trigger refresh of projects list
    setRefreshTrigger(prev => prev + 1);
  };

  // Generate random project data
  const generateRandomProject = async () => {
    if (!user?.uid) {
      toast.error('Debes estar autenticado para crear proyectos');
      return;
    }

    const projectNames = [
      'Edificio Residencial Norte',
      'Centro Comercial Plaza',
      'Planta Industrial Textil',
      'Casa Familiar López',
      'Edificio de Oficinas Central',
      'Fábrica de Alimentos',
      'Residencia Martínez',
      'Shopping Mall Sur',
      'Complejo Industrial Norte',
      'Apartamentos Vista Linda',
      'Torre de Oficinas Este',
      'Casa García',
      'Centro Médico San Juan',
      'Supermercado Central',
      'Laboratorio Químico',
      'Condominio Las Flores'
    ];

    const descriptions = [
      'Instalación eléctrica completa con sistema de iluminación LED',
      'Proyecto de modernización del sistema eléctrico',
      'Instalación de tableros de distribución y circuitos especializados',
      'Sistema eléctrico para edificio de uso mixto',
      'Proyecto de eficiencia energética y automatización',
      'Instalación eléctrica industrial con alta demanda',
      'Sistema residencial con energía solar',
      'Proyecto comercial con sistemas de emergencia'
    ];

    const clientNames = [
      'Juan Carlos Rodríguez',
      'María Elena Fernández',
      'Roberto Silva',
      'Ana Patricia Morales',
      'Carlos Eduardo Jiménez',
      'Lucia Beatriz Castro',
      'Miguel Ángel Torres',
      'Patricia Isabel Vargas'
    ];

    const companies = [
      'Constructora ABC S.A.',
      'Edificaciones del Norte SRL',
      'Grupo Constructor Sur',
      'Inmobiliaria Central',
      'Constructora Moderna Ltda.',
      'Desarrollos Urbanos S.A.',
      'Ingeniería y Construcción Oeste',
      'Proyectos Residenciales Este'
    ];

    const locations = [
      'Buenos Aires, Argentina',
      'Córdoba, Argentina',
      'Rosario, Santa Fe',
      'Mendoza, Argentina',
      'La Plata, Buenos Aires',
      'Mar del Plata, Buenos Aires',
      'Tucumán, Argentina',
      'Salta, Argentina'
    ];

    const randomProject = {
      name: projectNames[Math.floor(Math.random() * projectNames.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      owner_id: user.uid,
      client_name: clientNames[Math.floor(Math.random() * clientNames.length)],
      client_email: `${clientNames[Math.floor(Math.random() * clientNames.length)].toLowerCase().replace(/\s+/g, '.')}@email.com`,
      client_phone: `+54 11 ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      location: locations[Math.floor(Math.random() * locations.length)]
    };

    try {
      await projectsService.createProject(randomProject);
      toast.success(`Proyecto "${randomProject.name}" creado exitosamente`);
      handleProjectCreated();
    } catch (error) {
      console.error('Error creating random project:', error);
      toast.error('Error al crear el proyecto aleatorio');
    }
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
        
        <div className="flex gap-3">
          <button
            onClick={generateRandomProject}
            className="bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
            title="Generar proyecto con datos aleatorios"
          >
            <Shuffle className="w-5 h-5" />
            Generar Aleatorio
          </button>
          
          <button
            onClick={handleCreateProject}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Crear Proyecto
          </button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Proyectos Recientes
        </h2>
        <RecentProjectsGrid userId={user?.uid} key={refreshTrigger} />
      </div>


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
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default ProjectsGrid;
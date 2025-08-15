import React, { useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import CreateProjectModal from '../CreateProjectModal';

const CreateProjectCard = ({ userId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
            Crear Nuevo Proyecto
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Inicia un nuevo proyecto eléctrico con toda la información necesaria
          </p>

          {/* Create Button */}
          <button
            onClick={handleCreateProject}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <FileText className="w-5 h-5" />
            Comenzar Proyecto
          </button>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userId={userId}
          defaultType="residential"
        />
      )}
    </>
  );
};

export default CreateProjectCard;
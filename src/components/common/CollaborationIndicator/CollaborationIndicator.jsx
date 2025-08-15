import { useState } from 'react';
import { Wifi, WifiOff, Users, Clock, Save } from 'lucide-react';
import { Button, Modal } from '../../ui';
import CollaboratorsList from '../../../features/collaboration/components/CollaboratorsList';
import useRealTimeSync from '../../../features/collaboration/hooks/useRealTimeSync';
import useCollaboration from '../../../features/collaboration/hooks/useCollaboration';

const CollaborationIndicator = ({ projectId }) => {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const { isConnected, lastUpdate, forceSave } = useRealTimeSync(projectId);
  const { activeUsers, collaborationStats } = useCollaboration();

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const now = new Date();
    const update = new Date(timestamp);
    const diffMs = now - update;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    return update.toLocaleDateString();
  };

  const handleForceSave = async () => {
    const success = await forceSave();
    if (success) {
      // Show success feedback
    }
  };

  return (
    <>
      <div className="flex items-center space-x-3 text-sm">
        {/* Connection Status */}
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
          isConnected 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span className="text-xs font-medium">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>

        {/* Active Users */}
        {activeUsers.length > 0 && (
          <button
            onClick={() => setShowCollaborators(true)}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <Users className="w-3 h-3" />
            <span className="text-xs font-medium">
              {activeUsers.length} usuario{activeUsers.length !== 1 ? 's' : ''}
            </span>
          </button>
        )}

        {/* Last Update */}
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {formatLastUpdate(lastUpdate)}
          </span>
        </div>

        {/* Manual Save Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSave}
          className="p-1"
          title="Guardar manualmente"
        >
          <Save className="w-3 h-3" />
        </Button>
      </div>

      {/* Collaborators Modal */}
      <Modal
        isOpen={showCollaborators}
        onClose={() => setShowCollaborators(false)}
        title="Gestión de Colaboradores"
        size="md"
      >
        <CollaboratorsList project={collaborationStats} />
      </Modal>
    </>
  );
};

export default CollaborationIndicator;
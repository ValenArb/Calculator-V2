import React from 'react';
import { X, Circle, Clock } from 'lucide-react';
import usePresence from '../../hooks/usePresence';

const ActiveUsersModal = ({ projectId, isOpen, onClose }) => {
  const { activeUsers, isTracking } = usePresence(projectId, isOpen);

  if (!isOpen) return null;

  const formatLastSeen = (lastSeenTimestamp) => {
    if (!lastSeenTimestamp) return 'Desconocido';
    
    const now = new Date();
    const diff = now - lastSeenTimestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-green-500';
      case 'away':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'away':
        return 'Ausente';
      default:
        return 'Desconectado';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Usuarios Activos
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Circle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No hay otros usuarios activos en este proyecto
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <div key={user.userId} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">
                          {(user.displayName || user.email || 'U')
                            .split(' ')
                            .map(word => word.charAt(0))
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Status indicator */}
                    <div 
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-500' : 
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2 text-xs">
                    <Circle className={`w-2 h-2 fill-current ${getStatusColor(user.status)}`} />
                    <span className="text-gray-500">
                      {getStatusText(user.status)}
                    </span>
                  </div>

                  {/* Last seen */}
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatLastSeen(user.lastSeenTimestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 text-center text-xs text-gray-500">
          {activeUsers.length > 0 && (
            <>
              {activeUsers.length} usuario{activeUsers.length !== 1 ? 's' : ''} activo{activeUsers.length !== 1 ? 's' : ''}
              {isTracking && ' • Tú también estás activo'}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveUsersModal;
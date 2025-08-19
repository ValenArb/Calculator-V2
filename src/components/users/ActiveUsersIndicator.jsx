import React, { useState } from 'react';
import usePresence from '../../hooks/usePresence';
import ActiveUsersModal from './ActiveUsersModal';

const ActiveUsersIndicator = ({ 
  projectId, 
  showNames = false, 
  maxVisible = 4, 
  compact = false,
  autoStart = true,
  clickable = true 
}) => {
  const { activeUsers, isTracking } = usePresence(projectId, autoStart);
  const [showModal, setShowModal] = useState(false);

  // Show if there are other users OR if current user is tracking
  if (activeUsers.length === 0 && !isTracking) {
    return null; // Don't show if no users at all
  }

  const visibleUsers = activeUsers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, activeUsers.length - maxVisible);


  const handleClick = () => {
    if (clickable) {
      setShowModal(true);
    }
  };

  return (
    <>
      <div 
        className={`flex items-center ${compact ? 'space-x-1' : 'space-x-2'} ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        onClick={handleClick}
        title={clickable ? 'Ver usuarios activos' : undefined}
      >
      {/* Active users label - hide in compact mode if no space */}
      {!compact && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">
            {/* Include current user in count if tracking */}
            {activeUsers.length + (isTracking ? 1 : 0)} activo{(activeUsers.length + (isTracking ? 1 : 0)) !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* User avatars */}
      <div className={`flex ${compact ? '-space-x-1' : '-space-x-2'}`}>
        {visibleUsers.map((activeUser, index) => (
          <UserAvatar
            key={activeUser.userId}
            user={activeUser}
            showName={showNames}
            zIndex={visibleUsers.length - index}
            size={compact ? 'sm' : 'md'}
          />
        ))}
        
        {/* Show +N indicator if there are hidden users */}
        {hiddenCount > 0 && (
          <div 
            className={`relative z-0 ${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-gray-200 border-2 border-white rounded-full flex items-center justify-center`}
            title={`+${hiddenCount} más`}
          >
            <span className={`${compact ? 'text-xs' : 'text-xs'} font-medium text-gray-600`}>
              +{hiddenCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Compact mode indicator */}
      {compact && (activeUsers.length > 0 || isTracking) && (
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
      
      {/* Active Users Modal */}
      {clickable && (
        <ActiveUsersModal
          projectId={projectId}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

const UserAvatar = ({ user, showName, zIndex, size = 'md' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'Usuario';
  const lastSeenText = user.status === 'online' ? 'En línea' : 'Ausente';
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const statusSizeClasses = {
    sm: 'w-2 h-2 -bottom-0 -right-0',
    md: 'w-3 h-3 -bottom-0.5 -right-0.5',
    lg: 'w-4 h-4 -bottom-1 -right-1'
  };

  return (
    <div className="relative group">
      <div 
        className={`relative ${sizeClasses[size]} rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110`}
        style={{ zIndex }}
        title={`${displayName} - ${lastSeenText}`}
      >
        {/* Avatar image or initials */}
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {getInitials(displayName)}
            </span>
          </div>
        )}

        {/* Status indicator */}
        <div 
          className={`absolute ${statusSizeClasses[size]} ${getStatusColor(user.status)} border border-white rounded-full`}
          title={lastSeenText}
        />
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <div className="font-medium">{displayName}</div>
        <div className="text-gray-300">{lastSeenText}</div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
      </div>

      {/* Show name below avatar if requested */}
      {showName && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-gray-600 whitespace-nowrap">
          {displayName.split(' ')[0]}
        </div>
      )}
    </div>
  );
};

export default ActiveUsersIndicator;
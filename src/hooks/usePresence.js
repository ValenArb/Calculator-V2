import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import presenceService from '../services/firebase/presence';

/**
 * Hook to manage user presence in a project
 * @param {string} projectId - The project ID to track presence for
 * @param {boolean} autoStart - Whether to automatically start presence tracking (default: true)
 * @returns {object} - Active users array and presence controls
 */
const usePresence = (projectId, autoStart = true) => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const unsubscribeRef = useRef(null);

  // Start presence tracking (mark user as active)
  const startPresence = async () => {
    if (!projectId || !user || isTracking) return;

    try {
      // Start tracking current user's presence
      await presenceService.startPresence(projectId, user);
      setIsTracking(true);
      
    } catch (error) {
      console.error('Error starting presence:', error);
    }
  };

  // Stop presence tracking (stop marking user as active)
  const stopPresence = async () => {
    if (!isTracking) return;

    try {
      // Stop presence service
      await presenceService.stopPresence();
      setIsTracking(false);
      
    } catch (error) {
      console.error('Error stopping presence:', error);
    }
  };

  // Setup listeners and conditionally start presence tracking
  useEffect(() => {
    if (!projectId || !user) return;

    // Always listen for other users (for dashboard indicators)
    const unsubscribe = presenceService.onActiveUsersChange(projectId, (users) => {
      // Filter out current user (sorting is already done in presence service)
      const otherUsers = users.filter(activeUser => activeUser.userId !== user.uid);
      setActiveUsers(otherUsers);
    });

    unsubscribeRef.current = unsubscribe;

    // Only mark this user as active if autoStart is true (project detail page)
    if (autoStart && !isTracking) {
      startPresence();
    }

    // Cleanup on unmount or projectId change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (isTracking) {
        stopPresence();
      }
    };
  }, [projectId, user, autoStart]);

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      presenceService.stopPresence();
    };
  }, []);

  return {
    activeUsers,
    isTracking,
    startPresence,
    stopPresence,
    totalActiveUsers: activeUsers.length + (isTracking ? 1 : 0) // Include current user if tracking
  };
};

export default usePresence;
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { firestoreService } from '../../../services/firebase/firestore';
import { updateCurrentProject } from '../../../store/slices/projectsSlice';
import { setCalculationsData } from '../../../store/slices/calculationsSlice';
import { setConnectionStatus, setLastUpdate } from '../../../store/slices/collaborationSlice';
import { debounce } from 'lodash';

export const useRealTimeSync = (projectId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentProject } = useSelector((state) => state.projects);
  const calculations = useSelector((state) => state.calculations);

  // Debounced save function to avoid too many writes
  const debouncedSave = useCallback(
    debounce(async (projectId, calculationsData) => {
      if (!projectId || !user) return;
      
      try {
        await firestoreService.updateProject(projectId, {
          data: calculationsData,
          lastModifiedBy: user.uid,
          lastModifiedAt: new Date()
        });
        dispatch(setLastUpdate(new Date().toISOString()));
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        dispatch(setConnectionStatus(false));
      }
    }, 2000), // Save after 2 seconds of inactivity
    [user, dispatch]
  );

  // Auto-save calculations when they change
  useEffect(() => {
    if (projectId && calculations) {
      const calculationsData = {
        dpms: calculations.dpms,
        loadsByPanel: calculations.loadsByPanel,
        thermal: calculations.thermal,
        voltageDrops: calculations.voltageDrops,
        shortCircuit: calculations.shortCircuit
      };
      
      debouncedSave(projectId, calculationsData);
    }
  }, [
    projectId,
    calculations.dpms,
    calculations.loadsByPanel,
    calculations.thermal,
    calculations.voltageDrops,
    calculations.shortCircuit,
    debouncedSave
  ]);

  // Real-time listener for project changes
  useEffect(() => {
    if (!projectId) return;

    dispatch(setConnectionStatus(true));

    const unsubscribe = firestoreService.subscribeToProject(projectId, (updatedProject) => {
      if (!updatedProject) return;

      // Update project data
      dispatch(updateCurrentProject(updatedProject));

      // Update calculations if they were modified by another user
      if (updatedProject.lastModifiedBy !== user?.uid && updatedProject.data) {
        dispatch(setCalculationsData(updatedProject.data));
      }

      dispatch(setLastUpdate(new Date().toISOString()));
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      dispatch(setConnectionStatus(false));
    };
  }, [projectId, user?.uid, dispatch]);

  // Force save function
  const forceSave = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      const calculationsData = {
        dpms: calculations.dpms,
        loadsByPanel: calculations.loadsByPanel,
        thermal: calculations.thermal,
        voltageDrops: calculations.voltageDrops,
        shortCircuit: calculations.shortCircuit
      };

      await firestoreService.updateProject(projectId, {
        data: calculationsData,
        lastModifiedBy: user.uid,
        lastModifiedAt: new Date()
      });

      dispatch(setLastUpdate(new Date().toISOString()));
      return true;
    } catch (error) {
      console.error('Error force saving:', error);
      return false;
    }
  }, [projectId, user, calculations, dispatch]);

  // Connection status
  const isConnected = useSelector((state) => state.collaboration.isConnected);
  const lastUpdate = useSelector((state) => state.collaboration.lastUpdate);

  return {
    isConnected,
    lastUpdate,
    forceSave
  };
};

export default useRealTimeSync;
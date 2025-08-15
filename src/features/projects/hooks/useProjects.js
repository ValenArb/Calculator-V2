import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProjects, createProject, updateProject, deleteProject, duplicateProject } from '../../../store/slices/projectsSlice';

export const useProjects = () => {
  const dispatch = useDispatch();
  const { projects, currentProject, loading, error, favorites } = useSelector((state) => state.projects);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const fetchProjects = useCallback(async () => {
    if (user?.uid && isAuthenticated) {
      console.log('Fetching projects for user:', user.uid);
      try {
        const result = await dispatch(fetchUserProjects(user.uid));
        if (result.type === 'projects/fetchUser/rejected') {
          console.error('Failed to fetch projects:', result.payload);
        } else {
          console.log('Projects fetched successfully:', result.payload);
        }
      } catch (error) {
        console.error('Error in fetchProjects:', error);
      }
    }
  }, [dispatch, user?.uid, isAuthenticated]);

  useEffect(() => {
    console.log('useProjects useEffect triggered:', { 
      user: !!user, 
      uid: user?.uid, 
      isAuthenticated,
      projectsCount: projects.length
    });
    
    fetchProjects();
  }, [fetchProjects]);

  const createNewProject = async (projectData) => {
    if (user?.uid) {
      const result = await dispatch(createProject({ userId: user.uid, projectData }));
      if (result.type === 'projects/create/fulfilled') {
        // Use the callback instead of direct dispatch to ensure consistency
        await fetchProjects();
      }
      return result;
    }
  };

  const updateExistingProject = async (projectId, updates) => {
    return dispatch(updateProject({ projectId, updates }));
  };

  const deleteExistingProject = async (projectId) => {
    return dispatch(deleteProject(projectId));
  };

  const duplicateExistingProject = async (projectId, newProjectData = {}) => {
    if (user?.uid) {
      const result = await dispatch(duplicateProject({ 
        projectId, 
        userId: user.uid, 
        newProjectData 
      }));
      if (result.type === 'projects/duplicate/fulfilled') {
        // Use the callback instead of direct dispatch to ensure consistency
        await fetchProjects();
      }
      return result;
    }
  };

  const favoriteProjects = projects.filter(project => favorites.includes(project.id));
  const recentProjects = projects.slice(0, 5);

  return {
    projects,
    currentProject,
    loading,
    error,
    favoriteProjects,
    recentProjects,
    createNewProject,
    updateExistingProject,
    deleteExistingProject,
    duplicateExistingProject,
    refetchProjects: fetchProjects
  };
};

export default useProjects;
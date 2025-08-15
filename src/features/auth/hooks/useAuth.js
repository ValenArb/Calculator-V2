import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../../../services/firebase/auth';
import { setUser, setLoading } from '../../../store/slices/authSlice';

// Global flag to prevent multiple auth listeners
let globalAuthListenerSet = false;
let globalUnsubscribe = null;

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const componentMountedRef = useRef(true);

  useEffect(() => {
    // Prevent multiple auth listeners from being set up globally
    if (globalAuthListenerSet) {
      return;
    }

    console.log('useAuth: Setting up auth listener');
    globalAuthListenerSet = true;
    dispatch(setLoading(true));
    
    try {
      const unsubscribe = authService.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user);
        console.log('User UID:', user?.uid);
        console.log('User Email:', user?.email);
        console.log('User DisplayName:', user?.displayName);
        
        if (user) {
          dispatch(setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }));
        } else {
          dispatch(setUser(null));
        }
        dispatch(setLoading(false));
        console.log('Loading set to false');
      });

      globalUnsubscribe = unsubscribe;

      return () => {
        console.log('useAuth: Cleaning up auth listener');
        if (globalUnsubscribe) {
          globalUnsubscribe();
          globalUnsubscribe = null;
        }
        globalAuthListenerSet = false;
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      dispatch(setLoading(false));
      globalAuthListenerSet = false;
    }
  }, [dispatch]);

  console.log('useAuth: Current state - loading:', loading, 'isAuthenticated:', isAuthenticated, 'user:', user?.email);

  return {
    user,
    loading,
    error,
    isAuthenticated
  };
};

export default useAuth;
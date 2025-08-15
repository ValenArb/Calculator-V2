import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectsSlice from './slices/projectsSlice';
import calculationsSlice from './slices/calculationsSlice';
import collaborationSlice from './slices/collaborationSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    calculations: calculationsSlice,
    collaboration: collaborationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});


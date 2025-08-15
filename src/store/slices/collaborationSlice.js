import { createSlice } from '@reduxjs/toolkit';

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState: {
    activeUsers: [],
    isConnected: false,
    lastUpdate: null,
    conflicts: []
  },
  reducers: {
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    
    addActiveUser: (state, action) => {
      const user = action.payload;
      const existingIndex = state.activeUsers.findIndex(u => u.uid === user.uid);
      if (existingIndex === -1) {
        state.activeUsers.push(user);
      }
    },
    
    removeActiveUser: (state, action) => {
      const userId = action.payload;
      state.activeUsers = state.activeUsers.filter(u => u.uid !== userId);
    },
    
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    
    setLastUpdate: (state, action) => {
      state.lastUpdate = action.payload;
    },
    
    addConflict: (state, action) => {
      state.conflicts.push(action.payload);
    },
    
    resolveConflict: (state, action) => {
      const conflictId = action.payload;
      state.conflicts = state.conflicts.filter(c => c.id !== conflictId);
    },
    
    clearConflicts: (state) => {
      state.conflicts = [];
    }
  }
});

export const {
  setActiveUsers,
  addActiveUser,
  removeActiveUser,
  setConnectionStatus,
  setLastUpdate,
  addConflict,
  resolveConflict,
  clearConflicts
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
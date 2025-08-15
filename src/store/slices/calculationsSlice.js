import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const calculationsSlice = createSlice({
  name: 'calculations',
  initialState: {
    dpms: [],
    loadsByPanel: [],
    thermal: [],
    voltageDrops: [],
    shortCircuit: [],
    activeModule: 'dpms',
    loading: false,
    error: null
  },
  reducers: {
    setActiveModule: (state, action) => {
      state.activeModule = action.payload;
    },
    
    // DPMS Actions
    addDPMSRow: (state) => {
      state.dpms.push({
        id: uuidv4(),
        denominacionTablero: '',
        denominacionAmbiente: '',
        dimensiones: { x: 0, y: 0, h: 0 },
        superficie: 0,
        gradoElectrificacion: '',
        cargas: {
          TUG: [],
          IUG: [],
          ATE: [],
          ACU: [],
          TUE: [],
          OCE: []
        }
      });
    },
    
    updateDPMSRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.dpms.find(item => item.id === id);
      if (row) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          row[parent][child] = value;
        } else {
          row[field] = value;
        }
      }
    },
    
    deleteDPMSRow: (state, action) => {
      state.dpms = state.dpms.filter(item => item.id !== action.payload);
    },
    
    addDPMSCarge: (state, action) => {
      const { rowId, cargeType } = action.payload;
      const row = state.dpms.find(item => item.id === rowId);
      if (row) {
        row.cargas[cargeType].push({
          id: uuidv4(),
          cantidadBocas: 0,
          identificacionCircuito: '',
          dpms: 0,
          fase: '',
          corriente: 0
        });
      }
    },
    
    updateDPMSCarge: (state, action) => {
      const { rowId, cargeType, cargeId, field, value } = action.payload;
      const row = state.dpms.find(item => item.id === rowId);
      if (row) {
        const carge = row.cargas[cargeType].find(c => c.id === cargeId);
        if (carge) {
          carge[field] = value;
        }
      }
    },
    
    deleteDPMSCarge: (state, action) => {
      const { rowId, cargeType, cargeId } = action.payload;
      const row = state.dpms.find(item => item.id === rowId);
      if (row) {
        row.cargas[cargeType] = row.cargas[cargeType].filter(c => c.id !== cargeId);
      }
    },
    
    // Loads by Panel Actions
    addLoadsByPanelRow: (state) => {
      state.loadsByPanel.push({
        id: uuidv4(),
        identificacionTablero: '',
        lineaOCarga: '',
        tipoCarga: 'Normal',
        alimentacion: '',
        potenciaAparente: 0,
        cosPhi: 0
      });
    },
    
    updateLoadsByPanelRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.loadsByPanel.find(item => item.id === id);
      if (row) {
        row[field] = value;
      }
    },
    
    deleteLoadsByPanelRow: (state, action) => {
      state.loadsByPanel = state.loadsByPanel.filter(item => item.id !== action.payload);
    },
    
    // Thermal Actions
    addThermalRow: (state) => {
      state.thermal.push({
        id: uuidv4(),
        circuito: '',
        corriente: 0,
        conductor: 'Cobre',
        seccion: 2.5,
        capacidadPortante: 0,
        temperatura: 40
      });
    },
    
    updateThermalRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.thermal.find(item => item.id === id);
      if (row) {
        row[field] = value;
      }
    },
    
    deleteThermalRow: (state, action) => {
      state.thermal = state.thermal.filter(item => item.id !== action.payload);
    },
    
    // Voltage Drop Actions
    addVoltageDropRow: (state) => {
      state.voltageDrops.push({
        id: uuidv4(),
        circuito: '',
        longitud: 0,
        corriente: 0,
        seccion: 2.5,
        caidaTension: 0,
        caidaPermisible: 5.0
      });
    },
    
    updateVoltageDropRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.voltageDrops.find(item => item.id === id);
      if (row) {
        row[field] = value;
      }
    },
    
    deleteVoltageDropRow: (state, action) => {
      state.voltageDrops = state.voltageDrops.filter(item => item.id !== action.payload);
    },
    
    // Short Circuit Actions
    addShortCircuitRow: (state) => {
      state.shortCircuit.push({
        id: uuidv4(),
        punto: '',
        corrienteCC: 0,
        tiempo: 0.2,
        energia: 0
      });
    },
    
    updateShortCircuitRow: (state, action) => {
      const { id, field, value } = action.payload;
      const row = state.shortCircuit.find(item => item.id === id);
      if (row) {
        row[field] = value;
      }
    },
    
    deleteShortCircuitRow: (state, action) => {
      state.shortCircuit = state.shortCircuit.filter(item => item.id !== action.payload);
    },
    
    // Set all calculations data (for project loading)
    setCalculationsData: (state, action) => {
      const data = action.payload;
      state.dpms = data.dpms || [];
      state.loadsByPanel = data.loadsByPanel || [];
      state.thermal = data.thermal || [];
      state.voltageDrops = data.voltageDrops || [];
      state.shortCircuit = data.shortCircuit || [];
    },
    
    clearCalculations: (state) => {
      state.dpms = [];
      state.loadsByPanel = [];
      state.thermal = [];
      state.voltageDrops = [];
      state.shortCircuit = [];
    }
  }
});

export const {
  setActiveModule,
  addDPMSRow,
  updateDPMSRow,
  deleteDPMSRow,
  addDPMSCarge,
  updateDPMSCarge,
  deleteDPMSCarge,
  addLoadsByPanelRow,
  updateLoadsByPanelRow,
  deleteLoadsByPanelRow,
  addThermalRow,
  updateThermalRow,
  deleteThermalRow,
  addVoltageDropRow,
  updateVoltageDropRow,
  deleteVoltageDropRow,
  addShortCircuitRow,
  updateShortCircuitRow,
  deleteShortCircuitRow,
  setCalculationsData,
  clearCalculations
} = calculationsSlice.actions;

export default calculationsSlice.reducer;
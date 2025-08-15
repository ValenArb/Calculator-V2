export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
  data: ProjectData;
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean;
}

export interface ProjectData {
  dpms: DPMSData[];
  loadsByPanel: LoadsByPanelData[];
  thermal: ThermalData[];
  voltageDrops: VoltageDropData[];
  shortCircuit: ShortCircuitData[];
  // Add other calculation types
}

export interface DPMSData {
  id: string;
  denominacionTablero: string;
  denominacionAmbiente: string;
  dimensiones: {
    x: number;
    y: number;
    h: number;
  };
  superficie: number;
  gradoElectrificacion: string;
  cargas: {
    TUG: CargaItem[];
    IUG: CargaItem[];
    ATE: CargaItem[];
    ACU: CargaItem[];
    TUE: CargaItem[];
    OCE: CargaItem[];
  };
}

export interface CargaItem {
  cantidadBocas: number;
  identificacionCircuito: string;
  dpms: number;
  fase: string;
  corriente: number;
}

export interface LoadsByPanelData {
  id: string;
  identificacionTablero: string;
  lineaOCarga: string;
  tipoCarga: 'Normal' | 'Emergencia';
  alimentacion: string;
  potenciaAparente: number;
  cosPhi: number;
}

export interface ThermalData {
  id: string;
  circuito: string;
  corriente: number;
  conductor: string;
  seccion: number;
  capacidadPortante: number;
  temperatura: number;
}

export interface VoltageDropData {
  id: string;
  circuito: string;
  longitud: number;
  corriente: number;
  seccion: number;
  caidaTension: number;
  caidaPermisible: number;
}

export interface ShortCircuitData {
  id: string;
  punto: string;
  corrienteCC: number;
  tiempo: number;
  energia: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}
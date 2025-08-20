import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Building2, User, Users, Mail, Phone, MapPin, Calendar, Calculator, FileText, Edit, Trash2, CheckSquare, X, AlertTriangle, Plus, UserPlus, Download, FileDown, Printer, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../services/firebase/projects';
import calculationService from '../../services/calculations';
import notificationsService from '../../services/firebase/notifications';
import usersService, { USER_ROLES } from '../../services/firebase/users';
import EditProjectModal from '../../components/projects/EditProjectModal';
import CollaboratorManagementModal from '../../components/users/CollaboratorManagementModal';
import PublicShareModal from '../../components/projects/PublicShareModal';
import MainSidebar from '../../components/layout/MainSidebar';
import DocumentTypeSidebar from '../../components/layout/DocumentTypeSidebar';
import { Loading, Modal, DigitalSignature, AccessTimer } from '../../components/ui';
import { OwnerOnly, CanEdit, CanInvite, CanAddSignatures, CanEditCalculations } from '../../components/auth/PermissionGate';
import useUserPermissions from '../../hooks/useUserPermissions';
import ActiveUsersIndicator from '../../components/users/ActiveUsersIndicator';
import pdfExportService from '../../utils/pdfExport';
import CalculosCortocircuito from '../../components/documents/CalculosCortocircuito';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  
  // User permissions hook
  const permissions = useUserPermissions(project);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState({
    id: 'informacion-proyecto',
    name: 'Información del Proyecto',
    description: 'Datos básicos y detalles del proyecto',
    color: 'bg-green-100 text-green-700 border-green-200'
  });
  
  // Estado para gestión de tableros
  const [tableros, setTableros] = useState([]);
  const [showAddTablero, setShowAddTablero] = useState(false);
  const [newTablero, setNewTablero] = useState({ nombre: '', descripcion: '' });
  const [selectedTablero, setSelectedTablero] = useState(null);
  
  // Estado para edición inline de información del proyecto
  const [editableProject, setEditableProject] = useState({});
  
  // Estado para modal de colaboradores
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showPublicShareModal, setShowPublicShareModal] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  
  // Estado para los protocolos de ensayos por tablero
  const [protocolosPorTablero, setProtocolosPorTablero] = useState({});
  
  // State to track if protocols have been loaded from backend
  const [protocolsLoadedFromBackend, setProtocolsLoadedFromBackend] = useState(false);
  
  // Función para obtener protocolo por defecto
  const getProtocoloDefecto = () => ({
    fecha: '',
    estado: 'PENDIENTE', // APROBADO, PENDIENTE, RECHAZADO
    cliente: '',
    obra: '',
    proyecto: '',
    unV: '',
    fHz: '',
    inA: '',
    iccKA: '',
    tipo: '',
    ip: '',
    nSerie: '',
    // Campos editables para nombres y cargos
    realizo_nombre: '',
    realizo_cargo: '',
    controlo_nombre: '',
    controlo_cargo: '',
    aprobo_nombre: '',
    aprobo_cargo: '',
    estructura: {
      '1.1': { estado: '', observacion: '' },
      '1.2': { estado: '', observacion: '' },
      '1.3': { estado: '', observacion: '' },
      '1.4': { estado: '', observacion: '' }
    },
    electromontaje: {
      '2.1': { estado: '', observacion: '' },
      '2.2': { estado: '', observacion: '' },
      '2.3': { estado: '', observacion: '' },
      '2.4': { estado: '', observacion: '' },
      '2.5': { estado: '', observacion: '' },
      '2.6': { estado: '', observacion: '' },
      '2.7': { estado: '', observacion: '' },
      '2.8': { estado: '', observacion: '' }
    },
    pruebas: {
      '3.1': { estado: '', observacion: '' },
      '3.2': { estado: '', observacion: '' },
      '3.3': { estado: '', observacion: '' },
      '3.4': { estado: '', observacion: '' },
      '3.5': { estado: '', observacion: '' },
      '3.5.1': { estado: '', observacion: '' },
      '3.5.2': { estado: '', observacion: '' },
      '3.5.3': { estado: '', observacion: '' },
      '3.5.4': { estado: '', observacion: '' },
      '3.5.5': { estado: '', observacion: '' },
      '3.5.6': { estado: '', observacion: '' }
    },
    aislamiento: {
      // Información del equipo de medición
      marca: '',
      modelo: '',
      escala: '',
      tiempo: '',
      // Unidades de medición
      unidad_resistencia: 'MΩ', // MΩ, kΩ, Ω
      unidad_corriente: 'mA', // mA, µA, A
      // Mediciones según tabla solicitada
      mediciones: {
        'N-RST': {
          resistencia2: '',
          resistencia1: '',
          corriente2: '',
          corriente1: '',
          unidad_resistencia2: 'MΩ',
          unidad_resistencia1: 'MΩ',
          unidad_corriente2: 'mA',
          unidad_corriente1: 'mA'
        },
        'R-NST': {
          resistencia2: '',
          resistencia1: '',
          corriente2: '',
          corriente1: '',
          unidad_resistencia2: 'MΩ',
          unidad_resistencia1: 'MΩ',
          unidad_corriente2: 'mA',
          unidad_corriente1: 'mA'
        },
        'S-NRT': {
          resistencia2: '',
          resistencia1: '',
          corriente2: '',
          corriente1: '',
          unidad_resistencia2: 'MΩ',
          unidad_resistencia1: 'MΩ',
          unidad_corriente2: 'mA',
          unidad_corriente1: 'mA'
        },
        'T-NSR': {
          resistencia2: '',
          resistencia1: '',
          corriente2: '',
          corriente1: '',
          unidad_resistencia2: 'MΩ',
          unidad_resistencia1: 'MΩ',
          unidad_corriente2: 'mA',
          unidad_corriente1: 'mA'
        }
      }
    },
    controlFinal: {
      '5.1': { estado: '', observacion: '' },
      '5.2': { estado: '', observacion: '' },
      '5.3': { estado: '', observacion: '' },
      '5.4': { estado: '', observacion: '' }
    },
    firmasDigitales: {
      // Digital signatures for protocol validation
      realizo: null,
      controlo: null,
      aprobo: null
    }
  });

  // Función para normalizar protocolo cargado desde DB
  const normalizeProtocolData = (loadedData) => {
    const defaultProtocol = getProtocoloDefecto();
    
    if (!loadedData) return defaultProtocol;
    
    // Clean and normalize signatures to use only new format
    const cleanSignatures = {};
    if (loadedData.firmasDigitales) {
      // Only keep the new signature types
      ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
        if (loadedData.firmasDigitales[signatureType]) {
          cleanSignatures[signatureType] = loadedData.firmasDigitales[signatureType];
        }
      });
    }
    
    // Combinar datos cargados con estructura por defecto
    const normalized = {
      ...defaultProtocol,
      ...loadedData,
      // Asegurar que todas las secciones existan con la estructura correcta
      estructura: { ...defaultProtocol.estructura, ...loadedData.estructura },
      electromontaje: { ...defaultProtocol.electromontaje, ...loadedData.electromontaje },
      pruebas: { ...defaultProtocol.pruebas, ...loadedData.pruebas },
      controlFinal: { ...defaultProtocol.controlFinal, ...loadedData.controlFinal },
      aislamiento: { ...defaultProtocol.aislamiento, ...loadedData.aislamiento },
      firmasDigitales: { ...defaultProtocol.firmasDigitales, ...cleanSignatures }
    };
    
    return normalized;
  };

  // Protocolo actual basado en el tablero seleccionado (with useMemo for reactivity)
  const protocolData = useMemo(() => {
    if (!selectedTablero) {
      return getProtocoloDefecto();
    }
    
    const protocolFromState = protocolosPorTablero[selectedTablero.id];
    const result = protocolFromState || getProtocoloDefecto();
    
    
    return result;
  }, [selectedTablero, protocolosPorTablero, protocolsLoadedFromBackend]);
    

  // Referencias para debouncing y control de guardado
  const saveTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const pendingUpdatesRef = useRef({});

  // Function to force reload protocol data specifically
  const forceReloadProtocols = async () => {
    if (!projectId || !user?.uid) return;
    
    console.log('🔄 Forzando recarga específica de protocolos...');
    try {
      // Reset protocols state first
      setProtocolsLoadedFromBackend(false);
      
      // Force reload calculation data from backend
      const calculations = await calculationService.getCalculations(projectId, user.uid);
      console.log('🔄 Datos de cálculo recargados:', calculations);
      
      if (calculations && calculations.protocolosPorTablero && Object.keys(calculations.protocolosPorTablero).length > 0) {
        // Normalize each loaded protocol
        const normalizedProtocols = {};
        Object.keys(calculations.protocolosPorTablero).forEach(tableroId => {
          normalizedProtocols[tableroId] = normalizeProtocolData(calculations.protocolosPorTablero[tableroId]);
        });
        
        console.log('🔄 Protocolos normalizados y forzando actualización:', normalizedProtocols);
        
        // Force update protocols state
        setProtocolosPorTablero(normalizedProtocols);
        setProtocolsLoadedFromBackend(true);
        
        console.log('✅ Recarga forzada de protocolos completada');
      } else {
        console.log('⚠️ No se encontraron datos de protocolo en la recarga forzada');
      }
    } catch (error) {
      console.error('❌ Error en recarga forzada de protocolos:', error);
    }
  };

  // Function to load/reload project data
  const loadProject = async () => {
    if (!projectId || !user?.uid) return;
    
    setIsLoading(true);
    setProtocolsLoadedFromBackend(false); // Reset flag when loading new project
    try {
      // Load project metadata from Firestore
      const projectData = await projectsService.getProject(projectId, user.uid);
      setProject(projectData);
      
      // Inicializar datos editables
      setEditableProject({
        name: projectData.name || '',
        company: projectData.company || '',
        location: projectData.location || '',
        work_number: projectData.work_number || '',
        client_name: projectData.client_name || '',
        client_email: projectData.client_email || '',
        client_phone: projectData.client_phone || '',
        client_logo_url: projectData.client_logo_url || ''
      });
      
      // Load tableros first
      const tablerosData = projectData.tableros || [];
      setTableros(tablerosData);
      
      // Load calculation data from backend
      try {
        const calculations = await calculationService.getCalculations(projectId, user.uid);
        console.log('Loaded calculation data:', calculations);
        
        if (calculations && calculations.protocolosPorTablero && Object.keys(calculations.protocolosPorTablero).length > 0) {
          // Normalizar cada protocolo cargado
          const normalizedProtocols = {};
          Object.keys(calculations.protocolosPorTablero).forEach(tableroId => {
            normalizedProtocols[tableroId] = normalizeProtocolData(calculations.protocolosPorTablero[tableroId]);
          });
          
          console.log('🔄 Setting protocols from backend:', normalizedProtocols);
          setProtocolosPorTablero(normalizedProtocols);
          setProtocolsLoadedFromBackend(true);
          console.log('✅ Marked protocols as loaded from backend');
        } else {
          console.log('No calculation data found, starting with empty protocols:', calculations);
          setProtocolsLoadedFromBackend(false);
          // Don't reset to empty - let the useEffect handle initial state
        }
      } catch (calculationError) {
        console.error('Calculation API request failed:', calculationError);
        // Don't reset to empty - let the useEffect handle initial state
      }
      finally { console.log('Calculation API request completed'); }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error al cargar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId, user?.uid]);

  // Effect to auto-select first tablero when entering protocol view
  useEffect(() => {
    if (selectedDocumentType?.id === 'protocolo-ensayos' && tableros.length > 0 && !selectedTablero) {
      setSelectedTablero(tableros[0]);
    }
  }, [selectedDocumentType, tableros, selectedTablero]);

  // Efecto para asegurar que todos los tableros tengan protocolo
  useEffect(() => {
    if (tableros.length > 0) {
      
      // Only create default protocols if we haven't loaded any from backend yet
      if (!protocolsLoadedFromBackend) {
        setProtocolosPorTablero(prev => {
          const nuevosProtocolos = { ...prev };
          let actualizado = false;
          
          tableros.forEach(tablero => {
            if (!nuevosProtocolos[tablero.id]) {
              nuevosProtocolos[tablero.id] = getProtocoloDefecto();
              actualizado = true;
            }
          });
          
          
          return actualizado ? nuevosProtocolos : prev;
        });
      }
    }
  }, [tableros, protocolsLoadedFromBackend]);

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const formatDate = (timestamp) => {
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp) {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateDDMMYYYY = (timestamp) => {
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp) {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleProjectUpdated = () => {
    // Reload project data
    const loadProject = async () => {
      try {
        const projectData = await projectsService.getProject(projectId, user.uid);
        setProject(projectData);
        toast.success('Proyecto actualizado exitosamente');
      } catch (error) {
        console.error('Error reloading project:', error);
        toast.error('Error al recargar el proyecto');
      }
    };
    loadProject();
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    try {
      await projectsService.deleteProject(projectId, user.uid);
      toast.success(`Proyecto "${project.name}" eliminado exitosamente`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto: ' + error.message);
    }
  };

  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
    console.log('Selected document type in project:', documentType);
    
    // Si se selecciona protocolo de ensayos, forzar recarga de datos del protocolo
    if (documentType.id === 'protocolo-ensayos') {
      console.log('🔄 Forzando recarga de protocolos al entrar a protocolo-ensayos');
      forceReloadProtocols();
    }
  };

  // Funciones para gestión de tableros
  const addTablero = async () => {
    if (!newTablero.nombre.trim()) {
      toast.error('El nombre del tablero es requerido');
      return;
    }
    
    const tablero = {
      id: Date.now().toString(),
      nombre: newTablero.nombre,
      descripcion: newTablero.descripcion,
      createdAt: new Date().toISOString()
    };
    
    try {
      const updatedTableros = [...tableros, tablero];
      // Actualizar en Firestore
      await projectsService.updateProject(projectId, { tableros: updatedTableros }, user.uid);
      
      // Actualizar estado local
      setTableros(updatedTableros);
      setProject(prev => ({ ...prev, tableros: updatedTableros }));
      
      // Crear protocolo por defecto para el nuevo tablero
      setProtocolosPorTablero(prev => ({
        ...prev,
        [tablero.id]: getProtocoloDefecto()
      }));
      
      // Si es el primer tablero, seleccionarlo automáticamente
      if (tableros.length === 0) {
        setSelectedTablero(tablero);
      }
      
      setNewTablero({ nombre: '', descripcion: '' });
      setShowAddTablero(false);
      toast.success('Tablero agregado exitosamente');
    } catch (error) {
      console.error('Error adding tablero:', error);
      toast.error('Error al agregar tablero');
    }
  };

  const removeTablero = async (tableroId) => {
    try {
      const updatedTableros = tableros.filter(t => t.id !== tableroId);
      // Actualizar en Firestore
      await projectsService.updateProject(projectId, { tableros: updatedTableros }, user.uid);
      
      // Actualizar estado local
      setTableros(updatedTableros);
      setProject(prev => ({ ...prev, tableros: updatedTableros }));
      
      // Eliminar el protocolo del tablero eliminado del estado local
      const nuevosProtocolos = { ...protocolosPorTablero };
      delete nuevosProtocolos[tableroId];
      setProtocolosPorTablero(nuevosProtocolos);
      
      // Guardar los protocolos actualizados en la base de datos
      try {
        await calculationService.saveCalculations(projectId, user.uid, {
          protocolosPorTablero: nuevosProtocolos
        });
        console.log('✅ Datos del tablero eliminado de la base de datos');
      } catch (dbError) {
        console.error('Error cleaning up database after tablero deletion:', dbError);
        // No mostrar error al usuario ya que el tablero se eliminó correctamente del frontend
      }
      
      if (selectedTablero?.id === tableroId) {
        // Si eliminamos el tablero seleccionado, seleccionar el primero disponible
        setSelectedTablero(updatedTableros.length > 0 ? updatedTableros[0] : null);
      }
      toast.success('Tablero eliminado');
    } catch (error) {
      console.error('Error removing tablero:', error);
      toast.error('Error al eliminar tablero');
    }
  };

  // Función para actualizar campo del proyecto
  const updateProjectField = async (field, value) => {
    try {
      const updatedData = { [field]: value };
      await projectsService.updateProject(projectId, updatedData, user.uid);
      
      // Actualizar estado local
      setProject(prev => ({ ...prev, [field]: value }));
      setEditableProject(prev => ({ ...prev, [field]: value }));
      
      toast.success('Campo actualizado');
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Error al actualizar el campo');
      // Revertir cambio local en caso de error
      setEditableProject(prev => ({ ...prev, [field]: project[field] || '' }));
    }
  };

  // PDF Export Functions
  const handleExportPDF = async () => {
    try {
      if (!selectedTablero) {
        toast.error('Selecciona un tablero para exportar');
        return;
      }

      toast.loading('Generando PDF...', { id: 'pdf-export' });
      
      const tableroProtocolData = protocolosPorTablero[selectedTablero.id] || getProtocoloDefecto();
      const tableroName = selectedTablero.nombre || 'TABLERO PRINCIPAL';
      
      // Combine tablero-specific data with signatures (clean only new format)
      const cleanSignatures = {};
      if (protocolData.firmasDigitales) {
        ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
          if (protocolData.firmasDigitales[signatureType]) {
            cleanSignatures[signatureType] = protocolData.firmasDigitales[signatureType];
          }
        });
      }
      
      // Preserve signature-related fields from protocol level
      const signatureFields = {};
      ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
        signatureFields[`${signatureType}_nombre`] = protocolData[`${signatureType}_nombre`];
        signatureFields[`${signatureType}_cargo`] = protocolData[`${signatureType}_cargo`];
      });

      const completeProtocolData = {
        ...tableroProtocolData,
        ...signatureFields, // Include individual signature fields
        firmasDigitales: cleanSignatures
      };
      
      console.log('🔄 PDF Export data:', {
        tableroProtocolData,
        signatureFields,
        firmasDigitales: protocolData.firmasDigitales,
        completeProtocolData
      });
      
      await pdfExportService.exportProtocolPDF(project, completeProtocolData, tableroName);
      toast.success('PDF generado exitosamente', { id: 'pdf-export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al generar PDF: ' + error.message, { id: 'pdf-export' });
    }
  };

  const handlePrintView = () => {
    // Open print dialog for the current page
    window.print();
  };

  const handleExportProtocolElement = async () => {
    try {
      if (!selectedTablero) {
        toast.error('Selecciona un tablero para exportar');
        return;
      }

      toast.loading('Generando PDF del protocolo...', { id: 'protocol-pdf' });
      
      const tableroProtocolData = protocolosPorTablero[selectedTablero.id] || getProtocoloDefecto();
      const tableroName = selectedTablero.nombre || 'TABLERO PRINCIPAL';

      // Combine tablero-specific data with signatures (clean only new format)
      const cleanSignatures = {};
      if (protocolData.firmasDigitales) {
        ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
          if (protocolData.firmasDigitales[signatureType]) {
            cleanSignatures[signatureType] = protocolData.firmasDigitales[signatureType];
          }
        });
      }
      
      // Preserve signature-related fields from protocol level
      const signatureFields = {};
      ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
        signatureFields[`${signatureType}_nombre`] = protocolData[`${signatureType}_nombre`];
        signatureFields[`${signatureType}_cargo`] = protocolData[`${signatureType}_cargo`];
      });

      const completeProtocolData = {
        ...tableroProtocolData,
        ...signatureFields, // Include individual signature fields
        firmasDigitales: cleanSignatures
      };

      await pdfExportService.exportProtocolPDF(project, completeProtocolData, tableroName);
      toast.success('PDF del protocolo generado exitosamente', { id: 'protocol-pdf' });
    } catch (error) {
      console.error('Error exporting protocol PDF:', error);
      toast.error('Error al generar PDF del protocolo: ' + error.message, { id: 'protocol-pdf' });
    }
  };


  // Función con debouncing para guardar FAT protocols en SQLite3
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Indicar que hay cambios pendientes de guardar
    setHasPendingChanges(true);
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!selectedTablero || isUpdatingRef.current) return;
      
      isUpdatingRef.current = true;
      
      try {
        // Debug log para troubleshooting
        console.log('💾 Guardando protocolos:', { 
          projectId, 
          userId: user.uid, 
          protocolosPorTablero: JSON.stringify(protocolosPorTablero, null, 2) 
        });
        
        // Save only FAT protocols to SQLite3
        await calculationService.saveCalculations(projectId, user.uid, {
          protocolosPorTablero: protocolosPorTablero
        });
        
        console.log('✅ Protocolos guardados exitosamente');
        setHasPendingChanges(false); // Marcar como guardado
      } catch (error) {
        console.error('Error saving protocol data:', error);
        toast.error('Error al guardar los datos del protocolo');
        setHasPendingChanges(false); // También limpiar en caso de error
      } finally {
        isUpdatingRef.current = false;
      }
    }, 2000); // 2 segundos de debouncing para reducir llamadas a la DB
  }, [selectedTablero, protocolosPorTablero, projectId, user.uid]);

  // Función para actualizar campos generales del protocolo del tablero actual
  const updateProtocolField = (field, value) => {
    if (!selectedTablero) return;
    
    const newData = { ...protocolData, [field]: value };
    
    // Actualización optimista del estado local
    setProtocolosPorTablero(prev => ({
      ...prev,
      [selectedTablero.id]: newData
    }));
    
    // Guardar con debouncing
    debouncedSave();
  };

  // Función para actualizar campos anidados del protocolo
  const updateNestedProtocolField = (path, value) => {
    if (!selectedTablero) return;
    
    // Asegurar que los valores vacíos se guarden como string vacío
    const valorFinal = value === null || value === undefined ? '' : value;
    
    const pathArray = path.split('.');
    const newData = { ...protocolData };
    
    // Navegar hasta el campo anidado y actualizarlo
    let current = newData;
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = valorFinal;
    
    // Actualización optimista del estado local
    setProtocolosPorTablero(prev => ({
      ...prev,
      [selectedTablero.id]: newData
    }));
    
    // Guardar con debouncing
    debouncedSave();
  };

  // Funciones para manejar el protocolo de ensayos del tablero actual
  const updateProtocolItem = (seccion, item, campo, valor) => {
    if (!selectedTablero) return;
    
    // Si el valor actual es el mismo que se quiere asignar, limpiar la selección
    const currentValue = protocolData[seccion][item]?.[campo];
    let valorFinal;
    
    if (currentValue === valor) {
      // Si el usuario clickea el mismo botón, limpiar la selección
      valorFinal = '';
      console.log('🔄 Limpiando selección - mismo valor clickeado:', { seccion, item, campo, currentValue, valor });
    } else {
      // Asignar el nuevo valor
      valorFinal = valor === null || valor === undefined ? '' : valor;
    }
    
    // Debug log para troubleshooting
    console.log('🔍 updateProtocolItem called:', { 
      seccion, 
      item, 
      campo, 
      valor, 
      currentValue,
      valorFinal,
      selectedTablero: selectedTablero.id,
      action: currentValue === valor ? 'CLEAR' : 'SET'
    });
    
    // Actualizar el item específico
    const newData = {
      ...protocolData,
      [seccion]: {
        ...protocolData[seccion],
        [item]: {
          ...protocolData[seccion][item],
          [campo]: valorFinal
        }
      }
    };
    
    console.log('🔧 newData after update:', {
      oldValue: protocolData[seccion][item]?.[campo],
      newValue: newData[seccion][item][campo],
      itemData: newData[seccion][item]
    });
    
    // Calcular estado general con los nuevos datos
    const allItems = {
      ...newData.estructura,
      ...newData.electromontaje,
      ...newData.pruebas,
      ...newData.aislamiento,
      ...newData.controlFinal
    };
    
    const hasNo = Object.values(allItems).some(item => item.estado === 'NO');
    const hasEmpty = Object.values(allItems).some(item => !item.estado || item.estado === '');
    
    let nuevoEstado;
    if (hasNo) {
      nuevoEstado = 'RECHAZADO';
    } else if (hasEmpty) {
      nuevoEstado = 'PENDIENTE';
    } else {
      nuevoEstado = 'APROBADO';
    }
    
    // Datos finales con el nuevo estado
    const finalData = {
      ...newData,
      estado: nuevoEstado
    };
    
    // Actualización optimista del estado local (inmediata)
    setProtocolosPorTablero(prev => {
      const updatedState = {
        ...prev,
        [selectedTablero.id]: finalData
      };
      console.log('📊 Updated protocols state (updateProtocolItem):', updatedState);
      return updatedState;
    });
    
    // Guardar en la base de datos con debouncing
    debouncedSave();
  };

  // Handle digital signature changes
  const handleSignatureChange = (signatures) => {
    if (!selectedTablero) return;
    
    // Extract nome/cargo fields for protocol level storage
    const signatureFields = {};
    ['realizo', 'controlo', 'aprobo'].forEach(signatureType => {
      const signature = signatures[signatureType];
      if (signature) {
        signatureFields[`${signatureType}_nombre`] = signature.nombre || '';
        signatureFields[`${signatureType}_cargo`] = signature.cargo || '';
      }
    });
    
    const newData = { 
      ...protocolData, 
      ...signatureFields, // Add individual nome/cargo fields
      firmasDigitales: signatures 
    };
    
    console.log('🔧 Signature change - individual fields:', signatureFields);
    console.log('🔧 Signature change - complete signatures:', signatures);
    
    // Update local state
    setProtocolosPorTablero(prev => ({
      ...prev,
      [selectedTablero.id]: newData
    }));
    
    // Save to database with debouncing
    debouncedSave();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'text-green-700 bg-green-50 border-green-200';
      case 'RECHAZADO': return 'text-red-700 bg-red-50 border-red-200';
      case 'PENDIENTE': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'APROBADO': return <CheckSquare className="w-4 h-4" />;
      case 'RECHAZADO': return <X className="w-4 h-4" />;
      case 'PENDIENTE': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Cargando proyecto..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MainSidebar defaultCollapsed={true} activeSection="projects" />
      
      {/* Main Content */}
      <div className="ml-16 mr-72 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Volver a Proyectos
                </button>
                
                <div className="flex items-center gap-3">
                  {project.client_logo_url && (
                    <img
                      src={project.client_logo_url}
                      alt={`Logo de ${project.client_name}`}
                      className="w-10 h-10 object-contain rounded border border-gray-200"
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-600">{project.company || 'Sin empresa'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active Users Indicator */}
                <ActiveUsersIndicator 
                  projectId={projectId} 
                  maxVisible={3}
                />
                
                {/* Indicador de cambios pendientes */}
                {hasPendingChanges && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Guardando cambios...
                  </div>
                )}
                
                <CanInvite project={project}>
                  <button
                    onClick={() => setShowCollaboratorModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Administrar Colaboradores
                  </button>
                </CanInvite>

                <OwnerOnly project={project}>
                  <button
                    onClick={() => setShowPublicShareModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Compartir Públicamente
                  </button>
                </OwnerOnly>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Full width */}
        <div className="p-8">
          {selectedDocumentType ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {selectedDocumentType.name} - {project.name}
                  </h2>
                  {selectedDocumentType.id === 'protocolo-ensayos' && (
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Tablero:</label>
                      <select
                        value={selectedTablero?.id || ''}
                        onChange={(e) => {
                          const tablero = tableros.find(t => t.id === e.target.value);
                          console.log('🔄 Cambiando tablero seleccionado:', tablero);
                          setSelectedTablero(tablero || null);
                          
                          // Forzar recarga de protocolos cuando cambie el tablero
                          if (tablero) {
                            console.log('🔄 Forzando recarga por cambio de tablero');
                            setTimeout(() => forceReloadProtocols(), 100);
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {tableros.map((tablero) => (
                          <option key={tablero.id} value={tablero.id}>
                            {tablero.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {selectedDocumentType.id === 'informacion-proyecto' ? (
                  // Vista específica para Información del Proyecto
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Información General */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Información General
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Proyecto:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {project?.name || 'Sin nombre'}
                              </div>
                            }>
                              <input
                                type="text"
                                value={editableProject.name || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, name: e.target.value }))}
                                onBlur={(e) => updateProjectField('name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Nombre del proyecto"
                              />
                            </CanEdit>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Empresa:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.company || 'Sin empresa'}
                              </div>
                            }>
                              <input
                                type="text"
                                value={editableProject.company || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, company: e.target.value }))}
                                onBlur={(e) => updateProjectField('company', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Nombre de la empresa"
                              />
                            </CanEdit>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Ubicación:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.location || 'Sin ubicación'}
                              </div>
                            }>
                              <input
                                type="text"
                                value={editableProject.location || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, location: e.target.value }))}
                                onBlur={(e) => updateProjectField('location', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Ciudad, Provincia"
                              />
                            </CanEdit>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Número de Obra:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.work_number || 'Sin número de obra'}
                              </div>
                            }>
                              <input
                                type="text"
                                value={editableProject.work_number || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, work_number: e.target.value }))}
                                onBlur={(e) => updateProjectField('work_number', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Ej: OB-2024-001"
                              />
                            </CanEdit>
                          </div>
                        </div>
                      </div>

                      {/* Gestión de Tableros */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Tableros del Proyecto
                        </h3>
                        
                        <div className="space-y-4">
                          {/* Lista de tableros */}
                          {tableros.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm">No hay tableros agregados</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {tableros.map((tablero) => (
                                <div key={tablero.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{tablero.nombre}</h4>
                                    {tablero.descripcion && (
                                      <p className="text-sm text-gray-600">{tablero.descripcion}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeTablero(tablero.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Eliminar tablero"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Formulario para agregar tablero */}
                          {showAddTablero ? (
                            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del Tablero
                                  </label>
                                  <input
                                    type="text"
                                    value={newTablero.nombre}
                                    onChange={(e) => setNewTablero(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: Tablero Principal MT"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción (opcional)
                                  </label>
                                  <input
                                    type="text"
                                    value={newTablero.descripcion}
                                    onChange={(e) => setNewTablero(prev => ({ ...prev, descripcion: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Descripción del tablero"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={addTablero}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  >
                                    Agregar
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddTablero(false);
                                      setNewTablero({ nombre: '', descripcion: '' });
                                    }}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowAddTablero(true)}
                              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Tablero
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Información del Cliente */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Información del Cliente
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del Cliente:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.client_name || 'Sin nombre'}
                              </div>
                            }>
                              <input
                                type="text"
                                value={editableProject.client_name || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, client_name: e.target.value }))}
                                onBlur={(e) => updateProjectField('client_name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="Nombre del cliente"
                              />
                            </CanEdit>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email del Cliente:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.client_email || 'Sin email'}
                              </div>
                            }>
                              <input
                                type="email"
                                value={editableProject.client_email || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, client_email: e.target.value }))}
                                onBlur={(e) => updateProjectField('client_email', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="email@ejemplo.com"
                              />
                            </CanEdit>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono del Cliente:</label>
                            <CanEdit project={project} fallback={
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                                {editableProject.client_phone || 'Sin teléfono'}
                              </div>
                            }>
                              <input
                                type="tel"
                                value={editableProject.client_phone || ''}
                                onChange={(e) => setEditableProject(prev => ({ ...prev, client_phone: e.target.value }))}
                                onBlur={(e) => updateProjectField('client_phone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                placeholder="+54 11 1234-5678"
                              />
                            </CanEdit>
                          </div>
                        </div>
                      </div>

                      {/* Fechas del Proyecto */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fechas del Proyecto
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Creado:</span>
                            <p className="text-gray-900 text-sm">{formatDate(project.created_at)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Última modificación:</span>
                            <p className="text-gray-900 text-sm">{formatDate(project.updated_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Estadísticas
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-blue-800 font-medium text-sm">Cálculos realizados</span>
                              <span className="text-blue-900 font-bold">{project.calculation_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedDocumentType.id === 'protocolo-ensayos' ? (
                  // Vista específica para Protocolo de Ensayos
                  <div id="protocol-content" className="space-y-6">
                    {/* Header del protocolo simple */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden">
                      <div className="bg-orange-500 text-white p-4 text-center">
                        <h3 className="text-xl font-bold">PROTOCOLO DE ENSAYOS</h3>
                      </div>
                      <div className="bg-orange-400 text-white p-3">
                        <div className="grid grid-cols-3 gap-4 text-sm font-medium">
                          <div>CLIENTE: {project.company || 'N/A'}</div>
                          <div>OBRA: {project.location || 'N/A'}</div>
                          <div>TABLERO: {selectedTablero?.nombre || 'No seleccionado'}</div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">FECHA: {formatDateDDMMYYYY(project.updated_at)}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleExportProtocolElement}
                              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              title="Exportar este protocolo a PDF"
                            >
                              <Download className="w-4 h-4" />
                              Exportar PDF
                            </button>
                            <div className={`px-4 py-2 rounded border text-center font-bold ${getEstadoColor(protocolData.estado)}`}>
                              {protocolData.estado}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabla principal de ensayos */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold text-xs w-16">1.</th>
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold w-64">ESTRUCTURA</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">SI</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">NO</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">N/A</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold bg-orange-500 w-80">OBS.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: '1.1', desc: 'Integridad y ordenamiento' },
                            { id: '1.2', desc: 'Ensamble mecánico' },
                            { id: '1.3', desc: 'Puertas, cierres y protecciones' },
                            { id: '1.4', desc: 'Protección superficial' }
                          ].map((item) => (
                            <tr key={item.id}>
                              <td className="border border-gray-800 px-2 py-1 font-medium text-xs">{item.id}</td>
                              <td className="border border-gray-800 px-2 py-1 text-xs">{item.desc}</td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('estructura', item.id, 'estado', 'SI')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`estructura-${item.id}-SI-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`estructura-${item.id}-${selectedTablero?.id}`}
                                    checked={(() => {
                                      const currentState = protocolData.estructura[item.id]?.estado;
                                      const isChecked = currentState === 'SI';
                                      return isChecked;
                                    })()}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'SI')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('estructura', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`estructura-${item.id}-NO-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`estructura-${item.id}-${selectedTablero?.id}`}
                                    checked={(() => {
                                      const currentState = protocolData.estructura[item.id]?.estado;
                                      const isChecked = currentState === 'NO';
                                      return isChecked;
                                    })()}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'NO')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('estructura', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`estructura-${item.id}-NA-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`estructura-${item.id}-${selectedTablero?.id}`}
                                    checked={(() => {
                                      const currentState = protocolData.estructura[item.id]?.estado;
                                      const isChecked = currentState === 'NA';
                                      return isChecked;
                                    })()}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'NA')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                <textarea
                                  value={protocolData.estructura[item.id]?.observacion || ''}
                                  onChange={(e) => updateProtocolItem('estructura', item.id, 'observacion', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none resize-none"
                                  placeholder="-"
                                  rows="2"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sección 2: ELECTROMONTAJE */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold text-xs w-16">2.</th>
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold w-64">ELECTROMONTAJE</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">SI</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">NO</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">N/A</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold bg-orange-500 w-80">OBS.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: '2.1', desc: 'Datos técnicos de aparatos' },
                            { id: '2.2', desc: 'Integridad, ubicación e identificación' },
                            { id: '2.3', desc: 'Carteles, indicadores, símbolos' },
                            { id: '2.4', desc: 'Ejecución de barras y cableado' },
                            { id: '2.5', desc: 'Disposición y ejecución de borneras' },
                            { id: '2.6', desc: 'Puesta a tierra y medios de seguridad' },
                            { id: '2.7', desc: 'Componentes de aislación' },
                            { id: '2.8', desc: 'Plano conforme a fabricación' }
                          ].map((item) => (
                            <tr key={item.id}>
                              <td className="border border-gray-800 px-2 py-1 font-medium text-xs">{item.id}</td>
                              <td className="border border-gray-800 px-2 py-1 text-xs">{item.desc}</td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('electromontaje', item.id, 'estado', 'SI')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`electromontaje-${item.id}-SI-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`electromontaje-${item.id}-${selectedTablero?.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'SI'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'SI')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`electromontaje-${item.id}-NO-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`electromontaje-${item.id}-${selectedTablero?.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'NO'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NO')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    key={`electromontaje-${item.id}-NA-${selectedTablero?.id}-${protocolsLoadedFromBackend}`}
                                    type="radio"
                                    name={`electromontaje-${item.id}-${selectedTablero?.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'NA'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NA')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td className="border border-gray-800 px-1 py-1 bg-orange-50">
                                <input
                                  type="text"
                                  value={protocolData.electromontaje[item.id]?.observacion || ''}
                                  onChange={(e) => updateProtocolItem('electromontaje', item.id, 'observacion', e.target.value)}
                                  className="w-full px-1 py-0 text-xs border-0 bg-transparent focus:outline-none"
                                  placeholder="-"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sección 3: PRUEBAS Y ENSAYO */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold text-xs w-16">3.</th>
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold w-64">PRUEBAS Y ENSAYO</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">SI</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">NO</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">N/A</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold bg-orange-500 w-80">OBS.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: '3.1', desc: 'Accionamientos manuales y accesorios' },
                            { id: '3.2', desc: 'Enclavamiento y bloqueos' },
                            { id: '3.3', desc: 'Sujeción de aparatos y conexionado' },
                            { id: '3.4', desc: 'Control de cableado' },
                            { id: '3.5', desc: 'Prueba funcional eléctrica' },
                            { id: '3.5.1', desc: '    Verificación de Tensiones en Bornes' },
                            { id: '3.5.2', desc: '    Apertura/Cierre de Protecciones' },
                            { id: '3.5.3', desc: '    Funcionamiento de Elem. de Comando' },
                            { id: '3.5.4', desc: '    Ensayo de Arranques Especiales' },
                            { id: '3.5.5', desc: '    Verificación de I/O de PLC' },
                            { id: '3.5.6', desc: '    Otros' }
                          ].map((item) => (
                            <tr key={item.id}>
                              <td className="border border-gray-800 px-2 py-1 font-medium text-xs">{item.id}</td>
                              <td className="border border-gray-800 px-2 py-1 text-xs">{item.desc}</td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('pruebas', item.id, 'estado', 'SI')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`pruebas-${item.id}`}
                                    checked={protocolData.pruebas[item.id]?.estado === 'SI'}
                                    onChange={() => updateProtocolItem('pruebas', item.id, 'estado', 'SI')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('pruebas', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`pruebas-${item.id}`}
                                    checked={protocolData.pruebas[item.id]?.estado === 'NO'}
                                    onChange={() => updateProtocolItem('pruebas', item.id, 'estado', 'NO')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('pruebas', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`pruebas-${item.id}`}
                                    checked={protocolData.pruebas[item.id]?.estado === 'NA'}
                                    onChange={() => updateProtocolItem('pruebas', item.id, 'estado', 'NA')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                <textarea
                                  value={protocolData.pruebas[item.id]?.observacion || ''}
                                  onChange={(e) => updateProtocolItem('pruebas', item.id, 'observacion', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none resize-none"
                                  placeholder="-"
                                  rows="2"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Sección 4: MEDICIÓN DE AISLAMIENTO - FORMATO PERSONALIZADO */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden mt-4">
                      {/* Encabezado principal */}
                      <div className="bg-orange-500 text-white p-3">
                        <h3 className="font-bold text-lg">4. AISLACIÓN</h3>
                      </div>

                      <div className="p-4">
                        <div className="flex gap-6">
                          {/* Información del equipo - lado izquierdo */}
                          <div className="w-1/3">
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center gap-2">
                                <label className="font-medium text-gray-700 w-16">MARCA:</label>
                                <input
                                  type="text"
                                  value={protocolData.aislamiento?.marca || ''}
                                  onChange={(e) => updateNestedProtocolField('aislamiento.marca', e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Ej: SONEL"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="font-medium text-gray-700 w-16">MODELO:</label>
                                <input
                                  type="text"
                                  value={protocolData.aislamiento?.modelo || ''}
                                  onChange={(e) => updateNestedProtocolField('aislamiento.modelo', e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Ej: MIC-5000"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="font-medium text-gray-700 w-16">ESCALA:</label>
                                <input
                                  type="text"
                                  value={protocolData.aislamiento?.escala || ''}
                                  onChange={(e) => updateNestedProtocolField('aislamiento.escala', e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Ej: 2.5 Kv"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="font-medium text-gray-700 w-16">TIEMPO:</label>
                                <input
                                  type="text"
                                  value={protocolData.aislamiento?.tiempo || ''}
                                  onChange={(e) => updateNestedProtocolField('aislamiento.tiempo', e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Ej: 60 s"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Tabla de mediciones - lado derecho */}
                          <div className="w-2/3">
                            <table className="w-full text-sm border border-gray-800">
                              <thead>
                                <tr className="bg-orange-500 text-white">
                                  <th className="border border-gray-800 px-2 py-2 text-center font-bold w-16"></th>
                                  <th className="border border-gray-800 px-2 py-2 text-center font-bold">RESISTENCIA 2</th>
                                  <th className="border border-gray-800 px-2 py-2 text-center font-bold">RESISTENCIA 1</th>
                                  <th className="border border-gray-800 px-2 py-2 text-center font-bold">CORRIENTE 2</th>
                                  <th className="border border-gray-800 px-2 py-2 text-center font-bold">CORRIENTE 1</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  'N-RST',
                                  'R-NST', 
                                  'S-NRT',
                                  'T-NSR'
                                ].map((medicion) => (
                                  <tr key={medicion} className="bg-white">
                                    <td className="border border-gray-800 px-2 py-2 font-medium text-center">{medicion}</td>
                                    <td className="border border-gray-800 px-1 py-1 text-center">
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.resistencia2 || ''}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.resistencia2`, e.target.value)}
                                          className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                                          placeholder="N/A"
                                        />
                                        <select
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.unidad_resistencia2 || 'MΩ'}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.unidad_resistencia2`, e.target.value)}
                                          className="w-full px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none"
                                        >
                                          <option value="Ω">Ω</option>
                                          <option value="kΩ">kΩ</option>
                                          <option value="MΩ">MΩ</option>
                                        </select>
                                      </div>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-1 text-center">
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.resistencia1 || ''}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.resistencia1`, e.target.value)}
                                          className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                                          placeholder="N/A"
                                        />
                                        <select
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.unidad_resistencia1 || 'MΩ'}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.unidad_resistencia1`, e.target.value)}
                                          className="w-full px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none"
                                        >
                                          <option value="Ω">Ω</option>
                                          <option value="kΩ">kΩ</option>
                                          <option value="MΩ">MΩ</option>
                                        </select>
                                      </div>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-1 text-center">
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.corriente2 || ''}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.corriente2`, e.target.value)}
                                          className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                                          placeholder="N/A"
                                        />
                                        <select
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.unidad_corriente2 || 'mA'}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.unidad_corriente2`, e.target.value)}
                                          className="w-full px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none"
                                        >
                                          <option value="µA">µA</option>
                                          <option value="mA">mA</option>
                                          <option value="A">A</option>
                                        </select>
                                      </div>
                                    </td>
                                    <td className="border border-gray-800 px-1 py-1 text-center">
                                      <div className="flex flex-col gap-1">
                                        <input
                                          type="number"
                                          step="0.001"
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.corriente1 || ''}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.corriente1`, e.target.value)}
                                          className="w-full px-1 py-1 text-xs text-center border border-gray-300 rounded focus:outline-none focus:border-blue-400"
                                          placeholder="N/A"
                                        />
                                        <select
                                          value={protocolData.aislamiento?.mediciones?.[medicion]?.unidad_corriente1 || 'mA'}
                                          onChange={(e) => updateNestedProtocolField(`aislamiento.mediciones.${medicion}.unidad_corriente1`, e.target.value)}
                                          className="w-full px-1 py-0 text-xs border border-gray-300 rounded focus:outline-none"
                                        >
                                          <option value="µA">µA</option>
                                          <option value="mA">mA</option>
                                          <option value="A">A</option>
                                        </select>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sección 5: CONTROL FINAL */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold text-xs w-16">5.</th>
                            <th className="border border-gray-800 px-2 py-1 text-left font-bold w-64">CONTROL FINAL</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">SI</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">NO</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold w-12">N/A</th>
                            <th className="border border-gray-800 px-2 py-1 text-center font-bold bg-orange-500 w-80">OBS.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: '5.1', desc: 'Identificaciones y ordenamiento' },
                            { id: '5.2', desc: 'Inspección con presencia del cliente' },
                            { id: '5.3', desc: 'Detalles de terminación' },
                            { id: '5.4', desc: 'Accesorios y embalaje' }
                          ].map((item) => (
                            <tr key={item.id}>
                              <td className="border border-gray-800 px-2 py-1 font-medium text-xs">{item.id}</td>
                              <td className="border border-gray-800 px-2 py-1 text-xs">{item.desc}</td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('controlFinal', item.id, 'estado', 'SI')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`controlFinal-${item.id}`}
                                    checked={protocolData.controlFinal[item.id]?.estado === 'SI'}
                                    onChange={() => updateProtocolItem('controlFinal', item.id, 'estado', 'SI')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('controlFinal', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`controlFinal-${item.id}`}
                                    checked={protocolData.controlFinal[item.id]?.estado === 'NO'}
                                    onChange={() => updateProtocolItem('controlFinal', item.id, 'estado', 'NO')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('controlFinal', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`controlFinal-${item.id}`}
                                    checked={protocolData.controlFinal[item.id]?.estado === 'NA'}
                                    onChange={() => updateProtocolItem('controlFinal', item.id, 'estado', 'NA')}
                                    className="w-4 h-4"
                                  />
                                </div>
                              </td>
                              <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                <textarea
                                  value={protocolData.controlFinal[item.id]?.observacion || ''}
                                  onChange={(e) => updateProtocolItem('controlFinal', item.id, 'observacion', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border-0 bg-transparent focus:outline-none resize-none"
                                  placeholder="-"
                                  rows="2"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Normas de referencia */}
                    <div className="bg-white border border-gray-800 rounded-lg p-4 mt-4">
                      <h4 className="font-bold text-sm mb-3">ENSAYOS BASADOS EN LAS SIGUIENTES NORMAS:</h4>
                      <div className="text-xs space-y-1 text-gray-700">
                        <p>Norma IEC 62208 "Envolventes vacías destinadas a los conjuntos de aparamenta de baja tensión. Requisitos generales."</p>
                        <p>Norma IEC 60439-1 "Conjuntos de aparamenta de baja tensión. Parte 1: Conjuntos de serie y conjuntos derivados de serie."</p>
                        <p>Norma IEC 60439-2 "Conjuntos de aparamenta de baja tensión. Parte 2: Requisitos particulares para las canalizaciones prefabricadas."</p>
                        <p>Norma IEC 60439-3 "Requerimientos particulares para los tableros equipados destinados a ser instalados en lugares accesibles al personal no calificado durante su utilización"</p>
                        <p>Norma: IEC 60670-24 "Requisitos generales para las envolturas de los accesorios para instalaciones eléctricas fijas para usos domiciliarios y similares".</p>
                      </div>
                    </div>

                    {/* Digital Signatures Section */}
                    <div className="mt-6">
                      <DigitalSignature
                        signatures={protocolData.firmasDigitales || {}}
                        onSignatureChange={handleSignatureChange}
                        projectId={projectId}
                        disabled={false}
                        showRequiredFields={true}
                      />
                    </div>
                  </div>
                ) : selectedDocumentType.id === 'calculos-cortocircuito' ? (
                  // Vista específica para Cálculos de Cortocircuito
                  <CalculosCortocircuito
                    projectData={project}
                    onDataChange={(data) => {
                      // Actualizar los datos del proyecto con los cálculos de cortocircuito
                      const updatedProject = {
                        ...project,
                        calculation_data: {
                          ...project.calculation_data,
                          ...data
                        }
                      };
                      setProject(updatedProject);
                      // Aquí podrías agregar lógica para guardar automáticamente
                    }}
                    readOnly={!permissions.canEdit}
                  />
                ) : (
                  // Vista para otros tipos de documento
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm font-medium mb-2">
                        Documento seleccionado: {selectedDocumentType.name}
                      </p>
                      <p className="text-blue-700 text-sm">
                        {selectedDocumentType.description}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Funciones de Cálculo
                      </h3>
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Aquí se integrarán las funciones de cálculo específicas para {selectedDocumentType.name}.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Las calculadoras eléctricas serán integradas próximamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos del Proyecto
                </h2>

                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Selecciona un tipo de documento
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Usa el panel lateral derecho para elegir el tipo de documento que deseas trabajar.
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Document Type Sidebar */}
      <DocumentTypeSidebar
        onDocumentTypeSelect={handleDocumentTypeSelect}
        selectedType={selectedDocumentType}
        defaultCollapsed={false}
      />

      {/* Edit Project Modal */}
      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={user?.uid}
          projectId={projectId}
          onProjectUpdated={handleProjectUpdated}
        />
      )}

      {/* Collaborator Management Modal */}
      <CollaboratorManagementModal
        isOpen={showCollaboratorModal}
        onClose={() => setShowCollaboratorModal(false)}
        project={project}
        onProjectUpdate={loadProject}
      />

      {/* Public Share Modal */}
      <PublicShareModal
        isOpen={showPublicShareModal}
        onClose={() => setShowPublicShareModal(false)}
        project={project}
        onProjectUpdate={loadProject}
      />
    </div>
  );
};

export default ProjectDetail;
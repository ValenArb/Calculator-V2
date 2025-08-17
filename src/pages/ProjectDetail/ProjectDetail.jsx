import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Calendar, Calculator, FileText, Edit, Trash2, CheckSquare, X, AlertTriangle, Plus, UserPlus, Download, FileDown, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../services/firebase/projects';
import calculationService from '../../services/calculations';
import notificationsService from '../../services/firebase/notifications';
import usersService from '../../services/firebase/users';
import EditProjectModal from '../../components/projects/EditProjectModal';
import MainSidebar from '../../components/layout/MainSidebar';
import DocumentTypeSidebar from '../../components/layout/DocumentTypeSidebar';
import { Loading, Modal } from '../../components/ui';
import pdfExportService from '../../utils/pdfExport';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
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
  
  // Estado para modal de invitación
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', message: '' });
  const [isInviting, setIsInviting] = useState(false);
  
  // Estado para los protocolos de ensayos por tablero
  const [protocolosPorTablero, setProtocolosPorTablero] = useState({});
  
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
      // Mediciones entre conductores y tierra
      'L1-PE': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L2-PE': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L3-PE': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'N-PE': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      // Mediciones entre conductores activos
      'L1-L2': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L1-L3': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L1-N': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L2-L3': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L2-N': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      'L3-N': { tension_ensayo: '500', valor_medido: '', observaciones: '' },
      // Condiciones ambientales
      temperatura: '',
      humedad: '',
      presion: '',
      tiempo_carga: '60',
      // Información del equipo
      equipo_marca: '',
      equipo_modelo: '',
      equipo_serie: '',
      fecha_calibracion: ''
    },
    controlFinal: {
      '5.1': { estado: '', observacion: '' },
      '5.2': { estado: '', observacion: '' },
      '5.3': { estado: '', observacion: '' },
      '5.4': { estado: '', observacion: '' }
    }
  });

  // Protocolo actual basado en el tablero seleccionado
  const protocolData = selectedTablero ? 
    (protocolosPorTablero[selectedTablero.id] || getProtocoloDefecto()) : 
    getProtocoloDefecto();

  // Referencias para debouncing y control de guardado
  const saveTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const pendingUpdatesRef = useRef({});

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !user?.uid) return;
      
      setIsLoading(true);
      try {
        // Load project metadata from Firestore
        const projectData = await projectsService.getProject(projectId, user.uid);
        setProject(projectData);
        
        // Inicializar datos editables
        setEditableProject({
          name: projectData.name || '',
          company: projectData.company || '',
          client_name: projectData.client_name || '',
          client_email: projectData.client_email || '',
          client_phone: projectData.client_phone || '',
          location: projectData.location || '',
          work_number: projectData.work_number || '',
        });
        
        // Cargar tableros del proyecto
        const tablerosData = projectData.tableros || [];
        setTableros(tablerosData);
        // Seleccionar el primer tablero por defecto
        if (tablerosData.length > 0) {
          setSelectedTablero(tablerosData[0]);
        }
        
        // Load calculation data (FAT protocols) from SQLite3
        try {
          const calculationData = await calculationService.getCalculations(projectId, user.uid);
          setProtocolosPorTablero(calculationData.protocolosPorTablero || {});
        } catch (calcError) {
          console.warn('No calculation data found, starting with empty protocols:', calcError);
          setProtocolosPorTablero({});
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Error al cargar el proyecto');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, user?.uid, navigate]);

  // Efecto para asegurar que todos los tableros tengan protocolo
  useEffect(() => {
    if (tableros.length > 0) {
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
  }, [tableros]);

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
      
      // Eliminar el protocolo del tablero eliminado
      setProtocolosPorTablero(prev => {
        const nuevosProtocolos = { ...prev };
        delete nuevosProtocolos[tableroId];
        return nuevosProtocolos;
      });
      
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
      toast.loading('Generando PDF...', { id: 'pdf-export' });
      
      // Prepare project data for export
      const exportData = {
        ...project,
        calculation_data: {
          fatProtocol: protocolosPorTablero[selectedTablero?.id] || {}
        }
      };
      
      await pdfExportService.exportProjectProtocol(exportData);
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
      
      const protocolElement = document.getElementById('protocol-content');
      if (!protocolElement) {
        toast.error('No se encontró el contenido del protocolo', { id: 'protocol-pdf' });
        return;
      }

      const exportData = {
        ...project,
        calculation_data: {
          fatProtocol: protocolosPorTablero[selectedTablero.id] || {}
        }
      };

      await pdfExportService.exportElementToPDF('protocol-content', exportData);
      toast.success('PDF del protocolo generado exitosamente', { id: 'protocol-pdf' });
    } catch (error) {
      console.error('Error exporting protocol PDF:', error);
      toast.error('Error al generar PDF del protocolo: ' + error.message, { id: 'protocol-pdf' });
    }
  };

  // Función para enviar invitación
  const sendInvitation = async () => {
    if (!inviteData.email.trim()) {
      toast.error('El email es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setIsInviting(true);
    try {
      // Buscar el usuario por email para obtener su UID
      console.log('Inviting user with email:', inviteData.email);
      const recipientUser = await usersService.getUserByEmail(inviteData.email);
      
      if (!recipientUser) {
        toast.error(`Usuario con email "${inviteData.email}" no encontrado en la base de datos. Verifica que el usuario esté registrado y haya iniciado sesión al menos una vez.`);
        setIsInviting(false);
        return;
      }

      await notificationsService.createProjectInvitation({
        recipientEmail: inviteData.email,
        recipientUid: recipientUser.uid,
        senderUid: user.uid,
        senderName: user.displayName || user.email,
        senderEmail: user.email,
        projectId: projectId,
        projectName: project.name,
        message: inviteData.message
      });

      toast.success('Invitación enviada exitosamente');
      setShowInviteModal(false);
      setInviteData({ email: '', message: '' });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    } finally {
      setIsInviting(false);
    }
  };

  // Función con debouncing para guardar FAT protocols en SQLite3
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      if (!selectedTablero || isUpdatingRef.current) return;
      
      isUpdatingRef.current = true;
      
      try {
        // Save only FAT protocols to SQLite3
        await calculationService.saveCalculations(projectId, user.uid, {
          protocolosPorTablero: protocolosPorTablero
        });
      } catch (error) {
        console.error('Error saving protocol data:', error);
        toast.error('Error al guardar los datos del protocolo');
      } finally {
        isUpdatingRef.current = false;
      }
    }, 200); // Reducido a 200ms para mejor respuesta
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

  // Funciones para manejar el protocolo de ensayos del tablero actual
  const updateProtocolItem = (seccion, item, campo, valor) => {
    if (!selectedTablero) return;
    
    // Actualizar el item específico
    const newData = {
      ...protocolData,
      [seccion]: {
        ...protocolData[seccion],
        [item]: {
          ...protocolData[seccion][item],
          [campo]: valor
        }
      }
    };
    
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
    setProtocolosPorTablero(prev => ({
      ...prev,
      [selectedTablero.id]: finalData
    }));
    
    // Guardar en la base de datos con debouncing
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
                {/* PDF Export buttons - only show for protocol documents */}
                {selectedDocumentType?.id === 'protocolo-ensayos' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Exportar protocolo completo a PDF"
                    >
                      <FileDown className="w-4 h-4" />
                      Exportar PDF
                    </button>
                    <button
                      onClick={handlePrintView}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Vista de impresión"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Invitar Usuario
                </button>
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
                          setSelectedTablero(tablero || null);
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
                            <input
                              type="text"
                              value={editableProject.name || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, name: e.target.value }))}
                              onBlur={(e) => updateProjectField('name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="Nombre del proyecto"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Empresa:</label>
                            <input
                              type="text"
                              value={editableProject.company || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, company: e.target.value }))}
                              onBlur={(e) => updateProjectField('company', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="Nombre de la empresa"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Ubicación:</label>
                            <input
                              type="text"
                              value={editableProject.location || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, location: e.target.value }))}
                              onBlur={(e) => updateProjectField('location', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="Ciudad, Provincia"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Número de Obra:</label>
                            <input
                              type="text"
                              value={editableProject.work_number || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, work_number: e.target.value }))}
                              onBlur={(e) => updateProjectField('work_number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="Ej: OB-2024-001"
                            />
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
                            <input
                              type="text"
                              value={editableProject.client_name || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, client_name: e.target.value }))}
                              onBlur={(e) => updateProjectField('client_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="Nombre del cliente"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email del Cliente:</label>
                            <input
                              type="email"
                              value={editableProject.client_email || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, client_email: e.target.value }))}
                              onBlur={(e) => updateProjectField('client_email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="email@ejemplo.com"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono del Cliente:</label>
                            <input
                              type="tel"
                              value={editableProject.client_phone || ''}
                              onChange={(e) => setEditableProject(prev => ({ ...prev, client_phone: e.target.value }))}
                              onBlur={(e) => updateProjectField('client_phone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder="+54 11 1234-5678"
                            />
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
                                    type="radio"
                                    name={`estructura-${item.id}`}
                                    checked={protocolData.estructura[item.id]?.estado === 'SI'}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'SI')}
                                    className="w-4 h-4 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('estructura', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`estructura-${item.id}`}
                                    checked={protocolData.estructura[item.id]?.estado === 'NO'}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'NO')}
                                    className="w-4 h-4 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('estructura', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`estructura-${item.id}`}
                                    checked={protocolData.estructura[item.id]?.estado === 'NA'}
                                    onChange={() => updateProtocolItem('estructura', item.id, 'estado', 'NA')}
                                    className="w-4 h-4 pointer-events-none"
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
                                    type="radio"
                                    name={`electromontaje-${item.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'SI'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'SI')}
                                    className="w-4 h-4 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NO')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`electromontaje-${item.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'NO'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NO')}
                                    className="w-4 h-4 pointer-events-none"
                                  />
                                </div>
                              </td>
                              <td 
                                className="border border-gray-800 px-1 py-1 text-center cursor-pointer hover:bg-gray-100"
                                onClick={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NA')}
                              >
                                <div className="flex justify-center items-center h-full w-full py-2">
                                  <input
                                    type="radio"
                                    name={`electromontaje-${item.id}`}
                                    checked={protocolData.electromontaje[item.id]?.estado === 'NA'}
                                    onChange={() => updateProtocolItem('electromontaje', item.id, 'estado', 'NA')}
                                    className="w-4 h-4 pointer-events-none"
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
                                    className="w-4 h-4 pointer-events-none"
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
                                    className="w-4 h-4 pointer-events-none"
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
                                    className="w-4 h-4 pointer-events-none"
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

                    {/* Sección 4: MEDICIÓN DE AISLAMIENTO - NUEVA VERSIÓN MEJORADA */}
                    <div className="bg-white border border-gray-800 rounded-lg overflow-hidden mt-4">
                      {/* Encabezado principal */}
                      <div className="bg-green-600 text-white p-3">
                        <h3 className="font-bold text-lg">4. MEDICIÓN DE AISLAMIENTO</h3>
                        <p className="text-sm mt-1">Mediciones de resistencia de aislamiento según IEC 60364-6</p>
                      </div>

                      {/* Tabla de mediciones principales */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">4.1 Mediciones entre conductores y tierra</h4>
                        <table className="w-full text-sm border border-gray-300 mb-6">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border border-gray-300 px-3 py-2 text-left">Medición</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Tensión ensayo (V)</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Valor medido (MΩ)</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Valor mínimo</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Estado</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { id: 'L1-PE', desc: 'L1 - PE (Tierra)', min: '≥ 1.0' },
                              { id: 'L2-PE', desc: 'L2 - PE (Tierra)', min: '≥ 1.0' },
                              { id: 'L3-PE', desc: 'L3 - PE (Tierra)', min: '≥ 1.0' },
                              { id: 'N-PE', desc: 'N - PE (Tierra)', min: '≥ 1.0' }
                            ].map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2 font-medium">{item.desc}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <select
                                    value={protocolData.aislamiento?.[item.id]?.tension || '500'}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'tension', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                                  >
                                    <option value="250">250</option>
                                    <option value="500">500</option>
                                    <option value="1000">1000</option>
                                  </select>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={protocolData.aislamiento?.[item.id]?.valor || ''}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'valor', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-600">{item.min} MΩ</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`aislamiento-${item.id}`}
                                        checked={protocolData.aislamiento?.[item.id]?.conforme === 'CONFORME'}
                                        onChange={() => updateProtocolItem('aislamiento', item.id, 'conforme', 'CONFORME')}
                                        className="w-3 h-3"
                                      />
                                      <span className="ml-1 text-xs text-green-600">✓</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`aislamiento-${item.id}`}
                                        checked={protocolData.aislamiento?.[item.id]?.conforme === 'NO_CONFORME'}
                                        onChange={() => updateProtocolItem('aislamiento', item.id, 'conforme', 'NO_CONFORME')}
                                        className="w-3 h-3"
                                      />
                                      <span className="ml-1 text-xs text-red-600">✗</span>
                                    </label>
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <input
                                    type="text"
                                    value={protocolData.aislamiento?.[item.id]?.observacion || ''}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'observacion', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="Observaciones..."
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <h4 className="font-semibold text-gray-800 mb-3">4.2 Mediciones entre conductores activos</h4>
                        <table className="w-full text-sm border border-gray-300 mb-6">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="border border-gray-300 px-3 py-2 text-left">Medición</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Tensión ensayo (V)</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Valor medido (MΩ)</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Valor mínimo</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Estado</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { id: 'L1-L2', desc: 'L1 - L2', min: '≥ 1.0' },
                              { id: 'L2-L3', desc: 'L2 - L3', min: '≥ 1.0' },
                              { id: 'L3-L1', desc: 'L3 - L1', min: '≥ 1.0' },
                              { id: 'L1-N', desc: 'L1 - N', min: '≥ 1.0' },
                              { id: 'L2-N', desc: 'L2 - N', min: '≥ 1.0' },
                              { id: 'L3-N', desc: 'L3 - N', min: '≥ 1.0' }
                            ].map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-3 py-2 font-medium">{item.desc}</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <select
                                    value={protocolData.aislamiento?.[item.id]?.tension || '500'}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'tension', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                                  >
                                    <option value="250">250</option>
                                    <option value="500">500</option>
                                    <option value="1000">1000</option>
                                  </select>
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={protocolData.aislamiento?.[item.id]?.valor || ''}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'valor', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                                    placeholder="0.00"
                                  />
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center text-gray-600">{item.min} MΩ</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  <div className="flex justify-center space-x-2">
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`aislamiento-${item.id}`}
                                        checked={protocolData.aislamiento?.[item.id]?.conforme === 'CONFORME'}
                                        onChange={() => updateProtocolItem('aislamiento', item.id, 'conforme', 'CONFORME')}
                                        className="w-3 h-3"
                                      />
                                      <span className="ml-1 text-xs text-green-600">✓</span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="radio"
                                        name={`aislamiento-${item.id}`}
                                        checked={protocolData.aislamiento?.[item.id]?.conforme === 'NO_CONFORME'}
                                        onChange={() => updateProtocolItem('aislamiento', item.id, 'conforme', 'NO_CONFORME')}
                                        className="w-3 h-3"
                                      />
                                      <span className="ml-1 text-xs text-red-600">✗</span>
                                    </label>
                                  </div>
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  <input
                                    type="text"
                                    value={protocolData.aislamiento?.[item.id]?.observacion || ''}
                                    onChange={(e) => updateProtocolItem('aislamiento', item.id, 'observacion', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="Observaciones..."
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <h4 className="font-semibold text-gray-800 mb-3">4.3 Condiciones de ensayo y equipo utilizado</h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C):</label>
                              <input
                                type="number"
                                value={protocolData.aislamiento?.condiciones?.temperatura || ''}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'temperatura', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="20"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Humedad relativa (%):</label>
                              <input
                                type="number"
                                value={protocolData.aislamiento?.condiciones?.humedad || ''}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'humedad', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="65"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Presión atmosférica (hPa):</label>
                              <input
                                type="number"
                                value={protocolData.aislamiento?.condiciones?.presion || ''}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'presion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="1013"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de carga (s):</label>
                              <select
                                value={protocolData.aislamiento?.condiciones?.tiempoCarga || '60'}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'tiempoCarga', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="15">15 s</option>
                                <option value="60">60 s</option>
                                <option value="120">120 s</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Instrumento utilizado:</label>
                              <input
                                type="text"
                                value={protocolData.aislamiento?.condiciones?.instrumento || ''}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'instrumento', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Ej: Megger MIT515, Serie: 12345"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de calibración:</label>
                              <input
                                type="date"
                                value={protocolData.aislamiento?.condiciones?.fechaCalibracion || ''}
                                onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'fechaCalibracion', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del ensayo:</label>
                            <textarea
                              value={protocolData.aislamiento?.condiciones?.observaciones || ''}
                              onChange={(e) => updateProtocolItem('aislamiento', 'condiciones', 'observaciones', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              rows="3"
                              placeholder="Observaciones sobre las condiciones del ensayo, estado de la instalación, etc."
                            />
                          </div>
                        </div>

                        {/* Resumen de resultados */}
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-2">Resumen de resultados</h4>
                          <div className="text-sm text-blue-700">
                            <p>• Todas las mediciones deben cumplir con el valor mínimo de 1.0 MΩ según IEC 60364-6</p>
                            <p>• Para instalaciones nuevas se recomienda un valor mínimo de 2.0 MΩ</p>
                            <p>• Los ensayos se realizan con la instalación desenergizada y equipos desconectados</p>
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
                                    className="w-4 h-4 pointer-events-none"
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
                                    className="w-4 h-4 pointer-events-none"
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
                                    className="w-4 h-4 pointer-events-none"
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

                    {/* Firmas */}
                    <div className="bg-white border border-gray-800 rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">REALIZÓ:</label>
                            <input
                              type="text"
                              value={protocolData.realizo_nombre}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, realizo_nombre: e.target.value }))}
                              onBlur={(e) => updateProtocolField('realizo_nombre', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Nombre"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">CARGO:</label>
                            <input
                              type="text"
                              value={protocolData.realizo_cargo}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, realizo_cargo: e.target.value }))}
                              onBlur={(e) => updateProtocolField('realizo_cargo', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Cargo"
                            />
                          </div>
                          <div className="border-b border-gray-400 mb-1 h-8"></div>
                          <p className="text-xs">FIRMA: ................................</p>
                        </div>
                        <div className="text-center">
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">CONTROLÓ:</label>
                            <input
                              type="text"
                              value={protocolData.controlo_nombre}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, controlo_nombre: e.target.value }))}
                              onBlur={(e) => updateProtocolField('controlo_nombre', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Nombre"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">CARGO:</label>
                            <input
                              type="text"
                              value={protocolData.controlo_cargo}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, controlo_cargo: e.target.value }))}
                              onBlur={(e) => updateProtocolField('controlo_cargo', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Cargo"
                            />
                          </div>
                          <div className="border-b border-gray-400 mb-1 h-8"></div>
                          <p className="text-xs">FIRMA: ................................</p>
                        </div>
                        <div className="text-center">
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">APROBÓ:</label>
                            <input
                              type="text"
                              value={protocolData.aprobo_nombre}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, aprobo_nombre: e.target.value }))}
                              onBlur={(e) => updateProtocolField('aprobo_nombre', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Nombre"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">CARGO:</label>
                            <input
                              type="text"
                              value={protocolData.aprobo_cargo}
                              onChange={(e) => setProtocolData(prev => ({ ...prev, aprobo_cargo: e.target.value }))}
                              onBlur={(e) => updateProtocolField('aprobo_cargo', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                              placeholder="Cargo"
                            />
                          </div>
                          <div className="border-b border-gray-400 mb-1 h-8"></div>
                          <p className="text-xs">FIRMA: ................................</p>
                        </div>
                      </div>
                    </div>
                  </div>
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

      {/* Invite User Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invitar Usuario al Proyecto"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del Usuario
            </label>
            <input
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="usuario@ejemplo.com"
              disabled={isInviting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje (opcional)
            </label>
            <textarea
              value={inviteData.message}
              onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Mensaje personalizado para el usuario invitado..."
              disabled={isInviting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowInviteModal(false)}
              disabled={isInviting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={sendInvitation}
              disabled={isInviting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Enviar Invitación
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
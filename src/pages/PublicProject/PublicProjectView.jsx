import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, Calendar, FileText, Download, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Loading, AccessTimer } from '../../components/ui';
import projectsService from '../../services/firebase/projects';
import calculationService from '../../services/calculations';
import pdfExportService from '../../utils/pdfExport';
import toast from 'react-hot-toast';

const PublicProjectView = () => {
  const { projectId, shareToken } = useParams();
  const [project, setProject] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState({
    id: 'informacion-proyecto',
    name: 'Información del Proyecto',
    description: 'Datos básicos y detalles del proyecto',
    color: 'bg-green-100 text-green-700 border-green-200'
  });
  const [protocolData, setProtocolData] = useState({});
  const [selectedTablero, setSelectedTablero] = useState(null);

  // Default protocol structure
  const getProtocoloDefecto = () => ({
    fecha: '',
    estado: 'PENDIENTE',
    cliente: '',
    obra: '',
    proyecto: '',
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
    controlFinal: {
      '5.1': { estado: '', observacion: '' },
      '5.2': { estado: '', observacion: '' },
      '5.3': { estado: '', observacion: '' },
      '5.4': { estado: '', observacion: '' }
    }
  });

  // Get current protocol data for selected tablero
  const getCurrentProtocolData = () => {
    if (!selectedTablero) {
      console.log('🔍 No selectedTablero, returning default protocol');
      return getProtocoloDefecto();
    }
    
    const currentData = protocolData[selectedTablero.id];
    console.log('🔍 getCurrentProtocolData debug:', {
      selectedTableroId: selectedTablero.id,
      selectedTableroName: selectedTablero.nombre,
      hasDataForTablero: !!currentData,
      allProtocolDataKeys: Object.keys(protocolData),
      currentData: currentData,
      defaultProtocol: getProtocoloDefecto()
    });
    
    return currentData || getProtocoloDefecto();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'APROBADO': return 'text-green-700 bg-green-50 border-green-200';
      case 'RECHAZADO': return 'text-red-700 bg-red-50 border-red-200';
      case 'PENDIENTE': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
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

  useEffect(() => {
    loadPublicProject();
  }, [projectId, shareToken]);

  const loadPublicProject = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate public access
      const accessValidation = await projectsService.validatePublicAccess(projectId, shareToken);
      
      if (!accessValidation.valid) {
        setError(accessValidation.reason);
        return;
      }

      setAccessInfo(accessValidation);

      // Get project data
      const projectData = await projectsService.getProject(projectId, null, { bypassAuth: true });
      setProject(projectData);

      // Load protocol data if available
      try {
        const calculations = await calculationService.getCalculations(projectId, null);
        console.log('🔍 Full calculations response for public view:', calculations);
        if (calculations && calculations.protocolosPorTablero) {
          setProtocolData(calculations.protocolosPorTablero);
          console.log('✅ Public view loaded protocol data:', calculations.protocolosPorTablero);
          
          // Log specific protocol data for debugging
          Object.keys(calculations.protocolosPorTablero).forEach(tableroId => {
            console.log(`📋 Protocol data for tablero ${tableroId}:`, calculations.protocolosPorTablero[tableroId]);
          });
        } else {
          console.log('⚠️ No protocolosPorTablero found in calculations:', calculations);
        }
      } catch (protocolError) {
        console.error('❌ Error loading protocol data for public view:', protocolError);
      }

      // Auto-select first tablero if available
      if (projectData.tableros && projectData.tableros.length > 0) {
        setSelectedTablero(projectData.tableros[0]);
      }

    } catch (error) {
      console.error('Error loading public project:', error);
      setError('Error al cargar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleExportToPDF = async () => {
    if (!accessInfo?.permissions?.download_pdf) {
      toast.error('No tienes permisos para descargar PDFs');
      return;
    }

    try {
      toast.loading('Generando PDF...', { id: 'pdf-export' });
      
      if (!selectedTablero) {
        toast.error('Selecciona un tablero para exportar', { id: 'pdf-export' });
        return;
      }

      const currentProtocolData = getCurrentProtocolData();
      const tableroName = selectedTablero.nombre || 'TABLERO PRINCIPAL';
      
      console.log('🔄 Exporting PDF with data:', {
        project,
        currentProtocolData,
        tableroName,
        selectedTablero
      });
      
      await pdfExportService.exportProtocolPDF(project, currentProtocolData, tableroName);
      
      toast.success('PDF generado exitosamente', { id: 'pdf-export' });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al generar el PDF: ' + error.message, { id: 'pdf-export' });
    }
  };

  const documentTypes = [
    {
      id: 'informacion-proyecto',
      name: 'Información del Proyecto',
      description: 'Datos básicos y detalles del proyecto',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'protocolo-ensayos',
      name: 'Protocolo de Ensayos',
      description: 'Protocolos de verificación y ensayos',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-4 h-4" />
            Ir a NotiCalc
          </a>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border">
          <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Proyecto no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-blue-600" />
                  {project.name}
                  <span className="text-sm font-normal text-gray-500 bg-blue-100 px-2 py-1 rounded-full">
                    Vista Pública
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">Proyecto compartido públicamente</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Access timer */}
                {accessInfo?.expiresAt && (
                  <AccessTimer 
                    expiryTime={accessInfo.expiresAt}
                    showIcon={true}
                    showText={true}
                  />
                )}

                {/* Download button */}
                {accessInfo?.permissions?.download_pdf && (
                  <button
                    onClick={handleExportToPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido del Proyecto</h3>
                <div className="space-y-2">
                  {documentTypes.map((docType) => (
                    <button
                      key={docType.id}
                      onClick={() => setSelectedDocumentType(docType)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedDocumentType.id === docType.id
                          ? docType.color
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <div>
                          <p className="font-medium text-sm">{docType.name}</p>
                          <p className="text-xs text-gray-600">{docType.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Access info */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Información de Acceso</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Acceso verificado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Visitado {accessInfo?.accessCount || 0} veces</span>
                  </div>
                  {accessInfo?.permissions?.download_pdf && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-purple-500" />
                      <span>Descarga de PDF permitida</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedDocumentType.name}
                </h2>
              </div>

              {selectedDocumentType.id === 'informacion-proyecto' ? (
                // Project Information
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold text-gray-900 border-b pb-2">
                        Información Básica
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Nombre del Proyecto</p>
                            <p className="font-medium text-gray-900">{project.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Descripción</p>
                            <p className="font-medium text-gray-900">{project.description || 'Sin descripción'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Tipo de Proyecto</p>
                            <p className="font-medium text-gray-900 capitalize">{project.project_type || 'No especificado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Fecha de Creación</p>
                            <p className="font-medium text-gray-900">
                              {project.created_at ? new Date(project.created_at.seconds * 1000).toLocaleDateString() : 'No disponible'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Client Info */}
                    <div className="space-y-4">
                      <h3 className="text-md font-semibold text-gray-900 border-b pb-2">
                        Información del Cliente
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Cliente</p>
                            <p className="font-medium text-gray-900">{project.client_name || 'No especificado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{project.client_email || 'No especificado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="font-medium text-gray-900">{project.client_phone || 'No especificado'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Ubicación</p>
                            <p className="font-medium text-gray-900">{project.location || 'No especificada'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedDocumentType.id === 'protocolo-ensayos' ? (
                // Protocol content (read-only)
                <div className="space-y-6">
                  {/* Selector de tablero si hay múltiples */}
                  {project?.tableros && project.tableros.length > 1 && (
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-sm font-medium text-gray-700">Tablero:</label>
                      <select
                        value={selectedTablero?.id || ''}
                        onChange={(e) => {
                          const tablero = project.tableros.find(t => t.id === e.target.value);
                          setSelectedTablero(tablero || null);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {project.tableros.map((tablero) => (
                          <option key={tablero.id} value={tablero.id}>
                            {tablero.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Vista del protocolo */}
                  {selectedTablero ? (
                    <div id="protocol-content" className="space-y-6">
                      {/* Header del protocolo */}
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
                              {accessInfo?.permissions?.download_pdf && (
                                <button
                                  onClick={handleExportToPDF}
                                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                  title="Exportar este protocolo a PDF"
                                >
                                  <Download className="w-4 h-4" />
                                  Exportar PDF
                                </button>
                              )}
                              <div className={`px-4 py-2 rounded border text-center font-bold ${getEstadoColor(getCurrentProtocolData().estado)}`}>
                                {getCurrentProtocolData().estado}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tabla 1: ESTRUCTURA */}
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
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().estructura?.[item.id]?.estado === 'SI' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().estructura?.[item.id]?.estado === 'NO' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().estructura?.[item.id]?.estado === 'NA' ? 'bg-gray-500 border-gray-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                  <div className="text-xs">
                                    {getCurrentProtocolData().estructura?.[item.id]?.observacion || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Tabla 2: ELECTROMONTAJE */}
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
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().electromontaje?.[item.id]?.estado === 'SI' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().electromontaje?.[item.id]?.estado === 'NO' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().electromontaje?.[item.id]?.estado === 'NA' ? 'bg-gray-500 border-gray-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                  <div className="text-xs">
                                    {getCurrentProtocolData().electromontaje?.[item.id]?.observacion || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Tabla 3: PRUEBAS Y ENSAYO */}
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
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().pruebas?.[item.id]?.estado === 'SI' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().pruebas?.[item.id]?.estado === 'NO' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().pruebas?.[item.id]?.estado === 'NA' ? 'bg-gray-500 border-gray-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                  <div className="text-xs">
                                    {getCurrentProtocolData().pruebas?.[item.id]?.observacion || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Tabla 4: MEDICIÓN DE AISLAMIENTO */}
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
                                  <div className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50">
                                    {getCurrentProtocolData().aislamiento?.marca || 'N/A'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="font-medium text-gray-700 w-16">MODELO:</label>
                                  <div className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50">
                                    {getCurrentProtocolData().aislamiento?.modelo || 'N/A'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="font-medium text-gray-700 w-16">ESCALA:</label>
                                  <div className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50">
                                    {getCurrentProtocolData().aislamiento?.escala || 'N/A'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="font-medium text-gray-700 w-16">TIEMPO:</label>
                                  <div className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50">
                                    {getCurrentProtocolData().aislamiento?.tiempo || 'N/A'}
                                  </div>
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
                                          <div className="px-1 py-1 text-xs text-center bg-gray-50 rounded">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.resistencia2 || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.unidad_resistencia2 || 'MΩ'}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-800 px-1 py-1 text-center">
                                        <div className="flex flex-col gap-1">
                                          <div className="px-1 py-1 text-xs text-center bg-gray-50 rounded">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.resistencia1 || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.unidad_resistencia1 || 'MΩ'}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-800 px-1 py-1 text-center">
                                        <div className="flex flex-col gap-1">
                                          <div className="px-1 py-1 text-xs text-center bg-gray-50 rounded">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.corriente2 || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.unidad_corriente2 || 'mA'}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-800 px-1 py-1 text-center">
                                        <div className="flex flex-col gap-1">
                                          <div className="px-1 py-1 text-xs text-center bg-gray-50 rounded">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.corriente1 || 'N/A'}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {getCurrentProtocolData().aislamiento?.mediciones?.[medicion]?.unidad_corriente1 || 'mA'}
                                          </div>
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

                      {/* Tabla 5: CONTROL FINAL */}
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
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().controlFinal?.[item.id]?.estado === 'SI' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().controlFinal?.[item.id]?.estado === 'NO' ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-1 py-1 text-center">
                                  <div className="flex justify-center items-center h-full w-full py-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${getCurrentProtocolData().controlFinal?.[item.id]?.estado === 'NA' ? 'bg-gray-500 border-gray-500' : 'border-gray-300'}`}></div>
                                  </div>
                                </td>
                                <td className="border border-gray-800 px-2 py-2 bg-orange-50">
                                  <div className="text-xs">
                                    {getCurrentProtocolData().controlFinal?.[item.id]?.observacion || '-'}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mensaje si no hay tableros */}
                      <div className="text-center mt-6">
                        <p className="text-gray-600 text-sm mb-4">
                          Este es un protocolo en modo solo lectura. Para ver todas las secciones y descargar el PDF completo, use el botón de descarga.
                        </p>
                        {accessInfo?.permissions?.download_pdf && (
                          <button
                            onClick={handleExportToPDF}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Download className="w-5 h-5" />
                            Descargar Protocolo Completo
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No hay tableros configurados para este proyecto</p>
                      {accessInfo?.permissions?.download_pdf && (
                        <button
                          onClick={handleExportToPDF}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Descargar PDF
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Other document types
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Contenido no disponible en vista pública</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Este proyecto fue compartido desde <strong>NotiCalc</strong></p>
            <a
              href="/"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Ir a NotiCalc
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProjectView;
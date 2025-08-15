import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Search, AlertTriangle, Info, ChevronRight, ArrowLeft, X, Building2, Cpu, Wrench, Plus, Shield, Loader, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { isCurrentUserAdmin } from '../../utils/adminUtils';
import AdminAddErrorModal from './AdminAddErrorModal';
import InviteAdminModal from './InviteAdminModal';
import { errorCodesService } from '../../services/firebase/errorCodes';
import { notificationsService } from '../../services/firebase/notifications';

const ErrorCodesApp = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = isCurrentUserAdmin(user);
  
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedSubLine, setSelectedSubLine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedError, setSelectedError] = useState(null);
  const [manufacturerSearch, setManufacturerSearch] = useState('');
  const [lineSearch, setLineSearch] = useState('');
  const [subLineSearch, setSubLineSearch] = useState('');
  const [productCodeSearch, setProductCodeSearch] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Firebase-based error database
  const [errorDatabase, setErrorDatabase] = useState({ manufacturers: {} });

  // Firebase-based product codes database
  const [productCodeDatabase, setProductCodeDatabase] = useState({});

  // Filtrar fabricantes por búsqueda
  const filteredManufacturers = useMemo(() => {
    return Object.entries(errorDatabase.manufacturers).filter(([key, manufacturer]) => {
      return manufacturer.name.toLowerCase().includes(manufacturerSearch.toLowerCase());
    });
  }, [manufacturerSearch]);

  // Filtrar líneas por búsqueda
  const filteredLines = useMemo(() => {
    if (!selectedManufacturer) return [];
    const manufacturer = errorDatabase.manufacturers[selectedManufacturer];
    return Object.entries(manufacturer.lines).filter(([key, line]) => {
      return line.name.toLowerCase().includes(lineSearch.toLowerCase());
    });
  }, [selectedManufacturer, lineSearch]);

  // Filtrar sub-líneas por búsqueda
  const filteredSubLines = useMemo(() => {
    if (!selectedManufacturer || !selectedLine) return [];
    const line = errorDatabase.manufacturers[selectedManufacturer]?.lines[selectedLine];
    if (!line?.hasSubLines) return [];
    return Object.entries(line.subLines).filter(([key, subLine]) => {
      return subLine.name.toLowerCase().includes(subLineSearch.toLowerCase());
    });
  }, [selectedManufacturer, selectedLine, subLineSearch]);

  // Función para buscar por código de producto
  const handleProductCodeSearch = (code) => {
    const cleanCode = code.trim().toUpperCase();
    setProductCodeSearch(cleanCode);
    
    if (!cleanCode) return;
    
    // Buscar coincidencia exacta
    let foundMatch = productCodeDatabase[cleanCode];
    
    // Si no hay coincidencia exacta, buscar coincidencia parcial
    if (!foundMatch) {
      const partialMatch = Object.keys(productCodeDatabase).find(key => 
        key.includes(cleanCode) || cleanCode.includes(key)
      );
      if (partialMatch) {
        foundMatch = productCodeDatabase[partialMatch];
      }
    }
    
    if (foundMatch) {
      // Auto-navegar a la ubicación correcta
      setSelectedManufacturer(foundMatch.manufacturer);
      setSelectedLine(foundMatch.line);
      if (foundMatch.subLine) {
        setSelectedSubLine(foundMatch.subLine);
      }
      // Limpiar búsquedas de navegación
      setManufacturerSearch('');
      setLineSearch('');
      setSubLineSearch('');
      setSearchTerm('');
      
      toast.success(`Navegando a ${errorDatabase.manufacturers[foundMatch.manufacturer].name} - ${errorDatabase.manufacturers[foundMatch.manufacturer].lines[foundMatch.line].name}`);
    } else {
      toast.error(`No se encontró información para el código de producto: ${cleanCode}`);
    }
  };

  // Obtener códigos de error disponibles basado en la selección actual
  const getAvailableErrorCodes = () => {
    if (!selectedManufacturer || !selectedLine) return [];
    
    const manufacturer = errorDatabase.manufacturers[selectedManufacturer];
    const line = manufacturer?.lines[selectedLine];
    
    if (!line) return [];
    
    // Si la línea tiene sub-líneas, necesitamos una sub-línea seleccionada
    if (line.hasSubLines && !selectedSubLine) return [];
    
    // Si tiene sub-líneas, usar códigos de la sub-línea
    if (line.hasSubLines && selectedSubLine) {
      return line.subLines[selectedSubLine]?.errorCodes || [];
    }
    
    // Si no tiene sub-líneas, usar códigos directos de la línea
    return line.errorCodes || [];
  };

  // Filtrar códigos de error por búsqueda
  const filteredErrors = useMemo(() => {
    const availableCodes = getAvailableErrorCodes();
    return availableCodes.filter(error => {
      return error.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
             error.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             error.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [selectedManufacturer, selectedLine, selectedSubLine, searchTerm]);

  // Funciones de navegación
  const resetSelection = () => {
    setSelectedManufacturer(null);
    setSelectedLine(null);
    setSelectedSubLine(null);
    setSearchTerm('');
    setSelectedError(null);
    setManufacturerSearch('');
    setLineSearch('');
    setSubLineSearch('');
    setProductCodeSearch('');
  };

  const goBackToManufacturer = () => {
    setSelectedLine(null);
    setSelectedSubLine(null);
    setSearchTerm('');
    setSelectedError(null);
    setLineSearch('');
    setSubLineSearch('');
  };

  const goBackToLine = () => {
    setSelectedSubLine(null);
    setSearchTerm('');
    setSelectedError(null);
    setSubLineSearch('');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Desconocida';
    }
  };

  // Load data from Firebase
  useEffect(() => {
    const loadErrorDatabase = async () => {
      try {
        setLoading(true);
        
        // Load complete error database
        const database = await errorCodesService.getCompleteErrorDatabase();
        setErrorDatabase(database);
        
        // Load product codes
        const productCodes = await errorCodesService.getAllProductCodes();
        setProductCodeDatabase(productCodes);
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error loading error database:', error);
        toast.error('Error cargando la base de datos de códigos de error');
        
        // Try to initialize sample data if database is empty
        try {
          await errorCodesService.initializeSampleData();
          toast.info('Inicializando base de datos con datos de ejemplo...');
          // Retry loading after initialization
          setTimeout(loadErrorDatabase, 2000);
        } catch (initError) {
          console.error('Error initializing sample data:', initError);
          toast.error('Error inicializando la base de datos');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadErrorDatabase();
  }, []);

  // Admin functions
  const handleAddErrorCode = async (data) => {
    try {
      // Add error code to Firebase
      await errorCodesService.addErrorCode(
        data.manufacturer,
        data.line,
        data.subLine,
        data.errorCode
      );
      
      // Send notification
      try {
        const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
        const lineName = errorDatabase.manufacturers[data.manufacturer]?.lines[data.line]?.name || 'Unknown';
        await notificationsService.notifyErrorCodeAdded(
          data.errorCode.code,
          manufacturerName,
          lineName,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send notification:', notificationError);
      }
      
      // Reload the database to reflect changes
      const updatedDatabase = await errorCodesService.getCompleteErrorDatabase();
      setErrorDatabase(updatedDatabase);
      
      toast.success('Código de error agregado exitosamente');
    } catch (error) {
      console.error('Error adding error code:', error);
      throw error;
    }
  };

  const handleAddManufacturer = async (data) => {
    try {
      // Add manufacturer to Firebase
      const manufacturerKey = await errorCodesService.addManufacturer({
        name: data.manufacturer
      });
      
      // Send manufacturer notification
      try {
        await notificationsService.notifyManufacturerAdded(
          data.manufacturer,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send manufacturer notification:', notificationError);
      }
      
      // Add line to the new manufacturer
      const lineKey = await errorCodesService.addLine(manufacturerKey, {
        name: data.line,
        hasSubLines: !!data.subLine
      });
      
      // Send line notification
      try {
        await notificationsService.notifyLineAdded(
          data.line,
          data.manufacturer,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send line notification:', notificationError);
      }
      
      // Add subline if needed
      if (data.subLine) {
        const subLineKey = await errorCodesService.addSubLine(manufacturerKey, lineKey, {
          name: data.subLine
        });
        
        // Send subline notification
        try {
          await notificationsService.notifySubLineAdded(
            data.subLine,
            data.line,
            data.manufacturer,
            user?.email || 'Unknown'
          );
        } catch (notificationError) {
          console.warn('Failed to send subline notification:', notificationError);
        }
        
        // Add error code to subline
        await errorCodesService.addErrorCode(
          manufacturerKey,
          lineKey,
          subLineKey,
          data.errorCode
        );
      } else {
        // Add error code directly to line
        await errorCodesService.addErrorCode(
          manufacturerKey,
          lineKey,
          null,
          data.errorCode
        );
      }
      
      // Send error code notification
      try {
        await notificationsService.notifyErrorCodeAdded(
          data.errorCode.code,
          data.manufacturer,
          data.line,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send error code notification:', notificationError);
      }
      
      // Reload the database to reflect changes
      const updatedDatabase = await errorCodesService.getCompleteErrorDatabase();
      setErrorDatabase(updatedDatabase);
      
      toast.success('Fabricante y código de error agregados exitosamente');
    } catch (error) {
      console.error('Error adding manufacturer:', error);
      throw error;
    }
  };

  const handleAddLine = async (data) => {
    try {
      // Add line to existing manufacturer
      const lineKey = await errorCodesService.addLine(data.manufacturer, {
        name: data.line,
        hasSubLines: !!data.subLine
      });
      
      // Send line notification
      try {
        const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
        await notificationsService.notifyLineAdded(
          data.line,
          manufacturerName,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send line notification:', notificationError);
      }
      
      // Add subline if needed
      if (data.subLine) {
        const subLineKey = await errorCodesService.addSubLine(data.manufacturer, lineKey, {
          name: data.subLine
        });
        
        // Send subline notification
        try {
          const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
          await notificationsService.notifySubLineAdded(
            data.subLine,
            data.line,
            manufacturerName,
            user?.email || 'Unknown'
          );
        } catch (notificationError) {
          console.warn('Failed to send subline notification:', notificationError);
        }
        
        // Add error code to subline
        await errorCodesService.addErrorCode(
          data.manufacturer,
          lineKey,
          subLineKey,
          data.errorCode
        );
      } else {
        // Add error code directly to line
        await errorCodesService.addErrorCode(
          data.manufacturer,
          lineKey,
          null,
          data.errorCode
        );
      }
      
      // Send error code notification
      try {
        const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
        await notificationsService.notifyErrorCodeAdded(
          data.errorCode.code,
          manufacturerName,
          data.line,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send error code notification:', notificationError);
      }
      
      // Reload the database to reflect changes
      const updatedDatabase = await errorCodesService.getCompleteErrorDatabase();
      setErrorDatabase(updatedDatabase);
      
      toast.success('Línea y código de error agregados exitosamente');
    } catch (error) {
      console.error('Error adding line:', error);
      throw error;
    }
  };

  const handleAddSubLine = async (data) => {
    try {
      // Add subline to existing line
      const subLineKey = await errorCodesService.addSubLine(data.manufacturer, data.line, {
        name: data.subLine
      });
      
      // Send subline notification
      try {
        const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
        const lineName = errorDatabase.manufacturers[data.manufacturer]?.lines[data.line]?.name || 'Unknown';
        await notificationsService.notifySubLineAdded(
          data.subLine,
          lineName,
          manufacturerName,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send subline notification:', notificationError);
      }
      
      // Add error code to the new subline
      await errorCodesService.addErrorCode(
        data.manufacturer,
        data.line,
        subLineKey,
        data.errorCode
      );
      
      // Send error code notification
      try {
        const manufacturerName = errorDatabase.manufacturers[data.manufacturer]?.name || 'Unknown';
        const lineName = errorDatabase.manufacturers[data.manufacturer]?.lines[data.line]?.name || 'Unknown';
        await notificationsService.notifyErrorCodeAdded(
          data.errorCode.code,
          manufacturerName,
          lineName,
          user?.email || 'Unknown'
        );
      } catch (notificationError) {
        console.warn('Failed to send error code notification:', notificationError);
      }
      
      // Reload the database to reflect changes
      const updatedDatabase = await errorCodesService.getCompleteErrorDatabase();
      setErrorDatabase(updatedDatabase);
      
      toast.success('Sub-línea y código de error agregados exitosamente');
    } catch (error) {
      console.error('Error adding sub-line:', error);
      throw error;
    }
  };

  // Handle admin invitation
  const handleAdminInvited = (email) => {
    console.log(`New admin invited: ${email}`);
    // You could add additional logic here if needed
  };

  // Loading screen
  if (loading || !initialLoadComplete) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cargando Códigos de Error
            </h3>
            <p className="text-gray-600">
              Obteniendo datos de la base de datos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Códigos de Error Eléctricos
              </h1>
              {isAdmin && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </div>
              )}
            </div>
            <p className="text-gray-600">
              Selecciona fabricante y línea de producto para acceder a los códigos de error
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {(selectedManufacturer || selectedLine || selectedSubLine) && (
              <button
                onClick={resetSelection}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Reiniciar</span>
              </button>
            )}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAdminModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Código</span>
                </button>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  title="Invitar Administrador"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invitar Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Code Search - Always visible */}
        <div className="mt-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Búsqueda por Código de Producto
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ej: ACS880-01, G120C, ATV32H..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={productCodeSearch}
                onChange={(e) => setProductCodeSearch(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleProductCodeSearch(productCodeSearch);
                  }
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el código de producto para navegar automáticamente
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {(selectedManufacturer || selectedLine || selectedSubLine) && (
        <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={resetSelection}
            className="hover:text-blue-600"
          >
            Inicio
          </button>
          {selectedManufacturer && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={goBackToManufacturer}
                className="hover:text-blue-600"
              >
                {errorDatabase.manufacturers[selectedManufacturer]?.name}
              </button>
            </>
          )}
          {selectedLine && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={goBackToLine}
                className="hover:text-blue-600"
              >
                {errorDatabase.manufacturers[selectedManufacturer]?.lines[selectedLine]?.name}
              </button>
            </>
          )}
          {selectedSubLine && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">
                {errorDatabase.manufacturers[selectedManufacturer]?.lines[selectedLine]?.subLines[selectedSubLine]?.name}
              </span>
            </>
          )}
        </div>
      )}

      {/* Paso 1: Selección de Fabricante */}
      {!selectedManufacturer && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            1. Selecciona el Fabricante
          </h2>
          
          {/* Search bar for manufacturers */}
          <div className="mb-6">
            <div className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar fabricante..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={manufacturerSearch}
                onChange={(e) => setManufacturerSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredManufacturers.map(([key, manufacturer]) => (
              <button
                key={key}
                onClick={() => setSelectedManufacturer(key)}
                className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{manufacturer.name}</h3>
                    <p className="text-sm text-gray-500">
                      {Object.keys(manufacturer.lines).length} líneas de productos
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: Selección de Línea */}
      {selectedManufacturer && !selectedLine && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            2. Selecciona la Línea de Producto
          </h2>
          
          {/* Search bar for lines */}
          <div className="mb-6">
            <div className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar línea de producto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={lineSearch}
                onChange={(e) => setLineSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLines.map(([key, line]) => (
              <button
                key={key}
                onClick={() => setSelectedLine(key)}
                className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Cpu className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{line.name}</h3>
                      <p className="text-sm text-gray-500">
                        {line.hasSubLines 
                          ? `${Object.keys(line.subLines).length} sub-líneas`
                          : `${line.errorCodes?.length || 0} códigos de error`
                        }
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: Selección de Sub-línea (si aplica) */}
      {selectedManufacturer && selectedLine && 
       errorDatabase.manufacturers[selectedManufacturer]?.lines[selectedLine]?.hasSubLines && 
       !selectedSubLine && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            3. Selecciona la Sub-línea
          </h2>
          
          {/* Search bar for sub-lines */}
          <div className="mb-6">
            <div className="max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar sub-línea..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subLineSearch}
                onChange={(e) => setSubLineSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubLines.map(([key, subLine]) => (
              <button
                key={key}
                onClick={() => setSelectedSubLine(key)}
                className="p-6 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{subLine.name}</h3>
                      <p className="text-sm text-gray-500">
                        {subLine.errorCodes?.length || 0} códigos de error
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 4: Búsqueda y Listado de Códigos */}
      {selectedManufacturer && selectedLine && 
       (!errorDatabase.manufacturers[selectedManufacturer]?.lines[selectedLine]?.hasSubLines || selectedSubLine) && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Códigos de Error - Buscar
          </h2>

          {/* Barra de Búsqueda */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar código de error..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de Códigos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredErrors.map((error) => (
              <div
                key={error.code}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedError(error)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-sm">
                      {error.code.length > 6 ? error.code.substring(0, 6) : error.code}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{error.title}</h3>
                      <p className="text-xs text-blue-600 font-medium">{error.code}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(error.severity)}`}>
                    {getSeverityText(error.severity)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{error.description}</p>
                <div className="mt-4 text-right">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver detalles →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredErrors.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron códigos</h3>
              <p className="text-gray-500">
                No hay códigos que coincidan con "{searchTerm}"
              </p>
            </div>
          )}

          {filteredErrors.length === 0 && !searchTerm && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingresa un código para buscar</h3>
              <p className="text-gray-500">
                Utiliza el campo de búsqueda para encontrar códigos de error específicos
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    {selectedError.code}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedError.title}</h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-gray-500 capitalize">{selectedError.category}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedError.severity)}`}>
                        Severidad: {getSeverityText(selectedError.severity)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-gray-600">{selectedError.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Posibles Causas</h3>
                  <ul className="space-y-2">
                    {selectedError.causes.map((cause, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Soluciones Recomendadas</h3>
                  <ol className="space-y-2">
                    {selectedError.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-600">{solution}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>
                    Si el problema persiste después de aplicar estas soluciones, 
                    consulte con un electricista calificado.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal */}
      <AdminAddErrorModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        errorDatabase={errorDatabase}
        onAddErrorCode={handleAddErrorCode}
        onAddManufacturer={handleAddManufacturer}
        onAddLine={handleAddLine}
        onAddSubLine={handleAddSubLine}
      />

      {/* Invite Admin Modal */}
      <InviteAdminModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        currentUser={user}
        onAdminInvited={handleAdminInvited}
      />
    </div>
  );
};

export default ErrorCodesApp;
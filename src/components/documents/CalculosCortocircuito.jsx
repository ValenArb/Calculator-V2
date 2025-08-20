import React, { useState, useEffect } from 'react';
import { Calculator, Plus, Minus, Save, Download, AlertTriangle, Zap } from 'lucide-react';

const CalculosCortocircuito = ({ projectData, onDataChange, readOnly = false }) => {
  const [cortocircuitoData, setCortocircuitoData] = useState({
    parametrosGenerales: {
      tensionNominal: '',
      frecuencia: 50,
      sistemaAterrado: 'si',
      tipoSistema: 'trifasico',
      factor: '1.1'
    },
    datosRed: {
      potenciaCC: '',
      impedanciaRed: '',
      relacionXR: '',
      ubicacion: ''
    },
    transformador: {
      potenciaNominal: '',
      tensionPrimario: '',
      tensionSecundario: '',
      impedancia: '',
      conexion: 'Dyn11'
    },
    puntosFalla: []
  });

  const [resultados, setResultados] = useState({});

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize data from project
  useEffect(() => {
    if (projectData?.calculation_data?.cortocircuito && !isInitialized) {
      setCortocircuitoData(prev => ({
        ...prev,
        ...projectData.calculation_data.cortocircuito
      }));
      setIsInitialized(true);
    }
  }, [projectData, isInitialized]);

  // Notify parent of changes (exclude onDataChange from deps to avoid infinite loops)
  useEffect(() => {
    // Only notify parent after initialization and when data actually changes
    if (onDataChange && isInitialized) {
      onDataChange({
        cortocircuito: cortocircuitoData
      });
    }
  }, [cortocircuitoData, isInitialized]);

  const handleParametroChange = (seccion, campo, valor) => {
    setCortocircuitoData(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const agregarPuntoFalla = () => {
    setCortocircuitoData(prev => ({
      ...prev,
      puntosFalla: [
        ...prev.puntosFalla,
        {
          id: Date.now(),
          nombre: `Punto ${prev.puntosFalla.length + 1}`,
          ubicacion: '',
          distancia: '',
          seccionCable: '',
          tipoProteccion: '',
          ajusteProteccion: '',
          iccTrifasica: '',
          iccBifasica: '',
          iccMonofasica: '',
          tiempoDesconexion: '',
          observaciones: ''
        }
      ]
    }));
  };

  const eliminarPuntoFalla = (id) => {
    setCortocircuitoData(prev => ({
      ...prev,
      puntosFalla: prev.puntosFalla.filter(punto => punto.id !== id)
    }));
  };

  const actualizarPuntoFalla = (id, campo, valor) => {
    setCortocircuitoData(prev => ({
      ...prev,
      puntosFalla: prev.puntosFalla.map(punto => 
        punto.id === id ? { ...punto, [campo]: valor } : punto
      )
    }));
  };

  const calcularCortocircuito = () => {
    // Aquí iría la lógica de cálculo de cortocircuito
    // Por ahora simularemos algunos resultados
    const nuevosResultados = {};
    
    cortocircuitoData.puntosFalla.forEach(punto => {
      const Sn = parseFloat(cortocircuitoData.transformador.potenciaNominal) || 1000;
      const Un = parseFloat(cortocircuitoData.parametrosGenerales.tensionNominal) || 400;
      const Z = parseFloat(cortocircuitoData.transformador.impedancia) || 6;
      
      // Cálculo simplificado de Icc trifásica
      const IccTrifasica = (Sn * 1000) / (Math.sqrt(3) * Un * (Z / 100));
      
      nuevosResultados[punto.id] = {
        iccTrifasica: IccTrifasica.toFixed(0),
        iccBifasica: (IccTrifasica * 0.866).toFixed(0),
        iccMonofasica: (IccTrifasica * 0.5).toFixed(0),
        tiempoDesconexion: '0.1'
      };
    });
    
    setResultados(nuevosResultados);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <Zap className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cálculos de Cortocircuito</h1>
            <p className="text-gray-600">Análisis de corrientes de falla y coordinación de protecciones</p>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex space-x-2">
            <button
              onClick={calcularCortocircuito}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span>Calcular</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Parámetros Generales */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          Parámetros Generales del Sistema
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tensión Nominal (V)
            </label>
            <input
              type="number"
              value={cortocircuitoData.parametrosGenerales.tensionNominal}
              onChange={(e) => handleParametroChange('parametrosGenerales', 'tensionNominal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="400"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia (Hz)
            </label>
            <input
              type="number"
              value={cortocircuitoData.parametrosGenerales.frecuencia}
              onChange={(e) => handleParametroChange('parametrosGenerales', 'frecuencia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="50"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sistema Aterrado
            </label>
            <select
              value={cortocircuitoData.parametrosGenerales.sistemaAterrado}
              onChange={(e) => handleParametroChange('parametrosGenerales', 'sistemaAterrado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={readOnly}
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sistema
            </label>
            <select
              value={cortocircuitoData.parametrosGenerales.tipoSistema}
              onChange={(e) => handleParametroChange('parametrosGenerales', 'tipoSistema', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={readOnly}
            >
              <option value="trifasico">Trifásico</option>
              <option value="monofasico">Monofásico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Datos de la Red */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Red de Alimentación</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potencia de CC (MVA)
            </label>
            <input
              type="number"
              step="0.1"
              value={cortocircuitoData.datosRed.potenciaCC}
              onChange={(e) => handleParametroChange('datosRed', 'potenciaCC', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="500"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impedancia Red (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={cortocircuitoData.datosRed.impedanciaRed}
              onChange={(e) => handleParametroChange('datosRed', 'impedanciaRed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="0.5"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relación X/R
            </label>
            <input
              type="number"
              step="0.1"
              value={cortocircuitoData.datosRed.relacionXR}
              onChange={(e) => handleParametroChange('datosRed', 'relacionXR', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="10"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <input
              type="text"
              value={cortocircuitoData.datosRed.ubicacion}
              onChange={(e) => handleParametroChange('datosRed', 'ubicacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Subestación principal"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Datos del Transformador */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Transformador</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Potencia Nominal (kVA)
            </label>
            <input
              type="number"
              value={cortocircuitoData.transformador.potenciaNominal}
              onChange={(e) => handleParametroChange('transformador', 'potenciaNominal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="1000"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tensión Primario (V)
            </label>
            <input
              type="number"
              value={cortocircuitoData.transformador.tensionPrimario}
              onChange={(e) => handleParametroChange('transformador', 'tensionPrimario', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="13200"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tensión Secundario (V)
            </label>
            <input
              type="number"
              value={cortocircuitoData.transformador.tensionSecundario}
              onChange={(e) => handleParametroChange('transformador', 'tensionSecundario', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="400"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impedancia (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={cortocircuitoData.transformador.impedancia}
              onChange={(e) => handleParametroChange('transformador', 'impedancia', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="6"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conexión
            </label>
            <select
              value={cortocircuitoData.transformador.conexion}
              onChange={(e) => handleParametroChange('transformador', 'conexion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={readOnly}
            >
              <option value="Dyn11">Dyn11</option>
              <option value="Yyn0">Yyn0</option>
              <option value="Dd0">Dd0</option>
              <option value="Yd11">Yd11</option>
            </select>
          </div>
        </div>
      </div>

      {/* Puntos de Falla */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Puntos de Falla</h2>
          {!readOnly && (
            <button
              onClick={agregarPuntoFalla}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Punto</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {cortocircuitoData.puntosFalla.map((punto, index) => (
            <div key={punto.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-900">
                  Punto de Falla {index + 1}: {punto.nombre}
                </h3>
                {!readOnly && (
                  <button
                    onClick={() => eliminarPuntoFalla(punto.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Punto
                  </label>
                  <input
                    type="text"
                    value={punto.nombre}
                    onChange={(e) => actualizarPuntoFalla(punto.id, 'nombre', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={readOnly}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={punto.ubicacion}
                    onChange={(e) => actualizarPuntoFalla(punto.id, 'ubicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Tablero principal"
                    disabled={readOnly}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia (m)
                  </label>
                  <input
                    type="number"
                    value={punto.distancia}
                    onChange={(e) => actualizarPuntoFalla(punto.id, 'distancia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="50"
                    disabled={readOnly}
                  />
                </div>
              </div>

              {/* Resultados del cálculo */}
              {resultados[punto.id] && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-3">Resultados del Cálculo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Icc Trifásica:</span>
                      <span className="ml-2 font-mono text-green-700">{resultados[punto.id].iccTrifasica} A</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Icc Bifásica:</span>
                      <span className="ml-2 font-mono text-green-700">{resultados[punto.id].iccBifasica} A</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Icc Monofásica:</span>
                      <span className="ml-2 font-mono text-green-700">{resultados[punto.id].iccMonofasica} A</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Tiempo Desc:</span>
                      <span className="ml-2 font-mono text-green-700">{resultados[punto.id].tiempoDesconexion} s</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {cortocircuitoData.puntosFalla.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No hay puntos de falla definidos.</p>
              <p className="text-sm">Haz clic en "Agregar Punto" para comenzar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculosCortocircuito;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calculator, Plus, Minus, Save, Download, AlertTriangle, Zap, FileText, Settings, Lock, Unlock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { updateProject } from '../../services/api.js';
import cortocircuitoService from '../../services/cortocircuito.js';
import { useSelector } from 'react-redux';

// Componente de Tooltip para los encabezados
const Tooltip = ({ text, children, position = 'top' }) => (
  <div className="relative group">
    {children}
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-[9999] max-w-xs pointer-events-none shadow-lg border border-gray-700`}>
      <div className="whitespace-normal leading-relaxed">{text}</div>
      <div className={`absolute ${position === 'top' ? 'top-full' : 'bottom-full'} left-1/2 transform -translate-x-1/2 border-4 border-transparent ${position === 'top' ? 'border-t-gray-900' : 'border-b-gray-900'}`}></div>
    </div>
  </div>
);

// Componente para el panel de detalles de cada carga
const CargaDetailPanel = ({ carga, onUpdate, onCalculate, readOnly, calcularPotenciaSimulada, calcularCorrienteNominal, calcularParametrosCable }) => {
  
  // Función para obtener métodos de instalación disponibles según tipo de cable
  const getMetodosDisponibles = (tipoCable, configuracion = null) => {
    switch(tipoCable) {
      case 'IRAM NM 247-3': // Superastic Jet/Flex - Solo método B2
        return [
          { value: 'B2', label: 'Método B2 - Cañería embutida' }
        ];
      case 'IRAM 62267': // Afumex 750 - Solo método B2  
        return [
          { value: 'B2', label: 'Método B2 - Cañería embutida' }
        ];
      case 'IRAM 2178': // Sintenax Valio - Todos los métodos disponibles
        return [
          { value: 'B2', label: 'Método B2 - Cañería embutida' },
          { value: 'C', label: 'Método C - Cañería al aire' },
          { value: 'D1', label: 'Método D1 - Enterrado directo' },
          { value: 'D2', label: 'Método D2 - En ducto enterrado' },
          { value: 'E', label: 'Método E - Bandeja perforada' },
          { value: 'F', label: 'Método F - Bandeja sólida' },
          { value: 'G', label: 'Método G - Bandeja vertical' }
        ];
      case 'IRAM 62266': // Afumex 1000 - Todos los métodos disponibles
        return [
          { value: 'B2', label: 'Método B2 - Cañería embutida' },
          { value: 'C', label: 'Método C - Cañería al aire' },
          { value: 'D1', label: 'Método D1 - Enterrado directo' },
          { value: 'D2', label: 'Método D2 - En ducto enterrado' },
          { value: 'E', label: 'Método E - Bandeja perforada' },
          { value: 'F', label: 'Método F - Bandeja sólida' },
          { value: 'G', label: 'Método G - Bandeja vertical' }
        ];
      default:
        return [
          { value: 'B2', label: 'Método B2 - Cañería embutida' }
        ];
    }
  };

  // Función para obtener secciones disponibles según tipo de cable (basado en catálogo Prysmian 2012)
  const getSeccionesDisponibles = (tipoCable, configuracion = null) => {
    switch(tipoCable) {
      case 'IRAM NM 247-3': // Superastic Jet/Flex
        return [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
      case 'IRAM 62267': // Afumex 750
        return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120];
      case 'IRAM 62266': // Afumex 1000 - Secciones según configuración del catálogo Prysmian páginas 24-25
        switch(configuracion) {
          case 'unipolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];
          case 'bipolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
          case 'tripolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
          case 'tetrapolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
          default:
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
        }
      case 'IRAM 2178': // Sintenax Valio - Secciones según configuración del catálogo Prysmian
        switch(configuracion) {
          case 'unipolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630];
          case 'bipolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
          case 'tripolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
          case 'tetrapolar':
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
          default:
            return [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
        }
      default:
        return [1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
    }
  };


  return (
    <div className="space-y-6">
      {/* Header de la carga */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {carga.denominacion || 'Nueva Carga'}
            </h3>
            <p className="text-sm text-gray-500">
              Configuración completa de la carga eléctrica y planilla de cargas
            </p>
          </div>
          <button 
            onClick={onCalculate}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            <span className="hidden sm:inline">Calcular ICC</span>
            <span className="sm:hidden">ICC</span>
          </button>
        </div>

        {/* Denominación principal */}
        <div>
          <Tooltip text="Denominación - Nombre identificativo de la carga o equipo eléctrico">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denominación de la Carga
            </label>
          </Tooltip>
          <input
            type="text"
            value={carga.denominacion}
            onChange={(e) => onUpdate(carga.id, 'denominacion', e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Motor de bomba principal, Iluminación oficinas, etc."
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Datos de Carga */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 text-blue-500 mr-2" />
          Datos de Carga
        </h4>
        
        <div className="space-y-4">
          {/* Primera fila - Potencia Instalada (ancho completo) */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Tooltip text="Potencia Instalada - Potencia nominal del equipo">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potencia Instalada
                </label>
              </Tooltip>
              <div className="flex space-x-2 w-full">
                <input
                  type="number"
                  value={carga.potenciaInstalada}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    onUpdate(carga.id, 'potenciaInstalada', newValue);
                    
                    // Calcular inmediatamente con el nuevo valor
                    if (newValue && !isNaN(parseFloat(newValue))) {
                      calcularPotenciaSimulada(carga.id, newValue);
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2200"
                  disabled={readOnly}
                />
                <select
                  value={carga.potenciaUnidad || 'W'}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    onUpdate(carga.id, 'potenciaUnidad', newUnit);
                    
                    // Recalcular con la nueva unidad si hay potencia instalada
                    if (carga.potenciaInstalada) {
                      calcularPotenciaSimulada(carga.id, null, newUnit);
                    }
                  }}
                  className="w-16 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  disabled={readOnly}
                >
                  <option value="W">W</option>
                  <option value="kW">kW</option>
                  <option value="HP">HP</option>
                  <option value="CV">CV</option>
                </select>
              </div>
            </div>
          </div>

          {/* Segunda fila - Coef. Simultaneidad y Eficiencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Tooltip text="Coeficiente de Simultaneidad - Factor que indica qué porcentaje de la carga opera simultáneamente">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coef. Simultaneidad
                </label>
              </Tooltip>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={carga.coefSimultaneidad}
                onChange={(e) => {
                  const newCoefSim = e.target.value;
                  onUpdate(carga.id, 'coefSimultaneidad', newCoefSim);
                  
                  // Recalcular si hay potencia instalada
                  if (carga.potenciaInstalada) {
                    calcularPotenciaSimulada(carga.id, null, null, newCoefSim);
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
                disabled={readOnly}
              />
            </div>

            <div>
              <Tooltip text="Eficiencia - Rendimiento del equipo en porcentaje">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Eficiencia (%)
                </label>
              </Tooltip>
              <input
                type="number"
                min="0"
                max="100"
                value={carga.eficiencia}
                onChange={(e) => {
                  const newEficiencia = e.target.value;
                  onUpdate(carga.id, 'eficiencia', newEficiencia);
                  
                  // Recalcular si hay potencia instalada
                  if (carga.potenciaInstalada) {
                    calcularPotenciaSimulada(carga.id, null, null, null, newEficiencia);
                  }
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Tercera fila - Tipo de Carga y Tensión Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Tooltip text="Tipo de Carga - Configuración de fases de la carga eléctrica">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Carga
                </label>
              </Tooltip>
              <select
                value={carga.tipoCarga || 'RSTN'}
                onChange={(e) => {
                  const newTipoCarga = e.target.value;
                  onUpdate(carga.id, 'tipoCarga', newTipoCarga);
                  
                  // Cambiar tensión automáticamente según tipo de carga
                  let nuevaTension;
                  if (newTipoCarga === 'RST' || newTipoCarga === 'RSTN') {
                    // Trifásicas → 380V
                    nuevaTension = '380';
                  } else if (newTipoCarga === 'DC') {
                    // DC → 12V
                    nuevaTension = '12';
                  } else {
                    // Monofásicas (R, S, T, RN, SN, TN) → 220V
                    nuevaTension = '220';
                  }
                  
                  onUpdate(carga.id, 'tension', nuevaTension);
                  
                  // Recalcular inmediatamente con los nuevos valores
                  calcularCorrienteNominal(carga.id, { 
                    tipoCarga: newTipoCarga, 
                    tension: nuevaTension 
                  });
                  // Chain the other calculations immediately
                  calcularParametrosCable(carga.id);
                  calcularICC(carga.id);
                  
                  // Actualizar automáticamente el interruptor después del recálculo
                  setTimeout(() => seleccionarInterruptorAutomatico(carga.id), 100);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="R">R - Monofásico</option>
                <option value="S">S - Monofásico</option>
                <option value="T">T - Monofásico</option>
                <option value="RN">RN - Monofásico R-N</option>
                <option value="SN">SN - Monofásico S-N</option>
                <option value="TN">TN - Monofásico T-N</option>
                <option value="RST">RST - Trifásico</option>
                <option value="RSTN">RSTN - Trifásico con Neutro</option>
                <option value="DC">DC - Corriente Continua</option>
              </select>
            </div>

            <div>
              <Tooltip text="Tensión Nominal - Tensión de funcionamiento de la carga en voltios">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tensión Nominal (V)
                </label>
              </Tooltip>
              <input
                type="number"
                value={carga.tension || ''}
                onChange={(e) => {
                  const newTension = e.target.value;
                  onUpdate(carga.id, 'tension', newTension);
                  // Recalcular inmediatamente con el nuevo valor
                  calcularCorrienteNominal(carga.id, { tension: newTension });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="380"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Cuarta fila - Factor de Potencia y % de Reserva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Tooltip text="Factor de Potencia - Coseno del ángulo entre tensión y corriente (No aplica para DC)">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factor de Potencia (cos φ)
                </label>
              </Tooltip>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={carga.tipoCarga === 'DC' ? '1.0' : carga.cosoPhi}
                onChange={(e) => {
                  const newCosPhi = e.target.value;
                  onUpdate(carga.id, 'cosoPhi', newCosPhi);
                  // Recalcular inmediatamente con el nuevo valor
                  calcularCorrienteNominal(carga.id, { cosoPhi: newCosPhi });
                }}
                onFocus={(e) => e.target.select()}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  carga.tipoCarga === 'DC' ? 'bg-gray-100 text-gray-500' : ''
                }`}
                placeholder="1"
                disabled={readOnly || carga.tipoCarga === 'DC'}
              />
            </div>

            <div>
              <Tooltip text="Porcentaje de Reserva - Porcentaje adicional de corriente para reserva de seguridad">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % de Reserva
                </label>
              </Tooltip>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={carga.porcentajeReserva || ''}
                onChange={(e) => {
                  const newPorcentajeReserva = e.target.value;
                  onUpdate(carga.id, 'porcentajeReserva', newPorcentajeReserva);
                  // Recalcular corrientes con reserva
                  calcularCorrienteConReserva(carga.id, newPorcentajeReserva);
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Quinta fila - Resultados principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Tooltip text="Potencia Simultánea - Potencia real considerando simultaneidad y eficiencia">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potencia Simultánea (kW)
                </label>
              </Tooltip>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                {carga.potenciaSimulada || '0.000'}
              </div>
            </div>

            <div>
              <Tooltip text="Corriente Nominal - Corriente total con reserva aplicada para dimensionamiento">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corriente Nominal (A)
                </label>
              </Tooltip>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                {(() => {
                  const corrienteBase = parseFloat(carga.corrienteNominal || 0);
                  const porcentajeReserva = parseFloat(carga.porcentajeReserva || 20) || 20;
                  const factorReserva = 1 + (porcentajeReserva / 100);
                  const corrienteConReserva = corrienteBase * factorReserva;
                  return corrienteConReserva.toFixed(2);
                })()}
              </div>
            </div>
          </div>

          {/* Sexta fila - Corrientes por fase */}
          {carga.corrientesPorFase && !carga.corrientesPorFase.DC && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Tooltip text="Corriente Base Fase R - Corriente calculada sin reserva en la fase R">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corriente Base R (A)
                  </label>
                </Tooltip>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                  {carga.corrientesPorFase?.R || '0.00'}
                </div>
              </div>

              <div>
                <Tooltip text="Corriente Base Fase S - Corriente calculada sin reserva en la fase S">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corriente Base S (A)
                  </label>
                </Tooltip>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                  {carga.corrientesPorFase?.S || '0.00'}
                </div>
              </div>

              <div>
                <Tooltip text="Corriente Base Fase T - Corriente calculada sin reserva en la fase T">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corriente Base T (A)
                  </label>
                </Tooltip>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                  {carga.corrientesPorFase?.T || '0.00'}
                </div>
              </div>
            </div>
          )}

          {/* Para DC, mostrar campo separado */}
          {carga.corrientesPorFase?.DC && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Tooltip text="Corriente Base DC - Corriente calculada sin reserva en circuito DC">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Corriente Base DC (A)
                  </label>
                </Tooltip>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                  {carga.corrientesPorFase.DC}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Interruptor Asociado */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 text-orange-500 mr-2" />
          Interruptor Asociado
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Tooltip text="Tipo de Interruptor - MCB (Magnetotérmico), MCCB (Caja Moldeada), ACB (Aire), Fusible">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Interruptor
              </label>
            </Tooltip>
            <select
              value={carga.interruptor.tipo}
              onChange={(e) => onUpdate(carga.id, 'interruptor.tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={readOnly}
            >
              <option value="">Seleccionar tipo</option>
              <option value="MCB">MCB - Magnetotérmico</option>
              <option value="MCCB">MCCB - Caja Moldeada</option>
              <option value="ACB">ACB - Aire</option>
              <option value="Fusible">Fusible</option>
            </select>
          </div>

          <div>
            <Tooltip text="Calibre - Corriente nominal del interruptor en amperios">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Calibre 
                  {!carga.interruptor.bloqueado && <span className="text-green-600 text-xs ml-1">(Auto)</span>}
                  {carga.interruptor.bloqueado && <span className="text-red-600 text-xs ml-1">(Manual)</span>}
                </label>
                <button
                  onClick={() => onUpdate(carga.id, 'interruptor.bloqueado', !carga.interruptor.bloqueado)}
                  className={`p-1 rounded transition-colors ${
                    carga.interruptor.bloqueado 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  title={carga.interruptor.bloqueado ? 'Desbloquear actualización automática' : 'Bloquear actualización automática'}
                  disabled={readOnly}
                >
                  {carga.interruptor.bloqueado ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            </Tooltip>
            <select
              value={carga.interruptor.calibre || ''}
              onChange={(e) => onUpdate(carga.id, 'interruptor.calibre', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 ${
                carga.interruptor.bloqueado 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
              }`}
              disabled={readOnly}
            >
              <option value="">Seleccionar calibre</option>
              <option value="6">6 A</option>
              <option value="10">10 A</option>
              <option value="16">16 A</option>
              <option value="20">20 A</option>
              <option value="25">25 A</option>
              <option value="32">32 A</option>
              <option value="40">40 A</option>
              <option value="50">50 A</option>
              <option value="63">63 A</option>
              <option value="80">80 A</option>
              <option value="100">100 A</option>
              <option value="125">125 A</option>
              <option value="160">160 A</option>
              <option value="200">200 A</option>
              <option value="250">250 A</option>
              <option value="315">315 A</option>
              <option value="400">400 A</option>
              <option value="500">500 A</option>
              <option value="630">630 A</option>
              <option value="800">800 A</option>
              <option value="1000">1000 A</option>
            </select>
          </div>

          <div>
            <Tooltip text="Curva de Disparo - Característica de disparo magnético (B, C, D, K, Z)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curva de Disparo
              </label>
            </Tooltip>
            <select
              value={carga.interruptor.curva}
              onChange={(e) => onUpdate(carga.id, 'interruptor.curva', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={readOnly}
            >
              <option value="">Seleccionar curva</option>
              <option value="B">B - Cargas resistivas</option>
              <option value="C">C - Cargas mixtas</option>
              <option value="D">D - Cargas inductivas</option>
              <option value="K">K - Cargas electrónicas</option>
              <option value="Z">Z - Cargas especiales</option>
            </select>
          </div>

          <div>
            <Tooltip text="Número de Polos - Cantidad de fases que interrumpe el dispositivo">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Número de Polos 
                  {!carga.interruptor.bloqueado && <span className="text-green-600 text-xs ml-1">(Auto)</span>}
                  {carga.interruptor.bloqueado && <span className="text-red-600 text-xs ml-1">(Manual)</span>}
                </label>
                <span className="text-xs text-gray-500">
                  {carga.interruptor.bloqueado ? 'Bloqueado' : 'Automático'}
                </span>
              </div>
            </Tooltip>
            <select
              value={carga.interruptor.polos}
              onChange={(e) => onUpdate(carga.id, 'interruptor.polos', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 ${
                carga.interruptor.bloqueado 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                  : 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
              }`}
              disabled={readOnly}
            >
              <option value="1">1P - Monofásico</option>
              <option value="2">2P - Bifásico</option>
              <option value="3">3P - Trifásico</option>
              <option value="4">4P - Trifásico + Neutro</option>
            </select>
          </div>

          <div>
            <Tooltip text="Capacidad Última de Corte - Máxima corriente de CC que puede interrumpir">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icu - Capacidad Última (kA)
              </label>
            </Tooltip>
            <input
              type="number"
              step="0.1"
              value={carga.interruptor.icu}
              onChange={(e) => onUpdate(carga.id, 'interruptor.icu', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="6"
              disabled={readOnly}
            />
          </div>

          <div>
            <Tooltip text="Capacidad de Servicio de Corte - Corriente de CC que puede interrumpir manteniendo funcionalidad">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ics - Capacidad de Servicio (kA)
              </label>
            </Tooltip>
            <input
              type="number"
              step="0.1"
              value={carga.interruptor.ics}
              onChange={(e) => onUpdate(carga.id, 'interruptor.ics', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="6"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Cable */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-purple-500 mr-2" />
          Características del Conductor
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Tooltip text="Tipo de Conductor - Selecciona el conductor según norma IRAM del catálogo Prysmian">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conductor
              </label>
            </Tooltip>
            <select
              value={carga.cable.tipo}
              onChange={(e) => {
                const nuevoTipo = e.target.value;
                onUpdate(carga.id, 'cable.tipo', nuevoTipo);
                
                // Verificar si la sección actual está disponible para el nuevo tipo
                const seccionesDisponibles = getSeccionesDisponibles(
                  nuevoTipo, 
                  carga.cable.configuracionSintenax || carga.cable.configuracionAfumex
                );
                const seccionActual = parseFloat(carga.cable.seccionFase);
                
                if (seccionActual && !seccionesDisponibles.includes(seccionActual)) {
                  // Si la sección actual no está disponible, resetearla
                  onUpdate(carga.id, 'cable.seccionFase', '');
                }

                // Verificar si el método de instalación actual está disponible para el nuevo tipo
                const metodosDisponibles = getMetodosDisponibles(nuevoTipo);
                const metodoActual = carga.cable.metodoInstalacion || 'B2';
                const metodoValido = metodosDisponibles.find(m => m.value === metodoActual);
                
                if (!metodoValido) {
                  // Si el método actual no está disponible, usar el primero disponible
                  const primerMetodo = metodosDisponibles[0]?.value || 'B2';
                  onUpdate(carga.id, 'cable.metodoInstalacion', primerMetodo);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              disabled={readOnly}
            >
              <option value="IRAM NM 247-3">IRAM NM 247-3 - Unipolar Normalizado</option>
              <option value="IRAM 62267">IRAM 62267 - Afumex 750 LS0H</option>
              <option value="IRAM 2178">IRAM 2178 - Sintenax Valio</option>
              <option value="IRAM 62266">IRAM 62266 - Afumex 1000 LS0H</option>
            </select>
          </div>

          {/* Configuración específica para Sintenax Valio */}
          {carga.cable.tipo === 'IRAM 2178' && (
            <div>
              <Tooltip text="Configuración Sintenax - Selecciona si el conductor es unipolar, bipolar, tripolar o tetrapolar">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuración Sintenax
                </label>
              </Tooltip>
              <select
                value={carga.cable.configuracionSintenax || 'tripolar'}
                onChange={(e) => {
                  const nuevaConfig = e.target.value;
                  onUpdate(carga.id, 'cable.configuracionSintenax', nuevaConfig);
                  
                  // Resetear la sección cuando cambia la configuración
                  onUpdate(carga.id, 'cable.seccionFase', '');
                  calcularParametrosCable(carga.id, { configuracionSintenax: nuevaConfig, seccionFase: '' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={readOnly}
              >
                <option value="unipolar">Unipolar (1 conductor)</option>
                <option value="bipolar">Bipolar (2 conductores)</option>
                <option value="tripolar">Tripolar (3 conductores)</option>
                <option value="tetrapolar">Tetrapolar (4 conductores)</option>
              </select>
            </div>
          )}

          {/* Configuración específica para Afumex 1000 */}
          {carga.cable.tipo === 'IRAM 62266' && (
            <div>
              <Tooltip text="Configuración Afumex 1000 - Selecciona si el conductor es unipolar, bipolar, tripolar o tetrapolar">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuración Afumex 1000
                </label>
              </Tooltip>
              <select
                value={carga.cable.configuracionAfumex || 'tripolar'}
                onChange={(e) => {
                  const nuevaConfig = e.target.value;
                  onUpdate(carga.id, 'cable.configuracionAfumex', nuevaConfig);
                  
                  // Resetear la sección cuando cambia la configuración
                  onUpdate(carga.id, 'cable.seccionFase', '');
                  calcularParametrosCable(carga.id, { configuracionAfumex: nuevaConfig, seccionFase: '' });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={readOnly}
              >
                <option value="unipolar">Unipolar (1 conductor)</option>
                <option value="bipolar">Bipolar (2 conductores)</option>
                <option value="tripolar">Tripolar (3 conductores)</option>
                <option value="tetrapolar">Tetrapolar (4 conductores)</option>
              </select>
            </div>
          )}

          <div>
            <Tooltip text="Sección de Fase - Área transversal del conductor de fase">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección de Fase
              </label>
            </Tooltip>
            <select
              value={carga.cable.seccionFase || ''}
              onChange={(e) => {
                const nuevaSeccion = e.target.value;
                onUpdate(carga.id, 'cable.seccionFase', nuevaSeccion);
                // Pasar el nuevo valor directamente para evitar problemas de sincronización
                calcularParametrosCable(carga.id, { seccionFase: nuevaSeccion });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={readOnly}
            >
              {getSeccionesDisponibles(
                carga.cable.tipo || 'IRAM NM 247-3', 
                carga.cable.configuracionSintenax || carga.cable.configuracionAfumex
              ).map(seccion => (
                <option key={seccion} value={seccion}>
                  {seccion} mm²
                </option>
              ))}
            </select>
          </div>


          <div>
            <Tooltip text="Longitud del Conductor - Distancia total del conductor en metros (m)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud (m)
              </label>
            </Tooltip>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={carga.cable.longitud}
                onChange={(e) => {
                  const nuevaLongitud = e.target.value;
                  onUpdate(carga.id, 'cable.longitud', nuevaLongitud);
                  calcularParametrosCable(carga.id, { longitud: nuevaLongitud });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
                disabled={readOnly}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                m
              </span>
            </div>
          </div>

          <div>
            <Tooltip text="Conductores en Paralelo - Número de conductores idénticos en paralelo por fase para aumentar capacidad de corriente">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conductores en Paralelo
              </label>
            </Tooltip>
            <select
              value={carga.cable.paralelo || '1'}
              onChange={(e) => {
                const nuevoParalelo = e.target.value;
                onUpdate(carga.id, 'cable.paralelo', nuevoParalelo);
                calcularParametrosCable(carga.id, { paralelo: nuevoParalelo });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={readOnly}
            >
              <option value="1">1 conductor (simple)</option>
              <option value="2">2 conductores en paralelo</option>
              <option value="3">3 conductores en paralelo</option>
              <option value="4">4 conductores en paralelo</option>
              <option value="5">5 conductores en paralelo</option>
              <option value="6">6 conductores en paralelo</option>
            </select>
          </div>

          {/* Método de instalación - mostrar solo si hay múltiples métodos disponibles o si es necesario */}
          {carga.cable.tipo && (() => {
            const metodosDisponibles = getMetodosDisponibles(carga.cable.tipo, carga.cable.configuracionSintenax || carga.cable.configuracionAfumex);
            return metodosDisponibles.length > 1 || (carga.cable.tipo !== 'IRAM NM 247-3' && carga.cable.tipo !== 'IRAM 62267');
          })() && (
            <div>
              <Tooltip text="Método de Instalación - Método de instalación del conductor según normas IEC que afecta la capacidad de corriente">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Instalación
                </label>
              </Tooltip>
              <select
                value={carga.cable.metodoInstalacion || 'B2'}
                onChange={(e) => {
                  const nuevoMetodo = e.target.value;
                  const metodosDisponibles = getMetodosDisponibles(carga.cable.tipo, carga.cable.configuracionSintenax || carga.cable.configuracionAfumex);
                  
                  // Verificar si el método seleccionado está disponible para este tipo de cable
                  const metodoValido = metodosDisponibles.find(m => m.value === nuevoMetodo);
                  if (!metodoValido) {
                    // Si el método no está disponible, usar el primero disponible
                    const primerMetodo = metodosDisponibles[0]?.value || 'B2';
                    onUpdate(carga.id, 'cable.metodoInstalacion', primerMetodo);
                    calcularParametrosCable(carga.id, { metodoInstalacion: primerMetodo });
                  } else {
                    onUpdate(carga.id, 'cable.metodoInstalacion', nuevoMetodo);
                    calcularParametrosCable(carga.id, { metodoInstalacion: nuevoMetodo });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                {getMetodosDisponibles(carga.cable.tipo, carga.cable.configuracionSintenax || carga.cable.configuracionAfumex).map(metodo => (
                  <option key={metodo.value} value={metodo.value}>
                    {metodo.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Tooltip text="Resistencia - Resistencia eléctrica total del cable calculada automáticamente (ajustada por cables en paralelo)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resistencia (Ω)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.cable.resistencia || '0.0000'}
            </div>
          </div>

          {/* Reactancia solo para cables multipolares */}
          {carga.cable.tipo && 
           carga.cable.tipo !== 'IRAM NM 247-3' && 
           carga.cable.tipo !== 'IRAM 62267' &&
           !(carga.cable.tipo === 'IRAM 2178' && carga.cable.configuracionSintenax === 'unipolar') &&
           !(carga.cable.tipo === 'IRAM 62266' && carga.cable.configuracionAfumex === 'unipolar') && (
            <div>
              <Tooltip text="Reactancia Inductiva - Reactancia del cable calculada automáticamente (solo cables multipolares)">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reactancia (Ω)
                </label>
              </Tooltip>
              <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
                {carga.cable.reactancia || '0.0000'}
              </div>
            </div>
          )}

          <div>
            <Tooltip text="Corriente Admisible - Máxima corriente que puede circular sin superar temperatura límite (total para todos los cables en paralelo)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corriente Admisible Total (A)
                {parseInt(carga.cable.paralelo || 1) > 1 && (
                  <span className="text-xs text-blue-600 ml-1">
                    ({parseInt(carga.cable.paralelo || 1)} × {Math.round((carga.cable.capacidadAdmisible || 0) / parseInt(carga.cable.paralelo || 1))}A)
                  </span>
                )}
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.cable.capacidadAdmisible || '0'}
              {parseInt(carga.cable.paralelo || 1) > 1 && (
                <span className="text-xs text-blue-600 ml-2">
                  (×{carga.cable.paralelo})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resultados ICC */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Verificaciones de Seguridad
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">






          <div>
            <Tooltip text="Verificación de Interruptor - Compara ICC con capacidades Icu/Ics del interruptor">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verificación Interruptor
              </label>
            </Tooltip>
            <div className={`w-full px-3 py-2 rounded-md text-center font-medium ${
              carga.resultadosICC.verificacionInterruptor === 'OK' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : carga.resultadosICC.verificacionInterruptor === 'NO_OK'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}>
              {carga.resultadosICC.verificacionInterruptor === 'OK' ? '✓ CONFORME' :
               carga.resultadosICC.verificacionInterruptor === 'NO_OK' ? '✗ NO CONFORME' : 'PENDIENTE'}
            </div>
          </div>

          <div>
            <Tooltip text="Verificación de Cable - Verifica que la capacidad del cable sea mayor al calibre del interruptor que lo protege">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verificación Cable
              </label>
            </Tooltip>
            <div className={`w-full px-3 py-2 rounded-md text-center font-medium ${
              carga.resultadosICC.verificacionCable === 'OK' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : carga.resultadosICC.verificacionCable === 'NO_OK'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}>
              {carga.resultadosICC.verificacionCable === 'OK' ? '✓ CONFORME' :
               carga.resultadosICC.verificacionCable === 'NO_OK' ? '✗ NO CONFORME' : 'PENDIENTE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanillaCargas = ({ projectData, onDataChange, readOnly = false }) => {
  const user = useSelector(state => state.auth.user);
  const [cortocircuitoData, setCortocircuitoData] = useState({
    // Planilla de cargas integrada con datos de ICC
    cargas: []
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [cargaSeleccionada, setCargaSeleccionada] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error'
  const onDataChangeRef = useRef(onDataChange);
  const lastDataRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // Initialize data from project
  useEffect(() => {
    const loadCortocircuitoData = async () => {
      if (projectData && !isInitialized && user?.uid) {
        try {
          console.log('🔄 Loading cortocircuito data for project:', projectData.id);
          const cortocircuitoResponse = await cortocircuitoService.getCortocircuito(projectData.id, user.uid);
          
          if (cortocircuitoResponse?.calculosData && Object.keys(cortocircuitoResponse.calculosData).length > 0) {
            console.log('✅ Cortocircuito data loaded from backend:', cortocircuitoResponse.calculosData);
            setCortocircuitoData(prev => ({
              ...prev,
              ...cortocircuitoResponse.calculosData
            }));
          } else {
            console.log('ℹ️ No cortocircuito data found, using default state');
          }
        } catch (error) {
          console.error('❌ Error loading cortocircuito data:', error);
          // Continue with default state if loading fails
        } finally {
          setIsInitialized(true);
        }
      }
    };
    
    loadCortocircuitoData();
  }, [projectData, isInitialized, user?.uid]);

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data) => {
    if (!projectData?.id || !user?.uid || readOnly) return;

    console.log('🔄 Auto-save: Cambios detectados, esperando 2 segundos antes de guardar...');

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      console.log('⏰ Auto-save: Timeout anterior cancelado, reiniciando countdown...');
    }

    // Set new timeout for debounced auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('💾 Auto-save: Iniciando guardado automático...');
        setSaveStatus('saving');
        setIsSaving(true);

        // Use new cortocircuito service to save directly to calculos_cortocircuito field
        await cortocircuitoService.saveCortocircuito(projectData.id, user.uid, data);
        
        console.log('✅ Auto-save: Datos guardados exitosamente');
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);

      } catch (error) {
        console.error('❌ Auto-save: Error guardando datos de cortocircuito:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 3000);
      } finally {
        setIsSaving(false);
      }
    }, 2000); // 2 seconds debounce
  }, [projectData?.id, user?.uid, readOnly]);

  // Update ref when onDataChange changes
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Debounced notification to parent and auto-save with change detection
  useEffect(() => {
    if (!isInitialized) return;

    const currentDataString = JSON.stringify(cortocircuitoData);
    
    // Only notify and save if data actually changed
    if (lastDataRef.current !== currentDataString) {
      console.log('🔍 Cambio detectado en cortocircuitoData:', {
        cargas: cortocircuitoData.cargas.length
      });
      
      lastDataRef.current = currentDataString;
      
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Debounce the notification to prevent rapid fire updates
      debounceTimeoutRef.current = setTimeout(() => {
        if (onDataChangeRef.current) {
          console.log('📡 Notificando cambios al componente padre');
          onDataChangeRef.current({
            cortocircuito: cortocircuitoData
          });
        }
      }, 100); // 100ms debounce for parent notification

      // Trigger auto-save
      autoSave(cortocircuitoData);
    }
  }, [cortocircuitoData, isInitialized, autoSave]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Fix automático del calibre y polos - detectar cambios en corrienteNominal y tipoCarga
  useEffect(() => {
    cortocircuitoData.cargas.forEach(carga => {
      if (carga.corrienteNominal && parseFloat(carga.corrienteNominal) > 0) {
        const currentCalibre = parseFloat(carga.interruptor?.calibre || 0);
        const currentPolos = carga.interruptor?.polos || '';
        const corriente = parseFloat(carga.corrienteNominal);
        const porcentajeReserva = parseFloat(carga.porcentajeReserva || 20) || 20;
        const factorReserva = 1 + (porcentajeReserva / 100);
        const corrienteConReserva = corriente * factorReserva;
        
        // Calibres disponibles
        const calibresDisponibles = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];
        const calibreNecesario = calibresDisponibles.find(calibre => calibre >= corrienteConReserva);
        
        // Calcular polos necesarios según tipo de carga
        let polosNecesarios;
        const tipoCarga = carga.tipoCarga || 'RSTN';
        if (tipoCarga === 'R' || tipoCarga === 'S' || tipoCarga === 'T' || tipoCarga === 'DC') {
          polosNecesarios = '1';
        } else if (tipoCarga === 'RN' || tipoCarga === 'SN' || tipoCarga === 'TN') {
          polosNecesarios = '2';
        } else if (tipoCarga === 'RST') {
          polosNecesarios = '3';
        } else if (tipoCarga === 'RSTN') {
          polosNecesarios = '4';
        } else {
          polosNecesarios = '1';
        }
        
        console.log(`🔍 Carga: ${carga.denominacion}, Tipo: ${tipoCarga}, Corriente: ${corriente}A, Calibre: ${currentCalibre}→${calibreNecesario}A, Polos: ${currentPolos}→${polosNecesarios}`);
        
        // Si el calibre o polos no son correctos, actualizarlo (solo si no está bloqueado)
        if (!carga.interruptor.bloqueado && ((calibreNecesario && currentCalibre !== calibreNecesario) || (currentPolos !== polosNecesarios))) {
          console.log(`🔧 ACTUALIZANDO INTERRUPTOR - Calibre: ${currentCalibre}→${calibreNecesario}A, Polos: ${currentPolos}→${polosNecesarios}`);
          setTimeout(() => {
            seleccionarInterruptorAutomatico(carga.id);
          }, 50);
        } else if (carga.interruptor.bloqueado) {
          console.log(`🔒 INTERRUPTOR BLOQUEADO - No se actualiza automáticamente`);
        }
      }
    });
  }, [
    cortocircuitoData.cargas.map(c => c.corrienteNominal).join(','),
    cortocircuitoData.cargas.map(c => c.tipoCarga).join(','),
    cortocircuitoData.cargas.map(c => c.interruptor.bloqueado).join(',')
  ]);




  const agregarCarga = () => {
    const nuevaCarga = {
      id: Date.now(),
      // Datos básicos de la carga
      denominacion: '',
      tipoCarga: 'RSTN', // Default to RSTN (trifásico con neutro)
      tension: '380', // Tensión nominal por defecto para trifásico
      potenciaInstalada: '',
      potenciaUnidad: 'W',
      coefSimultaneidad: '1.0',
      cosoPhi: '0.8',
      eficiencia: '100',
      porcentajeReserva: '20', // Porcentaje de reserva por defecto
      potenciaSimulada: '',
      corrienteNominal: '',
      corrienteRegulacion: '',
      
      // Interruptor asociado
      interruptor: {
        tipo: '',
        calibre: '',
        calibreUnidad: 'A',
        curva: '',
        polos: '3',
        icu: '',
        ics: '',
        bloqueado: false // Control para bloquear actualización automática
      },
      
      // Datos de cableado
      cable: {
        tipo: 'IRAM NM 247-3',
        disposicion: 'bandeja',
        cantidadTernas: '1',
        seccionFase: '',
        longitud: '',
        resistencia: '',
        reactancia: '',
        capacidadAdmisible: ''
      },
      
      // Resultados calculados de ICC
      resultadosICC: {
        impedanciaEquivalente: '',
        iccTrifasico: '',
        iccBifasico: '',
        iccMonofasico: '',
        corrientePico: '',
        potenciaCC: '',
        verificacionInterruptor: 'PENDIENTE',
        verificacionCable: 'PENDIENTE'
      }
    };

    setCortocircuitoData(prev => ({
      ...prev,
      cargas: [...prev.cargas, nuevaCarga]
    }));

    // Auto-seleccionar la nueva carga
    setCargaSeleccionada(nuevaCarga);
  };

  const eliminarCarga = (id) => {
    setCortocircuitoData(prev => ({
      ...prev,
      cargas: prev.cargas.filter(carga => carga.id !== id)
    }));
  };

  const actualizarCarga = (id, campo, valor) => {
    setCortocircuitoData(prev => {
      const nuevasCargas = prev.cargas.map(carga => {
        if (carga.id === id) {
          let cargaActualizada;
          // Manejo de campos anidados (interruptor.tipo, cable.seccionFase, etc.)
          if (campo.includes('.')) {
            const [seccion, subcampo] = campo.split('.');
            cargaActualizada = {
              ...carga,
              [seccion]: {
                ...carga[seccion],
                [subcampo]: valor
              }
            };
          } else {
            cargaActualizada = { ...carga, [campo]: valor };
          }
          
          // Actualizar carga seleccionada si es la misma
          if (cargaSeleccionada?.id === id) {
            setCargaSeleccionada(cargaActualizada);
          }
          
          return cargaActualizada;
        }
        return carga;
      });
      
      return {
        ...prev,
        cargas: nuevasCargas
      };
    });
    
    // Verificar cable si se actualiza cualquier valor relacionado con cable o interruptor
    const camposQueAfectanVerificacion = [
      'interruptor.calibre',
      'cable.capacidadAdmisible',
      'cable.tipo',
      'cable.seccionFase',
      'cable.paralelo',
      'cable.metodoInstalacion',
      'cable.configuracionSintenax',
      'cable.configuracionAfumex'
    ];
    
    if (camposQueAfectanVerificacion.includes(campo)) {
      console.log(`🔄 CAMPO ACTUALIZADO: ${campo} → Ejecutando verificarCable`);
      // Ejecutar verificación inmediatamente con los valores actualizados
      setTimeout(() => {
        const cargaActualizada = cortocircuitoData.cargas.find(c => c.id === id);
        if (cargaActualizada) {
          // Aplicar la actualización manualmente para la verificación
          let cargaConCambio;
          if (campo.includes('.')) {
            const [seccion, subcampo] = campo.split('.');
            cargaConCambio = {
              ...cargaActualizada,
              [seccion]: {
                ...cargaActualizada[seccion],
                [subcampo]: valor
              }
            };
          } else {
            cargaConCambio = { ...cargaActualizada, [campo]: valor };
          }
          
          // Ejecutar verificación con los valores actualizados
          verificarCableConValores(id, cargaConCambio);
        }
      }, 10);
    }
    
    // El fix del calibre se maneja ahora con useEffect
  };

  // Función para calcular potencia simulada (con valores específicos para evitar problemas de estado asíncrono)
  const calcularPotenciaSimulada = (id, valorPotencia = null, valorUnidad = null, valorCoefSim = null, valorEficiencia = null) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;

    // Usar valores pasados como parámetro o los del estado actual
    const potenciaInst = parseFloat(valorPotencia !== null ? valorPotencia : carga.potenciaInstalada);
    const unidad = valorUnidad !== null ? valorUnidad : (carga.potenciaUnidad || 'W');
    const coefSim = parseFloat(valorCoefSim !== null ? valorCoefSim : carga.coefSimultaneidad) || 1;
    const eficiencia = parseFloat(valorEficiencia !== null ? valorEficiencia : carga.eficiencia) || 100;

    if (!potenciaInst || isNaN(potenciaInst) || potenciaInst <= 0) {
      // Si no hay potencia válida, limpiar los campos calculados
      actualizarCarga(id, 'potenciaSimulada', '');
      actualizarCarga(id, 'corrienteNominal', '');
      return;
    }

    // Convertir a kW según la unidad
    let potenciaInstKW;
    switch (unidad) {
      case 'W':
        potenciaInstKW = potenciaInst / 1000;
        break;
      case 'kW':
        potenciaInstKW = potenciaInst;
        break;
      case 'HP':
        potenciaInstKW = potenciaInst * 0.7457; // 1 HP = 0.7457 kW
        break;
      case 'CV':
        potenciaInstKW = potenciaInst * 0.7355; // 1 CV = 0.7355 kW
        break;
      default:
        potenciaInstKW = potenciaInst / 1000;
    }

    const potenciaSimulada = (potenciaInstKW * coefSim * (eficiencia / 100)).toFixed(3);
    
    actualizarCarga(id, 'potenciaSimulada', potenciaSimulada);
    
    // Calcular corriente nominal con los nuevos valores calculados inmediatamente
    calcularCorrienteNominal(id, { potenciaSimulada: potenciaSimulada });
  };

  // Función para calcular corriente nominal
  const calcularCorrienteNominal = (id, nuevaData = {}) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;
    
    // Usar nuevos valores si se pasan, sino usar los del estado
    const tensionNominal = parseFloat(nuevaData.tension !== undefined ? nuevaData.tension : carga?.tension) || 380;
    const tipoCarga = nuevaData.tipoCarga !== undefined ? nuevaData.tipoCarga : (carga.tipoCarga || 'RSTN');
    const potenciaSimulada = nuevaData.potenciaSimulada !== undefined ? nuevaData.potenciaSimulada : carga.potenciaSimulada;
    const cosoPhi = nuevaData.cosoPhi !== undefined ? nuevaData.cosoPhi : carga.cosoPhi;
    
    if (!potenciaSimulada || !cosoPhi) {
      // Si no hay datos suficientes, limpiar el campo
      actualizarCarga(id, 'corrienteNominal', '');
      return;
    }

    const potenciaSimKW = parseFloat(potenciaSimulada);
    const cosPhi = parseFloat(cosoPhi);

    // Validar que los valores son válidos
    if (!potenciaSimKW || potenciaSimKW <= 0 || !cosPhi || cosPhi <= 0) {
      actualizarCarga(id, 'corrienteNominal', '');
      return;
    }

    let corrienteNominal;
    
    // Calcular según el tipo de carga
    if (tipoCarga === 'RST' || tipoCarga === 'RSTN') {
      // TRIFÁSICO: I = P(kW) × 1000 / (√3 × V × cos φ)
      corrienteNominal = (potenciaSimKW * 1000) / (Math.sqrt(3) * tensionNominal * cosPhi);
    } else if (tipoCarga === 'DC') {
      // CORRIENTE CONTINUA: I = P(kW) × 1000 / V (sin cos φ)
      corrienteNominal = (potenciaSimKW * 1000) / tensionNominal;
    } else {
      // MONOFÁSICO (R, S, T, RN, SN, TN): I = P(kW) × 1000 / (V × cos φ)
      corrienteNominal = (potenciaSimKW * 1000) / (tensionNominal * cosPhi);
    }

    // Calcular corrientes por fase según el tipo de carga
    let corrientesPorFase = {};
    
    if (tipoCarga === 'RST' || tipoCarga === 'RSTN') {
      // Trifásico: corriente igual en las 3 fases
      corrientesPorFase = {
        R: corrienteNominal.toFixed(2),
        S: corrienteNominal.toFixed(2),
        T: corrienteNominal.toFixed(2),
        N: tipoCarga === 'RSTN' ? '0.00' : null // Neutro solo en RSTN
      };
    } else if (tipoCarga === 'R' || tipoCarga === 'RN') {
      corrientesPorFase = {
        R: corrienteNominal.toFixed(2),
        S: '0.00',
        T: '0.00',
        N: tipoCarga === 'RN' ? corrienteNominal.toFixed(2) : null
      };
    } else if (tipoCarga === 'S' || tipoCarga === 'SN') {
      corrientesPorFase = {
        R: '0.00',
        S: corrienteNominal.toFixed(2),
        T: '0.00',
        N: tipoCarga === 'SN' ? corrienteNominal.toFixed(2) : null
      };
    } else if (tipoCarga === 'T' || tipoCarga === 'TN') {
      corrientesPorFase = {
        R: '0.00',
        S: '0.00',
        T: corrienteNominal.toFixed(2),
        N: tipoCarga === 'TN' ? corrienteNominal.toFixed(2) : null
      };
    } else if (tipoCarga === 'DC') {
      corrientesPorFase = {
        DC: corrienteNominal.toFixed(2)
      };
    }

    // Guardar también los valores usados en el cálculo para debug
    actualizarCarga(id, 'corrienteNominal', corrienteNominal.toFixed(2));
    actualizarCarga(id, 'corrientesPorFase', corrientesPorFase);
    actualizarCarga(id, '_debugTension', tensionNominal.toString());
    actualizarCarga(id, '_debugTipoCarga', tipoCarga);
    actualizarCarga(id, '_debugPotencia', potenciaSimKW.toString());
    actualizarCarga(id, '_debugCosPhi', cosPhi.toString());
    
    // Calcular corrientes con reserva automáticamente
    calcularCorrienteConReserva(id);
  };

  // Función para calcular corrientes con reserva
  const calcularCorrienteConReserva = (id, nuevoPorcentajeReserva = null) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga || !carga.corrientesPorFase) return;

    const porcentajeReserva = parseFloat(nuevoPorcentajeReserva !== null ? nuevoPorcentajeReserva : (carga.porcentajeReserva || '20')) || 20;
    const factorReserva = 1 + (porcentajeReserva / 100);

    let corrientesConReserva = {};

    if (carga.corrientesPorFase.DC) {
      // DC
      const corrienteDC = parseFloat(carga.corrientesPorFase.DC);
      corrientesConReserva = {
        DC: (corrienteDC * factorReserva).toFixed(2)
      };
    } else {
      // AC (R, S, T, N)
      corrientesConReserva = {
        R: (parseFloat(carga.corrientesPorFase.R || 0) * factorReserva).toFixed(2),
        S: (parseFloat(carga.corrientesPorFase.S || 0) * factorReserva).toFixed(2),
        T: (parseFloat(carga.corrientesPorFase.T || 0) * factorReserva).toFixed(2),
        N: carga.corrientesPorFase.N !== null 
          ? (parseFloat(carga.corrientesPorFase.N || 0) * factorReserva).toFixed(2)
          : null
      };
    }

    actualizarCarga(id, 'corrientesConReserva', corrientesConReserva);
    
    seleccionarInterruptorAutomatico(id);
  };

  // Función para seleccionar automáticamente calibre y polos del interruptor
  const seleccionarInterruptorAutomatico = (id) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga || !carga.corrienteNominal || carga.interruptor.bloqueado) return;

    // Calcular corriente nominal con reserva
    const corrienteBase = parseFloat(carga.corrienteNominal || 0);
    const porcentajeReserva = parseFloat(carga.porcentajeReserva || 20) || 20;
    const factorReserva = 1 + (porcentajeReserva / 100);
    const corrienteNominalConReserva = corrienteBase * factorReserva;

    // Seleccionar calibre (debe ser mayor a la corriente nominal)
    const calibresDisponibles = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];
    const calibreSeleccionado = calibresDisponibles.find(calibre => calibre >= corrienteNominalConReserva);

    // Seleccionar número de polos según tipo de carga
    let polosSeleccionados;
    const tipoCarga = carga.tipoCarga || 'RSTN';
    
    if (tipoCarga === 'R' || tipoCarga === 'S' || tipoCarga === 'T' || tipoCarga === 'DC') {
      // Monofásico o DC → 1 polo
      polosSeleccionados = '1';
    } else if (tipoCarga === 'RN' || tipoCarga === 'SN' || tipoCarga === 'TN') {
      // Monofásico con neutro → 2 polos
      polosSeleccionados = '2';
    } else if (tipoCarga === 'RST') {
      // Trifásico → 3 polos
      polosSeleccionados = '3';
    } else if (tipoCarga === 'RSTN') {
      // Trifásico con neutro → 4 polos
      polosSeleccionados = '4';
    } else {
      // Default para casos no especificados
      polosSeleccionados = '1';
    }

    // Actualizar los valores del interruptor
    if (calibreSeleccionado) {
      actualizarCarga(id, 'interruptor.calibre', calibreSeleccionado.toString());
    }
    actualizarCarga(id, 'interruptor.polos', polosSeleccionados);
    
    // Verificar cable después de actualizar calibre del interruptor
    verificarCable(id);
  };

  // Función para calcular parámetros del cable según catálogo Prysmian 2012
  const calcularParametrosCable = (id, overrideValues = {}) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;

    // Usar valores override si se proporcionan, sino usar valores del estado
    const seccion = parseFloat(overrideValues.seccionFase || carga.cable.seccionFase);
    const longitud = parseFloat(overrideValues.longitud || carga.cable.longitud);
    const tipoCable = overrideValues.tipo || carga.cable.tipo;
    const numeroParalelo = parseInt(overrideValues.paralelo || carga.cable.paralelo || 1);
    const metodoInstalacion = overrideValues.metodoInstalacion || carga.cable.metodoInstalacion || 'B2';
    const configuracionSintenax = overrideValues.configuracionSintenax || carga.cable.configuracionSintenax;
    const configuracionAfumex = overrideValues.configuracionAfumex || carga.cable.configuracionAfumex;

    // Validar que tengamos los valores mínimos necesarios
    if (!seccion || !longitud || !tipoCable) return;

    // Datos del catálogo Prysmian por tipo de cable
    const datosCatalogo = {
      'IRAM NM 247-3': { // Superastic Jet/Flex - Página 5 del catálogo Prysmian
        resistencias: { // ohm/km a 70°C - Valores exactos del catálogo
          1: 19.5, 1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 
          16: 1.21, 25: 0.780, 35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161
        },
        corrientes: { // Amperes en cañería embutida - Método B2
          1: 10.5, 1.5: 14, 2.5: 18, 4: 25, 6: 32, 10: 44, 
          16: 59, 25: 77, 35: 96, 50: 117, 70: 149, 95: 180, 120: 208
        }
      },
      'IRAM 62267': { // Afumex 750 LS0H - Página 7 del catálogo Prysmian - Cable unipolar
        resistencias: { // ohm/km a 70°C - Valores exactos del catálogo
          1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 
          25: 0.780, 35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161
        },
        corrientes: { // Amperes - Método B2 (cañería embutida) - Valores exactos del catálogo
          1.5: 15.5, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 
          25: 89, 35: 111, 50: 134, 70: 171, 95: 207, 120: 239
        }
      },
      'IRAM 2178': { // Sintenax Valio - Páginas 14-17 del catálogo
        unipolar: {
          resistencias: { // ohm/km a 70°C - Valores exactos del catálogo Prysmian páginas 14-17
            1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 25: 0.780, 
            35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161, 150: 0.129, 
            185: 0.106, 240: 0.0817, 300: 0.0654, 400: 0.0495, 500: 0.0396, 630: 0.0318
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 
              300: 371, 400: 435, 500: 502, 630: 578
            },
            C: { // Método C - Cañería al aire
              1.5: 18, 2.5: 25, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101, 35: 125,
              50: 151, 70: 192, 95: 232, 120: 269, 150: 309, 185: 353, 240: 415, 
              300: 473, 400: 555, 500: 641, 630: 738
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 141, 70: 179, 95: 216, 120: 251, 150: 288, 185: 329, 240: 387, 
              300: 441, 400: 518, 500: 598, 630: 689
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 16, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 
              300: 371, 400: 435, 500: 502, 630: 578
            },
            E: { // Método E - Bandeja perforada
              1.5: 16, 2.5: 22, 4: 30, 6: 38, 10: 53, 16: 71, 25: 94, 35: 117,
              50: 141, 70: 179, 95: 216, 120: 251, 150: 288, 185: 329, 240: 387, 
              300: 441, 400: 518, 500: 598, 630: 689
            },
            F: { // Método F - Bandeja sólida
              1.5: 14, 2.5: 20, 4: 26, 6: 33, 10: 46, 16: 62, 25: 81, 35: 101,
              50: 122, 70: 155, 95: 187, 120: 217, 150: 249, 185: 284, 240: 334, 
              300: 381, 400: 447, 500: 516, 630: 595
            },
            G: { // Método G - Bandeja vertical
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 
              300: 371, 400: 435, 500: 502, 630: 578
            }
          }
        },
        bipolar: {
          resistencias: { // ohm/km a 70°C - Valores exactos del catálogo Prysmian
            1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 25: 0.780, 
            35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161, 150: 0.129, 
            185: 0.106, 240: 0.0817
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.108, 2.5: 0.100, 4: 0.0949, 6: 0.0901, 10: 0.0860, 16: 0.0813, 25: 0.0780,
            35: 0.0760, 50: 0.0734, 70: 0.0736, 95: 0.0733, 120: 0.0729, 150: 0.0720,
            185: 0.0720, 240: 0.0716
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 53, 16: 70, 25: 91, 35: 113,
              50: 136, 70: 173, 95: 207, 120: 238, 150: 269, 185: 302, 240: 349
            },
            C: { // Método C - Cañería al aire
              1.5: 19, 2.5: 26, 4: 35, 6: 44, 10: 60, 16: 79, 25: 103, 35: 128,
              50: 154, 70: 196, 95: 235, 120: 271, 150: 306, 185: 344, 240: 397
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 18, 2.5: 24, 4: 33, 6: 41, 10: 56, 16: 74, 25: 96, 35: 119,
              50: 143, 70: 182, 95: 219, 120: 252, 150: 285, 185: 320, 240: 370
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 53, 16: 70, 25: 91, 35: 113,
              50: 136, 70: 173, 95: 207, 120: 238, 150: 269, 185: 302, 240: 349
            },
            E: { // Método E - Bandeja perforada
              1.5: 18, 2.5: 24, 4: 33, 6: 41, 10: 56, 16: 74, 25: 96, 35: 119,
              50: 143, 70: 182, 95: 219, 120: 252, 150: 285, 185: 320, 240: 370
            },
            F: { // Método F - Bandeja sólida
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328
            },
            G: { // Método G - Bandeja vertical
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 53, 16: 70, 25: 91, 35: 113,
              50: 136, 70: 173, 95: 207, 120: 238, 150: 269, 185: 302, 240: 349
            }
          }
        },
        tripolar: {
          resistencias: { // ohm/km a 70°C - Valores exactos del catálogo Prysmian
            1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 25: 0.780, 
            35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161, 150: 0.129, 
            185: 0.106, 240: 0.0817, 300: 0.0654
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.108, 2.5: 0.100, 4: 0.0949, 6: 0.0901, 10: 0.0860, 16: 0.0813, 25: 0.0780,
            35: 0.0760, 50: 0.0734, 70: 0.0736, 95: 0.0733, 120: 0.0729, 150: 0.0720,
            185: 0.0720, 240: 0.0716, 300: 0.0714
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 300: 371
            },
            C: { // Método C - Cañería al aire
              1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 56, 16: 75, 25: 97, 35: 121,
              50: 145, 70: 185, 95: 222, 120: 256, 150: 289, 185: 326, 240: 376, 300: 425
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 16, 2.5: 22, 4: 29, 6: 37, 10: 51, 16: 68, 25: 88, 35: 110,
              50: 132, 70: 168, 95: 202, 120: 233, 150: 263, 185: 297, 240: 342, 300: 387
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 300: 371
            },
            E: { // Método E - Bandeja perforada
              1.5: 16, 2.5: 22, 4: 29, 6: 37, 10: 51, 16: 68, 25: 88, 35: 110,
              50: 132, 70: 168, 95: 202, 120: 233, 150: 263, 185: 297, 240: 342, 300: 387
            },
            F: { // Método F - Bandeja sólida
              1.5: 14, 2.5: 19, 4: 25, 6: 32, 10: 44, 16: 59, 25: 76, 35: 95,
              50: 114, 70: 145, 95: 174, 120: 201, 150: 227, 185: 256, 240: 295, 300: 334
            },
            G: { // Método G - Bandeja vertical
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 300: 371
            }
          }
        },
        tetrapolar: {
          resistencias: { // ohm/km a 70°C - Valores exactos del catálogo Prysmian
            1.5: 13.3, 2.5: 7.98, 4: 4.95, 6: 3.30, 10: 1.91, 16: 1.21, 25: 0.780, 
            35: 0.554, 50: 0.386, 70: 0.272, 95: 0.206, 120: 0.161, 150: 0.129, 
            185: 0.106, 240: 0.0817
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.108, 2.5: 0.100, 4: 0.0949, 6: 0.0901, 10: 0.0860, 16: 0.0813, 25: 0.0780,
            35: 0.0760, 50: 0.0734, 70: 0.0736, 95: 0.0733, 120: 0.0729, 150: 0.0720,
            185: 0.0720, 240: 0.0716
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 13, 2.5: 19, 4: 24, 6: 31, 10: 42, 16: 57, 25: 74, 35: 92,
              50: 103, 70: 130, 95: 156, 120: 179, 150: 196, 185: 222, 240: 258
            },
            C: { // Método C - Cañería al aire
              1.5: 15, 2.5: 22, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 14, 2.5: 20, 4: 26, 6: 33, 10: 45, 16: 61, 25: 78, 35: 97,
              50: 116, 70: 148, 95: 178, 120: 205, 150: 231, 185: 261, 240: 301
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 13, 2.5: 19, 4: 24, 6: 31, 10: 42, 16: 57, 25: 74, 35: 92,
              50: 103, 70: 130, 95: 156, 120: 179, 150: 196, 185: 222, 240: 258
            },
            E: { // Método E - Bandeja perforada
              1.5: 14, 2.5: 20, 4: 26, 6: 33, 10: 45, 16: 61, 25: 78, 35: 97,
              50: 116, 70: 148, 95: 178, 120: 205, 150: 231, 185: 261, 240: 301
            },
            F: { // Método F - Bandeja sólida
              1.5: 12, 2.5: 17, 4: 22, 6: 28, 10: 39, 16: 52, 25: 67, 35: 84,
              50: 101, 70: 128, 95: 154, 120: 177, 150: 200, 185: 226, 240: 261
            },
            G: { // Método G - Bandeja vertical
              1.5: 13, 2.5: 19, 4: 24, 6: 31, 10: 42, 16: 57, 25: 74, 35: 92,
              50: 103, 70: 130, 95: 156, 120: 179, 150: 196, 185: 222, 240: 258
            }
          }
        }
      },
      'IRAM 62266': { // Afumex 1000 - Páginas 24-25 del catálogo
        unipolar: {
          resistencias: { // ohm/km a 90°C - Valores exactos del catálogo Prysmian páginas 24-25
            1.5: 15.1, 2.5: 9.08, 4: 5.64, 6: 3.76, 10: 2.18, 16: 1.38, 25: 0.889,
            35: 0.631, 50: 0.439, 70: 0.309, 95: 0.234, 120: 0.183, 150: 0.148,
            185: 0.118, 240: 0.0907, 300: 0.0728, 400: 0.0601, 500: 0.0487, 630: 0.0402
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 
              300: 410, 400: 481, 500: 555, 630: 640
            },
            C: { // Método C - Cañería al aire
              1.5: 20, 2.5: 27, 4: 36, 6: 46, 10: 64, 16: 85, 25: 112, 35: 138,
              50: 167, 70: 213, 95: 258, 120: 299, 150: 344, 185: 392, 240: 461,
              300: 526, 400: 618, 500: 712, 630: 820
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 18, 2.5: 25, 4: 33, 6: 42, 10: 58, 16: 77, 25: 101, 35: 125,
              50: 151, 70: 192, 95: 232, 120: 269, 150: 309, 185: 353, 240: 415, 
              300: 473, 400: 555, 500: 641, 630: 738
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 
              300: 410, 400: 481, 500: 555, 630: 640
            },
            E: { // Método E - Bandeja perforada
              1.5: 18, 2.5: 24, 4: 32, 6: 41, 10: 56, 16: 75, 25: 97, 35: 121,
              50: 145, 70: 185, 95: 222, 120: 256, 150: 289, 185: 326, 240: 376, 
              300: 425, 400: 498, 500: 575, 630: 662
            },
            F: { // Método F - Bandeja sólida
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328, 
              300: 371, 400: 435, 500: 502, 630: 578
            },
            G: { // Método G - Bandeja vertical
              1.5: 17, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 
              300: 410, 400: 481, 500: 555, 630: 640
            }
          }
        },
        bipolar: {
          resistencias: { // ohm/km a 90°C - Valores exactos del catálogo Prysmian
            1.5: 15.1, 2.5: 9.08, 4: 5.64, 6: 3.76, 10: 2.18, 16: 1.38, 25: 0.889,
            35: 0.631, 50: 0.439, 70: 0.309, 95: 0.234, 120: 0.183, 150: 0.148,
            185: 0.118, 240: 0.0907
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.103, 2.5: 0.0957, 4: 0.0896, 6: 0.0851, 10: 0.0803, 16: 0.0768,
            25: 0.0770, 35: 0.0746, 50: 0.0741, 70: 0.0731, 95: 0.0712, 120: 0.0709,
            150: 0.0713, 185: 0.0715, 240: 0.0707
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 18, 2.5: 25, 4: 34, 6: 43, 10: 59, 16: 78, 25: 102, 35: 126,
              50: 152, 70: 193, 95: 232, 120: 268, 150: 303, 185: 341, 240: 394
            },
            C: { // Método C - Cañería al aire
              1.5: 21, 2.5: 28, 4: 38, 6: 48, 10: 66, 16: 88, 25: 115, 35: 143,
              50: 172, 70: 219, 95: 264, 120: 306, 150: 346, 185: 389, 240: 449
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 19, 2.5: 26, 4: 35, 6: 44, 10: 60, 16: 79, 25: 103, 35: 128,
              50: 154, 70: 196, 95: 235, 120: 271, 150: 306, 185: 344, 240: 397
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 18, 2.5: 25, 4: 34, 6: 43, 10: 59, 16: 78, 25: 102, 35: 126,
              50: 152, 70: 193, 95: 232, 120: 268, 150: 303, 185: 341, 240: 394
            },
            E: { // Método E - Bandeja perforada
              1.5: 19, 2.5: 26, 4: 35, 6: 44, 10: 60, 16: 79, 25: 103, 35: 128,
              50: 154, 70: 196, 95: 235, 120: 271, 150: 306, 185: 344, 240: 397
            },
            F: { // Método F - Bandeja sólida
              1.5: 16, 2.5: 23, 4: 30, 6: 38, 10: 52, 16: 69, 25: 90, 35: 112,
              50: 135, 70: 172, 95: 206, 120: 238, 150: 269, 185: 302, 240: 349
            },
            G: { // Método G - Bandeja vertical
              1.5: 18, 2.5: 25, 4: 34, 6: 43, 10: 59, 16: 78, 25: 102, 35: 126,
              50: 152, 70: 193, 95: 232, 120: 268, 150: 303, 185: 341, 240: 394
            }
          }
        },
        tripolar: {
          resistencias: { // ohm/km a 90°C - Valores exactos del catálogo Prysmian
            1.5: 15.1, 2.5: 9.08, 4: 5.64, 6: 3.76, 10: 2.18, 16: 1.38, 25: 0.889,
            35: 0.631, 50: 0.439, 70: 0.309, 95: 0.234, 120: 0.183, 150: 0.148,
            185: 0.118, 240: 0.0907, 300: 0.0728
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.103, 2.5: 0.0957, 4: 0.0896, 6: 0.0851, 10: 0.0803, 16: 0.0768,
            25: 0.0770, 35: 0.0746, 50: 0.0741, 70: 0.0731, 95: 0.0712, 120: 0.0709,
            150: 0.0713, 185: 0.0715, 240: 0.0707, 300: 0.0707
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 16, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 300: 410
            },
            C: { // Método C - Cañería al aire
              1.5: 19, 2.5: 26, 4: 35, 6: 44, 10: 60, 16: 79, 25: 103, 35: 128,
              50: 154, 70: 196, 95: 235, 120: 271, 150: 306, 185: 344, 240: 397, 300: 449
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 56, 16: 75, 25: 97, 35: 121,
              50: 145, 70: 185, 95: 222, 120: 256, 150: 289, 185: 326, 240: 376, 300: 425
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 16, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 300: 410
            },
            E: { // Método E - Bandeja perforada
              1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 56, 16: 75, 25: 97, 35: 121,
              50: 145, 70: 185, 95: 222, 120: 256, 150: 289, 185: 326, 240: 376, 300: 425
            },
            F: { // Método F - Bandeja sólida
              1.5: 14, 2.5: 20, 4: 27, 6: 35, 10: 48, 16: 64, 25: 84, 35: 104,
              50: 125, 70: 159, 95: 191, 120: 220, 150: 248, 185: 279, 240: 322, 300: 364
            },
            G: { // Método G - Bandeja vertical
              1.5: 16, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363, 300: 410
            }
          }
        },
        tetrapolar: {
          resistencias: { // ohm/km a 90°C - Valores exactos del catálogo Prysmian
            1.5: 15.1, 2.5: 9.08, 4: 5.64, 6: 3.76, 10: 2.18, 16: 1.38, 25: 0.889,
            35: 0.631, 50: 0.439, 70: 0.309, 95: 0.234, 120: 0.183, 150: 0.148,
            185: 0.118, 240: 0.0907
          },
          reactancias: { // ohm/km a 50 Hz - Valores exactos del catálogo Prysmian
            1.5: 0.103, 2.5: 0.0957, 4: 0.0896, 6: 0.0851, 10: 0.0803, 16: 0.0768,
            25: 0.0770, 35: 0.0746, 50: 0.0741, 70: 0.0731, 95: 0.0712, 120: 0.0709,
            150: 0.0713, 185: 0.0715, 240: 0.0707
          },
          corrientes: { 
            B2: { // Método B2 - Cañería embutida
              1.5: 14, 2.5: 20, 4: 27, 6: 35, 10: 48, 16: 64, 25: 84, 35: 104,
              50: 125, 70: 159, 95: 191, 120: 220, 150: 248, 185: 279, 240: 322
            },
            C: { // Método C - Cañería al aire
              1.5: 16, 2.5: 23, 4: 31, 6: 39, 10: 54, 16: 72, 25: 94, 35: 117,
              50: 140, 70: 178, 95: 214, 120: 247, 150: 279, 185: 314, 240: 363
            },
            D1: { // Método D1 - Enterrado directo
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328
            },
            D2: { // Método D2 - En ducto enterrado
              1.5: 14, 2.5: 20, 4: 27, 6: 35, 10: 48, 16: 64, 25: 84, 35: 104,
              50: 125, 70: 159, 95: 191, 120: 220, 150: 248, 185: 279, 240: 322
            },
            E: { // Método E - Bandeja perforada
              1.5: 15, 2.5: 21, 4: 28, 6: 36, 10: 49, 16: 66, 25: 85, 35: 106,
              50: 127, 70: 162, 95: 194, 120: 223, 150: 252, 185: 284, 240: 328
            },
            F: { // Método F - Bandeja sólida
              1.5: 12, 2.5: 18, 4: 24, 6: 30, 10: 42, 16: 56, 25: 73, 35: 91,
              50: 109, 70: 139, 95: 167, 120: 193, 150: 217, 185: 245, 240: 282
            },
            G: { // Método G - Bandeja vertical
              1.5: 14, 2.5: 20, 4: 27, 6: 35, 10: 48, 16: 64, 25: 84, 35: 104,
              50: 125, 70: 159, 95: 191, 120: 220, 150: 248, 185: 279, 240: 322
            }
          }
        }
      }
    };

    // Para cables con configuraciones específicas, obtener datos según configuración
    let datosActuales;
    if (tipoCable === 'IRAM 2178') {
      const configuracion = configuracionSintenax || 'tripolar';
      datosActuales = datosCatalogo[tipoCable][configuracion];
    } else if (tipoCable === 'IRAM 62266') {
      const configuracion = configuracionAfumex || 'tripolar';
      datosActuales = datosCatalogo[tipoCable][configuracion];
    } else {
      datosActuales = datosCatalogo[tipoCable];
    }

    if (!datosActuales || !datosActuales.resistencias[seccion]) {
      let config = '';
      if (tipoCable === 'IRAM 2178') {
        config = ` configuración ${configuracionSintenax || 'tripolar'}`;
      } else if (tipoCable === 'IRAM 62266') {
        config = ` configuración ${configuracionAfumex || 'tripolar'}`;
      }
      console.warn(`Datos no encontrados para ${tipoCable}${config} sección ${seccion}mm²`);
      return;
    }

    // Resistencia por km del catálogo convertida a Ω total considerando longitud y cables en paralelo
    const resistenciaPorKm = datosActuales.resistencias[seccion];
    const resistenciaTotal = (resistenciaPorKm * longitud / 1000 / numeroParalelo).toFixed(4);

    // Reactancia (solo para cables multipolares como Sintenax y Afumex 1000)
    let reactanciaTotal = '0.0000';
    if (datosActuales.reactancias && datosActuales.reactancias[seccion]) {
      const reactanciaPorKm = datosActuales.reactancias[seccion];
      reactanciaTotal = (reactanciaPorKm * longitud / 1000 / numeroParalelo).toFixed(4);
    }

    // Corriente admisible total considerando cables en paralelo e instalación
    let corrientePorCable = 0;
    if (tipoCable === 'IRAM 2178' || tipoCable === 'IRAM 62266') {
      // Para cables con métodos de instalación específicos
      corrientePorCable = datosActuales.corrientes[metodoInstalacion] ? 
                         datosActuales.corrientes[metodoInstalacion][seccion] || 0 : 0;
    } else {
      // Para cables sin métodos específicos (IRAM NM 247-3, IRAM 62267)
      corrientePorCable = datosActuales.corrientes[seccion] || 0;
    }
    const corrienteTotal = Math.round(corrientePorCable * numeroParalelo);

    actualizarCarga(id, 'cable.resistencia', resistenciaTotal);
    actualizarCarga(id, 'cable.reactancia', reactanciaTotal);
    actualizarCarga(id, 'cable.capacidadAdmisible', corrienteTotal.toString());

    // Recalcular ICC después de actualizar parámetros del cable
    calcularICC(id);
  };

  // Función principal de cálculo de ICC según IEC 60909
  const calcularICC = (id) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;
    
    const tensionNominal = parseFloat(carga.tension) || 380;

    // Impedancia de la red simplificada (valor por defecto conservador)
    const zRed = 0.01; // Ohms - valor típico para red de distribución

    // Impedancia del cable
    const rCable = parseFloat(carga.cable.resistencia) || 0;
    const xCable = parseFloat(carga.cable.reactancia) || 0;
    const zCable = Math.sqrt(rCable * rCable + xCable * xCable);

    // Impedancia equivalente total
    const zEquivalente = zRed + zCable;

    // 5. Cálculos de corrientes de cortocircuito
    
    // ICC Trifásico (IEC 60909)
    const iccTrifasico = tensionNominal / (Math.sqrt(3) * zEquivalente * 1000); // en kA

    // ICC Bifásico (87% del trifásico aproximadamente)
    const iccBifasico = iccTrifasico * 0.866;

    // ICC Monofásico (depende del sistema de puesta a tierra)
    // Simplificado para sistema TN
    const iccMonofasico = tensionNominal / (2 * zEquivalente * 1000); // en kA

    // 6. Corriente de pico (Ip)
    // Factor κ según IEC 60909 (simplificado)
    const relacionXR = zCable > 0 ? xCable / rCable : 0.1;
    let factorKappa;
    if (relacionXR <= 0.5) factorKappa = 1.02;
    else if (relacionXR <= 1) factorKappa = 1.15;
    else if (relacionXR <= 2) factorKappa = 1.35;
    else if (relacionXR <= 3) factorKappa = 1.45;
    else factorKappa = 1.8;

    const corrientePico = iccTrifasico * factorKappa * Math.sqrt(2);

    // 7. Potencia de cortocircuito
    const potenciaCC = Math.sqrt(3) * tensionNominal * iccTrifasico / 1000; // en MVA

    // Actualizar resultados
    actualizarCarga(id, 'resultadosICC.impedanciaEquivalente', zEquivalente.toFixed(4));
    actualizarCarga(id, 'resultadosICC.iccTrifasico', iccTrifasico.toFixed(2));
    actualizarCarga(id, 'resultadosICC.iccBifasico', iccBifasico.toFixed(2));
    actualizarCarga(id, 'resultadosICC.iccMonofasico', iccMonofasico.toFixed(2));
    actualizarCarga(id, 'resultadosICC.corrientePico', corrientePico.toFixed(2));
    actualizarCarga(id, 'resultadosICC.potenciaCC', potenciaCC.toFixed(3));

    // Verificaciones
    verificarInterruptor(id, iccTrifasico);
    verificarCable(id, corrientePico);
  };

  // Verificación de aptitud del interruptor
  const verificarInterruptor = (id, iccTrifasico) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;

    const icu = parseFloat(carga.interruptor.icu);
    const ics = parseFloat(carga.interruptor.ics);

    let verificacion = 'PENDIENTE';
    
    if (icu && ics) {
      if (iccTrifasico <= icu && iccTrifasico <= ics) {
        verificacion = 'OK';
      } else {
        verificacion = 'NO_OK';
      }
    }

    actualizarCarga(id, 'resultadosICC.verificacionInterruptor', verificacion);
  };

  // Verificación de aptitud del cable (versión con valores actualizados)
  const verificarCableConValores = (id, carga) => {
    if (!carga) return;

    const capacidadAdmisible = parseFloat(carga.cable.capacidadAdmisible);
    const calibreInterruptor = parseFloat(carga.interruptor.calibre);

    console.log(`🔍 VERIFICACIÓN CABLE - Carga: ${carga.denominacion}`);
    console.log(`📊 Valores - Capacidad Cable: "${carga.cable.capacidadAdmisible}" → ${capacidadAdmisible}A`);
    console.log(`📊 Valores - Calibre Interruptor: "${carga.interruptor.calibre}" → ${calibreInterruptor}A`);
    console.log(`🔢 Comparación: ${capacidadAdmisible} > ${calibreInterruptor} = ${capacidadAdmisible > calibreInterruptor}`);

    let verificacion = 'PENDIENTE';
    
    if (capacidadAdmisible && calibreInterruptor) {
      // La corriente admisible del cable debe ser MAYOR que el calibre del interruptor
      // El cable debe soportar más corriente que la que puede pasar el interruptor
      
      if (capacidadAdmisible > calibreInterruptor) {
        verificacion = 'OK';
        console.log(`✅ CABLE OK - Capacidad ${capacidadAdmisible}A > Calibre ${calibreInterruptor}A`);
      } else {
        verificacion = 'NO_OK';
        console.log(`❌ CABLE NO_OK - Capacidad ${capacidadAdmisible}A ≤ Calibre ${calibreInterruptor}A`);
      }
    } else {
      console.log(`⚠️ DATOS FALTANTES - Capacidad: ${capacidadAdmisible}A (${typeof capacidadAdmisible}), Calibre: ${calibreInterruptor}A (${typeof calibreInterruptor})`);
    }

    console.log(`📝 Resultado final: ${verificacion}`);
    actualizarCarga(id, 'resultadosICC.verificacionCable', verificacion);
  };

  // Verificación de aptitud del cable (versión original para compatibilidad)
  const verificarCable = (id, corrientePico) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;
    verificarCableConValores(id, carga);
  };

  // Función para calcular todos los ICC
  const calcularTodosLosICC = () => {
    cortocircuitoData.cargas.forEach(carga => {
      calcularICC(carga.id);
    });
  };


  // Función para exportar PDF
  const exportarPDF = async () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Título
      doc.setFontSize(16);
      doc.text('PLANILLA DE CARGAS', 20, 20);
      
      // Información del proyecto
      if (projectData) {
        doc.setFontSize(10);
        doc.text(`Proyecto: ${projectData.name}`, 20, 30);
        doc.text(`Cliente: ${projectData.client_name}`, 20, 35);
      }


      // Tabla de cargas
      const tableData = cortocircuitoData.cargas.map(carga => [
        carga.denominacion,
        carga.potenciaInstalada,
        carga.coefSimultaneidad,
        carga.cosoPhi,
        carga.eficiencia,
        carga.potenciaSimulada,
        carga.corrienteNominal,
        carga.interruptor.tipo,
        carga.interruptor.calibre,
        carga.interruptor.curva,
        carga.interruptor.icu,
        carga.cable.tipo,
        carga.cable.seccionFase,
        carga.cable.longitud,
        carga.cable.resistencia,
        carga.cable.reactancia,
        carga.resultadosICC.iccTrifasico,
        carga.resultadosICC.iccBifasico,
        carga.resultadosICC.corrientePico,
        carga.resultadosICC.verificacionInterruptor,
        carga.resultadosICC.verificacionCable
      ]);

      const tableHeaders = [
        'Denominación',
        'P.Inst.(W)',
        'Cs',
        'cos φ',
        'η (%)',
        'P.Sim.(kW)',
        'In (A)',
        'Tipo Int.',
        'Calibre',
        'Curva',
        'Icu (kA)',
        'Cable',
        'Secc.(mm²)',
        'Long.(m)',
        'R (Ω)',
        'X (Ω)',
        'Isc3φ(kA)',
        'Isc2φ(kA)',
        'Ip (kA)',
        'Verif.Int.',
        'Verif.Cable'
      ];

      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: 60,
        theme: 'grid',
        styles: {
          fontSize: 6,
          cellPadding: 1,
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Denominación
          16: { fillColor: [231, 76, 60], textColor: 255 }, // ICC Trifásico
          19: { 
            cellWidth: 15,
            halign: 'center',
            fillColor: function(data) {
              return data.cell.raw === 'OK' ? [46, 204, 113] : 
                     data.cell.raw === 'NO_OK' ? [231, 76, 60] : [149, 165, 166];
            }
          },
          20: { 
            cellWidth: 15,
            halign: 'center',
            fillColor: function(data) {
              return data.cell.raw === 'OK' ? [46, 204, 113] : 
                     data.cell.raw === 'NO_OK' ? [231, 76, 60] : [149, 165, 166];
            }
          }
        }
      });

      // Pie de página con fecha
      const fechaActual = new Date().toLocaleDateString('es-ES');
      doc.setFontSize(8);
      doc.text(`Fecha: ${fechaActual}`, 20, doc.internal.pageSize.height - 10);
      doc.text('Generado con NotiCalc - Sistema de Cálculos Eléctricos', 200, doc.internal.pageSize.height - 10);

      // Guardar PDF
      const fileName = `Planilla_Cargas_ICC_${projectData?.name || 'Proyecto'}_${fechaActual.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Verifica que todos los datos estén completos.');
    }
  };

  // Manual save function
  const manualSave = async () => {
    if (!projectData?.id || !user?.uid || readOnly || isSaving) return;

    console.log('🖱️ Guardado manual: Usuario hizo clic en el botón Guardar');

    // Cancel auto-save if pending
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      console.log('⏰ Guardado manual: Cancelando auto-save pendiente');
    }

    try {
      console.log('💾 Guardado manual: Iniciando guardado inmediato...');
      setSaveStatus('saving');
      setIsSaving(true);

      // Use new cortocircuito service to save directly to calculos_cortocircuito field
      await cortocircuitoService.saveCortocircuito(projectData.id, user.uid, cortocircuitoData);
      
      console.log('✅ Guardado manual: Datos guardados exitosamente');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);

    } catch (error) {
      console.error('❌ Guardado manual: Error guardando datos de cortocircuito:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Planilla de Cargas</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Planilla de cargas conforme a obra
              {/* Save status indicator */}
              {saveStatus && (
                <span className={`ml-3 text-sm px-2 py-1 rounded-full ${
                  saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
                  saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
                  saveStatus === 'error' ? 'bg-red-100 text-red-700' : ''
                }`}>
                  {saveStatus === 'saving' ? '💾 Guardando...' :
                   saveStatus === 'saved' ? '✅ Guardado' :
                   saveStatus === 'error' ? '❌ Error al guardar' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={manualSave}
              disabled={isSaving}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Guardar cambios manualmente"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button 
              onClick={calcularTodosLosICC}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calcular ICC</span>
            </button>
            <button 
              onClick={exportarPDF}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Planilla de Cargas */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 text-green-500 mr-2" />
            Planilla de Cargas
          </h2>
          {!readOnly && (
            <button
              onClick={agregarCarga}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Carga</span>
            </button>
          )}
        </div>

        {cortocircuitoData.cargas.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No hay cargas definidas.</p>
            <p className="text-xs sm:text-sm">Haz clic en "Agregar Carga" para comenzar.</p>
          </div>
        ) : (
          <div className="flex flex-col xl:grid xl:grid-cols-4 gap-6">
            {/* Panel Izquierdo - Lista de Cargas */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 xl:sticky xl:top-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cargas</h3>
                </div>
                
                <div className="space-y-2 max-h-64 xl:max-h-96 overflow-y-auto">
                  {cortocircuitoData.cargas.map((carga, index) => (
                    <div 
                      key={carga.id}
                      onClick={() => setCargaSeleccionada(carga)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        cargaSeleccionada?.id === carga.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {carga.denominacion || `Carga ${index + 1}`}
                          </p>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>{carga.potenciaInstalada ? `${carga.potenciaInstalada}${carga.potenciaUnidad || 'W'}` : 'Sin potencia'}</span>
                          </div>
                        </div>
                        
                        {/* Indicadores de estado */}
                        <div className="flex items-center space-x-1 ml-2">
                          {carga.resultadosICC.verificacionInterruptor === 'OK' && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Interruptor OK"></div>
                          )}
                          {carga.resultadosICC.verificacionCable === 'OK' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Cable OK"></div>
                          )}
                          {!readOnly && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                eliminarCarga(carga.id);
                                if (cargaSeleccionada?.id === carga.id) {
                                  setCargaSeleccionada(null);
                                }
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded ml-1"
                              title="Eliminar carga"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  {cortocircuitoData.cargas.length} carga{cortocircuitoData.cargas.length !== 1 ? 's' : ''} total{cortocircuitoData.cargas.length !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>

            {/* Panel Derecho - Detalles de la Carga Seleccionada */}
            <div className="xl:col-span-3 order-1 xl:order-2">
              {!cargaSeleccionada ? (
                <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 sm:p-8 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Selecciona una Carga</h3>
                  <p className="text-sm sm:text-base text-gray-500">Haz clic en una carga de la lista para ver y editar sus detalles</p>
                </div>
              ) : (
                <CargaDetailPanel 
                  carga={cargaSeleccionada} 
                  onUpdate={actualizarCarga}
                  onCalculate={() => calcularICC(cargaSeleccionada.id)}
                  readOnly={readOnly}
                  calcularPotenciaSimulada={calcularPotenciaSimulada}
                  calcularCorrienteNominal={calcularCorrienteNominal}
                  calcularParametrosCable={calcularParametrosCable}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanillaCargas;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calculator, Plus, Minus, Save, Download, AlertTriangle, Zap, FileText, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { updateProject } from '../../services/api.js';
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
              Configuración completa de la carga eléctrica y cálculo de cortocircuito
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div>
            <Tooltip text="Potencia Instalada - Potencia nominal del equipo">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencia Instalada
              </label>
            </Tooltip>
            <div className="flex space-x-2">
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
                placeholder="1000"
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
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="W">W</option>
                <option value="kW">kW</option>
                <option value="HP">HP</option>
                <option value="CV">CV</option>
              </select>
            </div>
          </div>

          <div>
            <Tooltip text="Coeficiente de Simultaneidad - Factor que indica qué porcentaje de la carga opera simultáneamente">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coeficiente de Simultaneidad
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
              placeholder="1.0"
              disabled={readOnly}
            />
          </div>

          <div>
            <Tooltip text="Factor de Potencia - Coseno del ángulo entre tensión y corriente">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Factor de Potencia (cos φ)
              </label>
            </Tooltip>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={carga.cosoPhi}
              onChange={(e) => {
                const newCosPhi = e.target.value;
                onUpdate(carga.id, 'cosoPhi', newCosPhi);
                setTimeout(() => calcularCorrienteNominal(carga.id), 0);
              }}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.8"
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
            <Tooltip text="Corriente Nominal - Corriente de operación calculada según la potencia y tensión">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corriente Nominal (A)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.corrienteNominal || '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Interruptor Asociado */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 text-orange-500 mr-2" />
          Interruptor Asociado
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <Tooltip text="Calibre - Corriente nominal del interruptor">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calibre
              </label>
            </Tooltip>
            <div className="flex space-x-2">
              <select
                value={carga.interruptor.calibre || ''}
                onChange={(e) => onUpdate(carga.id, 'interruptor.calibre', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="">Seleccionar calibre</option>
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="16">16</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="32">32</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="63">63</option>
                <option value="80">80</option>
                <option value="100">100</option>
                <option value="125">125</option>
                <option value="160">160</option>
                <option value="200">200</option>
                <option value="250">250</option>
                <option value="315">315</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="630">630</option>
                <option value="800">800</option>
                <option value="1000">1000</option>
              </select>
              <select
                value={carga.interruptor.calibreUnidad || 'A'}
                onChange={(e) => onUpdate(carga.id, 'interruptor.calibreUnidad', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="A">A</option>
                <option value="mA">mA</option>
                <option value="kA">kA</option>
              </select>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Polos
              </label>
            </Tooltip>
            <select
              value={carga.interruptor.polos}
              onChange={(e) => onUpdate(carga.id, 'interruptor.polos', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          Características del Cable
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <Tooltip text="Tipo de Aislamiento - PVC (Policloruro de Vinilo), XLPE (Polietileno Reticulado), EPR (Etileno Propileno)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Aislamiento
              </label>
            </Tooltip>
            <select
              value={carga.cable.tipo}
              onChange={(e) => onUpdate(carga.id, 'cable.tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={readOnly}
            >
              <option value="PVC">PVC - Policloruro de Vinilo</option>
              <option value="XLPE">XLPE - Polietileno Reticulado</option>
              <option value="EPR">EPR - Etileno Propileno</option>
            </select>
          </div>

          <div>
            <Tooltip text="Sección de Fase - Área transversal del conductor de fase">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección de Fase
              </label>
            </Tooltip>
            <div className="flex space-x-2">
              <select
                value={carga.cable.seccionFase || ''}
                onChange={(e) => {
                  onUpdate(carga.id, 'cable.seccionFase', e.target.value);
                  calcularParametrosCable(carga.id);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="">Seleccionar sección</option>
                <option value="1">1</option>
                <option value="1.5">1.5</option>
                <option value="2.5">2.5</option>
                <option value="4">4</option>
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="16">16</option>
                <option value="25">25</option>
                <option value="35">35</option>
                <option value="50">50</option>
                <option value="70">70</option>
                <option value="95">95</option>
                <option value="120">120</option>
                <option value="150">150</option>
                <option value="185">185</option>
                <option value="240">240</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
              </select>
              <select
                value={carga.cable.seccionUnidad || 'mm²'}
                onChange={(e) => onUpdate(carga.id, 'cable.seccionUnidad', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="mm²">mm²</option>
                <option value="AWG">AWG</option>
                <option value="MCM">MCM</option>
              </select>
            </div>
          </div>

          <div>
            <Tooltip text="Sección de Neutro - Área transversal del conductor neutro">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección de Neutro
              </label>
            </Tooltip>
            <select
              value={carga.cable.seccionNeutro || ''}
              onChange={(e) => onUpdate(carga.id, 'cable.seccionNeutro', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={readOnly}
            >
              <option value="">Seleccionar sección</option>
              <option value="1">1</option>
              <option value="1.5">1.5</option>
              <option value="2.5">2.5</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="16">16</option>
              <option value="25">25</option>
              <option value="35">35</option>
              <option value="50">50</option>
              <option value="70">70</option>
              <option value="95">95</option>
              <option value="120">120</option>
              <option value="150">150</option>
              <option value="185">185</option>
              <option value="240">240</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
            </select>
          </div>

          <div>
            <Tooltip text="Sección de Tierra - Área transversal del conductor de protección">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección de Tierra
              </label>
            </Tooltip>
            <select
              value={carga.cable.seccionTierra || ''}
              onChange={(e) => onUpdate(carga.id, 'cable.seccionTierra', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={readOnly}
            >
              <option value="">Seleccionar sección</option>
              <option value="1">1</option>
              <option value="1.5">1.5</option>
              <option value="2.5">2.5</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="16">16</option>
              <option value="25">25</option>
              <option value="35">35</option>
              <option value="50">50</option>
              <option value="70">70</option>
              <option value="95">95</option>
              <option value="120">120</option>
              <option value="150">150</option>
              <option value="185">185</option>
              <option value="240">240</option>
              <option value="300">300</option>
              <option value="400">400</option>
              <option value="500">500</option>
            </select>
          </div>

          <div>
            <Tooltip text="Longitud del Cable - Distancia total del cable">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud
              </label>
            </Tooltip>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={carga.cable.longitud}
                onChange={(e) => {
                  onUpdate(carga.id, 'cable.longitud', e.target.value);
                  calcularParametrosCable(carga.id);
                }}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
                disabled={readOnly}
              />
              <select
                value={carga.cable.longitudUnidad || 'm'}
                onChange={(e) => onUpdate(carga.id, 'cable.longitudUnidad', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={readOnly}
              >
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="ft">ft</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>

          <div>
            <Tooltip text="Resistencia - Resistencia eléctrica total del cable calculada automáticamente">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resistencia (Ω)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.cable.resistencia || '0.0000'}
            </div>
          </div>

          <div>
            <Tooltip text="Reactancia Inductiva - Reactancia del cable calculada automáticamente">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reactancia (Ω)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.cable.reactancia || '0.0000'}
            </div>
          </div>

          <div>
            <Tooltip text="Corriente Admisible - Máxima corriente que puede circular sin superar temperatura límite">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corriente Admisible (A)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-900 font-mono">
              {carga.cable.capacidadAdmisible || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Resultados ICC */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          Resultados de Cortocircuito (IEC 60909)
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <Tooltip text="Impedancia Equivalente - Impedancia total del circuito (red + trafo + cable)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impedancia Equivalente (Ω)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-gray-900 font-mono text-center">
              {carga.resultadosICC.impedanciaEquivalente || '--'}
            </div>
          </div>

          <div>
            <Tooltip text="Corriente de Cortocircuito Trifásica - Máxima corriente de falla entre fases según IEC 60909">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isc Trifásica (kA)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-red-50 border border-red-300 rounded-md text-red-700 font-mono font-bold text-center text-lg">
              {carga.resultadosICC.iccTrifasico || '--'}
            </div>
          </div>

          <div>
            <Tooltip text="Corriente de Cortocircuito Bifásica - Corriente de falla entre dos fases">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isc Bifásica (kA)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-gray-900 font-mono text-center">
              {carga.resultadosICC.iccBifasico || '--'}
            </div>
          </div>

          <div>
            <Tooltip text="Corriente de Cortocircuito Monofásica - Corriente de falla fase-neutro/tierra">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isc Monofásica (kA)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-gray-900 font-mono text-center">
              {carga.resultadosICC.iccMonofasico || '--'}
            </div>
          </div>

          <div>
            <Tooltip text="Corriente de Pico - Máximo valor instantáneo de corriente considerando factor κ (kappa)">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Corriente de Pico (kA)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-yellow-50 border border-yellow-300 rounded-md text-gray-900 font-mono text-center">
              {carga.resultadosICC.corrientePico || '--'}
            </div>
          </div>

          <div>
            <Tooltip text="Potencia de Cortocircuito - Potencia aparente de cortocircuito trifásico">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencia CC (MVA)
              </label>
            </Tooltip>
            <div className="w-full px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-gray-900 font-mono text-center">
              {carga.resultadosICC.potenciaCC || '--'}
            </div>
          </div>

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
            <Tooltip text="Verificación de Cable - Compara corrientes con capacidad admisible del cable">
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

const CalculosCortocircuito = ({ projectData, onDataChange, readOnly = false }) => {
  const user = useSelector(state => state.auth.user);
  const [cortocircuitoData, setCortocircuitoData] = useState({
    // Datos del sistema de alimentación
    sistemaAlimentacion: {
      tensionNominal: '',
      tensionUnidad: 'V',
      frecuencia: 50,
      tipoConexion: 'TN',
      numeroFases: 'trifasico',
      iccPunto: '', // ICC en punto de conexión (kA)
      impedanciaRed: '' // Alternativa al ICC punto
    },
    // Datos del transformador (si aplica)
    transformador: {
      aplica: false,
      potenciaNominal: '',
      tensionCortocircuito: '',
      relacionTransformacion: '',
      conexion: 'Dy11'
    },
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
    if (projectData && !isInitialized) {
      if (projectData.calculation_data?.cortocircuito) {
        setCortocircuitoData(prev => ({
          ...prev,
          ...projectData.calculation_data.cortocircuito
        }));
      }
      setIsInitialized(true);
    }
  }, [projectData, isInitialized]);

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

        const updateData = {
          userId: user.uid,
          calculationData: {
            ...(projectData.calculation_data || {}),
            cortocircuito: data
          }
        };

        await updateProject(projectData.id, updateData);
        
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
        cargas: cortocircuitoData.cargas.length,
        sistemaAlimentacion: cortocircuitoData.sistemaAlimentacion.tensionNominal,
        transformador: cortocircuitoData.transformador.aplica
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


  const handleSistemaChange = (campo, valor) => {
    setCortocircuitoData(prev => ({
      ...prev,
      sistemaAlimentacion: {
        ...prev.sistemaAlimentacion,
        [campo]: valor
      }
    }));
  };

  const handleTransformadorChange = (campo, valor) => {
    setCortocircuitoData(prev => ({
      ...prev,
      transformador: {
        ...prev.transformador,
        [campo]: valor
      }
    }));
  };

  const agregarCarga = () => {
    const nuevaCarga = {
      id: Date.now(),
      // Datos básicos de la carga
      denominacion: '',
      potenciaInstalada: '',
      potenciaUnidad: 'W',
      coefSimultaneidad: '1.0',
      cosoPhi: '0.8',
      eficiencia: '100',
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
        ics: ''
      },
      
      // Datos de cableado
      cable: {
        tipo: 'XLPE',
        disposicion: 'bandeja',
        cantidadTernas: '1',
        seccionFase: '',
        seccionNeutro: '',
        seccionTierra: '',
        seccionUnidad: 'mm²',
        longitud: '',
        longitudUnidad: 'm',
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
    
    // Calcular corriente nominal con los nuevos valores
    setTimeout(() => calcularCorrienteNominal(id), 0);
  };

  // Función para calcular corriente nominal
  const calcularCorrienteNominal = (id) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    const tensionNominal = parseFloat(cortocircuitoData.sistemaAlimentacion.tensionNominal) || 380;
    
    if (!carga || !carga.potenciaSimulada || !carga.cosoPhi) {
      // Si no hay datos suficientes, limpiar el campo
      actualizarCarga(id, 'corrienteNominal', '');
      return;
    }

    const potenciaSimKW = parseFloat(carga.potenciaSimulada);
    const cosPhi = parseFloat(carga.cosoPhi);
    const polos = parseInt(carga.interruptor.polos) || 3;

    // Validar que los valores son válidos
    if (!potenciaSimKW || potenciaSimKW <= 0 || !cosPhi || cosPhi <= 0) {
      actualizarCarga(id, 'corrienteNominal', '');
      return;
    }

    let corrienteNominal;
    
    if (polos === 3 || polos === 4) {
      // Trifásico: I = P / (√3 × V × cos φ)
      // Usar tensión línea-línea (ej: 380V)
      corrienteNominal = (potenciaSimKW * 1000) / (Math.sqrt(3) * tensionNominal * cosPhi);
    } else {
      // Monofásico: I = P / (V × cos φ)  
      // Usar tensión fase-neutro = tensión línea-línea / √3
      const tensionFaseNeutro = tensionNominal / Math.sqrt(3);
      corrienteNominal = (potenciaSimKW * 1000) / (tensionFaseNeutro * cosPhi);
    }

    actualizarCarga(id, 'corrienteNominal', corrienteNominal.toFixed(2));
  };

  // Función para calcular parámetros del cable (R, X, Iz)
  const calcularParametrosCable = (id) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga || !carga.cable.seccionFase || !carga.cable.longitud) return;

    const seccion = parseFloat(carga.cable.seccionFase);
    const longitud = parseFloat(carga.cable.longitud);
    const tipoCable = carga.cable.tipo;

    // Resistividad del cobre a 20°C (Ω·mm²/m)
    const rho_cu = 0.0175;
    
    // Factor de temperatura (simplificado para 70°C)
    const factorTemp = 1.2;

    // Resistencia: R = ρ × L / S × factor_temp
    const resistencia = (rho_cu * longitud / seccion * factorTemp).toFixed(4);

    // Reactancia inductiva aproximada (Ω/m típica para cables de potencia)
    let reactanciaPorMetro;
    if (seccion <= 10) reactanciaPorMetro = 0.00015;
    else if (seccion <= 50) reactanciaPorMetro = 0.00012;
    else if (seccion <= 120) reactanciaPorMetro = 0.0001;
    else reactanciaPorMetro = 0.00008;

    const reactancia = (reactanciaPorMetro * longitud).toFixed(4);

    // Capacidad admisible aproximada según sección y tipo de cable
    let capacidadAdmisible;
    const factoresTipo = { 'PVC': 0.8, 'XLPE': 1.0, 'EPR': 0.95 };
    const factorTipo = factoresTipo[tipoCable] || 1.0;

    // Tabla aproximada de capacidades (A) para cables en bandeja
    if (seccion <= 1.5) capacidadAdmisible = 15;
    else if (seccion <= 2.5) capacidadAdmisible = 21;
    else if (seccion <= 4) capacidadAdmisible = 28;
    else if (seccion <= 6) capacidadAdmisible = 36;
    else if (seccion <= 10) capacidadAdmisible = 50;
    else if (seccion <= 16) capacidadAdmisible = 68;
    else if (seccion <= 25) capacidadAdmisible = 89;
    else if (seccion <= 35) capacidadAdmisible = 110;
    else if (seccion <= 50) capacidadAdmisible = 134;
    else if (seccion <= 70) capacidadAdmisible = 171;
    else if (seccion <= 95) capacidadAdmisible = 207;
    else if (seccion <= 120) capacidadAdmisible = 239;
    else capacidadAdmisible = Math.round(seccion * 2); // Aproximación lineal para secciones grandes

    capacidadAdmisible = Math.round(capacidadAdmisible * factorTipo);

    actualizarCarga(id, 'cable.resistencia', resistencia);
    actualizarCarga(id, 'cable.reactancia', reactancia);
    actualizarCarga(id, 'cable.capacidadAdmisible', capacidadAdmisible.toString());

    // Recalcular ICC después de actualizar parámetros del cable
    calcularICC(id);
  };

  // Función principal de cálculo de ICC según IEC 60909
  const calcularICC = (id) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    const tensionNominal = parseFloat(cortocircuitoData.sistemaAlimentacion.tensionNominal) || 380;
    const iccPunto = parseFloat(cortocircuitoData.sistemaAlimentacion.iccPunto);
    
    if (!carga || (!iccPunto && !cortocircuitoData.sistemaAlimentacion.impedanciaRed)) return;

    // 1. Impedancia de la red (fuente)
    let zRed = 0;
    if (iccPunto) {
      // Z_red = V / (√3 × Icc_punto × 1000)
      zRed = tensionNominal / (Math.sqrt(3) * iccPunto * 1000);
    } else if (cortocircuitoData.sistemaAlimentacion.impedanciaRed) {
      zRed = parseFloat(cortocircuitoData.sistemaAlimentacion.impedanciaRed);
    }

    // 2. Impedancia del transformador (si aplica)
    let zTrafo = 0;
    if (cortocircuitoData.transformador.aplica) {
      const potenciaTrafoKVA = parseFloat(cortocircuitoData.transformador.potenciaNominal);
      const ukPorcentaje = parseFloat(cortocircuitoData.transformador.tensionCortocircuito);
      
      if (potenciaTrafoKVA && ukPorcentaje) {
        // Z_trafo = (uk/100) × (V²/S)
        zTrafo = (ukPorcentaje / 100) * (tensionNominal * tensionNominal) / (potenciaTrafoKVA * 1000);
      }
    }

    // 3. Impedancia del cable
    const rCable = parseFloat(carga.cable.resistencia) || 0;
    const xCable = parseFloat(carga.cable.reactancia) || 0;
    const zCable = Math.sqrt(rCable * rCable + xCable * xCable);

    // 4. Impedancia equivalente total
    const zEquivalente = zRed + zTrafo + zCable;

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

  // Verificación de aptitud del cable
  const verificarCable = (id, corrientePico) => {
    const carga = cortocircuitoData.cargas.find(c => c.id === id);
    if (!carga) return;

    const capacidadAdmisible = parseFloat(carga.cable.capacidadAdmisible);
    const corrienteNominal = parseFloat(carga.corrienteNominal);

    let verificacion = 'PENDIENTE';
    
    if (capacidadAdmisible && corrienteNominal) {
      // Verificar tanto corriente nominal como corriente de CC
      const factorSeguridad = 1.25; // 25% de seguridad
      
      if (corrienteNominal * factorSeguridad <= capacidadAdmisible && 
          corrientePico * 1000 <= capacidadAdmisible * 10) { // Factor aproximado para ICC
        verificacion = 'OK';
      } else {
        verificacion = 'NO_OK';
      }
    }

    actualizarCarga(id, 'resultadosICC.verificacionCable', verificacion);
  };

  // Función para calcular todos los ICC
  const calcularTodosLosICC = () => {
    cortocircuitoData.cargas.forEach(carga => {
      calcularICC(carga.id);
    });
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    try {
      // Crear datos para Excel
      const excelData = [];
      
      // Encabezados principales
      const headers = [
        'Denominación',
        // Datos de Carga
        'P.Inst.(W)', 'Cs', 'cos φ', 'η (%)', 'P.Sim.(kW)', 'In (A)',
        // Interruptor
        'Tipo Int.', 'Calibre', 'Curva', 'Polos', 'Icu (kA)', 'Ics (kA)',
        // Cable
        'Tipo Cable', 'S.Fase (mm²)', 'S.N (mm²)', 'S.T (mm²)', 'Long.(m)', 'R (Ω)', 'X (Ω)', 'Iz (A)',
        // Resultados ICC
        'Z.eq (Ω)', 'Isc3φ (kA)', 'Isc2φ (kA)', 'Isc1φ (kA)', 'Ip (kA)', 'Scc (MVA)', 'Verif.Int.', 'Verif.Cable'
      ];
      
      excelData.push(headers);
      
      // Datos de cada carga
      cortocircuitoData.cargas.forEach(carga => {
        const row = [
          carga.denominacion,
          // Datos de Carga
          carga.potenciaInstalada,
          carga.coefSimultaneidad,
          carga.cosoPhi,
          carga.eficiencia,
          carga.potenciaSimulada,
          carga.corrienteNominal,
          // Interruptor
          carga.interruptor.tipo,
          carga.interruptor.calibre,
          carga.interruptor.curva,
          carga.interruptor.polos,
          carga.interruptor.icu,
          carga.interruptor.ics,
          // Cable
          carga.cable.tipo,
          carga.cable.seccionFase,
          carga.cable.seccionNeutro,
          carga.cable.seccionTierra,
          carga.cable.longitud,
          carga.cable.resistencia,
          carga.cable.reactancia,
          carga.cable.capacidadAdmisible,
          // Resultados ICC
          carga.resultadosICC.impedanciaEquivalente,
          carga.resultadosICC.iccTrifasico,
          carga.resultadosICC.iccBifasico,
          carga.resultadosICC.iccMonofasico,
          carga.resultadosICC.corrientePico,
          carga.resultadosICC.potenciaCC,
          carga.resultadosICC.verificacionInterruptor,
          carga.resultadosICC.verificacionCable
        ];
        excelData.push(row);
      });
      
      // Crear CSV (que Excel puede abrir)
      const csvContent = excelData.map(row => 
        row.map(cell => {
          // Escapar comillas y comas
          const cellStr = String(cell || '');
          return cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') 
            ? `"${cellStr.replace(/"/g, '""')}"` 
            : cellStr;
        }).join(',')
      ).join('\n');
      
      // Agregar BOM para UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Descargar archivo
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const fechaActual = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
      const fileName = `Planilla_Cargas_ICC_${projectData?.name || 'Proyecto'}_${fechaActual}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Excel exportado exitosamente');
      
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar a Excel. Intenta de nuevo.');
    }
  };

  // Función para exportar PDF
  const exportarPDF = async () => {
    try {
      const doc = new jsPDF('landscape', 'mm', 'a4');
      
      // Título
      doc.setFontSize(16);
      doc.text('PLANILLA DE CARGAS + CÁLCULO DE CORTOCIRCUITO', 20, 20);
      
      // Información del proyecto
      if (projectData) {
        doc.setFontSize(10);
        doc.text(`Proyecto: ${projectData.name}`, 20, 30);
        doc.text(`Cliente: ${projectData.client_name}`, 20, 35);
      }

      // Datos del sistema
      doc.setFontSize(12);
      doc.text('DATOS DEL SISTEMA', 20, 45);
      doc.setFontSize(9);
      doc.text(`Tensión: ${cortocircuitoData.sistemaAlimentacion.tensionNominal}V | ` +
               `Frecuencia: ${cortocircuitoData.sistemaAlimentacion.frecuencia}Hz | ` +
               `Tipo: ${cortocircuitoData.sistemaAlimentacion.tipoConexion} | ` +
               `ICC Punto: ${cortocircuitoData.sistemaAlimentacion.iccPunto}kA`, 20, 50);

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

      const updateData = {
        userId: user.uid,
        calculationData: {
          ...(projectData.calculation_data || {}),
          cortocircuito: cortocircuitoData
        }
      };

      await updateProject(projectData.id, updateData);
      
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Planilla de Cargas + Cálculo ICC</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Planilla de cargas conforme a obra con cálculo de corrientes de cortocircuito
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

      {/* Datos del Sistema de Alimentación */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 text-blue-500 mr-2" />
          Sistema de Alimentación
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tensión Nominal
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={cortocircuitoData.sistemaAlimentacion.tensionNominal}
                onChange={(e) => handleSistemaChange('tensionNominal', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="380"
                disabled={readOnly}
              />
              <select
                value={cortocircuitoData.sistemaAlimentacion.tensionUnidad || 'V'}
                onChange={(e) => handleSistemaChange('tensionUnidad', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                disabled={readOnly}
              >
                <option value="V">V</option>
                <option value="kV">kV</option>
                <option value="mV">mV</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia (Hz)
            </label>
            <input
              type="number"
              value={cortocircuitoData.sistemaAlimentacion.frecuencia}
              onChange={(e) => handleSistemaChange('frecuencia', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={readOnly}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conexión
            </label>
            <select
              value={cortocircuitoData.sistemaAlimentacion.tipoConexion}
              onChange={(e) => handleSistemaChange('tipoConexion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={readOnly}
            >
              <option value="TN">TN</option>
              <option value="TT">TT</option>
              <option value="IT">IT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ICC en Punto de Conexión (kA)
            </label>
            <input
              type="number"
              step="0.1"
              value={cortocircuitoData.sistemaAlimentacion.iccPunto}
              onChange={(e) => handleSistemaChange('iccPunto', e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="25"
              disabled={readOnly}
            />
          </div>
        </div>
      </div>

      {/* Datos del Transformador */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            Transformador
          </h2>
          {!readOnly && (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={cortocircuitoData.transformador.aplica}
                onChange={(e) => handleTransformadorChange('aplica', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Incluir transformador</span>
            </label>
          )}
        </div>
        
        {cortocircuitoData.transformador.aplica && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Potencia Nominal (kVA)
              </label>
              <input
                type="number"
                value={cortocircuitoData.transformador.potenciaNominal}
                onChange={(e) => handleTransformadorChange('potenciaNominal', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="1000"
                disabled={readOnly}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tensión de Cortocircuito (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={cortocircuitoData.transformador.tensionCortocircuito}
                onChange={(e) => handleTransformadorChange('tensionCortocircuito', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="6"
                disabled={readOnly}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relación de Transformación
              </label>
              <input
                type="text"
                value={cortocircuitoData.transformador.relacionTransformacion}
                onChange={(e) => handleTransformadorChange('relacionTransformacion', e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="13200/380"
                disabled={readOnly}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conexión
              </label>
              <select
                value={cortocircuitoData.transformador.conexion}
                onChange={(e) => handleTransformadorChange('conexion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={readOnly}
              >
                <option value="Dy11">Dy11</option>
                <option value="Yy0">Yy0</option>
                <option value="Dd0">Dd0</option>
                <option value="Yd11">Yd11</option>
              </select>
            </div>
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
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => exportarExcel()}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      title="Exportar Excel"
                    >
                      Excel
                    </button>
                  </div>
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
                            <span>{carga.potenciaInstalada ? `${carga.potenciaInstalada}W` : 'Sin potencia'}</span>
                            {carga.resultadosICC.iccTrifasico && (
                              <span className="ml-2 text-red-600 font-medium">
                                Icc: {carga.resultadosICC.iccTrifasico}kA
                              </span>
                            )}
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

export default CalculosCortocircuito;
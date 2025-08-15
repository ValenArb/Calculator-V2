import * as XLSX from 'xlsx';

export class ExcelExporter {
  constructor() {
    this.workbook = null;
  }

  exportProject(projectData, calculationsData) {
    this.workbook = XLSX.utils.book_new();
    
    // Add project summary sheet
    this.addProjectSummarySheet(projectData);
    
    // Add DPMS sheets
    if (calculationsData.dpms?.length > 0) {
      this.addDPMSSheet(calculationsData.dpms);
    }
    
    // Add Loads per Panel sheet
    if (calculationsData.loadsByPanel?.length > 0) {
      this.addLoadsByPanelSheet(calculationsData.loadsByPanel);
    }
    
    // Add Thermal sheet
    if (calculationsData.thermal?.length > 0) {
      this.addThermalSheet(calculationsData.thermal);
    }
    
    // Add Voltage Drop sheet
    if (calculationsData.voltageDrops?.length > 0) {
      this.addVoltageDropSheet(calculationsData.voltageDrops);
    }
    
    // Add Short Circuit sheet
    if (calculationsData.shortCircuit?.length > 0) {
      this.addShortCircuitSheet(calculationsData.shortCircuit);
    }
    
    return this.workbook;
  }

  addProjectSummarySheet(projectData) {
    const summaryData = [
      ['CALCULADORA ELÉCTRICA - RESUMEN DEL PROYECTO'],
      [''],
      ['Nombre del Proyecto:', projectData.name || ''],
      ['Descripción:', projectData.description || ''],
      ['Fecha de Creación:', projectData.createdAt ? new Date(projectData.createdAt.seconds * 1000).toLocaleDateString() : ''],
      ['Última Modificación:', projectData.updatedAt ? new Date(projectData.updatedAt.seconds * 1000).toLocaleDateString() : ''],
      ['Propietario:', projectData.ownerId || ''],
      ['Colaboradores:', projectData.collaborators?.join(', ') || 'Ninguno'],
      [''],
      ['MÓDULOS INCLUIDOS:'],
      ['• DPMS - Determinación de la Potencia Máxima Simultánea'],
      ['• Cargas por Tablero'],
      ['• Cálculo Térmico de Conductores'],
      ['• Verificación de Caída de Tensión'],
      ['• Cálculo de Cortocircuito'],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Set column widths
    worksheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
    
    // Style the header
    if (worksheet['A1']) {
      worksheet['A1'].s = {
        font: { bold: true, sz: 16 },
        alignment: { horizontal: 'center' }
      };
    }

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Resumen');
  }

  addDPMSSheet(dpmsData) {
    const headers = [
      'Denominación Tablero',
      'Denominación Ambiente',
      'Dimensiones X (m)',
      'Dimensiones Y (m)',
      'Dimensiones H (m)',
      'Superficie (m²)',
      'Grado Electrificación',
      'TUG - Cantidad',
      'TUG - DPMS (VA)',
      'IUG - Cantidad',
      'IUG - DPMS (VA)',
      'ATE - Cantidad',
      'ATE - DPMS (VA)',
      'ACU - Cantidad',
      'ACU - DPMS (VA)',
      'TUE - Cantidad',
      'TUE - DPMS (VA)',
      'OCE - Cantidad',
      'OCE - DPMS (VA)',
      'DPMS Total (VA)',
      'Corriente Total (A)'
    ];

    const rows = dpmsData.map(item => {
      const superficie = item.dimensiones.x * item.dimensiones.y;
      
      // Sumar cargas por tipo
      const getTotalByType = (type) => {
        const cargas = item.cargas[type] || [];
        return {
          cantidad: cargas.reduce((sum, c) => sum + (c.cantidadBocas || 0), 0),
          dpms: cargas.reduce((sum, c) => sum + (c.dpms || 0), 0)
        };
      };

      const tug = getTotalByType('TUG');
      const iug = getTotalByType('IUG');
      const ate = getTotalByType('ATE');
      const acu = getTotalByType('ACU');
      const tue = getTotalByType('TUE');
      const oce = getTotalByType('OCE');

      const dpmsTotal = tug.dpms + iug.dpms + ate.dpms + acu.dpms + tue.dpms + oce.dpms;
      const corrienteTotal = dpmsTotal / 220; // Asumiendo 220V

      return [
        item.denominacionTablero,
        item.denominacionAmbiente,
        item.dimensiones.x,
        item.dimensiones.y,
        item.dimensiones.h,
        superficie.toFixed(2),
        item.gradoElectrificacion,
        tug.cantidad,
        tug.dpms,
        iug.cantidad,
        iug.dpms,
        ate.cantidad,
        ate.dpms,
        acu.cantidad,
        acu.dpms,
        tue.cantidad,
        tue.dpms,
        oce.cantidad,
        oce.dpms,
        dpmsTotal.toFixed(2),
        corrienteTotal.toFixed(2)
      ];
    });

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto-fit columns
    const colWidths = headers.map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'DPMS');
  }

  addLoadsByPanelSheet(loadsData) {
    const headers = [
      'Identificación Tablero',
      'Línea o Carga',
      'Tipo de Carga',
      'Alimentación',
      'Potencia Aparente (kVA)',
      'cos φ',
      'Potencia Activa (kW)',
      'Corriente (A)'
    ];

    const rows = loadsData.map(item => [
      item.identificacionTablero,
      item.lineaOCarga,
      item.tipoCarga,
      item.alimentacion,
      item.potenciaAparente,
      item.cosPhi,
      (item.potenciaAparente * item.cosPhi).toFixed(2),
      (item.potenciaAparente / 0.38).toFixed(2) // Estimación básica
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = headers.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Cargas por Tablero');
  }

  addThermalSheet(thermalData) {
    const headers = [
      'Circuito',
      'Corriente (A)',
      'Conductor',
      'Sección (mm²)',
      'Capacidad Portante (A)',
      'Temperatura (°C)',
      'Verificación',
      'Utilización (%)'
    ];

    const rows = thermalData.map(item => [
      item.circuito,
      item.corriente,
      item.conductor,
      item.seccion,
      item.capacidadPortante,
      item.temperatura,
      item.corriente <= item.capacidadPortante ? 'OK' : 'NO OK',
      ((item.corriente / item.capacidadPortante) * 100).toFixed(1)
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = headers.map(() => ({ wch: 15 }));

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Cálculo Térmico');
  }

  addVoltageDropSheet(voltageDropData) {
    const headers = [
      'Circuito',
      'Longitud (m)',
      'Corriente (A)',
      'Sección (mm²)',
      'Caída de Tensión (V)',
      'Caída de Tensión (%)',
      'Caída Permisible (%)',
      'Verificación'
    ];

    const rows = voltageDropData.map(item => [
      item.circuito,
      item.longitud,
      item.corriente,
      item.seccion,
      item.caidaTension,
      ((item.caidaTension / 220) * 100).toFixed(2), // Asumiendo 220V
      item.caidaPermisible,
      (item.caidaTension / 220 * 100) <= item.caidaPermisible ? 'OK' : 'NO OK'
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = headers.map(() => ({ wch: 15 }));

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Caída de Tensión');
  }

  addShortCircuitSheet(shortCircuitData) {
    const headers = [
      'Punto',
      'Corriente CC (A)',
      'Tiempo (s)',
      'Energía (kJ)',
      'Poder de Corte Req. (kA)'
    ];

    const rows = shortCircuitData.map(item => [
      item.punto,
      item.corrienteCC,
      item.tiempo,
      item.energia,
      (item.corrienteCC / 1000).toFixed(1)
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    worksheet['!cols'] = headers.map(() => ({ wch: 18 }));

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Cortocircuito');
  }

  downloadFile(filename = 'calculo-electrico.xlsx') {
    if (!this.workbook) {
      throw new Error('No hay datos para exportar');
    }

    XLSX.writeFile(this.workbook, filename);
  }

  getBlob() {
    if (!this.workbook) {
      throw new Error('No hay datos para exportar');
    }

    const wbout = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
  }
}
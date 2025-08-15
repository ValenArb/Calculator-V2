import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class PDFExporter {
  constructor() {
    this.pdf = null;
    this.pageNumber = 1;
  }

  exportProject(projectData, calculationsData) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageNumber = 1;

    // Add header to all pages
    this.addHeader(projectData);
    
    // Add project summary
    this.addProjectSummary(projectData);
    
    // Add DPMS calculations
    if (calculationsData.dpms?.length > 0) {
      this.addNewPage();
      this.addDPMSSection(calculationsData.dpms);
    }
    
    // Add Loads per Panel
    if (calculationsData.loadsByPanel?.length > 0) {
      this.addNewPage();
      this.addLoadsByPanelSection(calculationsData.loadsByPanel);
    }
    
    // Add Thermal calculations
    if (calculationsData.thermal?.length > 0) {
      this.addNewPage();
      this.addThermalSection(calculationsData.thermal);
    }
    
    // Add Voltage Drop calculations
    if (calculationsData.voltageDrops?.length > 0) {
      this.addNewPage();
      this.addVoltageDropSection(calculationsData.voltageDrops);
    }
    
    // Add Short Circuit calculations
    if (calculationsData.shortCircuit?.length > 0) {
      this.addNewPage();
      this.addShortCircuitSection(calculationsData.shortCircuit);
    }

    // Add footer to all pages
    this.addFooter();

    return this.pdf;
  }

  addHeader(projectData) {
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    
    // Title
    this.pdf.setFontSize(18);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('CALCULADORA ELÉCTRICA', pageWidth / 2, 20, { align: 'center' });
    
    // Project name
    this.pdf.setFontSize(14);
    this.pdf.text(projectData.name || 'Proyecto Sin Nombre', pageWidth / 2, 30, { align: 'center' });
    
    // Date
    this.pdf.setFontSize(10);
    this.pdf.setFont(undefined, 'normal');
    const date = new Date().toLocaleDateString('es-ES');
    this.pdf.text(`Fecha de generación: ${date}`, pageWidth - 15, 15, { align: 'right' });

    // Line separator
    this.pdf.setLineWidth(0.5);
    this.pdf.line(15, 35, pageWidth - 15, 35);
  }

  addProjectSummary(projectData) {
    let yPosition = 45;
    
    this.pdf.setFontSize(12);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('RESUMEN DEL PROYECTO', 15, yPosition);
    
    yPosition += 10;
    this.pdf.setFont(undefined, 'normal');
    this.pdf.setFontSize(10);
    
    const summaryData = [
      ['Descripción:', projectData.description || 'Sin descripción'],
      ['Fecha de Creación:', projectData.createdAt ? new Date(projectData.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'],
      ['Colaboradores:', projectData.collaborators?.length > 0 ? projectData.collaborators.join(', ') : 'Ninguno'],
    ];

    summaryData.forEach(([label, value]) => {
      this.pdf.setFont(undefined, 'bold');
      this.pdf.text(label, 15, yPosition);
      this.pdf.setFont(undefined, 'normal');
      this.pdf.text(String(value), 60, yPosition);
      yPosition += 7;
    });
  }

  addDPMSSection(dpmsData) {
    this.pdf.setFontSize(14);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('DETERMINACIÓN DE LA POTENCIA MÁXIMA SIMULTÁNEA (DPMS)', 15, 50);

    const tableData = dpmsData.map(item => {
      const superficie = item.dimensiones.x * item.dimensiones.y;
      
      // Calcular DPMS total
      let dpmsTotal = 0;
      Object.values(item.cargas).forEach(cargas => {
        cargas.forEach(carga => {
          dpmsTotal += carga.dpms || 0;
        });
      });

      return [
        item.denominacionTablero || '',
        item.denominacionAmbiente || '',
        `${item.dimensiones.x} x ${item.dimensiones.y}`,
        superficie.toFixed(2),
        item.gradoElectrificacion || '',
        dpmsTotal.toFixed(0),
        (dpmsTotal / 220).toFixed(2)
      ];
    });

    this.pdf.autoTable({
      startY: 60,
      head: [['Tablero', 'Ambiente', 'Dimensiones (m)', 'Superficie (m²)', 'Grado Electrif.', 'DPMS (VA)', 'Corriente (A)']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Add detailed breakdown for each tablero
    let finalY = this.pdf.lastAutoTable.finalY + 10;
    
    dpmsData.forEach((item, index) => {
      if (finalY > 250) {
        this.addNewPage();
        finalY = 50;
      }

      this.pdf.setFontSize(11);
      this.pdf.setFont(undefined, 'bold');
      this.pdf.text(`Detalle de cargas - ${item.denominacionTablero}`, 15, finalY);
      finalY += 8;

      const detailData = [];
      Object.entries(item.cargas).forEach(([tipo, cargas]) => {
        cargas.forEach(carga => {
          detailData.push([
            tipo,
            carga.cantidadBocas || 0,
            carga.identificacionCircuito || '',
            carga.dpms || 0,
            carga.fase || '',
            carga.corriente || 0
          ]);
        });
      });

      if (detailData.length > 0) {
        this.pdf.autoTable({
          startY: finalY,
          head: [['Tipo', 'Cant. Bocas', 'ID Circuito', 'DPMS (VA)', 'Fase', 'Corriente (A)']],
          body: detailData,
          styles: { fontSize: 7 },
          headStyles: { fillColor: [52, 152, 219], textColor: 255 }
        });
        finalY = this.pdf.lastAutoTable.finalY + 15;
      }
    });
  }

  addLoadsByPanelSection(loadsData) {
    this.pdf.setFontSize(14);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('CARGAS POR TABLERO', 15, 50);

    const tableData = loadsData.map(item => [
      item.identificacionTablero || '',
      item.lineaOCarga || '',
      item.tipoCarga || '',
      item.alimentacion || '',
      item.potenciaAparente || 0,
      item.cosPhi || 0,
      (item.potenciaAparente * item.cosPhi).toFixed(2),
      (item.potenciaAparente / 0.38).toFixed(2)
    ]);

    this.pdf.autoTable({
      startY: 60,
      head: [['Tablero', 'Línea/Carga', 'Tipo', 'Alimentación', 'P.Ap.(kVA)', 'cos φ', 'P.Act.(kW)', 'I (A)']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // Add summary
    let finalY = this.pdf.lastAutoTable.finalY + 10;
    const totalPotencia = loadsData.reduce((sum, item) => sum + (item.potenciaAparente || 0), 0);
    const totalPotenciaActiva = loadsData.reduce((sum, item) => sum + (item.potenciaAparente * item.cosPhi || 0), 0);

    this.pdf.setFontSize(10);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text(`Potencia Total Aparente: ${totalPotencia.toFixed(2)} kVA`, 15, finalY);
    this.pdf.text(`Potencia Total Activa: ${totalPotenciaActiva.toFixed(2)} kW`, 15, finalY + 7);
  }

  addThermalSection(thermalData) {
    this.pdf.setFontSize(14);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('VERIFICACIÓN TÉRMICA DE CONDUCTORES', 15, 50);

    const tableData = thermalData.map(item => {
      const verification = item.corriente <= item.capacidadPortante ? 'OK' : 'NO OK';
      const utilization = ((item.corriente / item.capacidadPortante) * 100).toFixed(1);
      
      return [
        item.circuito || '',
        item.corriente || 0,
        item.conductor || '',
        item.seccion || 0,
        item.capacidadPortante || 0,
        item.temperatura || 0,
        verification,
        utilization + '%'
      ];
    });

    this.pdf.autoTable({
      startY: 60,
      head: [['Circuito', 'I (A)', 'Conductor', 'Sección (mm²)', 'Cap.Port.(A)', 'Temp.(°C)', 'Verif.', 'Util.(%)']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 87, 34], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        6: { 
          cellWidth: 15,
          halign: 'center',
          fillColor: (rowIndex, columnIndex, cellData) => cellData === 'OK' ? [76, 175, 80] : [244, 67, 54]
        }
      }
    });
  }

  addVoltageDropSection(voltageDropData) {
    this.pdf.setFontSize(14);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('VERIFICACIÓN DE CAÍDA DE TENSIÓN', 15, 50);

    const tableData = voltageDropData.map(item => {
      const caidaPorcentual = ((item.caidaTension / 220) * 100).toFixed(2);
      const verification = parseFloat(caidaPorcentual) <= item.caidaPermisible ? 'OK' : 'NO OK';
      
      return [
        item.circuito || '',
        item.longitud || 0,
        item.corriente || 0,
        item.seccion || 0,
        item.caidaTension || 0,
        caidaPorcentual + '%',
        item.caidaPermisible + '%',
        verification
      ];
    });

    this.pdf.autoTable({
      startY: 60,
      head: [['Circuito', 'Long.(m)', 'I (A)', 'Secc.(mm²)', 'ΔV (V)', 'ΔV (%)', 'Perm.(%)', 'Verif.']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [156, 39, 176], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        7: { 
          cellWidth: 15,
          halign: 'center',
          fillColor: (rowIndex, columnIndex, cellData) => cellData === 'OK' ? [76, 175, 80] : [244, 67, 54]
        }
      }
    });
  }

  addShortCircuitSection(shortCircuitData) {
    this.pdf.setFontSize(14);
    this.pdf.setFont(undefined, 'bold');
    this.pdf.text('CÁLCULO DE CORRIENTE DE CORTOCIRCUITO', 15, 50);

    const tableData = shortCircuitData.map(item => [
      item.punto || '',
      item.corrienteCC || 0,
      item.tiempo || 0,
      item.energia || 0,
      (item.corrienteCC / 1000).toFixed(1)
    ]);

    this.pdf.autoTable({
      startY: 60,
      head: [['Punto', 'Icc (A)', 'Tiempo (s)', 'Energía (kJ)', 'P.Corte Req.(kA)']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [244, 67, 54], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });
  }

  addNewPage() {
    this.pdf.addPage();
    this.pageNumber++;
  }

  addFooter() {
    const pageCount = this.pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      const pageWidth = this.pdf.internal.pageSize.getWidth();
      const pageHeight = this.pdf.internal.pageSize.getHeight();
      
      this.pdf.setFontSize(8);
      this.pdf.setFont(undefined, 'normal');
      
      // Page number
      this.pdf.text(`Página ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      
      // Generated by
      this.pdf.text('Generado por Calculadora Eléctrica', 15, pageHeight - 10);
    }
  }

  downloadFile(filename = 'calculo-electrico.pdf') {
    if (!this.pdf) {
      throw new Error('No hay datos para exportar');
    }

    this.pdf.save(filename);
  }

  getBlob() {
    if (!this.pdf) {
      throw new Error('No hay datos para exportar');
    }

    return this.pdf.output('blob');
  }
}
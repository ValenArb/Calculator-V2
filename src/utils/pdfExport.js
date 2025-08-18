import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility for generating PDF exports of electrical test protocols
 * Follows IEC 60364-6 standards for electrical installation testing documentation
 */
class PDFExportService {
  constructor() {
    this.defaultOptions = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      margin: {
        top: 20,
        right: 15,
        bottom: 20,
        left: 15
      },
      quality: 0.98,
      scale: 2
    };
  }

  /**
   * Export project protocol to PDF
   * @param {Object} project - Project data with protocol information
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportProjectProtocol(project, options = {}) {
    try {
      const config = { ...this.defaultOptions, ...options };
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: config.orientation,
        unit: config.unit,
        format: config.format
      });

      // Set document properties
      pdf.setProperties({
        title: `FAT - ${project.name}`,
        subject: 'Protocolo de FAT para tableros',
        author: project.client_name || 'Calculadora Eléctrica',
        keywords: 'electrical,testing,protocol,IEC60364',
        creator: 'Codeiroo / ValenArbert'
      });

      let yPosition = config.margin.top;

      // Add header
      yPosition = this.addHeader(pdf, project, yPosition, config);
      
      // Add project information
      yPosition = this.addProjectInfo(pdf, project, yPosition, config);
      
      // Add testing sections
      yPosition = this.addTestingSections(pdf, project, yPosition, config);
      
      // Add footer
      this.addFooter(pdf, config);

      // Save the PDF
      const filename = this.generateFilename(project);
      pdf.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Error al generar el PDF: ' + error.message);
    }
  }

  /**
   * @param {Object} project - Project data
   * @param {Object} protocol - Protocol data
   * @param {String} tableroName - Board name
   * @returns {Promise<void>}
   */
  async exportProtocolPDF(project, protocol, tableroName = 'TABLERO PRINCIPAL') {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set document properties
      pdf.setProperties({
        title: `Protocolo de Ensayos - ${project.name}`,
        subject: 'Protocolo de Ensayos Eléctricos',
        author: project.client_name || project.company || 'Cliente',
        keywords: 'electrical,testing,protocol,FAT',
        creator: 'Calculadora Eléctrica V2'
      });

      // Page dimensions
      const pageWidth = 210; // A4 portrait width
      const pageHeight = 297; // A4 portrait height
      const margin = 10;

      this.generateProtocol(pdf, project, protocol, tableroName, { pageWidth, pageHeight, margin });

      // Save the PDF
      const filename = `Protocolo_${(project.name || 'Proyecto').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Error generating protocol PDF:', error);
      throw new Error('Error al generar el PDF del protocolo: ' + error.message);
    }
  }

  /**
   * Add header to PDF
   */
  addHeader(pdf, project, yPosition, config) {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PROTOCOLO DE ENSAYOS ELÉCTRICOS', config.margin.left, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Según norma IEC 60364-6', config.margin.left, yPosition);
    
    yPosition += 15;
    pdf.line(config.margin.left, yPosition, 210 - config.margin.right, yPosition);
    
    return yPosition + 10;
  }

  /**
   * Add project information
   */
  addProjectInfo(pdf, project, yPosition, config) {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMACIÓN DEL PROYECTO', config.margin.left, yPosition);
    
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    
    const projectInfo = [
      [`Nombre del Proyecto:`, project.name || 'N/A'],
      [`Cliente:`, project.client_name || 'N/A'],
      [`Ubicación:`, project.location || 'N/A'],
      [`Tipo de Proyecto:`, this.formatProjectType(project.project_type)],
      [`Estado:`, this.formatStatus(project.status)],
      [`Fecha de Creación:`, this.formatDate(project.created_at)],
      [`Última Actualización:`, this.formatDate(project.updated_at)]
    ];

    projectInfo.forEach(([label, value]) => {
      pdf.text(label, config.margin.left, yPosition);
      pdf.text(value, config.margin.left + 50, yPosition);
      yPosition += 6;
    });

    return yPosition + 10;
  }

  /**
   * Add testing sections
   */
  addTestingSections(pdf, project, yPosition, config) {
    if (!project.calculation_data || !project.calculation_data.fatProtocol) {
      pdf.text('No hay datos de protocolo disponibles', config.margin.left, yPosition);
      return yPosition + 10;
    }

    const protocol = project.calculation_data.fatProtocol;
    
    // Add each testing section
    yPosition = this.addTestingSection(pdf, 'ESTRUCTURA Y MECÁNICA', protocol.estructura, yPosition, config);
    yPosition = this.addTestingSection(pdf, 'ELECTROMONTAJE', protocol.electromontaje, yPosition, config);
    yPosition = this.addTestingSection(pdf, 'PRUEBAS FUNCIONALES', protocol.pruebas, yPosition, config);
    yPosition = this.addTestingSection(pdf, 'MEDICIÓN DE AISLAMIENTO', protocol.aislamiento, yPosition, config);
    yPosition = this.addTestingSection(pdf, 'CONTROL FINAL', protocol.controlFinal, yPosition, config);
    
    // Add digital signatures section
    if (protocol.firmasDigitales) {
      yPosition = this.addDigitalSignatures(pdf, protocol.firmasDigitales, yPosition, config);
    }

    return yPosition;
  }

  /**
   * Add individual testing section
   */
  addTestingSection(pdf, title, sectionData, yPosition, config) {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = config.margin.top;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, config.margin.left, yPosition);
    
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    if (sectionData && typeof sectionData === 'object') {
      Object.entries(sectionData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          let displayText = `${key}: `;
          
          if (value.estado) {
            displayText += `Estado: ${value.estado}`;
          }
          if (value.valor_medido) {
            displayText += ` | Valor: ${value.valor_medido}`;
          }
          if (value.observaciones || value.observacion) {
            displayText += ` | Obs: ${value.observaciones || value.observacion}`;
          }
          
          pdf.text(displayText, config.margin.left + 5, yPosition);
          yPosition += 5;
        } else {
          pdf.text(`${key}: ${value || 'N/A'}`, config.margin.left + 5, yPosition);
          yPosition += 5;
        }

        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = config.margin.top;
        }
      });
    }

    return yPosition + 10;
  }

  /**
   * Add digital signatures section to PDF
   */
  addDigitalSignatures(pdf, signatures, yPosition, config) {
    // Check if we need a new page
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = config.margin.top;
    }

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FIRMAS DIGITALES', config.margin.left, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const signatureTypes = [
      { id: 'tecnico_ensayos', label: 'Técnico de Ensayos' },
      { id: 'supervisor_electrico', label: 'Supervisor Eléctrico' },
      { id: 'cliente_representante', label: 'Representante del Cliente' },
      { id: 'inspector_certificacion', label: 'Inspector de Certificación' }
    ];

    signatureTypes.forEach((signatureType) => {
      const signature = signatures[signatureType.id];
      
      if (signature && signature.data) {
        // Check if we need a new page
        if (yPosition > 240) {
          pdf.addPage();
          yPosition = config.margin.top;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text(`${signatureType.label}:`, config.margin.left, yPosition);
        yPosition += 8;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        
        // Add signature metadata
        pdf.text(`Tipo: ${signature.type === 'drawn' ? 'Dibujada' : 'Cargada'}`, config.margin.left + 5, yPosition);
        pdf.text(`Fecha: ${this.formatDate(signature.timestamp)}`, config.margin.left + 80, yPosition);
        yPosition += 5;

        // Add signature image (simplified - just show that it exists)
        pdf.rect(config.margin.left + 5, yPosition, 50, 15);
        pdf.text('FIRMA DIGITAL', config.margin.left + 15, yPosition + 8);
        yPosition += 20;
      } else {
        pdf.text(`${signatureType.label}: Sin firmar`, config.margin.left, yPosition);
        yPosition += 8;
      }
    });

    return yPosition + 10;
  }

  /**
   */
  generateProtocol(pdf, project, protocol, tableroName, config) {
    const { pageWidth, pageHeight, margin } = config;
    let y = margin;

    // Main title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const title = 'PROTOCOLO DE ENSAYOS';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, y);
    y += 5;

    // Orange header with client info
    pdf.setFillColor(255, 165, 0);
    pdf.rect(margin, y, pageWidth - 2 * margin, 12, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    const clientText = `CLIENTE: ${project.company || project.client_name || 'N/A'}`;
    const obraText = `OBRA: ${project.location || 'N/A'}`;
    
    pdf.text(clientText, margin + 2, y + 5);
    pdf.text(obraText, margin + 100, y + 5);
    
    pdf.text(`TABLERO: ${tableroName}`, margin + 2, y + 9);
    y += 15;

    // Project details box
    // pdf.setDrawColor(0, 0, 0);
    // pdf.rect(margin, y, pageWidth - 2 * margin, 30);
    
    // pdf.setFontSize(9);
    // pdf.setFont('helvetica', 'normal');
    
    // // Project info grid
    // const projectInfo = [
    //   [`CLIENTE:`, project.company || project.client_name || ''],
    //   [`PROYECTO:`, project.name || ''],
    //   [`Un(V):`, '380', `F(Hz):`, '50', `In(A):`, '630'],
    //   [`Icc(kA):`, '50', `TIPO:`, 'ESTANDARD', `IP:`, '65'],
    //   [`Nº SERIE:`, '735461023', `FECHA:`, '2024']
    // ];

    // let yPos = y + 6;
    // projectInfo.forEach((row, index) => {
    //   let xPos = margin + 3;
    //   for (let i = 0; i < row.length; i += 2) {
    //     if (row[i] && row[i + 1] !== undefined) {
    //       pdf.setFont('helvetica', 'bold');
    //       pdf.text(row[i], xPos, yPos);
    //       pdf.setFont('helvetica', 'normal');
    //       pdf.text(row[i + 1], xPos + 20, yPos);
    //       xPos += 60;
    //     }
    //   }
    //   yPos += 5;
    // });

    // y += 35;

    // Date and status
    const protocolStatus = String(protocol.estado) || 'N/A';
    const protocolStatusColor = {
      'APROBADO': [0, 128, 0], // Green
      'RECHAZADO': [220, 20, 60], // Red
      'PENDIENTE': [255, 165, 0] // Orange
    };
    const statusColor = protocolStatusColor[protocolStatus] || [128, 128, 128]; // Default to Gray

    const statusBoxWidth = 70;
    const statusBoxHeight = 8;
    const statusBoxX = pageWidth - margin - statusBoxWidth;
    const statusBoxY = y;

    pdf.setFillColor(...statusColor);
    pdf.rect(statusBoxX, statusBoxY, statusBoxWidth, statusBoxHeight, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);

    const textWidth = pdf.getTextWidth(protocolStatus);
    const textX = statusBoxX + (statusBoxWidth - textWidth) / 2;
    const textY = statusBoxY + statusBoxHeight / 2 + 1;

    pdf.text(protocolStatus, textX, textY);
    pdf.setTextColor(0, 0, 0);

    pdf.setFont('helvetica', 'normal');
    pdf.text(`FECHA: ${new Date().toLocaleDateString('es-ES')}`, margin, y + 5);
    y += 10;

    // Testing sections
    y = this.addTestingSections(pdf, protocol, y, config);

    // Signatures section
    y = this.addSignatures(pdf, protocol, y, config);

    // Standards section
    y = this.addStandards(pdf, y, config);
  }

  /**
   * Add  testing sections exactly as in reference document
   */
  addTestingSections(pdf, protocol, y, config) {
    const { pageWidth, margin } = config;
    
    // Section 1: ESTRUCTURA
    y = this.addSection(pdf, '1.', 'ESTRUCTURA', [
      '1.1 Integridad y ordenamiento',
      '1.2 Ensamble mecánico', 
      '1.3 Puertas, cierres y protecciones',
      '1.4 Protección superficial'
    ], protocol.estructura, y, config);

    // Section 2: ELECTROMONTAJE
    y = this.addSection(pdf, '2.', 'ELECTROMONTAJE', [
      '2.1 Datos técnicos de aparatos',
      '2.2 Integridad, ubicación e identificación',
      '2.3 Carteles, indicadores, símbolos',
      '2.4 Ejecución de barras y cableado',
      '2.5 Disposición y ejecución de borneras',
      '2.6 Puesta a tierra y medios de seguridad',
      '2.7 Componentes de aislación',
      '2.8 Plano conforme a fabricacion'
    ], protocol.electromontaje, y, config);

    // Section 3: PRUEBAS Y ENSAYO
    y = this.addSection(pdf, '3.', 'PRUEBAS Y ENSAYO', [
      '3.1 Accionamientos manuales y accesorios',
      '3.2 Enclavamiento y bloqueos',
      '3.3 Sujeción de aparatos y conexionado',
      '3.4 Control de cableado',
      '3.5 Prueba funcional eléctrica',
      '3.5.1 Verificación de Tensiones en Bornes',
      '3.5.2 Apertura/Cierre de Protecciones',
      '3.5.3 Funcionamiento de Elem. de Comando',
      '3.5.4 Ensayo de Arranques Especiales',
      '3.5.5 Verificación de I/O de PLC',
      '3.5.6 Otros'
    ], protocol.pruebas, y, config);

    // Section 4: AISLACION - Special table format
    y = this.addAislacionSection(pdf, protocol.aislamiento, y, config);

    // Section 5: CONTROL FINAL
    y = this.addSection(pdf, '5.', 'CONTROL FINAL', [
      '5.1 Identificaciones y ordenamiento',
      '5.2 Inspección con presencia del cliente',
      '5.3 Detalles de terminación',
      '5.4 Accesorios y embalaje'
    ], protocol.controlFinal, y, config);

    return y;
  }

  /**
   * Add individual  section
   */
  addSection(pdf, sectionNum, sectionTitle, items, sectionData, y, config) {
    const { pageWidth, margin } = config;
    const rowHeight = 4.5; // Reducido para headers más compactos
    const colWidths = [125, 12, 12, 12, 30]; // Description, SI, NO, N/A, OBS - reducido espaciado
    
    // Section header CON headers en la misma fila
    pdf.setFillColor(255, 165, 0);
    pdf.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${sectionNum} ${sectionTitle}`, margin + 2, y + 3.2);
    
    // Headers SI, NO, N/A, OBS en la MISMA fila que el título
    let x = margin;
    const headers = ['', 'SI', 'NO', 'N/A', 'OBS.'];
    pdf.setFontSize(7); // Fuente más pequeña para headers compactos
    headers.forEach((header, index) => {
      if (index > 0) {
        pdf.text(header, x + colWidths[index] / 2 - pdf.getTextWidth(header) / 2, y + 3.2);
      }
      x += colWidths[index];
    });
    
    y += rowHeight;
    
    // Data rows
    items.forEach((item) => {
      const itemKey = item.split(' ')[0]; // Get item ID (e.g., "1.1")
      const itemData = sectionData?.[itemKey] || {};
      
      // Row background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
      
      // Draw borders
      x = margin;
      colWidths.forEach((width) => {
        pdf.rect(x, y, width, rowHeight);
        x += width;
      });
      
      // Content
      x = margin;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      
      // Description
      pdf.text(item, x + 1, y + 3.5);
      x += colWidths[0];
      
      // Checkboxes
      ['SI', 'NO', 'N/A'].forEach((option, index) => {
        const isChecked = itemData.estado === option || 
                         (option === 'N/A' && itemData.estado === 'NA');
        if (isChecked) {
          pdf.text('x', x + colWidths[index + 1] / 2 - 1, y + 3.5);
        }
        x += colWidths[index + 1];
      });
      
      // Observations
      const obs = itemData.observacion || itemData.observaciones || '-';
      pdf.text(obs.substring(0, 15), x + 1, y + 3.5);
      
      y += rowHeight;
    });
    
    return y + 3;
  }

/**
 * Add Aislacion section with special table format - Exact match to reference image
 */
addAislacionSection(pdf, aislacionData, y, config) {
  const { pageWidth, margin } = config;
  const rowHeight = 4.5;
  
  // Section header
  pdf.setFillColor(255, 165, 0);
  pdf.rect(margin, y, pageWidth - 2 * margin, rowHeight, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('4. AISLACION:', margin + 2, y + 3);
  y += rowHeight + 1;
  
  // Equipment info in left column format like the image
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  // Left side equipment info - más compacto
  const equipmentStartY = y;
  y += 5;
  pdf.text(`MARCA:`, margin + 2, y);
  pdf.text(`${aislacionData?.marca || 'N/A'}`, margin + 25, y);
  y += 3;
  
  pdf.text(`MODELO:`, margin + 2, y);
  pdf.text(`${aislacionData?.modelo || 'N/A'}`, margin + 25, y);
  y += 3;
  
  pdf.text(`ESCALA:`, margin + 2, y);
  pdf.text(`${aislacionData?.escala || 'N/A'}`, margin + 25, y);
  y += 3;
  
  pdf.text(`TIEMPO:`, margin + 2, y);
  pdf.text(`${aislacionData?.tiempo || 'N/A'}`, margin + 25, y);
  
  // Table positioned right next to equipment info
  const tableStartY = equipmentStartY; // Alineado con el primer texto del equipo
  const tableX = margin + 60; // Más cerca del texto del equipo
  const tableWidth = pageWidth - tableX - margin;
  const colWidths = [25, 25, 25, 25, 25]; // 5 equal columns
  
  // Orange header row
  pdf.setFillColor(255, 165, 0);
  pdf.rect(tableX, tableStartY, tableWidth, rowHeight, 'F');
  
  const headers = ['', 'RESISTENCIA 2', 'RESISTENCIA 1', 'CORRIENTE 2', 'CORRIENTE 1'];
  let x = tableX;
  
  headers.forEach((header, index) => {
    // Draw cell border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.rect(x, tableStartY, colWidths[index], rowHeight);
    
    if (index > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(0, 0, 0);
      
      // Center text in header
      const textWidth = pdf.getTextWidth(header);
      const textX = x + (colWidths[index] - textWidth) / 2;
      pdf.text(header, textX, tableStartY + 3);
    }
    x += colWidths[index];
  });
  
  // Data rows with exact labels from image and units
  const measurements = [
    { 
      label: 'N-RST', 
      values: [
        (aislacionData?.mediciones?.['N-RST']?.resistencia2 || 'N/A') + 
        (aislacionData?.mediciones?.['N-RST']?.resistencia2 ? ` ${aislacionData?.mediciones?.['N-RST']?.unidad_resistencia2 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['N-RST']?.resistencia1 || 'N/A') + 
        (aislacionData?.mediciones?.['N-RST']?.resistencia1 ? ` ${aislacionData?.mediciones?.['N-RST']?.unidad_resistencia1 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['N-RST']?.corriente2 || 'N/A') + 
        (aislacionData?.mediciones?.['N-RST']?.corriente2 ? ` ${aislacionData?.mediciones?.['N-RST']?.unidad_corriente2 || 'mA'}` : ''),
        (aislacionData?.mediciones?.['N-RST']?.corriente1 || 'N/A') + 
        (aislacionData?.mediciones?.['N-RST']?.corriente1 ? ` ${aislacionData?.mediciones?.['N-RST']?.unidad_corriente1 || 'mA'}` : '')
      ]
    },
    { 
      label: 'R-NST', 
      values: [
        (aislacionData?.mediciones?.['R-NST']?.resistencia2 || 'N/A') + 
        (aislacionData?.mediciones?.['R-NST']?.resistencia2 ? ` ${aislacionData?.mediciones?.['R-NST']?.unidad_resistencia2 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['R-NST']?.resistencia1 || 'N/A') + 
        (aislacionData?.mediciones?.['R-NST']?.resistencia1 ? ` ${aislacionData?.mediciones?.['R-NST']?.unidad_resistencia1 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['R-NST']?.corriente2 || 'N/A') + 
        (aislacionData?.mediciones?.['R-NST']?.corriente2 ? ` ${aislacionData?.mediciones?.['R-NST']?.unidad_corriente2 || 'mA'}` : ''),
        (aislacionData?.mediciones?.['R-NST']?.corriente1 || 'N/A') + 
        (aislacionData?.mediciones?.['R-NST']?.corriente1 ? ` ${aislacionData?.mediciones?.['R-NST']?.unidad_corriente1 || 'mA'}` : '')
      ]
    },
    { 
      label: 'S-NRT', 
      values: [
        (aislacionData?.mediciones?.['S-NRT']?.resistencia2 || 'N/A') + 
        (aislacionData?.mediciones?.['S-NRT']?.resistencia2 ? ` ${aislacionData?.mediciones?.['S-NRT']?.unidad_resistencia2 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['S-NRT']?.resistencia1 || 'N/A') + 
        (aislacionData?.mediciones?.['S-NRT']?.resistencia1 ? ` ${aislacionData?.mediciones?.['S-NRT']?.unidad_resistencia1 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['S-NRT']?.corriente2 || 'N/A') + 
        (aislacionData?.mediciones?.['S-NRT']?.corriente2 ? ` ${aislacionData?.mediciones?.['S-NRT']?.unidad_corriente2 || 'mA'}` : ''),
        (aislacionData?.mediciones?.['S-NRT']?.corriente1 || 'N/A') + 
        (aislacionData?.mediciones?.['S-NRT']?.corriente1 ? ` ${aislacionData?.mediciones?.['S-NRT']?.unidad_corriente1 || 'mA'}` : '')
      ]
    },
    { 
      label: 'T-NSR', 
      values: [
        (aislacionData?.mediciones?.['T-NSR']?.resistencia2 || 'N/A') + 
        (aislacionData?.mediciones?.['T-NSR']?.resistencia2 ? ` ${aislacionData?.mediciones?.['T-NSR']?.unidad_resistencia2 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['T-NSR']?.resistencia1 || 'N/A') + 
        (aislacionData?.mediciones?.['T-NSR']?.resistencia1 ? ` ${aislacionData?.mediciones?.['T-NSR']?.unidad_resistencia1 || 'MΩ'}` : ''),
        (aislacionData?.mediciones?.['T-NSR']?.corriente2 || 'N/A') + 
        (aislacionData?.mediciones?.['T-NSR']?.corriente2 ? ` ${aislacionData?.mediciones?.['T-NSR']?.unidad_corriente2 || 'mA'}` : ''),
        (aislacionData?.mediciones?.['T-NSR']?.corriente1 || 'N/A') + 
        (aislacionData?.mediciones?.['T-NSR']?.corriente1 ? ` ${aislacionData?.mediciones?.['T-NSR']?.unidad_corriente1 || 'mA'}` : '')
      ]
    }
  ];
  
  let currentY = tableStartY + rowHeight;
  
  measurements.forEach((measurement, rowIndex) => {
    // Sin colores alternos - todo blanco como en la imagen
    pdf.setFillColor(255, 255, 255); // White only
    pdf.rect(tableX, currentY, tableWidth, rowHeight, 'F');
    
    // Draw cell borders
    x = tableX;
    colWidths.forEach((width) => {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.2);
      pdf.rect(x, currentY, width, rowHeight);
      x += width;
    });
    
    // Content
    x = tableX;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    
    // First column - measurement label (left aligned)
    pdf.text(measurement.label, x + 2, currentY + 3);
    x += colWidths[0];
    
    // Data columns - centered
    measurement.values.forEach((value, index) => {
      const textWidth = pdf.getTextWidth(value);
      const textX = x + (colWidths[index + 1] - textWidth) / 2;
      pdf.text(value, textX, currentY + 3);
      x += colWidths[index + 1];
    });
    
    currentY += rowHeight;
  });
  
  // Return Y position after the entire section
  return Math.max(y + 3, currentY + 3);
}

  /**
   * Add  signatures section
   */
  addSignatures(pdf, protocol, y, config) {
    const { pageWidth, margin } = config;

    console.log('=== Protocol Data Debug ===');
    console.log('Protocol object:', protocol);
    console.log('Protocol keys:', Object.keys(protocol));
    console.log('Protocol JSON:', JSON.stringify(protocol, null, 2));
    console.log('Firmas Digitales:', protocol.firmasDigitales);
    console.log('============================');
    
    // Signatures
    const signatures = [
      { 
        title: 'REALIZO:', 
        name: String(protocol.realizo_nombre), 
        cargo: String(protocol.realizo_cargo),
        firma: protocol.firmasDigitales?.tecnico_ensayos
      },
      { 
        title: 'CONTROLO:', 
        name: String(protocol.controlo_nombre), 
        cargo: String(protocol.controlo_cargo),
        firma: protocol.firmasDigitales?.supervisor_electrico
      },
      { 
        title: 'APROBO:', 
        name: String(protocol.aprobo_nombre), 
        cargo: String(protocol.aprobo_cargo),
        firma: protocol.firmasDigitales?.cliente_representante
      }
    ];
    
    const sigWidth = (pageWidth - 2 * margin) / 3;
    
    signatures.forEach((sig, index) => {
      const x = margin + (index * sigWidth);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text(sig.title, x, y);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(sig.name, x, y + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text(`CARGO: ${sig.cargo}`, x, y + 10);
      
      // Signature line
      const lineY = y + 15;
      pdf.line(x, lineY, x + sigWidth - 10, lineY);
      pdf.text('FIRMA: ................................', x, y + 18);
      
      // Digital signature indicator
      if (sig.firma && sig.firma.data) {
        pdf.setFontSize(6);
        pdf.text('(FIRMADO DIGITALMENTE)', x, y + 22);
      }
    });
    
    return y + 30;
  }

  /**
   * Add  standards section
   */
  addStandards(pdf, y, config) {
    const { pageWidth, margin } = config;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('ENSAYOS BASADOS EN LAS SIGUIENTES NORMAS:', margin, y);
    y += 8;
    
    const standards = [
      'Norma IEC 62208 "Envolventes vacías destinadas a los conjuntos de aparamenta de baja tensión. Requisitos generales."',
      'Norma IEC 60439-1 "Conjuntos de aparamenta de baja tensión. Parte 1: Conjuntos de serie y conjuntos derivados de serie."',
      'Norma IEC 60439-2 "Conjuntos de aparamenta de baja tensión. Parte 2: Requisitos particulares para las canalizaciones prefabricadas."',
      'Norma IEC 60439-3 "Requerimientos particulares para los tableros equipados destinados a ser instalados en lugares accesibles al personal no calificado durante su utilización"',
      'Norma: IEC 60670-24 "Requisitos generales para las envolturas de los accesorios para instalaciones eléctricas fijas para usos domiciliarios y similares".'
    ];
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    
    standards.forEach((standard) => {
      pdf.text(standard, margin, y);
      y += 4;
    });
    
    return y;
  }

  /**
   * Add protocol testing tables
   */
  addProtocolTables(pdf, project, yPosition, config) {
    const { pageWidth, margin } = config;
    const protocol = project.calculation_data?.fatProtocol || {};
    
    // Table configuration
    const tableWidth = pageWidth - (margin * 2);
    const colWidths = [15, 125, 12, 12, 12, 60]; // ID, Description, SI, NO, N/A, Observations - reducido espaciado
    const rowHeight = 5; // Reducido para headers más compactos
    
    // Testing sections
    const sections = [
      { title: '1. ESTRUCTURA Y MECÁNICA', data: protocol.estructura || {}, color: [34, 139, 34] },
      { title: '2. ELECTROMONTAJE', data: protocol.electromontaje || {}, color: [34, 139, 34] },
      { title: '3. PRUEBAS FUNCIONALES', data: protocol.pruebas || {}, color: [34, 139, 34] },
      { title: '4. MEDICIÓN DE AISLAMIENTO', data: protocol.aislamiento || {}, color: [34, 139, 34] },
      { title: '5. CONTROL FINAL', data: protocol.controlFinal || {}, color: [34, 139, 34] }
    ];
    
    sections.forEach((section, sectionIndex) => {
      // Section header CON headers en la misma fila
      pdf.setFillColor(...section.color);
      pdf.rect(margin, yPosition, tableWidth, rowHeight, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, margin + 2, yPosition + 3.2);
      
      // Headers ID, DESCRIPCIÓN, SI, NO, N/A, OBSERVACIONES en la MISMA fila que el título
      const headers = ['ID', 'DESCRIPCIÓN', 'SI', 'NO', 'N/A', 'OBSERVACIONES'];
      let xPosition = margin;
      
      pdf.setTextColor(255, 255, 255); // Mantener texto blanco para que se vea sobre el fondo verde
      headers.forEach((header, index) => {
        // Fuente más pequeña para headers compactos
        if (index >= 2 && index <= 4) { // SI, NO, N/A
          pdf.setFontSize(7);
          // Centrar los headers SI, NO, N/A
          const textWidth = pdf.getTextWidth(header);
          pdf.text(header, xPosition + (colWidths[index] / 2) - (textWidth / 2), yPosition + 3.2);
        } else {
          pdf.setFontSize(8);
          pdf.text(header, xPosition + 2, yPosition + 3.2);
        }
        pdf.setFont('helvetica', 'bold');
        xPosition += colWidths[index];
      });
      
      pdf.setTextColor(0, 0, 0); // Restablecer color de texto
      yPosition += rowHeight;
      
      // Table rows
      const items = this.getTestingItems(sectionIndex + 1);
      items.forEach((item) => {
        xPosition = margin;
        const itemData = section.data[item.id] || {};
        
        // Draw row
        pdf.setFillColor(255, 255, 255);
        pdf.rect(margin, yPosition, tableWidth, rowHeight, 'F');
        
        // ID
        pdf.rect(xPosition, yPosition, colWidths[0], rowHeight);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(item.id, xPosition + 2, yPosition + 4);
        xPosition += colWidths[0];
        
        // Description
        pdf.rect(xPosition, yPosition, colWidths[1], rowHeight);
        pdf.text(item.desc.substring(0, 50), xPosition + 2, yPosition + 4);
        xPosition += colWidths[1];
        
        // SI, NO, N/A checkboxes
        ['SI', 'NO', 'NA'].forEach((option, optIndex) => {
          pdf.rect(xPosition, yPosition, colWidths[2 + optIndex], rowHeight);
          const isChecked = itemData.estado === option || (option === 'NA' && itemData.estado === 'N/A');
          if (isChecked) {
            pdf.text('✓', xPosition + 6, yPosition + 4);
          }
          xPosition += colWidths[2 + optIndex];
        });
        
        // Observations
        pdf.rect(xPosition, yPosition, colWidths[5], rowHeight);
        const obs = itemData.observacion || itemData.observaciones || '';
        pdf.text(obs.substring(0, 25), xPosition + 2, yPosition + 4);
        
        yPosition += rowHeight;
      });
      
      yPosition += 3; // Space between sections
    });
    
    return yPosition;
  }

  /**
   * Add protocol signatures section
   */
  addProtocolSignatures(pdf, project, yPosition, config) {
    const { pageWidth, margin } = config;
    const protocol = project.calculation_data?.fatProtocol || {};
    const signatures = protocol.firmasDigitales || {};
    
    // Signatures title
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FIRMAS DIGITALES', margin, yPosition);
    yPosition += 8;
    
    // Signature boxes
    const signatureTypes = [
      { id: 'tecnico_ensayos', label: 'TÉCNICO DE ENSAYOS' },
      { id: 'supervisor_electrico', label: 'SUPERVISOR ELÉCTRICO' },
      { id: 'cliente_representante', label: 'REPRESENTANTE CLIENTE' }
    ];
    
    const boxWidth = 80;
    const boxHeight = 20;
    const spacing = 10;
    
    signatureTypes.forEach((sigType, index) => {
      const xPosition = margin + (index * (boxWidth + spacing));
      const signature = signatures[sigType.id];
      
      // Signature box
      pdf.rect(xPosition, yPosition, boxWidth, boxHeight);
      
      // Label
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sigType.label, xPosition + 2, yPosition - 2);
      
      // Signature status
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      if (signature && signature.data) {
        pdf.text('FIRMADO DIGITALMENTE', xPosition + 2, yPosition + 10);
        pdf.text(`Fecha: ${this.formatDate(signature.timestamp)}`, xPosition + 2, yPosition + 15);
      } else {
        pdf.text('SIN FIRMAR', xPosition + 2, yPosition + 10);
      }
    });
    
    return yPosition + boxHeight + 10;
  }

  /**
   * Get testing items for each section
   */
  getTestingItems(section) {
    const items = {
      1: [ // Estructura y Mecánica
        { id: '1.1', desc: 'Identificación de materiales y componentes' },
        { id: '1.2', desc: 'Verificación de dimensiones según planos' },
        { id: '1.3', desc: 'Control de soldaduras y uniones mecánicas' },
        { id: '1.4', desc: 'Verificación de acabados y pinturas' }
      ],
      2: [ // Electromontaje
        { id: '2.1', desc: 'Cableado y conexiones eléctricas' },
        { id: '2.2', desc: 'Identificación de conductores' },
        { id: '2.3', desc: 'Verificación de secciones de cables' },
        { id: '2.4', desc: 'Conexión de equipos y dispositivos' },
        { id: '2.5', desc: 'Verificación de polaridades' },
        { id: '2.6', desc: 'Conexiones de puesta a tierra' },
        { id: '2.7', desc: 'Verificación de esquemas eléctricos' },
        { id: '2.8', desc: 'Rotulado y etiquetado' }
      ],
      3: [ // Pruebas Funcionales
        { id: '3.1', desc: 'Prueba de encendido de equipos' },
        { id: '3.2', desc: 'Verificación de secuencias operativas' },
        { id: '3.3', desc: 'Prueba de sistemas de protección' },
        { id: '3.4', desc: 'Verificación de alarmas y señalizaciones' },
        { id: '3.5', desc: 'Prueba de comunicaciones' }
      ],
      4: [ // Medición de Aislamiento
        { id: '4.1', desc: 'Medición entre conductores y tierra' },
        { id: '4.2', desc: 'Medición entre conductores activos' },
        { id: '4.3', desc: 'Verificación de resistencia de aislamiento' },
        { id: '4.4', desc: 'Registro de condiciones ambientales' }
      ],
      5: [ // Control Final
        { id: '5.1', desc: 'Identificaciones y ordenamiento' },
        { id: '5.2', desc: 'Inspección con presencia del cliente' },
        { id: '5.3', desc: 'Detalles de terminación' },
        { id: '5.4', desc: 'Accesorios y embalaje' }
      ]
    };
    
    return items[section] || [];
  }

  /**
   * Get status color for PDF
   */
  getStatusColor(status) {
    switch (status) {
      case 'APROBADO': return [34, 139, 34]; // Green
      case 'RECHAZADO': return [220, 20, 60]; // Red
      case 'PENDIENTE': return [255, 165, 0]; // Orange
      default: return [128, 128, 128]; // Gray
    }
  }

  /**
   * Add footer
   */
  addFooter(pdf, config) {
    const pageCount = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      // Footer text
      const footerText = `Generado por Calculadora Eléctrica V2 - Página ${i} de ${pageCount}`;
      const footerDate = `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`;
      
      pdf.text(footerText, config.margin.left, 285);
      pdf.text(footerDate, 210 - config.margin.right - pdf.getTextWidth(footerDate), 285);
    }
  }

  /**
   * Generate filename for the PDF
   */
  generateFilename(project) {
    const date = new Date().toISOString().split('T')[0];
    const projectName = (project.name || 'Proyecto').replace(/[^a-zA-Z0-9]/g, '_');
    return `Protocolo_${projectName}_${date}.pdf`;
  }

  /**
   * Format project type for display
   */
  formatProjectType(type) {
    const types = {
      'residential': 'Residencial',
      'commercial': 'Comercial',
      'industrial': 'Industrial'
    };
    return types[type] || type || 'N/A';
  }

  /**
   * Format status for display
   */
  formatStatus(status) {
    const statuses = {
      'draft': 'Borrador',
      'active': 'Activo',
      'completed': 'Completado',
      'archived': 'Archivado'
    };
    return statuses[status] || status || 'N/A';
  }

  /**
   * Format date for display
   */
  formatDate(date) {
    if (!date) return 'N/A';
    
    try {
      if (date.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('es-ES');
      }
      return new Date(date).toLocaleDateString('es-ES');
    } catch (error) {
      return 'N/A';
    }
  }
}

// Create and export singleton instance
const pdfExportService = new PDFExportService();
export default pdfExportService;

// Export individual methods for convenience
export const {
  exportProjectProtocol,
  exportElementToPDF
} = pdfExportService;
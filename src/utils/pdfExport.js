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
        title: `Protocolo de Ensayos - ${project.name}`,
        subject: 'Protocolo de Ensayos Eléctricos',
        author: project.client_name || 'Calculadora Eléctrica',
        keywords: 'electrical,testing,protocol,IEC60364',
        creator: 'Calculadora Eléctrica V2'
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
   * Export specific element to PDF using html2canvas
   * @param {string} elementId - ID of the element to export
   * @param {Object} project - Project data
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportElementToPDF(elementId, project, options = {}) {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Elemento no encontrado');
      }

      const config = { ...this.defaultOptions, ...options };
      
      // Capture element as canvas
      const canvas = await html2canvas(element, {
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Set document properties
      pdf.setProperties({
        title: `Protocolo de Ensayos - ${project.name}`,
        subject: 'Protocolo de Ensayos Eléctricos',
        author: project.client_name || 'Calculadora Eléctrica',
        keywords: 'electrical,testing,protocol,IEC60364',
        creator: 'Calculadora Eléctrica V2'
      });

      let position = 0;

      // Add image to PDF, creating new pages if needed
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      const filename = this.generateFilename(project);
      pdf.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Error generating PDF from element:', error);
      throw new Error('Error al generar el PDF: ' + error.message);
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
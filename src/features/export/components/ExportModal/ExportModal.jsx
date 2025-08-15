import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import { Button, Modal } from '../../../../components/ui';
import { ExcelExporter } from '../../services/excelExport';
import { PDFExporter } from '../../services/pdfExport';
import toast from 'react-hot-toast';

const ExportModal = ({ isOpen, onClose, projectData, calculationsData }) => {
  const [exportType, setExportType] = useState('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeSummary: true,
    includeDPMS: true,
    includeLoads: true,
    includeThermal: true,
    includeVoltageDrops: true,
    includeShortCircuit: true
  });

  const handleExport = async () => {
    if (!projectData || !calculationsData) {
      toast.error('No hay datos para exportar');
      return;
    }

    setIsExporting(true);
    
    try {
      // Filter data based on export options
      const filteredData = {
        dpms: exportOptions.includeDPMS ? calculationsData.dpms : [],
        loadsByPanel: exportOptions.includeLoads ? calculationsData.loadsByPanel : [],
        thermal: exportOptions.includeThermal ? calculationsData.thermal : [],
        voltageDrops: exportOptions.includeVoltageDrops ? calculationsData.voltageDrops : [],
        shortCircuit: exportOptions.includeShortCircuit ? calculationsData.shortCircuit : []
      };

      const filename = `${projectData.name || 'proyecto'}-${new Date().toISOString().split('T')[0]}`;

      if (exportType === 'excel') {
        const exporter = new ExcelExporter();
        exporter.exportProject(projectData, filteredData);
        exporter.downloadFile(`${filename}.xlsx`);
        toast.success('Archivo Excel descargado exitosamente');
      } else if (exportType === 'pdf') {
        const exporter = new PDFExporter();
        exporter.exportProject(projectData, filteredData);
        exporter.downloadFile(`${filename}.pdf`);
        toast.success('Archivo PDF descargado exitosamente');
      }

      onClose();
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const getDataCounts = () => {
    return {
      dpms: calculationsData?.dpms?.length || 0,
      loads: calculationsData?.loadsByPanel?.length || 0,
      thermal: calculationsData?.thermal?.length || 0,
      voltageDrops: calculationsData?.voltageDrops?.length || 0,
      shortCircuit: calculationsData?.shortCircuit?.length || 0
    };
  };

  const counts = getDataCounts();
  const hasData = Object.values(counts).some(count => count > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exportar Proyecto"
      size="lg"
    >
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Formato de Exportación</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setExportType('excel')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                exportType === 'excel'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <FileSpreadsheet className={`w-8 h-8 ${
                  exportType === 'excel' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">Excel (.xlsx)</span>
                <span className="text-sm text-gray-500">Datos tabulares editables</span>
              </div>
            </button>

            <button
              onClick={() => setExportType('pdf')}
              className={`p-4 border-2 rounded-lg transition-colors ${
                exportType === 'pdf'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <FileText className={`w-8 h-8 ${
                  exportType === 'pdf' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">PDF</span>
                <span className="text-sm text-gray-500">Reporte profesional</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Contenido a Incluir
          </h3>
          
          {!hasData ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay datos de cálculos para exportar.</p>
              <p className="text-sm mt-1">Completa algunos cálculos antes de exportar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exportOptions.includeSummary && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="summary"
                      checked={exportOptions.includeSummary}
                      onChange={() => handleOptionChange('includeSummary')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="summary" className="ml-3 text-sm font-medium text-gray-700">
                      Resumen del Proyecto
                    </label>
                  </div>
                  <span className="text-xs text-gray-500">Información general</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dpms"
                    checked={exportOptions.includeDPMS}
                    onChange={() => handleOptionChange('includeDPMS')}
                    disabled={counts.dpms === 0}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="dpms" className="ml-3 text-sm font-medium text-gray-700">
                    DPMS - Potencia Máxima Simultánea
                  </label>
                </div>
                <span className="text-xs text-gray-500">
                  {counts.dpms} elemento{counts.dpms !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="loads"
                    checked={exportOptions.includeLoads}
                    onChange={() => handleOptionChange('includeLoads')}
                    disabled={counts.loads === 0}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="loads" className="ml-3 text-sm font-medium text-gray-700">
                    Cargas por Tablero
                  </label>
                </div>
                <span className="text-xs text-gray-500">
                  {counts.loads} elemento{counts.loads !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="thermal"
                    checked={exportOptions.includeThermal}
                    onChange={() => handleOptionChange('includeThermal')}
                    disabled={counts.thermal === 0}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="thermal" className="ml-3 text-sm font-medium text-gray-700">
                    Cálculo Térmico
                  </label>
                </div>
                <span className="text-xs text-gray-500">
                  {counts.thermal} elemento{counts.thermal !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="voltageDrops"
                    checked={exportOptions.includeVoltageDrops}
                    onChange={() => handleOptionChange('includeVoltageDrops')}
                    disabled={counts.voltageDrops === 0}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="voltageDrops" className="ml-3 text-sm font-medium text-gray-700">
                    Caída de Tensión
                  </label>
                </div>
                <span className="text-xs text-gray-500">
                  {counts.voltageDrops} elemento{counts.voltageDrops !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shortCircuit"
                    checked={exportOptions.includeShortCircuit}
                    onChange={() => handleOptionChange('includeShortCircuit')}
                    disabled={counts.shortCircuit === 0}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="shortCircuit" className="ml-3 text-sm font-medium text-gray-700">
                    Cortocircuito
                  </label>
                </div>
                <span className="text-xs text-gray-500">
                  {counts.shortCircuit} elemento{counts.shortCircuit !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={isExporting || !hasData}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : `Exportar ${exportType.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal;
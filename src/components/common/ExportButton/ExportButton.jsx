import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../../ui';
import ExportModal from '../../../features/export/components/ExportModal';

const ExportButton = ({ projectData, calculationsData, variant = "secondary", size = "md" }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const hasData = calculationsData && (
    (calculationsData.dpms && calculationsData.dpms.length > 0) ||
    (calculationsData.loadsByPanel && calculationsData.loadsByPanel.length > 0) ||
    (calculationsData.thermal && calculationsData.thermal.length > 0) ||
    (calculationsData.voltageDrops && calculationsData.voltageDrops.length > 0) ||
    (calculationsData.shortCircuit && calculationsData.shortCircuit.length > 0)
  );

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowExportModal(true)}
        disabled={!hasData}
        title={hasData ? 'Exportar proyecto' : 'No hay datos para exportar'}
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectData={projectData}
        calculationsData={calculationsData}
      />
    </>
  );
};

export default ExportButton;
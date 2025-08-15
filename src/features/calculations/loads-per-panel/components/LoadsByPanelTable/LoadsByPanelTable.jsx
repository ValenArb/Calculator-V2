import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Table } from '../../../../../components/ui';
import { 
  addLoadsByPanelRow, 
  updateLoadsByPanelRow, 
  deleteLoadsByPanelRow
} from '../../../../../store/slices/calculationsSlice';

const LoadsByPanelTable = () => {
  const dispatch = useDispatch();
  const { loadsByPanel } = useSelector((state) => state.calculations);

  const tiposCarga = ['Normal', 'Emergencia', 'Crítica'];
  const tiposAlimentacion = ['RN', 'SN', 'TN', 'RS', 'ST', 'RT', 'RST', 'RSTN'];

  const handleCellChange = (rowIndex, field, value) => {
    const row = loadsByPanel[rowIndex];
    dispatch(updateLoadsByPanelRow({ id: row.id, field, value }));
  };

  const handleAddRow = () => {
    dispatch(addLoadsByPanelRow());
  };

  const handleDeleteRow = (rowId) => {
    dispatch(deleteLoadsByPanelRow(rowId));
  };

  const calculatePotenciaActiva = (potenciaAparente, cosPhi) => {
    return (potenciaAparente * cosPhi).toFixed(2);
  };

  const calculateCorriente = (potenciaAparente, alimentacion) => {
    // Cálculo de corriente según tipo de alimentación
    if (potenciaAparente <= 0) return '0';
    
    let corriente = 0;
    
    if (alimentacion === 'RSTN' || alimentacion === 'RST') {
      // Trifásica: I = P / (√3 * V_línea)
      const tensionLinea = 380; // V línea a línea
      corriente = (potenciaAparente * 1000) / (Math.sqrt(3) * tensionLinea);
    } else if (alimentacion === 'RS' || alimentacion === 'ST' || alimentacion === 'RT') {
      // Bifásica: I = P / V_línea
      const tensionLinea = 380; // V línea a línea
      corriente = (potenciaAparente * 1000) / tensionLinea;
    } else {
      // Monofásica: I = P / V_fase
      const tensionFase = 220; // V fase a neutro
      corriente = (potenciaAparente * 1000) / tensionFase;
    }
    
    return corriente.toFixed(2);
  };

  const columns = [
    {
      key: 'identificacionTablero',
      title: 'Identificación Tablero',
      width: '180px',
      editable: true,
      placeholder: 'ej. TD-01'
    },
    {
      key: 'lineaOCarga',
      title: 'Línea o Carga a Alimentar',
      width: '200px',
      editable: true,
      placeholder: 'ej. Iluminación Oficina'
    },
    {
      key: 'tipoCarga',
      title: 'Tipo de Carga',
      width: '120px',
      render: (value, row, rowIndex) => (
        <select
          value={value || 'Normal'}
          onChange={(e) => handleCellChange(rowIndex, 'tipoCarga', e.target.value)}
          className="table-cell-input"
        >
          {tiposCarga.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      )
    },
    {
      key: 'alimentacion',
      title: 'Alimentación',
      width: '100px',
      render: (value, row, rowIndex) => (
        <select
          value={value || 'RN'}
          onChange={(e) => handleCellChange(rowIndex, 'alimentacion', e.target.value)}
          className="table-cell-input"
        >
          <option value="">Seleccionar...</option>
          {tiposAlimentacion.map(tipo => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
      )
    },
    {
      key: 'potenciaAparente',
      title: 'Potencia Aparente (kVA)',
      width: '150px',
      type: 'number',
      editable: true,
      placeholder: '0.00'
    },
    {
      key: 'cosPhi',
      title: 'cos φ',
      width: '80px',
      type: 'number',
      editable: true,
      placeholder: '0.92'
    },
    {
      key: 'potenciaActiva',
      title: 'Potencia Activa (kW)',
      width: '150px',
      editable: false,
      render: (value, row) => calculatePotenciaActiva(row.potenciaAparente || 0, row.cosPhi || 0)
    },
    {
      key: 'corriente',
      title: 'Corriente Est. (A)',
      width: '130px',
      editable: false,
      render: (value, row) => calculateCorriente(row.potenciaAparente || 0, row.alimentacion || 'RN')
    },
    {
      key: 'actions',
      title: 'Acciones',
      width: '100px',
      editable: false,
      render: (value, row) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteRow(row.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )
    }
  ];

  // Calculate totals
  const totals = loadsByPanel.reduce((acc, item) => {
    acc.potenciaAparente += item.potenciaAparente || 0;
    acc.potenciaActiva += (item.potenciaAparente || 0) * (item.cosPhi || 0);
    return acc;
  }, { potenciaAparente: 0, potenciaActiva: 0 });

  // Group by tablero for summary
  const tableroSummary = loadsByPanel.reduce((acc, item) => {
    const tablero = item.identificacionTablero || 'Sin especificar';
    if (!acc[tablero]) {
      acc[tablero] = { potenciaAparente: 0, potenciaActiva: 0, count: 0 };
    }
    acc[tablero].potenciaAparente += item.potenciaAparente || 0;
    acc[tablero].potenciaActiva += (item.potenciaAparente || 0) * (item.cosPhi || 0);
    acc[tablero].count += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Cargas por Tablero</h2>
        <Button onClick={handleAddRow}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Carga
        </Button>
      </div>

      <Table
        columns={columns}
        data={loadsByPanel}
        onCellChange={handleCellChange}
        editable={true}
        className="mb-6"
      />

      {/* Totals Summary */}
      {loadsByPanel.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Totals */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Totales Generales</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-800">Potencia Aparente Total:</span>
                <span className="font-medium text-blue-900">{totals.potenciaAparente.toFixed(2)} kVA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Potencia Activa Total:</span>
                <span className="font-medium text-blue-900">{totals.potenciaActiva.toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Factor de Potencia Promedio:</span>
                <span className="font-medium text-blue-900">
                  {totals.potenciaAparente > 0 ? (totals.potenciaActiva / totals.potenciaAparente).toFixed(3) : '0.000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Total de Cargas:</span>
                <span className="font-medium text-blue-900">{loadsByPanel.length}</span>
              </div>
            </div>
          </div>

          {/* Summary by Tablero */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-3">Resumen por Tablero</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(tableroSummary).map(([tablero, data]) => (
                <div key={tablero} className="bg-white rounded p-3 border border-green-100">
                  <div className="font-medium text-green-900 mb-1">{tablero}</div>
                  <div className="text-sm text-green-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Cargas:</span>
                      <span>{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P. Aparente:</span>
                      <span>{data.potenciaAparente.toFixed(2)} kVA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P. Activa:</span>
                      <span>{data.potenciaActiva.toFixed(2)} kW</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {loadsByPanel.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">⚡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cargas definidas</h3>
          <p className="text-gray-600 mb-4">Agrega las cargas eléctricas para cada tablero del proyecto</p>
          <Button onClick={handleAddRow}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Carga
          </Button>
        </div>
      )}
    </div>
  );
};

export default LoadsByPanelTable;
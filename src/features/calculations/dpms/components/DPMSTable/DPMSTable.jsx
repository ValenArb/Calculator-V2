import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2 } from 'lucide-react';
import { Button, Table } from '../../../../../components/ui';
import { 
  addDPMSRow, 
  updateDPMSRow, 
  deleteDPMSRow,
  addDPMSCarge,
  updateDPMSCarge,
  deleteDPMSCarge
} from '../../../../../store/slices/calculationsSlice';

const DPMSTable = () => {
  const dispatch = useDispatch();
  const { dpms } = useSelector((state) => state.calculations);

  const gradosElectrificacion = [
    'Básico',
    'Medio',
    'Superior',
    'Especial'
  ];

  const tiposCargas = ['TUG', 'IUG', 'ATE', 'ACU', 'TUE', 'OCE'];
  const fases = ['RN-GE', 'SN-GE', 'TN-GE', 'RSTN-GE'];

  const handleCellChange = (rowIndex, field, value) => {
    const row = dpms[rowIndex];
    dispatch(updateDPMSRow({ id: row.id, field, value }));
  };

  const handleAddRow = () => {
    dispatch(addDPMSRow());
  };

  const handleDeleteRow = (rowId) => {
    dispatch(deleteDPMSRow(rowId));
  };

  const calculateSuperficie = (row) => {
    return row.dimensiones.x * row.dimensiones.y;
  };

  const columns = [
    {
      key: 'denominacionTablero',
      title: 'Denominación Tablero',
      width: '150px',
      editable: true
    },
    {
      key: 'denominacionAmbiente',
      title: 'Denominación Ambiente',
      width: '150px',
      editable: true
    },
    {
      key: 'dimensiones.x',
      title: 'X [m]',
      width: '80px',
      type: 'number',
      editable: true
    },
    {
      key: 'dimensiones.y',
      title: 'Y [m]',
      width: '80px',
      type: 'number',
      editable: true
    },
    {
      key: 'dimensiones.h',
      title: 'h [m]',
      width: '80px',
      type: 'number',
      editable: true
    },
    {
      key: 'superficie',
      title: 'Superficie [m²]',
      width: '120px',
      editable: false,
      render: (value, row) => calculateSuperficie(row).toFixed(2)
    },
    {
      key: 'gradoElectrificacion',
      title: 'Grado Electrificación',
      width: '150px',
      render: (value, row, rowIndex) => (
        <select
          value={value || ''}
          onChange={(e) => handleCellChange(rowIndex, 'gradoElectrificacion', e.target.value)}
          className="table-cell-input"
        >
          <option value="">Seleccionar...</option>
          {gradosElectrificacion.map(grado => (
            <option key={grado} value={grado}>{grado}</option>
          ))}
        </select>
      )
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">DPMS - Determinación de la Potencia Máxima Simultánea</h2>
        <Button onClick={handleAddRow}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar Fila
        </Button>
      </div>

      <Table
        columns={columns}
        data={dpms}
        onCellChange={handleCellChange}
        editable={true}
        className="mb-8"
      />

      {/* Detail Tables for each DPMS row */}
      {dpms.map((row, rowIndex) => (
        <div key={row.id} className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">
            Cargas para: {row.denominacionTablero || `Tablero ${rowIndex + 1}`}
          </h3>
          
          {tiposCargas.map(tipoCarga => (
            <div key={tipoCarga} className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-medium text-gray-700">{tipoCarga}</h4>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => dispatch(addDPMSCarge({ rowId: row.id, cargeType: tipoCarga }))}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar {tipoCarga}
                </Button>
              </div>
              
              {row.cargas[tipoCarga].length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="table-header">Cantidad Bocas</th>
                        <th className="table-header">ID Circuito</th>
                        <th className="table-header">DPMS [VA]</th>
                        <th className="table-header">Fase</th>
                        <th className="table-header">Corriente [A]</th>
                        <th className="table-header">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {row.cargas[tipoCarga].map((carge) => (
                        <tr key={carge.id}>
                          <td className="table-cell">
                            <input
                              type="number"
                              value={carge.cantidadBocas}
                              onChange={(e) => dispatch(updateDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id,
                                field: 'cantidadBocas',
                                value: parseInt(e.target.value) || 0
                              }))}
                              className="table-cell-input"
                            />
                          </td>
                          <td className="table-cell">
                            <input
                              type="text"
                              value={carge.identificacionCircuito}
                              onChange={(e) => dispatch(updateDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id,
                                field: 'identificacionCircuito',
                                value: e.target.value
                              }))}
                              className="table-cell-input"
                            />
                          </td>
                          <td className="table-cell">
                            <input
                              type="number"
                              value={carge.dpms}
                              onChange={(e) => dispatch(updateDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id,
                                field: 'dpms',
                                value: parseFloat(e.target.value) || 0
                              }))}
                              className="table-cell-input"
                            />
                          </td>
                          <td className="table-cell">
                            <select
                              value={carge.fase}
                              onChange={(e) => dispatch(updateDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id,
                                field: 'fase',
                                value: e.target.value
                              }))}
                              className="table-cell-input"
                            >
                              <option value="">Seleccionar...</option>
                              {fases.map(fase => (
                                <option key={fase} value={fase}>{fase}</option>
                              ))}
                            </select>
                          </td>
                          <td className="table-cell">
                            <input
                              type="number"
                              value={carge.corriente}
                              onChange={(e) => dispatch(updateDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id,
                                field: 'corriente',
                                value: parseFloat(e.target.value) || 0
                              }))}
                              className="table-cell-input"
                              step="0.01"
                            />
                          </td>
                          <td className="table-cell">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => dispatch(deleteDPMSCarge({
                                rowId: row.id,
                                cargeType: tipoCarga,
                                cargeId: carge.id
                              }))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DPMSTable;
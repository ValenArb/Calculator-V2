import { forwardRef, useMemo } from 'react';
import classNames from 'classnames';

const Table = forwardRef(({ 
  columns = [], 
  data = [], 
  onCellChange,
  editable = false,
  className = '',
  ...props 
}, ref) => {
  const memoizedData = useMemo(() => data, [data]);

  const handleCellChange = (rowIndex, columnKey, value) => {
    if (onCellChange) {
      onCellChange(rowIndex, columnKey, value);
    }
  };

  return (
    <div className={classNames('overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg', className)}>
      <table ref={ref} className="min-w-full divide-y divide-gray-300" {...props}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="table-header"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {memoizedData.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="table-cell">
                  {editable && column.editable !== false ? (
                    <input
                      type={column.type || 'text'}
                      value={row[column.key] || ''}
                      onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                      className="table-cell-input"
                      placeholder={column.placeholder}
                    />
                  ) : (
                    <span>{column.render ? column.render(row[column.key], row) : row[column.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

Table.displayName = 'Table';

export default Table;
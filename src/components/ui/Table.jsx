'use client';

import React from 'react';
import EmptyState from './EmptyState';
import { FileQuestion } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = 'No records found',
  emptyDescription = 'There are no items matching your request.',
  loading = false,
  className = ''
}) {
  if (loading) {
    return (
      <div className="table-container p-6 text-center">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: 48, width: '100%' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`table-container ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  width: col.width || 'auto',
                  textAlign: col.align || 'left'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((col, colIdx) => {
                const cellRenderer = col.cell || col.render;
                const accessorKey = col.accessorKey || col.accessor;
                return (
                  <td
                    key={colIdx}
                    style={{
                      textAlign: col.align || 'left'
                    }}
                  >
                    {cellRenderer ? cellRenderer(row) : (accessorKey ? row[accessorKey] : null)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

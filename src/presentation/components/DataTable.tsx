import type { ReactNode } from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = 'No hay datos disponibles',
}: DataTableProps<T>) {
  return (
    <div className="panel-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-primary-light/55">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-primary font-semibold whitespace-nowrap tracking-wide ${
                    column.className ?? ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={getRowKey(row)} className="border-t border-gray-100 hover:bg-primary-light/20 transition">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 align-middle whitespace-nowrap ${
                        column.className ?? ''
                      }`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

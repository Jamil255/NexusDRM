import React from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onPageChange?: (newPage: number) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  loading,
  total = 0,
  page = 1,
  limit = 10,
  onPageChange,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="glass-card rounded-xl border border-dark-800/60 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-900/80 border-b border-dark-800/80 text-dark-300 text-xs font-semibold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800/40 text-sm">
            {loading ? (
              // Skeleton Rows
              Array.from({ length: limit }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-dark-850 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-dark-500 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-dark-900/40 hover:text-dark-50 transition-colors duration-150"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4 text-dark-200 font-medium">
                      {col.render ? col.render(row) : col.accessor ? (row[col.accessor] as any) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {onPageChange && totalPages > 1 && (
        <div className="bg-dark-900/50 border-t border-dark-800/60 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-dark-400 font-semibold">
            Showing <span className="text-dark-200 font-bold">{Math.min((page - 1) * limit + 1, total)}</span> to{' '}
            <span className="text-dark-200 font-bold">{Math.min(page * limit, total)}</span> of{' '}
            <span className="text-dark-200 font-bold">{total}</span> records
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-850 border border-dark-800 hover:border-brand-500/30 text-dark-300 disabled:opacity-40 disabled:hover:border-dark-800 transition-all cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pIdx = idx + 1;
              const isCurrent = pIdx === page;
              return (
                <button
                  key={pIdx}
                  onClick={() => onPageChange(pIdx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-brand-500 text-dark-950 shadow-md shadow-brand-500/20'
                      : 'bg-dark-850 border border-dark-800 hover:border-brand-500/30 text-dark-300'
                  }`}
                >
                  {pIdx}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-dark-850 border border-dark-800 hover:border-brand-500/30 text-dark-300 disabled:opacity-40 disabled:hover:border-dark-800 transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

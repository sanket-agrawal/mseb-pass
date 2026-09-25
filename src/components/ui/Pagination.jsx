'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  loading = false,
  className = '',
  itemName = 'passes'
}) {
  if (totalItems === 0 && totalPages <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
        end = totalPages - 1;
      }

      if (start > 2) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page) => {
    if (loading || page === currentPage || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div
      className={`pagination-container ${className}`}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '0.875rem 1.25rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '1.25rem',
        userSelect: 'none'
      }}
    >
      {/* Items count summary & Page Size selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-600)',
            fontWeight: 500
          }}
        >
          Showing{' '}
          <strong style={{ color: 'var(--gray-900)', fontWeight: 700 }}>
            {startItem}-{endItem}
          </strong>{' '}
          of{' '}
          <strong style={{ color: 'var(--gray-900)', fontWeight: 700 }}>
            {totalItems}
          </strong>{' '}
          {itemName}
        </span>

        {onPageSizeChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label
              htmlFor="pageSizeSelect"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--gray-500)',
                fontWeight: 500
              }}
            >
              Show:
            </label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              style={{
                padding: '4px 8px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--gray-700)',
                backgroundColor: 'var(--gray-50)',
                border: '1px solid var(--gray-300)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page Navigation Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {/* First Page button */}
        <button
          onClick={() => handlePageClick(1)}
          disabled={currentPage <= 1 || loading}
          title="First Page"
          aria-label="First Page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: currentPage <= 1 ? 'var(--gray-300)' : 'var(--gray-700)',
            cursor: currentPage <= 1 || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronsLeft style={{ width: 16, height: 16 }} />
        </button>

        {/* Previous Page button */}
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          title="Previous Page"
          aria-label="Previous Page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '0 8px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: currentPage <= 1 ? 'var(--gray-300)' : 'var(--gray-700)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: currentPage <= 1 || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronLeft style={{ width: 16, height: 16 }} />
          <span className="pagination-btn-text">Prev</span>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (typeof page === 'string' && page.startsWith('ellipsis')) {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: '0 6px',
                  color: 'var(--gray-400)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600
                }}
              >
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={loading}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                padding: '0 8px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 700 : 600,
                border: isActive
                  ? '1px solid var(--primary-600)'
                  : '1px solid var(--border-color)',
                backgroundColor: isActive
                  ? 'var(--primary-600)'
                  : 'var(--bg-surface)',
                color: isActive ? '#ffffff' : 'var(--gray-700)',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: isActive
                  ? '0 2px 4px rgba(37, 99, 235, 0.25)'
                  : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page button */}
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          title="Next Page"
          aria-label="Next Page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '0 8px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: currentPage >= totalPages ? 'var(--gray-300)' : 'var(--gray-700)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: currentPage >= totalPages || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="pagination-btn-text">Next</span>
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>

        {/* Last Page button */}
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage >= totalPages || loading}
          title="Last Page"
          aria-label="Last Page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            color: currentPage >= totalPages ? 'var(--gray-300)' : 'var(--gray-700)',
            cursor: currentPage >= totalPages || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <ChevronsRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}

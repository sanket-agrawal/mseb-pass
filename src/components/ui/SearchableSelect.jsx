'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export default function SearchableSelect({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Select or search...',
  error,
  required = false,
  disabled = false,
  allowCustom = true,
  className = '',
  id,
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find matching option for current value
  const currentOption = options.find(
    (opt) => (typeof opt === 'object' ? opt.value : opt) === value
  );

  // Sync search term with value or selected option label
  useEffect(() => {
    if (!isOpen) {
      if (currentOption) {
        setSearchTerm(typeof currentOption === 'object' ? currentOption.label : currentOption);
      } else {
        setSearchTerm(value || '');
      }
    }
  }, [value, isOpen, currentOption]);

  // Measure position for fixed portal placement at document root level
  const updatePosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setPopoverPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleScrollOrResize() {
      updatePosition();
    }

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  // Close dropdown on click outside (checking both input container and portal menu)
  useEffect(() => {
    function handleClickOutside(event) {
      const cleanId = selectId.replace(/:/g, '');
      const portalEl = document.querySelector(`.popover-portal-${cleanId}`);

      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        portalEl &&
        !portalEl.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectId]);

  // Filter options based on search input
  const filteredOptions = options.filter((opt) => {
    if (!searchTerm || !isOpen) return true;
    const term = searchTerm.toLowerCase().trim();
    if (typeof opt === 'object') {
      const valMatch = (opt.value || '').toString().toLowerCase().includes(term);
      const labelMatch = (opt.label || '').toString().toLowerCase().includes(term);
      const subtextMatch = (opt.subtext || '').toString().toLowerCase().includes(term);
      return valMatch || labelMatch || subtextMatch;
    }
    return opt.toString().toLowerCase().includes(term);
  });

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    updatePosition();
    if (allowCustom && onChange) {
      onChange(val, null);
    }
  };

  const handleSelectOption = (opt) => {
    const optValue = typeof opt === 'object' ? opt.value : opt;
    const optLabel = typeof opt === 'object' ? opt.label : opt;
    const optData = typeof opt === 'object' ? opt.data || opt : opt;

    setSearchTerm(optLabel);
    setIsOpen(false);
    if (onChange) {
      onChange(optValue, optData);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    if (onChange) onChange('', null);
    setIsOpen(true);
    updatePosition();
  };

  const cleanPortalClass = `popover-portal-${selectId.replace(/:/g, '')}`;

  const popoverMenu = (
    <div
      className={cleanPortalClass}
      style={{
        position: 'fixed',
        top: `${popoverPos.top}px`,
        left: `${popoverPos.left}px`,
        width: `${popoverPos.width}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow:
          '0 14px 35px -5px rgba(0, 0, 0, 0.22), 0 8px 14px -6px rgba(0, 0, 0, 0.15)',
        maxHeight: '260px',
        overflowY: 'auto',
        zIndex: 999999,
        padding: '6px',
      }}
    >
      {filteredOptions.length > 0 ? (
        filteredOptions.map((opt, idx) => {
          const optVal = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          const optSubtext = typeof opt === 'object' ? opt.subtext : null;
          const isSelected = optVal === value;

          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(opt)}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                borderRadius: '6px',
                backgroundColor: isSelected ? '#e0e7ff' : 'transparent',
                color: isSelected ? '#3730a3' : '#0f172a',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                marginBottom: idx < filteredOptions.length - 1 ? '2px' : '0',
                transition: 'background-color 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected ? '#3730a3' : '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {optLabel}
                </span>
                {isSelected && (
                  <Check style={{ width: 15, height: 15, color: '#4f46e5', flexShrink: 0 }} />
                )}
              </div>
              {optSubtext && (
                <span
                  style={{
                    fontSize: '11.5px',
                    color: isSelected ? '#4338ca' : '#64748b',
                    fontWeight: 400,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {optSubtext}
                </span>
              )}
            </div>
          );
        })
      ) : (
        <div
          style={{
            padding: '10px 12px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          No results found. {allowCustom ? 'Type custom value.' : ''}
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        position: 'relative',
        fontFamily: 'inherit',
      }}
    >
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            lineHeight: 1.4,
          }}
        >
          {label}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Combobox Trigger Input */}
      <div
        ref={inputRef}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}
      >
        <input
          id={selectId}
          type="text"
          disabled={disabled}
          value={searchTerm}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => {
            updatePosition();
            setIsOpen(true);
          }}
          style={{
            width: '100%',
            height: '40px',
            paddingLeft: '36px',
            paddingRight: searchTerm ? '52px' : '36px',
            fontSize: '13.5px',
            fontWeight: 500,
            color: '#0f172a',
            backgroundColor: disabled ? '#f1f5f9' : '#ffffff',
            border: `1px solid ${error ? '#ef4444' : isOpen ? '#6366f1' : '#cbd5e1'}`,
            borderRadius: '8px',
            outline: 'none',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            boxShadow: isOpen
              ? '0 0 0 3px rgba(99, 102, 241, 0.18)'
              : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            transition: 'all 0.15s ease-in-out',
          }}
          className={className}
        />

        {/* Search Icon */}
        <div
          style={{
            position: 'absolute',
            left: '11px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Search style={{ width: 16, height: 16 }} />
        </div>

        {/* Right Action Icons */}
        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#ffffff',
            paddingLeft: '2px',
          }}
        >
          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                borderRadius: '4px',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              title="Clear selection"
            >
              <X style={{ width: 14, height: 14 }} />
            </button>
          )}

          <ChevronDown
            style={{
              width: 16,
              height: 16,
              color: '#64748b',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* Render Popover via React Portal directly into document.body */}
      {isOpen && !disabled && mounted && createPortal(popoverMenu, document.body)}

      {error && (
        <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}

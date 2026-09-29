'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { Activity, AlertTriangle, CheckCircle, Flame, Layers } from 'lucide-react';

export default function SubdivisionStats({ stats = [] }) {
  if (!stats || stats.length === 0) {
    return null;
  }

  const getRiskConfig = (rate, level) => {
    if (rate >= 10 || level === 'critical') {
      return {
        label: 'Critical',
        marathiLabel: 'गंभीर बिघाड',
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#dc2626',
        barColor: '#ef4444',
        icon: Flame,
      };
    }
    if (rate >= 5 || level === 'warning') {
      return {
        label: 'Warning',
        marathiLabel: 'मध्यम बिघाड',
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#d97706',
        barColor: '#f59e0b',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Healthy',
      marathiLabel: 'सामान्य',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      text: '#16a34a',
      barColor: '#10b981',
      icon: CheckCircle,
    };
  };

  return (
    <Card style={{ marginBottom: '1.75rem' }}>
      {/* Header and Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.01em' }}>
              Sub-Division Failure Rate & Health Monitor
            </h3>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: '4px' }}>
            Ratio of outward replacement gatepasses to total installed DTC transformers (उपविभागानिहाय रोहित्र बिघाड दर)
          </p>
        </div>

        {/* Threshold Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              fontWeight: 600,
            }}
          >
            ● &lt; 5% Normal
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
              fontWeight: 600,
            }}
          >
            ● 5% - 9.9% Warning
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              fontWeight: 600,
            }}
          >
            ● ≥ 10% Critical
          </span>
        </div>
      </div>

      {/* Grid of Sub-Divisions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {stats.map((sd) => {
          const failureRate = Number(sd.failure_rate || 0);
          const config = getRiskConfig(failureRate, sd.risk_level);
          const RiskIcon = config.icon;

          // Scale bar for visual clarity (100% bar width corresponds to 15% failure rate max visual)
          const barWidth = Math.min(100, Math.max(failureRate > 0 ? 6 : 0, (failureRate / 15) * 100));

          return (
            <div
              key={sd.id || sd.name}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: `1px solid ${config.border}`,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle top indicator bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: config.barColor,
                }}
              />

              {/* Sub-division title and Risk Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--gray-900)', textTransform: 'uppercase' }}>
                    {sd.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Layers size={11} />
                    Sub-Division
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: config.bg,
                    border: `1px solid ${config.border}`,
                    color: config.text,
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  <RiskIcon size={12} />
                  <span>{config.label}</span>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 500 }}>
                    Failure Rate
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: config.text, letterSpacing: '-0.02em', marginTop: '2px' }}>
                    {failureRate.toFixed(2)}%
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>
                    Outward: <strong style={{ color: 'var(--gray-900)' }}>{sd.outward_gatepasses || 0}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Total Assets: <strong style={{ color: 'var(--gray-900)' }}>{(sd.total_assets || 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Progress Track */}
              <div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'var(--gray-100)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      backgroundColor: config.barColor,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px' }}>
                  <span>0%</span>
                  <span>5% Threshold</span>
                  <span>10% Threshold</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

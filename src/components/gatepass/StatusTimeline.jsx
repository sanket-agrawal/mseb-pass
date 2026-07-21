'use client';

import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { GATEPASS_STATUS } from '@/lib/constants';

const steps = [
  { id: GATEPASS_STATUS.DRAFT, label: 'Draft', marathi: 'मसुदा' },
  { id: GATEPASS_STATUS.ISSUED, label: 'Issued', marathi: 'निर्गमित' },
  { id: GATEPASS_STATUS.IN_TRANSIT, label: 'In Transit', marathi: 'मार्गावर' },
  { id: GATEPASS_STATUS.DELIVERED, label: 'Delivered', marathi: 'पोहोचले' },
  { id: GATEPASS_STATUS.COMPLETED, label: 'Completed', marathi: 'पूर्ण' }
];

const statusOrder = [
  GATEPASS_STATUS.DRAFT,
  GATEPASS_STATUS.ISSUED,
  GATEPASS_STATUS.IN_TRANSIT,
  GATEPASS_STATUS.DELIVERED,
  GATEPASS_STATUS.COMPLETED
];

export default function StatusTimeline({ currentStatus = GATEPASS_STATUS.DRAFT }) {
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div style={{ padding: '0.75rem 0', width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', minWidth: 460, padding: '0 8px' }}>
        {/* Background connector line */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 24,
            right: 24,
            height: 3,
            backgroundColor: 'var(--gray-200)',
            zIndex: 1
          }}
        />

        {steps.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: isPassed || isCurrent ? 'var(--primary-600)' : 'var(--bg-surface)',
                  color: isPassed || isCurrent ? '#ffffff' : 'var(--gray-400)',
                  border: `2px solid ${isPassed || isCurrent ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isCurrent ? '0 0 0 4px var(--primary-100)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isPassed ? (
                  <CheckCircle2 style={{ width: 16, height: 16 }} />
                ) : isCurrent ? (
                  <Clock style={{ width: 16, height: 16, animation: 'pulseGlow 1.5s infinite' }} />
                ) : (
                  <Circle style={{ width: 12, height: 12 }} />
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--primary-700)' : isPassed ? 'var(--gray-800)' : 'var(--gray-400)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {step.label}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--gray-500)', display: 'block', whiteSpace: 'nowrap' }}>
                  {step.marathi}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { GATEPASS_STATUS, GATEPASS_STATUS_CONFIG } from '@/lib/constants';
import { Check, Clock, CircleDot } from 'lucide-react';

const STAGES = [
  { key: GATEPASS_STATUS.ISSUED, label: 'Issued (निर्गमित)', description: 'Gate pass generated & dispatched' },
  { key: GATEPASS_STATUS.CREDITED, label: 'Credited (जमा)', description: 'Transformer returned / credited' },
  { key: GATEPASS_STATUS.COMPLETED, label: 'Completed (पूर्ण)', description: 'Job fully closed' },
];

export default function StatusTimeline({ currentStatus = 'issued' }) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '1.25rem 0' }}>
      {STAGES.map((stage, idx) => {
        const isDone = idx < activeIdx || currentStatus === 'completed';
        const isCurrent = idx === activeIdx && currentStatus !== 'completed';
        const isFuture = idx > activeIdx && currentStatus !== 'completed';

        return (
          <React.Fragment key={stage.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  backgroundColor: isDone ? 'var(--success-600, #059669)' : isCurrent ? 'var(--primary-600, #2563eb)' : 'var(--gray-200, #e5e7eb)',
                  color: isDone || isCurrent ? 'white' : 'var(--gray-500)',
                  boxShadow: isCurrent ? '0 0 0 4px var(--primary-100, #dbeafe)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isDone ? <Check size={18} /> : isCurrent ? <CircleDot size={18} /> : idx + 1}
              </div>
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: isCurrent || isDone ? 700 : 500, color: isCurrent ? 'var(--primary-700)' : isDone ? 'var(--success-700)' : 'var(--gray-500)' }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                  {stage.description}
                </div>
              </div>
            </div>

            {idx < STAGES.length - 1 && (
              <div
                style={{
                  height: '3px',
                  flex: 1,
                  backgroundColor: idx < activeIdx ? 'var(--success-600, #059669)' : 'var(--gray-200, #e5e7eb)',
                  margin: '0 8px',
                  marginBottom: '28px',
                  borderRadius: '2px',
                  transition: 'all 0.2s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

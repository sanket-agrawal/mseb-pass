'use client';

import React from 'react';
import { Zap } from 'lucide-react';

export default function GatePassPreview({ data, className = '' }) {
  if (!data) return null;

  const isOutward = data.type === 'outward';
  const materials = data.materials || [];

  return (
    <div className={`gatepass-preview ${className}`}>
      <div className="preview-container">
        {/* Header */}
        <div className="preview-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Zap style={{ width: 22, height: 22, color: 'var(--primary-700)', fill: 'currentColor' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्यादित (MSEDCL)
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, margin: 0 }}>
            गाळण शाखा-दोंडाईचा जि.धुळे (Sub Division Dondaicha, Dist. Dhule)
          </p>
          <div className="preview-pass-badge">
            गेट पास ({isOutward ? 'जावक / OUTWARD' : 'आवक / INWARD'})
          </div>
        </div>

        {/* Info Row: Serial & Date */}
        <div className="preview-info-row">
          <div>
            <span style={{ color: '#475569', fontWeight: 600 }}>क्रमांक (Serial No.): </span>
            <span style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
              {data.serial_number || data.id}
            </span>
          </div>
          <div>
            <span style={{ color: '#475569', fontWeight: 600 }}>दिनांक (Date): </span>
            <span style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
              {data.date}
            </span>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="preview-fields">
          <div className="field-row">
            <span className="field-label">प्रती (Recipient To):</span>
            <span className="field-value">
              {data.recipient_name} ({data.recipient_designation || 'Staff'}) — {data.destination_substation}, {data.destination_section}
            </span>
          </div>

          <div className="field-row">
            <span className="field-label">गाडी नं. (Vehicle No.):</span>
            <span className="field-value font-mono">{data.vehicle_number}</span>
          </div>

          <div className="field-row">
            <span className="field-label">सामान आणणाऱ्याचे नांव (Driver):</span>
            <span className="field-value">
              {data.driver_name} (मोबाईल: {data.driver_mobile})
            </span>
          </div>

          <div className="field-row">
            <span className="field-label">विजखात्यास/ठेकेदारास (Contractor):</span>
            <span className="field-value">{data.contractor_name}</span>
          </div>
        </div>

        {/* Material Table Header */}
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', margin: '14px 0 6px 0' }}>
          ✻ मालाचे वर्णन / ट्रान्सफार्मरचे वर्णन ✻
        </div>

        <table className="preview-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>अ.नं.</th>
              <th>मेक (Make)</th>
              <th>सि.नं. (Sr No)</th>
              <th>जॉब नं.</th>
              <th>क्षमता (KVA)</th>
              <th>गावाचे नांव / DTC नं.</th>
              <th>स्थिती</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, idx) => (
              <tr key={idx}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>{m.make || '-'}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.serial_number || '-'}</td>
                <td>{m.job_number || '-'}</td>
                <td style={{ fontWeight: 700, color: 'var(--primary-800)' }}>{m.capacity || '-'}</td>
                <td>{m.village_name} {m.dtc_number ? `(DTC: ${m.dtc_number})` : ''}</td>
                <td style={{ fontWeight: 600 }}>
                  {m.condition === 'faulty' ? 'दूषित/जळालेले' : m.condition === 'repaired' ? 'दुरुस्त' : 'नवीन'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Line Staff Section */}
        <div className="preview-staff-box">
          <strong>Destination Line Staff: </strong>
          {data.line_staff_name || 'N/A'} | <strong>Mob: </strong>{data.line_staff_mobile || 'N/A'} | <strong>CPF: </strong>{data.line_staff_cpf || 'N/A'}
        </div>

        {/* Condition Remarks */}
        <div className="preview-remarks">
          <strong>टिपणी / Condition Certificate: </strong>
          <span>{data.remarks}</span>
        </div>

        {/* Signatures */}
        <div className="preview-signatures">
          <div className="sig-column">
            <div className="sig-line">देणाऱ्याची सही व हुद्दा (Sender Signature)</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
              {data.sender_name} ({data.sender_designation})
            </div>
          </div>

          <div className="sig-column">
            <div className="sig-line">घेणाऱ्याची सही व हुद्दा (Receiver Signature)</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
              {data.receiver_name || data.line_staff_name || 'Receiver Signature'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="preview-footer">
          <span>Digital Gate Pass ID: <strong>{data.id}</strong></span>
          <span>Generated: {new Date().toLocaleString()}</span>
          <span>MSEDCL Sub Division Dondaicha</span>
        </div>
      </div>
    </div>
  );
}

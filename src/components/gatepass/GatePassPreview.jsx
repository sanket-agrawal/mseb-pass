'use client';

import React from 'react';
import LOGO_BASE64 from '@/lib/logoBase64';

export default function GatePassPreview({ data, className = '' }) {
  if (!data) return null;

  const isOutward = data.type === 'outward';
  const materials = data.materials || [];
  const officeName = data.from_office?.name || data.sender_designation || 'Sub Division Office';
  const divisionName = data.division?.name || data.destination_division || data.from_office?.division || data.from_office?.parent?.name || 'Dondaicha Division';
  const paperBgColor = isOutward ? '#FFF9C4' : '#FCE4EC';
  const paperBorderColor = isOutward ? '#1e293b' : '#be185d';

  return (
    <div className={`gatepass-preview ${isOutward ? 'outward' : 'inward'} ${className}`} style={{ backgroundColor: paperBgColor }}>
      <div className="preview-container" style={{ backgroundColor: paperBgColor, borderColor: paperBorderColor }}>
        {/* Header */}
        <div className="preview-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 4 }}>
            <img
              src={LOGO_BASE64}
              alt="Logo"
              style={{ height: 42, width: 'auto', objectFit: 'contain' }}
            />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्यादित
            </h2>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#1e3a5f', fontWeight: 700, margin: '2px 0' }}>
            विभाग (Division): {divisionName}
          </div>
          <p style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600, margin: 0 }}>
            {officeName} • Gate Pass System
          </p>
          <div
            className="preview-pass-badge"
            style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.95rem',
              fontWeight: 800,
              textDecoration: 'none',
              backgroundColor: isOutward ? 'var(--accent-100)' : 'var(--pink-100)',
              color: isOutward ? 'var(--accent-700)' : 'var(--pink-700)',
              border: isOutward ? '1px solid var(--accent-200)' : '1px solid var(--pink-200)'
            }}
          >
            गेटपास ({isOutward ? 'जावक / OUTWARD' : 'आवक / INWARD'})
          </div>
        </div>

        {/* Info Row: Serial & Date */}
        <div className="preview-info-row">
          <div>
            <span style={{ color: '#475569', fontWeight: 600 }}>गेटपास क्र. (Gate Pass ID): </span>
            <span style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
              {data.display_id || data.serial_number || data.id}
            </span>
          </div>
          <div>
            <span style={{ color: '#475569', fontWeight: 600 }}>दिनांक (Date): </span>
            <span style={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
              {data.date ? new Date(data.date).toISOString().split('T')[0] : ''}
            </span>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="preview-fields">
          <div className="field-row">
            <span className="field-label">प्रति (Recipient To):</span>
            <span className="field-value">
              {data.recipient_name} ({data.recipient_designation || 'Staff'}) — {data.destination_substation || 'Substation'}{data.destination_section ? `, ${data.destination_section}` : ''}
            </span>
          </div>

          <div className="field-row">
            <span className="field-label">गाडी क्र. (Vehicle No.):</span>
            <span className="field-value font-mono">{data.vehicle_number || 'TBD'}</span>
          </div>

          <div className="field-row">
            <span className="field-label">वाहन चालक (Driver):</span>
            <span className="field-value">
              {data.driver_name || 'TBD'} {data.driver_mobile ? `(Phone: ${data.driver_mobile})` : ''} {data.vehicle_number ? `[Vehicle No: ${data.vehicle_number}]` : ''}
            </span>
          </div>

          <div className="field-row">
            <span className="field-label">कंत्राटदार (Contractor):</span>
            <span className="field-value">{data.contractor_name || '-'}</span>
          </div>

          {(data.linked_gatepass_id || data.linked_gatepass?.display_id) && (
            <div className="field-row">
              <span className="field-label">संलग्न गेटपास (Linked Pass Ref):</span>
              <span className="field-value" style={{ fontWeight: 800, color: 'var(--primary-700)' }}>
                {data.linked_gatepass?.display_id || data.linked_gatepass_id}
              </span>
            </div>
          )}
        </div>

        {/* Material Table Header */}
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', margin: '14px 0 6px 0' }}>
          साहित्याचा तपशील / रोहित्र विवरण (Material Details)
        </div>

        <table className="preview-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>अ.क्र.</th>
              <th>कंपनी (Make)</th>
              <th>अनुक्रमांक (Sr No)</th>
              <th>जॉब क्र.</th>
              <th>क्षमता (KVA)</th>
              <th>गाव / DTC क्र.</th>
              <th>स्थिती</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, idx) => (
              <React.Fragment key={idx}>
                <tr>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{m.make || '-'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{m.serial_number || '-'}</td>
                  <td>{m.job_number || '-'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-800)' }}>{m.capacity || '-'}</td>
                  <td>{m.village_name} {m.dtc_number ? `(DTC: ${m.dtc_number})` : ''}</td>
                  <td style={{ fontWeight: 600 }}>
                    {m.condition === 'faulty' ? 'नादुरुस्त (Faulty)' : m.condition === 'repaired' ? 'दुरुस्त (Repaired)' : 'चांगले'}
                  </td>
                </tr>
                {/* Render Failed Job Record if present */}
                {m.failed_job_record && (
                  <tr>
                    <td colSpan={7} style={{ backgroundColor: '#fffbeb', padding: '6px 12px', fontSize: '11px', color: '#92400e' }}>
                      ⚠️ <strong>Failed Job Record:</strong> Warranty: <strong>{m.failed_job_record.warranty || 'GP'}</strong> | Oil Drain Serial: {m.failed_job_record.oil_drain_serial_number || 'N/A'} | Recorded By CPF: {m.failed_job_record.recorded_by_cpf}
                    </td>
                  </tr>
                )}
                {/* Render Healthy Job Record if present */}
                {m.healthy_job_record && (
                  <tr>
                    <td colSpan={7} style={{ backgroundColor: '#f0fdf4', padding: '6px 12px', fontSize: '11px', color: '#166534' }}>
                      ✅ <strong>Healthy Job Record:</strong> R-Phase: {m.healthy_job_record.ryb_r_reading}A | Y-Phase: {m.healthy_job_record.ryb_y_reading}A | B-Phase: {m.healthy_job_record.ryb_b_reading}A | Spark Test: {m.healthy_job_record.spark_test?.toUpperCase()} | Tested By CPF: {m.healthy_job_record.tested_by_cpf}
                    </td>
                  </tr>
                )}
              </React.Fragment>
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
          <strong>शेरा / Condition Certificate: </strong>
          <span>{data.remarks}</span>
        </div>

        {/* Signatures */}
        <div className="preview-signatures">
          <div className="sig-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: '#15803d', 
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '2px 6px',
              fontWeight: 700, 
              fontSize: '0.65rem', 
              marginBottom: 8
            }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✔</span> Digitally Signed
            </div>
            <div className="sig-line" style={{ width: '100%' }}>देणाऱ्याची स्वाक्षरी (Sender Signature)</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
              {data.sender_name || 'Sender'} ({data.sender_designation || 'Officer'})
            </div>
          </div>

          <div className="sig-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              color: '#15803d', 
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '2px 6px',
              fontWeight: 700, 
              fontSize: '0.65rem', 
              marginBottom: 8
            }}>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✔</span> Digitally Signed
            </div>
            <div className="sig-line" style={{ width: '100%' }}>घेणाऱ्याची स्वाक्षरी (Receiver Signature)</div>
            <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
              {data.receiver_name || (isOutward ? data.contractor_name : data.line_staff_name) || 'Receiver Signature'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="preview-footer">
          <span>Digital Gate Pass ID: <strong>{data.display_id || data.id}</strong></span>
          <span>Generated: {new Date().toLocaleString()}</span>
          <span>{officeName}</span>
        </div>
      </div>
    </div>
  );
}

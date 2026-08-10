'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    backgroundColor: '#FFF9C4', // Physical yellow gate pass paper color
    fontFamily: 'Helvetica'
  },
  container: {
    borderWidth: 2,
    borderColor: '#1e293b',
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    textAlign: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    paddingBottom: 8
  },
  orgTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#0f172a'
  },
  subTitle: {
    fontSize: 9.5,
    color: '#334155',
    marginBottom: 6
  },
  passBadgeOutward: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    padding: '3px 12px',
    borderRadius: 4,
    textAlign: 'center',
    marginTop: 4,
    alignSelf: 'center',
  },
  passBadgeInward: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#be185d',
    backgroundColor: '#fce7f3',
    padding: '3px 12px',
    borderRadius: 4,
    textAlign: 'center',
    marginTop: 4,
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1'
  },
  boldText: {
    fontWeight: 'bold',
    color: '#0f172a'
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center'
  },
  label: {
    width: 150,
    fontSize: 9.5,
    color: '#475569',
    fontWeight: 'bold'
  },
  value: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    paddingBottom: 2
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5E6A3',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 5,
    alignItems: 'center'
  },
  colSr: { width: '8%', textAlign: 'center', fontSize: 8.5 },
  colMake: { width: '15%', paddingLeft: 4, fontSize: 8.5 },
  colSrNo: { width: '18%', paddingLeft: 4, fontSize: 8.5, fontWeight: 'bold' },
  colJob: { width: '14%', paddingLeft: 4, fontSize: 8.5 },
  colCap: { width: '15%', paddingLeft: 4, fontSize: 8.5, fontWeight: 'bold' },
  colVillage: { width: '18%', paddingLeft: 4, fontSize: 8.5 },
  colRemarks: { width: '12%', paddingLeft: 4, fontSize: 8.5 },

  staffSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFFDE7',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4
  },
  remarksBox: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#FFFFFF',
    fontSize: 9,
    lineHeight: 1.4
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 26
  },
  sigBlock: {
    width: '45%',
    textAlign: 'center'
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    paddingTop: 4,
    fontSize: 9,
    fontWeight: 'bold'
  },
  footer: {
    marginTop: 12,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#64748b'
  }
});

// Helper to strip non-Latin / Devanagari characters so Helvetica font never throws WinAnsiEncoding error
function sanitizeText(str) {
  if (!str) return '';
  return String(str).replace(/[^\x00-\x7F]/g, '').trim();
}

export function GatePassPDF({ data }) {
  if (!data) return null;

  const isOutward = data.type === 'outward';
  const materials = data.materials || [];

  const recipientStr = sanitizeText(`${data.recipient_name || ''} ${data.recipient_designation ? `(${data.recipient_designation})` : ''} - ${data.destination_substation || ''}, ${data.destination_section || ''}`) || `${data.recipient_name || 'AE'} - ${data.destination_substation || 'Substation'}`;
  const driverStr = sanitizeText(`${data.driver_name || ''} (Mob: ${data.driver_mobile || ''})`) || `${data.driver_name || ''}`;
  const contractorStr = sanitizeText(data.contractor_name) || '-';
  const remarksStr = sanitizeText(data.remarks) || 'Inspected all transformer units. LT and HT Rods in good condition. No oil leakage.';

  return (
    <Document title={`MSEB_GatePass_${data.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.orgTitle}>
              MAHARASHTRA STATE ELECTRICITY DISTRIBUTION CO. LTD.
            </Text>
            <Text style={styles.subTitle}>
              Sub Division Dondaicha, Dist. Dhule (MSEDCL Dondaicha)
            </Text>
            <Text style={isOutward ? styles.passBadgeOutward : styles.passBadgeInward}>
              {isOutward ? 'GATE PASS (OUTWARD / JAVAK)' : 'GATE PASS (INWARD / AAVAK)'}
            </Text>
          </View>

          {/* Info Row: Serial & Date */}
          <View style={styles.infoRow}>
            <Text>
              Serial No. (Kramank): <Text style={styles.boldText}>{sanitizeText(data.serial_number || data.id)}</Text>
            </Text>
            <Text>
              Date (Dinank): <Text style={styles.boldText}>{data.date}</Text>
            </Text>
          </View>

          {/* Recipient & Transport Details */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Prati (Recipient To):</Text>
            <Text style={styles.value}>{recipientStr}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Gadi No. (Vehicle No.):</Text>
            <Text style={styles.value}>{sanitizeText(data.vehicle_number)}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Driver Name & Mob:</Text>
            <Text style={styles.value}>{driverStr}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Thekedaras (Contractor):</Text>
            <Text style={styles.value}>{contractorStr}</Text>
          </View>

          {(data.linked_gatepass_id || data.linked_gatepass?.display_id) && (
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Linked Pass Ref:</Text>
              <Text style={styles.value}>{sanitizeText(data.linked_gatepass?.display_id || data.linked_gatepass_id)}</Text>
            </View>
          )}

          {/* Material Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colSr}>Sr</Text>
              <Text style={styles.colMake}>Make</Text>
              <Text style={styles.colSrNo}>Sr. No.</Text>
              <Text style={styles.colJob}>Job No.</Text>
              <Text style={styles.colCap}>Capacity (KVA)</Text>
              <Text style={styles.colVillage}>Village / DTC</Text>
              <Text style={styles.colRemarks}>Condition</Text>
            </View>

            {materials.map((m, idx) => (
              <React.Fragment key={idx}>
                <View style={styles.tableRow}>
                  <Text style={styles.colSr}>{idx + 1}</Text>
                  <Text style={styles.colMake}>{sanitizeText(m.make) || '-'}</Text>
                  <Text style={styles.colSrNo}>{sanitizeText(m.serial_number) || '-'}</Text>
                  <Text style={styles.colJob}>{sanitizeText(m.job_number) || '-'}</Text>
                  <Text style={styles.colCap}>{sanitizeText(m.capacity) || '-'}</Text>
                  <Text style={styles.colVillage}>{sanitizeText(m.village_name || m.dtc_number) || '-'}</Text>
                  <Text style={styles.colRemarks}>{sanitizeText(m.condition) || 'OK'}</Text>
                </View>
                {m.failed_job_record && (
                  <View style={{ backgroundColor: '#fef2f2', padding: 4, paddingLeft: 10 }}>
                    <Text style={{ fontSize: 7.5, color: '#991b1b' }}>
                      Failed Job Record: GP: {sanitizeText(m.failed_job_record.gp_reading) || 'N/A'} | Fresh: {sanitizeText(m.failed_job_record.fresh_reading) || 'N/A'} | Oil Drain Sr: {sanitizeText(m.failed_job_record.oil_drain_serial_number) || 'N/A'} | Recorded By CPF: {sanitizeText(m.failed_job_record.recorded_by_cpf) || 'N/A'}
                    </Text>
                  </View>
                )}
                {m.healthy_job_record && (
                  <View style={{ backgroundColor: '#f0fdf4', padding: 4, paddingLeft: 10 }}>
                    <Text style={{ fontSize: 7.5, color: '#166534' }}>
                      Healthy Job Record: R-Phase: {sanitizeText(m.healthy_job_record.ryb_r_reading)}A | Y-Phase: {sanitizeText(m.healthy_job_record.ryb_y_reading)}A | B-Phase: {sanitizeText(m.healthy_job_record.ryb_b_reading)}A | Spark Test: {sanitizeText(m.healthy_job_record.spark_test).toUpperCase()} | Tested By CPF: {sanitizeText(m.healthy_job_record.tested_by_cpf) || 'N/A'}
                    </Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Line Staff Section */}
          <View style={styles.staffSection}>
            <Text style={{ fontSize: 9, color: '#334155', fontWeight: 'bold' }}>
              Destination Line Staff: {sanitizeText(data.line_staff_name) || 'N/A'} | Mob: {sanitizeText(data.line_staff_mobile) || 'N/A'} | CPF: {sanitizeText(data.line_staff_cpf) || 'N/A'}
            </Text>
          </View>

          {/* Condition Remarks */}
          <View style={styles.remarksBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>Condition Certificate / Remarks:</Text>
            <Text>{remarksStr}</Text>
          </View>

          {/* Signatures */}
          <View style={styles.signatures}>
            <View style={styles.sigBlock}>
              <Text style={styles.sigLine}>Denaryachi Sahi (Sender Signature)</Text>
              <Text style={{ fontSize: 8.5, color: '#475569', marginTop: 2 }}>
                {sanitizeText(data.sender_name)} ({sanitizeText(data.sender_designation)})
              </Text>
            </View>

            <View style={styles.sigBlock}>
              <Text style={styles.sigLine}>Ghenaryachi Sahi (Receiver Signature)</Text>
              <Text style={{ fontSize: 8.5, color: '#475569', marginTop: 2 }}>
                {sanitizeText(data.receiver_name || data.line_staff_name) || 'Receiver Signature'}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Digital Gate Pass ID: {data.id}</Text>
            <Text>Generated: {new Date().toISOString().split('T')[0]}</Text>
            <Text>Sub Division Dondaicha (Dhule)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default GatePassPDF;

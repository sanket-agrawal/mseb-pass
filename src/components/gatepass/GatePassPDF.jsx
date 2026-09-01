'use client';

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import LOGO_BASE64 from '@/lib/logoBase64';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  container: {
    borderWidth: 2,
    borderColor: '#1e293b',
    padding: 14,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#64748b',
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 8,
  },
  logo: {
    width: 38,
    height: 38,
    objectFit: 'contain',
    marginRight: 8,
  },
  orgTitle: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  divisionText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginTop: 2,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 8,
    color: '#334155',
    marginTop: 1,
    textAlign: 'center',
  },
  passBadgeOutward: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#b45309',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 5,
    alignSelf: 'center',
  },
  passBadgeInward: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#be185d',
    backgroundColor: '#fce7f3',
    borderColor: '#fbcfe8',
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 5,
    alignSelf: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 0.8,
    borderBottomColor: '#94a3b8',
  },
  boldUnderlineText: {
    fontWeight: 'bold',
    color: '#0f172a',
    textDecoration: 'underline',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4.5,
    alignItems: 'flex-start',
  },
  label: {
    width: 140,
    fontSize: 8.5,
    color: '#334155',
    fontWeight: 'bold',
  },
  value: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 0.8,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 1.5,
  },
  tableTitleBanner: {
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 6,
    marginBottom: 4,
  },
  table: {
    marginTop: 2,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#cbd5e1',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 3.5,
    paddingHorizontal: 2,
    fontWeight: 'bold',
    fontSize: 7.8,
    color: '#0f172a',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    paddingVertical: 3.5,
    paddingHorizontal: 2,
    fontSize: 7.8,
    color: '#0f172a',
  },
  colSr: { width: '6%', textAlign: 'center' },
  colMake: { width: '18%' },
  colSrNo: { width: '18%', fontWeight: 'bold' },
  colJob: { width: '12%' },
  colCap: { width: '14%', fontWeight: 'bold' },
  colVillage: { width: '18%' },
  colCondition: { width: '14%' },
  staffSection: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
    borderWidth: 1,
    padding: 5,
    borderRadius: 4,
    marginVertical: 4,
  },
  remarksBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 5,
    borderRadius: 4,
    marginVertical: 4,
    fontSize: 8,
    color: '#1e293b',
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#64748b',
  },
  sigBlock: {
    width: '46%',
    alignItems: 'center',
  },
  digitallySignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    marginBottom: 5,
  },
  sigLine: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    width: '100%',
    textAlign: 'center',
    paddingTop: 3,
    fontWeight: 'bold',
    fontSize: 8.5,
    color: '#0f172a',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#94a3b8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7.5,
    color: '#64748b',
  },
});

function sanitizeText(str) {
  if (!str) return '';
  return String(str).replace(/[^\x00-\x7F]/g, '').trim();
}

export function GatePassPDF({ data }) {
  if (!data) return null;

  const isOutward = data.type === 'outward';
  const materials = data.materials || [];
  const pageBg = isOutward ? '#FFF9C4' : '#FCE4EC';
  const borderColor = isOutward ? '#1e293b' : '#be185d';

  const recipientStr = sanitizeText(
    `${data.recipient_name || ''} ${data.recipient_designation ? `(${data.recipient_designation})` : ''} - ${data.destination_substation || ''}${data.destination_section ? `, ${data.destination_section}` : ''}`
  ) || `${data.recipient_name || 'AE'} - ${data.destination_substation || 'Substation'}`;

  const driverStr = sanitizeText(
    `${data.driver_name || 'TBD'} ${data.driver_mobile ? `(Phone: ${data.driver_mobile})` : ''} ${data.vehicle_number ? `[Vehicle No: ${data.vehicle_number}]` : ''}`
  );

  const contractorStr = sanitizeText(data.contractor_name) || '-';
  const remarksStr = sanitizeText(data.remarks) || 'Inspected all transformer units. LT and HT Rods in good condition. No oil leakage.';
  const divisionName = sanitizeText(data.division?.name || data.destination_division || data.from_office?.division || data.from_office?.parent?.name || 'Dondaicha Division');
  const officeName = sanitizeText(data.from_office?.name || data.sender_designation || 'Sub Division Office');

  return (
    <Document title={`GatePass_${data.display_id || data.id}`}>
      <Page size="A4" style={[styles.page, { backgroundColor: pageBg }]}>
        <View style={[styles.container, { borderColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Image src={LOGO_BASE64} style={styles.logo} />
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.orgTitle}>
                  MAHARASHTRA STATE ELECTRICITY DISTRIBUTION CO. LTD.
                </Text>
                <Text style={styles.divisionText}>
                  Division (Vibhag): {divisionName}
                </Text>
                <Text style={styles.subTitle}>
                  {officeName} • Gate Pass System
                </Text>
              </View>
            </View>

            <Text style={isOutward ? styles.passBadgeOutward : styles.passBadgeInward}>
              {isOutward ? 'GATE PASS (OUTWARD / JAVAK)' : 'GATE PASS (INWARD / AAVAK)'}
            </Text>
          </View>

          {/* Info Row: Serial & Date */}
          <View style={styles.infoRow}>
            <Text style={{ fontSize: 8.5, color: '#334155', fontWeight: 'bold' }}>
              Gate Pass ID (Kramank): <Text style={styles.boldUnderlineText}>{sanitizeText(data.display_id || data.serial_number || data.id)}</Text>
            </Text>
            <Text style={{ fontSize: 8.5, color: '#334155', fontWeight: 'bold' }}>
              Date (Dinank): <Text style={styles.boldUnderlineText}>{data.date ? String(data.date).split('T')[0] : ''}</Text>
            </Text>
          </View>

          {/* Recipient & Transport Details */}
          <View style={styles.fieldRow}>
            <Text style={styles.label}>Recipient To (Prati):</Text>
            <Text style={styles.value}>{recipientStr}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Vehicle No. (Gadi No.):</Text>
            <Text style={styles.value}>{sanitizeText(data.vehicle_number) || 'TBD'}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Driver & Mobile (Vahan Chalak):</Text>
            <Text style={styles.value}>{driverStr}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.label}>Contractor (Thekedar):</Text>
            <Text style={styles.value}>{contractorStr}</Text>
          </View>

          {(data.linked_gatepass_id || data.linked_gatepass?.display_id) && (
            <View style={styles.fieldRow}>
              <Text style={styles.label}>Linked Pass Ref (Sanlagna Pass):</Text>
              <Text style={[styles.value, { color: '#1d4ed8' }]}>{sanitizeText(data.linked_gatepass?.display_id || data.linked_gatepass_id)}</Text>
            </View>
          )}

          {/* Material Table Title */}
          <Text style={styles.tableTitleBanner}>
            Material Details / Transformer Description (Sahityacha Tapashil)
          </Text>

          {/* Material Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colSr}>Sr</Text>
              <Text style={styles.colMake}>Make</Text>
              <Text style={styles.colSrNo}>Sr. No.</Text>
              <Text style={styles.colJob}>Job No.</Text>
              <Text style={styles.colCap}>Capacity</Text>
              <Text style={styles.colVillage}>Village / DTC</Text>
              <Text style={styles.colCondition}>Condition</Text>
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
                  <Text style={styles.colCondition}>{sanitizeText(m.condition) || 'Good'}</Text>
                </View>

                {m.failed_job_record && (
                  <View style={{ backgroundColor: '#fffbeb', borderTopWidth: 0.5, borderTopColor: '#fde68a', padding: 3.5, paddingLeft: 8 }}>
                    <Text style={{ fontSize: 7.2, color: '#92400e' }}>
                      [!] Failed Job Record: Warranty: {sanitizeText(m.failed_job_record.warranty) || 'GP'} | Oil Drain Sr: {sanitizeText(m.failed_job_record.oil_drain_serial_number) || 'N/A'} | Recorded By CPF: {sanitizeText(m.failed_job_record.recorded_by_cpf) || 'N/A'}
                    </Text>
                  </View>
                )}

                {m.healthy_job_record && (
                  <View style={{ backgroundColor: '#f0fdf4', borderTopWidth: 0.5, borderTopColor: '#bbf7d0', padding: 3.5, paddingLeft: 8 }}>
                    <Text style={{ fontSize: 7.2, color: '#166534' }}>
                      [OK] Healthy Job Record: R-Phase: {sanitizeText(m.healthy_job_record.ryb_r_reading)}A | Y-Phase: {sanitizeText(m.healthy_job_record.ryb_y_reading)}A | B-Phase: {sanitizeText(m.healthy_job_record.ryb_b_reading)}A | Spark Test: {sanitizeText(m.healthy_job_record.spark_test).toUpperCase()} | Tested By CPF: {sanitizeText(m.healthy_job_record.tested_by_cpf) || 'N/A'}
                    </Text>
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Line Staff Section */}
          <View style={styles.staffSection}>
            <Text style={{ fontSize: 8.2, color: '#1e293b', fontWeight: 'bold' }}>
              Destination Line Staff: {sanitizeText(data.line_staff_name) || 'N/A'} | Mob: {sanitizeText(data.line_staff_mobile) || 'N/A'} | CPF: {sanitizeText(data.line_staff_cpf) || 'N/A'}
            </Text>
          </View>

          {/* Condition Remarks */}
          <View style={styles.remarksBox}>
            <Text style={{ fontWeight: 'bold', marginBottom: 1.5, fontSize: 8 }}>Condition Certificate / Remarks (Shera):</Text>
            <Text style={{ fontSize: 7.8, color: '#334155' }}>{remarksStr}</Text>
          </View>

          {/* Signatures */}
          <View style={styles.signatures}>
            <View style={styles.sigBlock}>
              <View style={styles.digitallySignedBadge}>
                <Text style={{ fontSize: 7, color: '#15803d', fontWeight: 'bold' }}>* Digitally Signed</Text>
              </View>
              <Text style={styles.sigLine}>Denaryachi Sahi (Sender Signature)</Text>
              <Text style={{ fontSize: 8, color: '#475569', marginTop: 2, textAlign: 'center' }}>
                {sanitizeText(data.sender_name) || 'Sender'} ({sanitizeText(data.sender_designation) || 'Officer'})
              </Text>
            </View>

            <View style={styles.sigBlock}>
              <View style={styles.digitallySignedBadge}>
                <Text style={{ fontSize: 7, color: '#15803d', fontWeight: 'bold' }}>* Digitally Signed</Text>
              </View>
              <Text style={styles.sigLine}>Ghenaryachi Sahi (Receiver Signature)</Text>
              <Text style={{ fontSize: 8, color: '#475569', marginTop: 2, textAlign: 'center' }}>
                {sanitizeText(data.receiver_name || (data.type === 'outward' ? data.contractor_name : data.line_staff_name)) || 'Receiver Signature'}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Digital Gate Pass ID: {data.display_id || data.id}</Text>
            <Text>Generated: {new Date().toISOString().split('T')[0]}</Text>
            <Text>{officeName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default GatePassPDF;


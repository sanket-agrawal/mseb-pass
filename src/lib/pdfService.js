import React from 'react';
import { pdf } from '@react-pdf/renderer';
import GatePassPDF from '@/components/gatepass/GatePassPDF';

export function getGatePassFilename(gatePass) {
  if (!gatePass) return 'MSEB_GatePass.pdf';
  const serial = gatePass.serial_number || gatePass.id;
  const type = gatePass.type || 'outward';
  const date = gatePass.date || new Date().toISOString().split('T')[0];
  return `MSEB_GatePass_${serial}_${type}_${date}.pdf`;
}

export async function generateGatePassPDFBlob(gatePassData) {
  try {
    const blob = await pdf(<GatePassPDF data={gatePassData} />).toBlob();
    return blob;
  } catch (err) {
    console.error('React-PDF Blob generation error:', err);
    throw err;
  }
}

export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadGatePass(gatePassData) {
  try {
    const blob = await generateGatePassPDFBlob(gatePassData);
    const filename = getGatePassFilename(gatePassData);
    triggerBlobDownload(blob, filename);
  } catch (err) {
    console.warn('Falling back to native print PDF view...', err);
    // Fallback trigger browser print
    window.print();
  }
}

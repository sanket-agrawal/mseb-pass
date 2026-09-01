export function getPublicGatePassUrl(gatePass) {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return `${origin}/gatepass/view/${gatePass.id}`;
}

export function formatWhatsAppMessage(gatePass, viewUrl) {
  if (!gatePass) return '';
  const type = gatePass.type === 'outward' ? 'जावक (Outward)' : 'आवक (Inward)';
  const mat = gatePass.materials?.[0] || {};

  return `
📋 *Digital Gate Pass*
━━━━━━━━━━━━━━━━━━
🔢 *Gate Pass No:* ${gatePass.serial_number || gatePass.id}
📅 *Date:* ${gatePass.date}
📝 *Type:* ${type}

📍 *To:* ${gatePass.recipient_name || 'Staff'}
       ${gatePass.destination_substation || ''}
       ${gatePass.destination_section || ''}

🚗 *Vehicle:* ${gatePass.vehicle_number || '-'}
👤 *Driver:* ${gatePass.driver_name || '-'}
📱 *Mobile:* ${gatePass.driver_mobile || '-'}

⚡ *Transformer Details:*
   Make: ${mat.make || '-'}
   Sr.No: ${mat.serial_number || '-'}
   Capacity: ${mat.capacity || '-'}
   Village: ${mat.village_name || '-'}

👷 *Line Staff:* ${gatePass.line_staff_name || '-'}
📱 *Contact:* ${gatePass.line_staff_mobile || '-'}

🔗 *View/Download:* ${viewUrl}

━━━━━━━━━━━━━━━━━━
_Sub Division Dondaicha_
_Digital Gate Pass System_
`.trim();
}

export function shareViaWhatsApp(gatePass, phoneNumber = null) {
  const url = getPublicGatePassUrl(gatePass);
  const message = formatWhatsAppMessage(gatePass, url);
  const cleanPhone = phoneNumber ? String(phoneNumber).replace(/\D/g, '').slice(-10) : '';

  const waUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

export async function copyPassLinkToClipboard(gatePass) {
  const url = getPublicGatePassUrl(gatePass);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(url);
    return url;
  } else {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return url;
  }
}

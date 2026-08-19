import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function generateEmailHTML(gatePass, viewUrl, recipientName) {
  const typeStr = gatePass.type === 'outward' ? 'गेट पास (जावक / Outward)' : 'गेट पास (आवक / Inward)';
  const mat = gatePass.materials?.[0] || {};

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
      .header p { margin: 6px 0 0; opacity: 0.9; font-size: 13px; }
      .badge { display: inline-block; background: #f59e0b; color: #0f172a; padding: 4px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; margin-top: 10px; }
      .content { padding: 24px; }
      .card { background: #FFF9C4; border: 2px solid #d97706; border-radius: 8px; padding: 20px; margin: 16px 0; }
      .field { margin-bottom: 10px; }
      .label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; }
      .value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
      .cta { text-align: center; margin: 24px 0; }
      .cta a { display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; }
      .footer { text-align: center; padding: 16px; background: #f1f5f9; font-size: 12px; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>MSEB Digital Gate Pass</h1>
        <p>महाराष्ट्र राज्य विद्युत वितरण कंपनी मर्यादित (MSEB Dondaicha)</p>
        <span class="badge">${typeStr}</span>
      </div>

      <div class="content">
        <p>Dear ${recipientName || 'Officer / Contractor'},</p>
        <p>A digital gate pass has been issued for transformer transport. Summary details below:</p>

        <div class="card">
          <div class="field">
            <div class="label">Gate Pass No. (क्रमांक)</div>
            <div class="value">#${gatePass.serial_number || gatePass.id}</div>
          </div>
          <div class="field">
            <div class="label">Date (दिनांक)</div>
            <div class="value">${gatePass.date}</div>
          </div>
          <div class="field">
            <div class="label">Recipient & Substation (प्रती)</div>
            <div class="value">${gatePass.recipient_name} — ${gatePass.destination_substation}</div>
          </div>
          <div class="field">
            <div class="label">Driver & Vehicle</div>
            <div class="value">${gatePass.driver_name} (${gatePass.vehicle_number})</div>
          </div>
          <div class="field">
            <div class="label">Transformer Capacity & Make</div>
            <div class="value">${mat.capacity || '100 KVA'} - ${mat.make || 'MSEB Unit'} (Sr: ${mat.serial_number || '-'})</div>
          </div>
        </div>

        <div class="cta">
          <a href="${viewUrl}" target="_blank">View & Download Digital Gate Pass</a>
        </div>
      </div>

      <div class="footer">
        <p>MSEB Sub Division Dondaicha, Dist. Dhule</p>
        <p>Gate Pass Reference: ${gatePass.id}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function POST(request) {
  try {
    const { gatePass, recipientEmail, recipientName } = await request.json();

    if (!gatePass || !recipientEmail) {
      return NextResponse.json({ error: 'Missing gatePass or recipientEmail' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const viewUrl = `${baseUrl}/gatepass/view/${gatePass.id}`;

    if (!resend) {
      // Development mode simulation if API key not provided
      console.log(`[Email Simulation] Sent gatepass ${gatePass.id} to ${recipientEmail}`);
      return NextResponse.json({ success: true, simulated: true, viewUrl });
    }

    const { data, error } = await resend.emails.send({
      from: 'MSEB Gate Pass <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `MSEB Gate Pass #${gatePass.serial_number || gatePass.id} - ${gatePass.destination_substation}`,
      html: generateEmailHTML(gatePass, viewUrl, recipientName)
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data.id, viewUrl });
  } catch (error) {
    console.error('Email API Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

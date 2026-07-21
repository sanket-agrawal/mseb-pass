# Phase 5: Sharing & Notifications

## 🎯 Objective

Implement gate pass sharing via WhatsApp and Email, build a public gate pass view page (accessible via shared link), and create a notification system. This is what makes the digital gate pass truly useful — the admin creates it and the driver receives it instantly on their phone.

---

## 📋 Prerequisites

- Phase 1-4 completed
- Gate passes can be created, viewed, and exported as PDF
- `resend` package already installed (for email)
- Understanding of WhatsApp Web API limitations

---

## 🔄 Sharing Flow

### The Complete Flow:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Admin       │    │  Share       │    │  Driver     │
│  (Dondaicha) │    │  Channel     │    │  (On Road)  │
│              │    │              │    │             │
│  Creates     │───▶│  WhatsApp    │───▶│  Receives   │
│  Gate Pass   │    │  or Email    │    │  Link + PDF │
│              │    │              │    │             │
│  GP-164      │    │  Contains:   │    │  Opens on   │
│  Outward     │    │  - Link      │    │  Phone      │
│              │    │  - PDF       │    │  Browser    │
│              │    │  - Summary   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
```

---

## 📝 Implementation Steps

### Step 1: Create Public Gate Pass View Page

Create a public-facing page that anyone with the link can view (no auth required for viewing).

#### Route: `/gatepass/view/[id]`

This is a **separate layout** — no sidebar, no header, just the gate pass.

```javascript
// app/gatepass/view/[id]/page.js

export default function PublicGatePassView({ params }) {
  // Load gate pass data
  // Render a clean, mobile-friendly view of the gate pass
  
  return (
    <div className="public-gatepass-view">
      {/* MSEB Header */}
      <header className="public-header">
        <img src="/mseb-logo.png" alt="MSEB" />
        <h1>MSEB Digital Gate Pass</h1>
      </header>
      
      {/* Gate Pass Preview (same as GatePassPreview component) */}
      <GatePassPreview data={gatePass} />
      
      {/* Action Buttons */}
      <div className="public-actions">
        <Button icon={<Download />} onClick={handleDownloadPDF}>
          Download PDF
        </Button>
        <Button variant="outline" icon={<Printer />} onClick={handlePrint}>
          Print
        </Button>
      </div>
      
      {/* Status Timeline */}
      <StatusTimeline status={gatePass.status} timestamps={gatePass} />
      
      {/* Footer */}
      <footer className="public-footer">
        <p>This is a digitally generated gate pass by MSEB, Dondaicha Branch</p>
        <p>Gate Pass ID: {gatePass.id}</p>
      </footer>
    </div>
  );
}
```

**Public View Styling:**
- Mobile-first (drivers will view on phone)
- Clean white background with yellow gate pass card
- Large, readable text
- Download PDF button prominent
- No authentication required
- Minimal UI — just the gate pass + actions

#### Layout for Public Page:
```javascript
// app/gatepass/view/layout.js
// This layout does NOT include the sidebar/header
export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      {children}
    </div>
  );
}
```

### Step 2: Implement WhatsApp Sharing

WhatsApp sharing uses the `wa.me` API (no official API needed for MVP).

```javascript
// lib/shareService.js

export function shareViaWhatsApp(gatePass, phoneNumber = null) {
  const baseUrl = window.location.origin;
  const viewUrl = `${baseUrl}/gatepass/view/${gatePass.id}`;
  
  // Construct the message
  const message = formatWhatsAppMessage(gatePass, viewUrl);
  
  // WhatsApp URL
  const waUrl = phoneNumber
    ? `https://wa.me/91${phoneNumber}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  
  window.open(waUrl, '_blank');
}

function formatWhatsAppMessage(gp, url) {
  const type = gp.type === 'outward' ? 'जावक (Outward)' : 'आवक (Inward)';
  
  return `
📋 *MSEB Digital Gate Pass*
━━━━━━━━━━━━━━━━━━

🔢 *Gate Pass No:* ${gp.serial_number}
📅 *Date:* ${formatDate(gp.date)}
📝 *Type:* ${type}

📍 *To:* ${gp.recipient_name}
      ${gp.destination_substation}
      ${gp.destination_section}

🚗 *Vehicle:* ${gp.vehicle_number}
👤 *Driver:* ${gp.driver_name}
📱 *Mobile:* ${gp.driver_mobile}

⚡ *Transformer Details:*
   Make: ${gp.materials?.[0]?.make || '-'}
   Sr.No: ${gp.materials?.[0]?.serial_number || '-'}
   Capacity: ${gp.materials?.[0]?.capacity || '-'}
   Village: ${gp.materials?.[0]?.village_name || '-'}
   DTC: ${gp.materials?.[0]?.dtc_number || '-'}

👷 *Line Staff:* ${gp.line_staff_name || '-'}
📱 *Contact:* ${gp.line_staff_mobile || '-'}

🔗 *View/Download:* ${url}

━━━━━━━━━━━━━━━━━━
_MSEB Dondaicha Branch_
_Digital Gate Pass System_
`.trim();
}
```

### Step 3: Implement Email Sharing

Using **Resend** (free tier: 100 emails/day, perfect for MVP).

#### API Route: `app/api/share/route.js`

```javascript
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { gatePass, recipientEmail, recipientName } = await request.json();
    
    const viewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gatepass/view/${gatePass.id}`;
    
    const { data, error } = await resend.emails.send({
      from: 'MSEB Gate Pass <gatepass@yourdomain.com>',
      to: recipientEmail,
      subject: `Gate Pass #${gatePass.serial_number} - ${gatePass.type === 'outward' ? 'Outward (जावक)' : 'Inward (आवक)'} - MSEB Dondaicha`,
      html: generateEmailHTML(gatePass, viewUrl, recipientName),
    });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, messageId: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

#### Email HTML Template:

```javascript
function generateEmailHTML(gatePass, viewUrl, recipientName) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; padding: 24px; text-align: center; }
      .header h1 { margin: 0; font-size: 20px; }
      .header p { margin: 8px 0 0; opacity: 0.9; }
      .badge { display: inline-block; background: #f59e0b; color: #000; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-top: 12px; }
      .content { padding: 24px; }
      .gatepass-card { background: #FFF9C4; border: 2px solid #d97706; border-radius: 8px; padding: 20px; margin: 16px 0; }
      .field { margin-bottom: 12px; }
      .field-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      .field-value { font-size: 15px; font-weight: 600; color: #333; margin-top: 2px; }
      .material-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
      .material-table th { background: #F5E6A3; padding: 8px; text-align: left; border: 1px solid #d97706; }
      .material-table td { padding: 8px; border: 1px solid #d97706; }
      .cta { text-align: center; margin: 24px 0; }
      .cta a { display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
      .footer { text-align: center; padding: 16px 24px; background: #f8fafc; font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>MSEB Digital Gate Pass</h1>
        <p>महाराष्ट्र राज्य विद्युत वितरण कंपनी</p>
        <span class="badge">
          ${gatePass.type === 'outward' ? 'गेट पास (जावक)' : 'गेट पास (आवक)'}
        </span>
      </div>
      
      <div class="content">
        <p>Dear ${recipientName || 'Sir/Madam'},</p>
        <p>A gate pass has been issued for transformer transport. Details below:</p>
        
        <div class="gatepass-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div class="field">
              <div class="field-label">Gate Pass No. (क्रमांक)</div>
              <div class="field-value">#${gatePass.serial_number}</div>
            </div>
            <div class="field" style="text-align: right;">
              <div class="field-label">Date (दिनांक)</div>
              <div class="field-value">${formatDate(gatePass.date)}</div>
            </div>
          </div>
          
          <div class="field">
            <div class="field-label">To (प्रती)</div>
            <div class="field-value">${gatePass.recipient_name}, ${gatePass.destination_substation}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Vehicle No. (गाडी नं.)</div>
            <div class="field-value">${gatePass.vehicle_number}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Driver (चालक)</div>
            <div class="field-value">${gatePass.driver_name} - ${gatePass.driver_mobile}</div>
          </div>
          
          <table class="material-table">
            <thead>
              <tr>
                <th>Make</th>
                <th>Sr.No.</th>
                <th>Capacity</th>
                <th>Village</th>
                <th>DTC</th>
              </tr>
            </thead>
            <tbody>
              ${gatePass.materials?.map(m => `
              <tr>
                <td>${m.make || '-'}</td>
                <td>${m.serial_number || '-'}</td>
                <td>${m.capacity || '-'}</td>
                <td>${m.village_name || '-'}</td>
                <td>${m.dtc_number || '-'}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="cta">
          <a href="${viewUrl}">View & Download Gate Pass</a>
        </div>
        
        <p style="font-size: 13px; color: #666;">
          Click the button above to view the complete gate pass and download the PDF.
        </p>
      </div>
      
      <div class="footer">
        <p>MSEB Dondaicha Branch | Digital Gate Pass System</p>
        <p>This is an automated email. Gate Pass ID: ${gatePass.id}</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
```

### Step 4: Share Modal Component (`components/gatepass/ShareModal.jsx`)

```javascript
// Modal with sharing options
export function ShareModal({ isOpen, onClose, gatePass }) {
  const [shareMethod, setShareMethod] = useState('whatsapp');
  const [phoneNumber, setPhoneNumber] = useState(gatePass?.driver_mobile || '');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Gate Pass" size="md">
      {/* Tab selector: WhatsApp | Email | Copy Link */}
      <div className="share-tabs">
        <button 
          className={shareMethod === 'whatsapp' ? 'active' : ''} 
          onClick={() => setShareMethod('whatsapp')}
        >
          <WhatsAppIcon /> WhatsApp
        </button>
        <button 
          className={shareMethod === 'email' ? 'active' : ''} 
          onClick={() => setShareMethod('email')}
        >
          <Mail /> Email
        </button>
        <button 
          className={shareMethod === 'link' ? 'active' : ''} 
          onClick={() => setShareMethod('link')}
        >
          <Link /> Copy Link
        </button>
      </div>
      
      {/* WhatsApp Section */}
      {shareMethod === 'whatsapp' && (
        <div className="share-section">
          <Input 
            label="Phone Number" 
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="9876543210"
            helperText="Driver's WhatsApp number (without +91)"
          />
          <div className="share-preview">
            <h4>Message Preview:</h4>
            <pre className="message-preview">
              {formatWhatsAppMessage(gatePass, getViewUrl(gatePass))}
            </pre>
          </div>
          <Button 
            variant="primary" 
            icon={<Send />} 
            onClick={() => shareViaWhatsApp(gatePass, phoneNumber)}
            fullWidth
          >
            Send via WhatsApp
          </Button>
        </div>
      )}
      
      {/* Email Section */}
      {shareMethod === 'email' && (
        <div className="share-section">
          <Input 
            label="Recipient Email" 
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="recipient@example.com"
          />
          <Input 
            label="Recipient Name" 
            value={recipientName}
            onChange={setRecipientName}
            placeholder="Name"
          />
          <Button 
            variant="primary" 
            icon={<Send />} 
            onClick={handleSendEmail}
            loading={sending}
            fullWidth
          >
            Send Email
          </Button>
        </div>
      )}
      
      {/* Copy Link Section */}
      {shareMethod === 'link' && (
        <div className="share-section">
          <div className="link-copy">
            <Input 
              value={getViewUrl(gatePass)} 
              readOnly 
            />
            <Button 
              variant="primary" 
              icon={<Copy />} 
              onClick={handleCopyLink}
            >
              Copy
            </Button>
          </div>
          <p className="helper-text">
            Share this link with anyone to let them view and download the gate pass.
          </p>
        </div>
      )}
    </Modal>
  );
}
```

### Step 5: Quick Share Actions

Add one-click share buttons throughout the app:

```javascript
// On Gate Pass Detail Page
<div className="quick-share">
  <Button 
    variant="whatsapp" 
    icon={<WhatsAppIcon />}
    onClick={() => shareViaWhatsApp(gatePass, gatePass.driver_mobile)}
  >
    Send to Driver
  </Button>
  
  <Button 
    variant="outline"
    icon={<Share2 />}
    onClick={() => setShareModalOpen(true)}
  >
    More Options
  </Button>
</div>

// On Gate Pass List - per row action
<button className="action-btn" title="Share via WhatsApp" onClick={() => quickShareWhatsApp(gp)}>
  <WhatsAppIcon size={16} />
</button>
```

### Step 6: Share History & Tracking

Track when and how gate passes were shared:

```javascript
// Add to gate pass schema
{
  share_history: [
    {
      method: 'whatsapp',       // 'whatsapp' | 'email' | 'link'
      recipient: '9876543210',  // phone or email
      shared_at: '2026-07-21T14:30:00Z',
      shared_by: 'admin'
    }
  ]
}
```

Display share history on the gate pass detail page:
```
📤 Shared History
─────────────────
• WhatsApp to 9876543210 — 21 Jul 2026, 2:30 PM
• Email to ae.shindkheda@mseb.com — 21 Jul 2026, 2:35 PM
• Link copied — 21 Jul 2026, 3:00 PM
```

### Step 7: Notification Toast System

Enhance the toast notification system for sharing actions:

```javascript
// Success toasts
toast.success('Gate pass sent via WhatsApp!', {
  icon: '📱',
  duration: 3000,
});

toast.success('Email sent successfully!', {
  icon: '📧',
  duration: 3000,
});

toast.success('Link copied to clipboard!', {
  icon: '🔗',
  duration: 2000,
});

// Error handling
toast.error('Failed to send email. Please try again.', {
  duration: 5000,
});
```

### Step 8: WhatsApp Icon Component

Since Lucide doesn't have a WhatsApp icon, create a custom one:

```javascript
// components/icons/WhatsAppIcon.jsx
export function WhatsAppIcon({ size = 24, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
```

### Step 9: Auto-Share on Issue

When a gate pass is issued (status changed from draft to issued), offer to auto-share:

```javascript
// After successfully issuing a gate pass
const handleIssueGatePass = async (gatePass) => {
  // Update status to 'issued'
  await updateGatePass(gatePass.id, { status: 'issued' });
  
  // Show success + share prompt
  toast.custom((t) => (
    <div className="share-prompt-toast">
      <p>✅ Gate Pass #{gatePass.serial_number} issued!</p>
      <div className="toast-actions">
        <button onClick={() => {
          shareViaWhatsApp(gatePass, gatePass.driver_mobile);
          toast.dismiss(t.id);
        }}>
          📱 Send to Driver
        </button>
        <button onClick={() => toast.dismiss(t.id)}>
          Later
        </button>
      </div>
    </div>
  ), { duration: 10000 });
};
```

---

## ✅ Phase 5 Completion Checklist

- [ ] Public gate pass view page (`/gatepass/view/[id]`)
- [ ] Public page has separate layout (no sidebar/header)
- [ ] Mobile-optimized public view
- [ ] WhatsApp sharing with formatted message
- [ ] WhatsApp message includes all key gate pass details
- [ ] Email sharing via Resend API
- [ ] Professional email HTML template
- [ ] Email contains gate pass summary + view link
- [ ] Share modal with tabs (WhatsApp / Email / Copy Link)
- [ ] Copy link to clipboard functionality
- [ ] Share history tracking on gate pass
- [ ] Share history display on detail page
- [ ] Quick "Send to Driver" button (one-click WhatsApp)
- [ ] Auto-share prompt after issuing gate pass
- [ ] WhatsApp custom icon component
- [ ] Toast notifications for all share actions
- [ ] Error handling for failed shares
- [ ] Environment variables for Resend API key and app URL

---

## 🤖 Structured Prompt for Phase 5

```
You are building Phase 5 of the MSEB Digital Gate Pass System. Phases 1-4 are complete.

PROJECT: MSEB Digital Gate Pass System  
PHASE: 5 - Sharing & Notifications

CONTEXT: When the admin at Dondaicha MSEB creates a gate pass, they need to send it to the contractor/driver instantly. Currently this involves handing a paper form. Digitally, we share via WhatsApp (most common in India) and Email.

TASK: Implement gate pass sharing system.

REQUIREMENTS:

1. PUBLIC VIEW PAGE (app/gatepass/view/[id]/page.js):
   - Separate layout (NO sidebar/header)
   - Mobile-first design (drivers view on phone)
   - Shows complete gate pass in yellow card format
   - Download PDF button, Print button
   - Status timeline
   - Footer with MSEB branding and gate pass ID
   - No authentication required

2. WHATSAPP SHARING (lib/shareService.js):
   - Use wa.me API URL scheme (no official API needed)
   - Format message with emojis, bold text (*bold*), and line breaks
   - Include: gate pass number, date, type, destination, vehicle, driver, transformer details, view link
   - Pre-fill driver's phone number from gate pass data
   - Open in new tab/window

3. EMAIL SHARING (app/api/share/route.js):
   - Use Resend API (free tier: 100/day)
   - Professional HTML email template with:
     - MSEB blue gradient header
     - Gate pass type badge
     - Yellow card with all details
     - Material table
     - "View & Download" CTA button
     - Footer with branding
   - Environment variable: RESEND_API_KEY

4. SHARE MODAL (components/gatepass/ShareModal.jsx):
   - Tab interface: WhatsApp | Email | Copy Link
   - WhatsApp tab: phone input (pre-filled with driver mobile), message preview, send button
   - Email tab: email input, name input, send button with loading state
   - Copy Link tab: read-only URL input, copy button
   - Track share history

5. QUICK SHARE:
   - "Send to Driver" one-click button on gate pass detail (WhatsApp to driver)
   - Share icon on each row in gate pass list
   - Auto-share prompt toast after issuing a gate pass

6. SHARE HISTORY:
   - Track shares in gate pass data: method, recipient, timestamp
   - Display share history on detail page

7. WHATSAPP ICON: Custom SVG component (Lucide doesn't include WhatsApp)

WHATSAPP MESSAGE FORMAT:
📋 *MSEB Digital Gate Pass*
━━━━━━━━━━━━━━
🔢 *Gate Pass No:* 164
📅 *Date:* 21-07-2026
📝 *Type:* जावक (Outward)
📍 *To:* Assistant Engineer, Shindkheda S/dn
🚗 *Vehicle:* MH02 680689
👤 *Driver:* Manoj Pawra
⚡ *Transformer:* SVJ | 63 KVA | Chaugaon
🔗 *View:* [link]

OUTPUT: Complete sharing system with WhatsApp, email, and link sharing. The public view page should work perfectly on mobile phones (since drivers will open it on their Android phones).
```

---

## 🚀 Next Phase

After Phase 5 is complete, proceed to **Phase 6: Authentication, Polish & Deployment** — the final phase where you add login/auth, migrate to Supabase, polish the UI, and deploy to Vercel.

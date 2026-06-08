import express from 'express';
import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = join(__dirname, 'auth');
const PORT = parseInt(process.env.WA_PORT || '3001');
const WEBHOOK_URL = process.env.WA_WEBHOOK_URL || 'http://localhost:8000/api/v1/whatsapp/webhook';

if (!existsSync(AUTH_DIR)) mkdirSync(AUTH_DIR, { recursive: true });

const app = express();
app.use(express.json());

let sock = null;
let connectionState = 'disconnected';
let currentQR = null;
let qrTimestamp = null;

const logger = pino({ level: 'warn', transport: { target: 'pino-pretty' } });

async function startSock() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['MiniCrane', 'Chrome', '1.0.0'],
    syncFullHistory: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      currentQR = qr;
      qrTimestamp = Date.now();
      connectionState = 'awaiting_scan';
      try {
        const qrBase64 = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
        writeFileSync(join(AUTH_DIR, 'qr_base64.txt'), qrBase64);
      } catch (e) {
        console.error('QR generation error:', e.message);
      }
    }

    if (connection === 'open') {
      connectionState = 'connected';
      currentQR = null;
      console.log('✅ WhatsApp connected!');
      console.log(`   Number: ${sock.user?.id?.split(':')[0] || 'unknown'}`);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      connectionState = 'disconnected';
      console.log(`❌ WhatsApp disconnected (code: ${code}), reconnecting in 5s...`);
      if (code === DisconnectReason.loggedOut) {
        console.log('🔴 Number logged out! Delete auth folder to re-pair.');
      }
      setTimeout(startSock, 5000);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.key?.fromMe) continue;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      if (!text) continue;

      const sender = msg.key.remoteJid;
      const name = msg.pushName || 'unknown';
      console.log(`📩 WA from ${name} (${sender}): ${text}`);

      try {
        const payload = { sender, name, text, timestamp: msg.messageTimestamp };
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {
        console.error('Webhook error:', e.message);
      }
    }
  });
}

// --- REST API ---

app.get('/qr', (req, res) => {
  if (connectionState === 'connected') {
    return res.json({ status: 'connected', message: 'Already connected' });
  }
  if (!currentQR) {
    return res.json({ status: connectionState, message: 'No QR available yet, try again in a moment' });
  }
  res.json({
    status: 'awaiting_scan',
    qr_base64: `/api/qr-image`,
    expires_in: Math.max(0, 60000 - (Date.now() - qrTimestamp)),
  });
});

app.get('/qr-image', (req, res) => {
  try {
    const qrPath = join(AUTH_DIR, 'qr_base64.txt');
    if (!existsSync(qrPath)) return res.status(404).json({ error: 'No QR available' });
    const qrBase64 = readFileSync(qrPath, 'utf-8');
    const img = qrBase64.replace(/^data:image\/png;base64,/, '');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': Buffer.from(img, 'base64').length,
    });
    res.end(Buffer.from(img, 'base64'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/status', (req, res) => {
  res.json({
    status: connectionState,
    number: sock?.user?.id?.split(':')[0] || null,
    name: sock?.user?.name || null,
  });
});

app.post('/send', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) return res.status(400).json({ error: 'to and message required' });
  if (connectionState !== 'connected' || !sock) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }
  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/send-image', async (req, res) => {
  const { to, image_url, caption } = req.body;
  if (!to || !image_url) return res.status(400).json({ error: 'to and image_url required' });
  if (connectionState !== 'connected' || !sock) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }
  try {
    const jid = to.includes('@s.whatsapp.net') ? to : `${to}@s.whatsapp.net`;
    const imgResp = await fetch(image_url);
    const imgBuffer = await imgResp.arrayBuffer();
    await sock.sendMessage(jid, {
      image: Buffer.from(imgBuffer),
      caption: caption || '',
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/logout', async (req, res) => {
  if (sock) {
    sock.logout();
    sock = null;
  }
  connectionState = 'disconnected';
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`📞 WhatsApp service running on port ${PORT}`);
  startSock();
});

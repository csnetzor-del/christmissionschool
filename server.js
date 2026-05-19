const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const { createCareersApiRouter } = require('./careers-api');
const { createAdmissionsApiRouter } = require('./admissions-api');
const { createRazorpayApiRouter, isRazorpayConfigured } = require('./razorpay-api');

// Middleware
app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));
app.use('/api/careers', createCareersApiRouter(express, __dirname));
app.use('/api/admissions', createAdmissionsApiRouter(express, __dirname));
app.use('/api/razorpay', createRazorpayApiRouter());

app.get('/api/health', function (req, res) {
    res.json({ ok: true, service: 'christ-mission-school-api' });
});

app.use(express.static(path.join(__dirname, './')));

/**
 * SIB Encryption Helper
 * SIB usually requires AES-256-CBC or similar.
 * This is a placeholder for the exact encryption logic 
 * specified in the bank's integration document.
 */
function encrypt(text, key) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), Buffer.alloc(16, 0));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(text, key) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'utf8'), Buffer.alloc(16, 0));
    let decrypted = decipher.update(text, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function isSibGatewayConfigured() {
    const merchantId = process.env.SIB_MERCHANT_ID;
    const workingKey = process.env.SIB_WORKING_KEY;
    const accessCode = process.env.SIB_ACCESS_CODE;
    if (!merchantId || !workingKey || !accessCode) return false;
    if (
        merchantId === 'YOUR_MERCHANT_ID' ||
        workingKey === 'YOUR_WORKING_KEY' ||
        accessCode === 'YOUR_ACCESS_CODE'
    ) {
        return false;
    }
    const keyLen = Buffer.byteLength(workingKey, 'utf8');
    return keyLen === 16 || keyLen === 24 || keyLen === 32;
}

// Route: Initiate Payment
app.post('/api/payment/initiate', (req, res) => {
    const { amount, purpose, customerName, customerEmail, customerPhone } = req.body;

    if (!amount || !customerName) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const transactionId = 'CMS' + Date.now();

    if (!isRazorpayConfigured() && !isSibGatewayConfigured()) {
        return res.json({
            success: true,
            demoMode: true,
            transactionId,
            message: 'Demo payment mode — configure Razorpay keys on the server.',
        });
    }

    if (isRazorpayConfigured()) {
        return res.json({
            success: true,
            useRazorpay: true,
            demoMode: false,
            message: 'Use Razorpay checkout (client calls /api/razorpay/create-order).',
        });
    }

    if (!isSibGatewayConfigured()) {
        return res.json({
            success: true,
            demoMode: true,
            transactionId,
            message: 'Demo payment mode — configure Razorpay keys on the server.',
        });
    }

    const rawData = `${process.env.SIB_MERCHANT_ID}|${transactionId}|${amount}|INR|${process.env.SIB_REDIRECT_URL}|${customerName}|${customerEmail}`;

    try {
        const encryptedMsg = encrypt(rawData, process.env.SIB_WORKING_KEY);
        res.json({
            success: true,
            demoMode: false,
            gatewayUrl: 'https://sib.southindianbank.com/epay/payment.jsp',
            payload: {
                msg: encryptedMsg,
                merchant_id: process.env.SIB_MERCHANT_ID,
                access_code: process.env.SIB_ACCESS_CODE,
                order_id: transactionId,
            },
        });
    } catch (err) {
        console.error('SIB encrypt error:', err.message);
        res.json({
            success: true,
            demoMode: true,
            transactionId,
            message: 'Payment gateway unavailable; using demo mode.',
        });
    }
});

// Route: Payment Callback (Webhook)
app.post('/api/payment/callback', (req, res) => {
    // SIB posts data back to this URL after payment
    const { msg } = req.body;

    if (!msg) {
        return res.redirect('/payment-failed.html');
    }

    try {
        const decryptedData = decrypt(msg, process.env.SIB_WORKING_KEY);
        // Process decryptedData (check status, verify checksum, etc.)
        // Example: "merchant_id|txn_id|status|..."
        
        const isSuccess = decryptedData.includes('SUCCESS'); // Simple check for demo

        if (isSuccess) {
            res.redirect('/payment.html?status=success');
        } else {
            res.redirect('/payment.html?status=failed');
        }
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/payment.html?status=failed');
    }
});

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
    console.log(`CMS Backend Server running on ${HOST}:${PORT}`);
    console.log(`Site URL: ${base}`);
    console.log(`Serving frontend from ${path.join(__dirname, './')}`);
});

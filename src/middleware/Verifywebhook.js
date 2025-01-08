import dotenv from 'dotenv'
import crypto from 'crypto'
dotenv.config();
const secret = process.env.WEBHOOK_SECRET;

export const verifywebhook = (req, res, next) => {

    const hmac = req.headers['x-shopify-hmac-sha256'];

    // Use raw body directly
    const body = req.body;

    // Generate hash
    const hash = crypto.createHmac('sha256', secret).update(body).digest('base64');

    if (hmac === hash) {
   
        next();
    } else {
        console.log("HMAC mismatch");
        res.status(401).send('Unauthorized');
    }
};


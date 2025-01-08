import express from 'express';
import { verifywebhook } from '../middleware/Verifywebhook.js';
import { ordercreate,cartcreation } from '../webhooks/shopify.webhooks.js';
export const webhookRouter = express.Router();
webhookRouter.post("/sopifyordercreate",verifywebhook,ordercreate);
webhookRouter.post("/cartcreation",verifywebhook,cartcreation);
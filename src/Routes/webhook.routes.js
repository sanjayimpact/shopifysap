import express from 'express';
import { verifywebhook } from '../middleware/Verifywebhook.js';
import { ordercreate,cartcreation,createProduct, inventoryupdate, inventorylevelupdate, productupdate, productdelete } from '../webhooks/shopify.webhooks.js';
export const webhookRouter = express.Router();
webhookRouter.post("/sopifyordercreate",verifywebhook,ordercreate)
.post("/cartcreation",verifywebhook,cartcreation)
.post("/productcreate",verifywebhook,createProduct)
.post("/inventoryitemupdate",verifywebhook,inventoryupdate)
.post("/inventorylevelupdate",verifywebhook,inventorylevelupdate)
.post("/productupdate",verifywebhook,productupdate)
.post("/productdelete",verifywebhook,productdelete)
 
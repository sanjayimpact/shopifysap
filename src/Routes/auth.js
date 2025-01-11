// server/auth.js (ES6 version)
import 'dotenv/config';
import express from 'express';
import  shopify  from '../../config/shopify.js';
import { Session } from '../Models/Session.model.js';
import axios from 'axios'
import path from 'path';
import { fileURLToPath } from 'url'
import fs from 'fs'
import { fetchAllProducts } from '../../config/sap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionFilePath = path.join(__dirname, 'session.json');

const router = express.Router();





if (!fs.existsSync(sessionFilePath)) {
    fs.writeFileSync(sessionFilePath, ''); // Create empty file if missing
}

// Install/Auth Start
router.get('/auth', async (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send('Missing shop parameter.');
  }

  // Redirect to Shopify's OAuth page
  await shopify.auth.begin({
    rawRequest: req,
      rawResponse: res,
    shop,
    callbackPath: '/api/auth/callback',
    isOnline: false, // or true for online tokens
  });

});

// Auth Callback
router.get('/auth/callback', async (req, res) => {
  try {
      const { session } = await shopify.auth.callback({
          rawRequest: req,
          rawResponse: res,
      });

      
      const { id, shop, state, scope, accessToken } = session;
      const existingSession = await Session.findOne({ shop });
      if (!existingSession) {
        // Create a new session entry if it doesn't exist
        const newSession = new Session({
          id,
          shop,
          state,
          scope,
          accessToken,
        });
  
        await newSession.save();
      }
      

      res.redirect(`/home?host=${req.query.host}&shop=${session.shop}`);
  } catch (error) {
      console.error('Error in auth callback:', error);
      res.status(500).send('Error during authentication');
  }
});

router.get('/products', async (req, res) => {
  try {
      // Read session data from file
      const sessionData = await Session.findOne();
    if(!sessionData){
      res.status(404).json({message: 'Session not found'})

    }
  

      // Construct the API URL for Shopify Admin API
      const shopifyApiUrl = `https://intech-tools.myshopify.com/admin/api/2025-01/products.json?limit=10`; // Update version if needed

      // Make API request to fetch products
      const response = await axios.get(shopifyApiUrl, {
          headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': sessionData.accessToken, // Use access token from session
          },
      });

      if (response && response.data.products) {
          return res.status(200).json({
              data: response.data.products,
              isSuccess: true,
              message: 'Successfully fetched products',
          });
      } else {
          return res.status(200).json({ message: 'Data not found', isSuccess: false });
      }
  } catch (error) {
      console.error('Error fetching products:', error.message);
      res.status(500).json({ message: 'Error fetching products', isSuccess: false });
  }
});


















router.get('/sapproducts',async (req,res)=>{
  let data = await fetchAllProducts();
 return res.status(200).json({data:data});
})



export default router;

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


//   const sessionData = {
//       shop: session.shop,
//       accessToken: session.accessToken,
//       state: session.state,
//       scope: session.scope,
//   };
//   fs.writeFileSync(sessionFilePath, JSON.stringify(sessionData, null, 2)); // Save session in JSON format
//   console.log('Session saved successfully to file.');
// }

// // Read session data from JSON file
// function readSessionFromFile() {
//   if (fs.existsSync(sessionFilePath)) {
//       const data = fs.readFileSync(sessionFilePath, 'utf8');
//       return JSON.parse(data);
//   }
//   return null; // Return null if session file doesn't exist
// }



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

      console.log('Access Token:', session.accessToken);
      console.log('Session:', session);

      fs.writeFileSync(sessionFilePath, JSON.stringify(session, null, 2))
     

      res.redirect(`/home?host=${req.query.host}&shop=${session.shop}`);
  } catch (error) {
      console.error('Error in auth callback:', error);
      res.status(500).send('Error during authentication');
  }
});

router.get('/products', async (req, res) => {
  try {
      // Read session data from file
    let data = fs.readFileSync(sessionFilePath, 'utf8');
    let sessionData = JSON.parse(data);
      if (!sessionData) {
          return res.status(401).send('Session not found. Please authenticate first.');
      }

      // Construct the API URL for Shopify Admin API
      const shopifyApiUrl = `https://${sessionData.shop}/admin/api/2025-01/products.json`; // Update version if needed

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

router.get('/sapproducts',(req,res)=>{
  let data = fetchAllProducts();
return data;
})



export default router;

// server/auth.js (ES6 version)
import 'dotenv/config';
import express from 'express';
import  shopify  from '../../config/shopify.js';
import { Session } from '../Models/Session.model.js';
import axios from 'axios'


const router = express.Router();

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
    const {session} = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

      console.log(session.accessToken);
    // Save the session to the database
 console.log(session);
let checkexist = await Session.findOne({shop:session.shop});
if(checkexist){
  console.log("Already exists")
}
else{
  let sessionData =  new Session({
    id:session.id,
    shop:session.shop,
    state:session.state,
    scope:session.scope,
    accessToken:session.accessToken,

  })
  await sessionData.save();
}

  res.redirect(`/home?host=${req.query.host}&shop=${session.shop}`);
  } catch (error) {
    console.error('Error in auth callback:', error);
    res.status(500).send('Error during authentication');
  }
});

router.get('/products', async (req, res) => {
  try {
    // Retrieve the session from the database
    const sessionData = await Session.findOne(); // Fetch the session (adjust the query as needed)


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
    console.log(response);
if(response){
  
return res.status(200).json({data:response.data.products,isSuccess:true,message:"Successfully fetched"})
}
else{
  return res.status(200).json({message:"Data not found",isSuccess:false})
}

  } catch (error) {
    console.error('Error fetching products:', error.message
    );
    res.status(500).json({message:'Error fetching products',isSuccess:false});
  }
});





export default router;

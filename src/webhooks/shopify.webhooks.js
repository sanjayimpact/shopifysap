import path from 'path';
import fs from 'fs';
import axios from 'axios'
import https from 'https';
import createSession from '../../config/sap.js';
export const ordercreate=(req,res)=>{
    try{
        const rawBody = req.body.toString('utf8'); // Convert Buffer to String
        const webhookData = JSON.parse(rawBody);  // Parse JSON
    
        console.log('Webhook Verified:', webhookData); // 
      

    }catch(err){
        console.log(err);
    }
}

export const cartcreation = (req,res)=>{
    try{
        const rawBody = req.body.toString('utf8'); // Convert Buffer to String
        const webhookData = JSON.parse(rawBody);  // Parse JSON
    
        console.log('Webhook Verified:', webhookData); // 
   
    }catch(err){
        console.log(err)
    }
}


export const cartupdate = (req,res)=>{
    try{
        const rawBody = req.body.toString('utf8'); // Convert Buffer to String
        const webhookData = JSON.parse(rawBody);  // Parse JSON
    
        console.log('Webhook Verified:', webhookData); // 
   
    }catch(err){
        console.log(err)
    }
}

export const createProduct = async (req, res) => {
    try {
      // Parse the raw request body
      const rawBody = req.body.toString('utf8');
      const webhookData = JSON.parse(rawBody);
  
      console.log('Webhook Received:', webhookData);
  
      // Extract relevant data from Shopify product payload
      const productData = {
        ItemCode: webhookData.variants[0].sku || `ITEM_${Date.now()}`, // SKU as ItemCode
        ItemName: webhookData.title, // Name of the product
      
      
      };
  
      console.log('Mapped Product Data:', productData);
  
      // Sync with SAP
    //   const sapResponse = await syncWithSAP(productData);
  
    //   console.log('SAP Response:', sapResponse.data);
  
      // Respond to Shopify webhook
      res.status(200).send('Product synced with SAP successfully.');
    } catch (err) {
      console.error('Error handling webhook:', err);
      res.status(500).send('Error syncing product with SAP.');
    }
  };
  const agent = new https.Agent({
    ca: fs.readFileSync('./sap_cert.pem'), // Replace with actual path to the certificate
});
  const syncWithSAP = async (productData) => {
    try {

        let sessionId = fs.readFileSync('config/session.txt', 'utf8').trim();
  
    
       
      // Define SAP API endpoint and credentials
      const SAP_API_ENDPOINT = 'https://203.143.87.235:50000/b1s/v1/Items'; // Replace with your SAP API endpoint
      const SAP_API_AUTH = sessionId; // Replace with your SAP authentication token
  
      // Make API request to SAP
      const response = await axios.post(
        SAP_API_ENDPOINT,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `B1SESSION=${sessionId}`,
          },
          httpsAgent: agent,
        }
      )

      return response;
    } catch (error) {
        if (error.response?.data?.error?.code === 301) {
            console.log('Session expired. Logging in to SAP again...');
            const newSessionId = await loginToSAP(); // Log in to SAP and get a new session ID
      
            // Retry the sync with the new session ID
            const retryResponse = await axios.post(
              'https://203.143.87.235:50000/b1s/v1/Items',
              productData,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Cookie: `B1SESSION=${newSessionId}`,
                },
                httpsAgent: agent,
              }
            );
      
            return retryResponse;
          }
      console.error('Error syncing with SAP:', error.response?.data || error.message);
      throw new Error('Failed to sync product with SAP.');
    }
  };



 
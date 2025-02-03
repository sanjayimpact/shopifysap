import path from 'path';
import fs from 'fs';
import axios from 'axios'
import https from 'https';

import { fileURLToPath } from 'url';
const agent = new https.Agent({
  ca: fs.readFileSync('./sap_cert.pem'), // Replace with actual path to the certificate
});


export const createProduct = async (req, res) => {
    try {
      // Parse the raw request body
      const rawBody = req.body.toString('utf8');
      const webhookData = JSON.parse(rawBody);

      
      // Extract relevant data from Shopify product payload
      const productData = {
        ItemCode: webhookData.variants[0].sku || `ITEM_${Date.now()}`, // SKU as ItemCode
        ItemName: webhookData.title, // Name of the product
      
        ItemPrices: [
          {
              PriceList: 1,  // Default price list ID (Modify this based on your SAP configuration)
              Price: webhookData.variants[0].price || 0 // Assign a default price if missing
          }
      ]
      };

      console.log(productData);
      return;
  
 
  
      // Sync with SAP
      const sapResponse = await syncWithSAP(productData);
  
      console.log('SAP Response:', sapResponse.data);
  
      // Respond to Shopify webhook
      res.status(200).send('Product synced with SAP successfully.');
    } catch (err) {
      console.error('Error handling webhook:', err);
      res.status(500).send('Error syncing product with SAP.');
    }
  };

// product sync with sap
  const syncWithSAP = async (productData) => {
    try {

        let sessionId = fs.readFileSync('config/session.txt', 'utf8').trim();
  
    
       
      // Define SAP API endpoint and credentials
      const SAP_API_ENDPOINT = 'https://203.143.87.235:50000/b1s/v1/Items'; // Replace with your SAP API endpoint
     
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



  export const ordercreate = async (req, res) => {

    try {
      const rawBody = req.body.toString('utf8'); // Convert Buffer to String
      const webhookData = JSON.parse(rawBody); // Parse JSON
   
     console.log(webhookData,'webhookdata');
     return;
      
      const sapPayload = {
        CardCode:  'IN0001', // Map to the correct CardCode, use a default for testing
        DocDate: new Date(webhookData.created_at).toISOString().split('T')[0], // Format as yyyy-mm-dd
        DocDueDate: new Date().toISOString().split('T')[0], // Use today's date for due date
        NumAtCard: webhookData.id, // External order reference
        DocCurrency: 'AUD', // Default to AUD, change if necessary
        Comments: webhookData.note || '', // Add any order comments
        DocumentLines: webhookData.line_items.map((item,index) => ({
          ItemNumber: index + 1,
          ItemCode: '102105T', // Product ID
          Quantity: item.quantity,
          Price: parseFloat(item.price),
          LineTotal: parseFloat(item.price) * item.quantity,
        })),
      };
  
   
      console.log('SAP Payload:', sapPayload);
   return;
      // Send the order to SAP
      const sapResponse = await syncOrderWithSAP(sapPayload);
  
      console.log(sapResponse);
  
    
  
      res.status(200).json({ message: 'Order synced successfully', sapResponse: sapResponse.data });
    } catch (err) {
      console.error('Error processing order:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  };
  
  const syncOrderWithSAP = async (sapPayload) => {
    try {
      let sessionId = fs.readFileSync('config/session.txt', 'utf8').trim();
      const SAP_API_ENDPOINT = 'https://203.143.87.235:50000/b1s/v1/Orders';
  
      const response = await axios.post(
        SAP_API_ENDPOINT,
        sapPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            Cookie: `B1SESSION=${sessionId}`,
          },
          httpsAgent: agent,
        }
      );
  
      return response;
    } catch (error) {
      if (error.response?.data?.error?.code === 301) {
        console.log('Session expired. Logging in to SAP again...');
        const newSessionId = await loginToSAP(); // Log in to SAP and get a new session ID
        fs.writeFileSync('config/session.txt', newSessionId);
  
        // Retry the sync with the new session ID
        return axios.post(
          SAP_API_ENDPOINT,
          sapPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              Cookie: `B1SESSION=${newSessionId}`,
            },
            httpsAgent: agent,
          }
        );
      }
  
      console.error('Error syncing with SAP:', error.response?.data || error.message);
      throw new Error('Failed to sync order with SAP.');
    }
  };


 export const productupdate = async(req,res)=>{
  try{
    const rawBody = req.body.toString('utf8');
    const webhookData = JSON.parse(rawBody);


  }catch(err){
    console.log(err)
    return res.status(200).json({message:err.message})
  }
 }
 export const productdelete = async(req,res)=>{
  try{
    const rawBody = req.body.toString('utf8');
    const webhookData = JSON.parse(rawBody);

  }catch(err){
    console.log(err)
    return res.status(200).json({message:err.message})
  }
 }
 export const cartcreation = (req,res)=>{
  try{
      const rawBody = req.body.toString('utf8'); // Convert Buffer to String
      const webhookData = JSON.parse(rawBody);  // Parse JSON
  

 
  }catch(err){
      console.log(err)
  }
}


export const cartupdate = (req,res)=>{
  try{
      const rawBody = req.body.toString('utf8'); // Convert Buffer to String
      const webhookData = JSON.parse(rawBody);  // Parse JSON
  
     
 
  }catch(err){
      console.log(err)
  }
}
export const inventoryupdate = async(req,res)=>{
  try{
    const rawBody = req.body.toString('utf8');
      const webhookData = JSON.parse(rawBody);


  }catch(err){
    console.log(err);
  }
}

 export const inventorylevelupdate = async(req,res)=>{
  try{
    const rawBody = req.body.toString('utf8');
    const webhookData = JSON.parse(rawBody);

   
  }catch(err){
    console.log(err)
    return res.status(200).json({message:err.message})
  }
 }
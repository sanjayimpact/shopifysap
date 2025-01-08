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
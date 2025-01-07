import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import https from 'https';
dotenv.config();

// SAP B1 Configuration
const config = {
    server: process.env.SAP_SERVER,    
    company_db: process.env.SAP_COMPANY_DB,      
    username: process.env.SAP_USERNAME,        
    password: process.env.SAP_PASSWORD,       
    use_ssl: true,               
};

// Build the Service Layer URL
const protocol = config.use_ssl ? 'https' : 'http';
const port = config.use_ssl ? 50000 : 50001;
const baseUrl = `${protocol}://${config.server}:${port}/b1s/v1`;

// Create HTTPS Agent for SSL Handling
const agent = new https.Agent({
    ca: fs.readFileSync('./sap_cert.pem'), // Replace with actual path to the certificate
});

// Create a Session
async function createSession() {
    try {
        const response = await axios.post(`${baseUrl}/Login`, 
            {
            CompanyDB: config.company_db,
            UserName: config.username,
            Password: config.password,
        },
        
        { httpsAgent: agent }    
    
    );

        if (response.status === 200) {
            console.log('Login Successful!');
            
            // Save session ID to a file
            console.log(response.data);
            const sessionId = response.data.SessionId;
            fs.writeFileSync('session.txt', sessionId);
            console.log('Session ID stored in session.txt:', sessionId);
        } else {
            console.error('Login Failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error connecting to SAP:', error.message);
    }
}

// // Fetch All Products Function
async function fetchAllProducts() {
    try {
        // Read session ID from file
        const sessionId = fs.readFileSync('session.txt', 'utf8');

        // Make GET request to fetch all products
        const response = await axios.get(`${baseUrl}/Items?$select=ItemCode,ItemName,BarCode`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
        });
    console.log(response.data.value);
        // console.log('All Products:', response.data.value); // SAP B1 returns data under 'value'
        return response.data.value;

    } catch (error) {
        console.error('Error fetching products:', error.message);

        // Handle session timeout and re-login
        if (error.response && error.response.status === 401) {
            console.log('Session expired. Re-authenticating...');
            await createSession(); // Re-authenticate
            return fetchAllProducts(); // Retry fetching products
        }
    }
}




// // // Execute the function
fetchAllProducts();
export default createSession;
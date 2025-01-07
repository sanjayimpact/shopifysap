import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Session file path
const sessionFilePath = path.join(__dirname, 'session.txt');
// console.log('Session File Path:', sessionFilePath);

// Ensure the session file exists
if (!fs.existsSync(sessionFilePath)) {
    fs.writeFileSync(sessionFilePath, ''); // Create empty file if missing
}

// Create HTTPS Agent for SSL Handling
const agent = new https.Agent({
    ca: fs.readFileSync('./sap_cert.pem'), // Replace with actual path to the certificate
});

// Create a Session
async function createSession() {
    try {
        const response = await axios.post(
            `${baseUrl}/Login`,
            {
                CompanyDB: config.company_db,
                UserName: config.username,
                Password: config.password,
            },
            { httpsAgent: agent }
        );

        if (response.status === 200) {
            console.log('Login Successful!');
            const sessionId = response.data.SessionId;

            // Save session ID to file
            fs.writeFileSync(sessionFilePath, sessionId);
            console.log('Session ID saved:', sessionId);

            return sessionId;
        } else {
            console.error('Login Failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error connecting to SAP:', error.message);
    }
}

// Fetch All Products
export const  fetchAllProducts=async()=> {
    try {
        // Read session ID from file
        let sessionId = fs.readFileSync(sessionFilePath, 'utf8').trim();

        // If session ID is empty, create a new session
        if (!sessionId) {
            console.log('No session found. Creating a new session...');
            sessionId = await createSession();
        }

        // Make GET request to fetch all products
        const response = await axios.get(`${baseUrl}/Items?$select=ItemCode,ItemName,BarCode,ItemClass`, {
            headers: {
                Cookie: `B1SESSION=${sessionId}`,
                'Content-Type': 'application/json',
            },
            httpsAgent: agent,
        });

        // console.log('All Products:', response.data.value); // SAP B1 returns data under 'value'
        return response.data.value;
    } catch (error) {
        console.error('Error fetching products:', error.message);

        // Handle session timeout (401) and re-login
        if (error.response && error.response.status === 401) {
            console.log('Session expired. Re-authenticating...');
            const newSessionId = await createSession(); // Re-authenticate

            // Retry fetching products with the new session ID
            if (newSessionId) {
                fs.writeFileSync(sessionFilePath, newSessionId); // Save new session ID
                return fetchAllProducts(); // Retry fetching products
            }
        }
    }
}

// Execute the function

export default createSession;

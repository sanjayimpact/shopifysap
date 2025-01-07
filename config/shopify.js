// server/shopify.js
import 'dotenv/config';
import '@shopify/shopify-api/adapters/node';
import {shopifyApi, LATEST_API_VERSION} from '@shopify/shopify-api';

// Destructure your environment variables
const {
  SHOPIFY_CLIENT,
  SHOPIFY_SECRET,
  SCOPES,
  HOST
} = process.env;

// Convert SCOPES to an array if it's comma-separated
const appScopes = SCOPES ? SCOPES.split(',') : [];

const shopify = shopifyApi({
  apiKey: SHOPIFY_CLIENT,
  apiSecretKey: SHOPIFY_SECRET,
  scopes: appScopes,

  // Remove the protocol (http/https) from HOST
  hostName: HOST ? HOST.replace(/https?:\/\//, '') : '',
  // Use a valid API version from the ApiVersion enum
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  features: {
    lineItemBilling: true,
    customerAddressDefaultFix: true,
    unstable_managedPricingSupport: true,
  },
  
});


// Export as the default from this module
export default shopify;

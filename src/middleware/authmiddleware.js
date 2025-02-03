export const validateShopifyRequest = (req, res, next) => {
    const referer = req.get('Referer'); // Get the Referer header
    const userAgent = req.get('User-Agent'); // Get the User-Agent header

    // Check if the request is from Shopify (by Referer or User-Agent)
    if (referer && referer.includes('myshopify.com')) {
      return next(); // Allow the request if it comes from Shopify
    }
  
    // Optional: Add additional checks (e.g., a custom query parameter for requests from Shopify)
    if (req.query.shop && req.query.shop.includes('.myshopify.com')) {
      return next(); // Allow if the shop parameter is present
    }
  
    // Deny access for direct browser access
    res.status(403).send('Access Forbidden: This page can only be accessed from a Shopify store.');
  };
  
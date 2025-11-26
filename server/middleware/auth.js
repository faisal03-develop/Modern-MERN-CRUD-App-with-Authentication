const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Check for token in the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Invalid token format.' });
  }

  try {
    // 2. Verify the token using the SECRET_KEY from index.js
    const decoded = jwt.verify(token, 'SECRET_KEY'); 
    
    // 3. Attach the user ID to the request object
    req.userId = decoded.id; 
    
    next(); // Pass control to the next handler (the actual route function)

  } catch (ex) {
    // If verification fails (e.g., token expired or invalid)
    res.status(400).json({ error: 'Invalid token.' });
  }
};

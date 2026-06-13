const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user ID to the request
    next(); // Move on to the actual controller
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
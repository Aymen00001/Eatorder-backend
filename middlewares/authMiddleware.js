const jwt = require('jsonwebtoken');
const config = require('../config.js');
const checkSuperAdmin = (req, res, next) => {
  // Retrieve the JWT token from the request header
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      // Decode the JWT token using the secret key
      const decodedToken = jwt.verify(token, config.secret);
      // Add the decoded user to the request
      req.user = decodedToken;
      // Check the user's role extracted from the token
      if (decodedToken.role === 'admin') {
        // The user is a super admin, proceed to the next step
        next();
      } else {
        // The user is not a super admin, send an error response
        res.status(403).json({ message: 'Access denied. You must be a super admin to perform this action.' });
      }
    } catch (error) {
      // The token is invalid or has expired, send an error response
      res.status(401).json({ message: 'Unauthorized access. Please log in.' });
    }
  } else {
    // No token was provided, send an error response
    res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
};
const checkOwner = (req, res, next) => {
  // Retrieve the JWT token from the request header
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      // Decode the JWT token using the secret key
      const decodedToken = jwt.verify(token, config.secret);
      // Add the decoded user to the request
      req.user = decodedToken;
      // Check if the user has the owner role
      if (decodedToken.role === 'owner') {
        // The user is an owner, proceed to the next step
        next();
      } else {
        // The user is not an owner, send an error response
        res.status(403).json({ message: 'Access denied. You must be an owner to perform this action.' });
      }
    } catch (error) {
      // The token is invalid or has expired, send an error response
      res.status(401).json({ message: 'Unauthorized access. Please log in.' });
    }
  } else {
    // No token was provided, send an error response
    res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
};
const checkClient = (req, res, next) => {
  // Retrieve the JWT token from the request header
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      // Decode the JWT token using the secret key
      const decodedToken = jwt.verify(token, config.secret);
      // Add the decoded user to the request
      req.user = decodedToken;
      // Check the user's role extracted from the token
      if (decodedToken.role === 'client') {
        // The user is a client, proceed to the next step
        next();
      } else {
        // The user is not a client, send an error response
        res.status(403).json({ message: 'Access denied. You must be a super admin to perform this action.' });
      }
    } catch (error) {
      // The token is invalid or has expired, send an error response
      res.status(401).json({ message: 'Unauthorized access. Please log in.' });
    }
  } else {
    // No token was provided, send an error response
    res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
};
const checkManager = (req, res, next) => {
  // Retrieve the JWT token from the request header
  const token = req.headers.authorization?.split(' ')[1];
  console.log(token);
  if (token) {
    try {
      // Decode the JWT token using the secret key
      const decodedToken = jwt.verify(token, config.secret);
      console.log(decodedToken);
      // Add the decoded user to the request
      req.user = decodedToken;
      // Check if the user has the manager role
      if (decodedToken.role === 'manager') {
        // The user is a manager, proceed to the next step
        next();
      } else {
        // The user is not a manager, send an error response
        res.status(403).json({ message: 'Access denied. You must be an owner to perform this action.' });
      }
    } catch (error) {
      // The token is invalid or has expired, send an error response
      res.status(401).json({ message: 'Unauthorized access. Please log in.' });
    }
  } else {
    // No token was provided, send an error response
    res.status(401).json({ message: 'Unauthorized access. Please log in.' });
  }
};
module.exports = {
  checkSuperAdmin,
  checkOwner,
  checkManager,
  checkClient,
};
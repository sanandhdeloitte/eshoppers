const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function peekPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded  = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

const verifyToken = async (req, res, next) => {

  if (req.method === 'OPTIONS') return next();  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.currentUser = null;
    req.userId      = null;
    return next();
  }

  const token   = authHeader.split(' ')[1];
  const payload = peekPayload(token);

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Malformed token' });
  }

  try {
    const isGoogle =
      payload.iss === 'https://accounts.google.com' ||
      payload.iss === 'accounts.google.com';

    if (isGoogle) {
      const ticket = await googleClient.verifyIdToken({
        idToken:  token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      req.currentUser = ticket.getPayload();
      req.userId = req.currentUser.sub;
      return next();
    }

    if (payload.iss === 'eshoppers') {
      req.currentUser = jwt.verify(token, process.env.JWT_SECRET);
      req.userId      = req.currentUser.sub;
      return next();
    }

    if (payload.iss === 'eshoppers-guest') {
      req.currentUser = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    }

    return res.status(401).json({ success: false, message: 'Unknown token issuer' });

  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;

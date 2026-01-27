import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'Secret exists' : 'Secret missing');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Token verified, user:', decoded);
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default protect;
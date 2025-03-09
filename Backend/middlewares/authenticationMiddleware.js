import jwt from 'jsonwebtoken';

export const requireSignIn = async (req, res, next) => {
  try {
    // Log JWT Secret to verify it's correctly loaded
    console.log('JWT Secret:', process.env.JWT_SECRET);

    // Check for the Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.replace("Bearer ", "");

    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT verification error:', error); // Log error details for debugging
    res.status(401).json({ message: 'Token is not valid' });
  }
};

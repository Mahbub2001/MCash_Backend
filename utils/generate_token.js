const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); 
  return { accessToken, refreshToken };
};

module.exports = generateTokens;
// middleware/renewToken.js
const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  let exist = false;

  if (!refreshToken) {
    return res.status(401).send({ valid: false, message: "No refresh token" });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ valid: false, message: "Invalid refresh token" });
    } else {
      const accessToken = jwt.sign({ id: decoded.id }, ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
      res.cookie('accessToken', accessToken, { maxAge: 1 * 24 * 60 * 60 * 1000 }); 
      exist = true;
    }
  });

  return exist;
};

module.exports = renewToken;
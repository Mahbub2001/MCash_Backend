const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const renewToken = require('../utils/renewToken');
const verifyJWT = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    if (renewToken(req, res)) {
      next();
    } else {
      return res.status(401).send({ valid: false, message: "Unauthorized" });
    }
  } else {
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        if (renewToken(req, res)) {
          next();
        } else {
          return res.status(403).send({ valid: false, message: "Invalid or expired access token" });
        }
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};

module.exports = verifyJWT;
const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET; 

const verifyJWT = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = verifyJWT;
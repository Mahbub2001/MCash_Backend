const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  const decodedEmail = req.decoded.email; 

  try {
    const user = await User.findOne({ email: decodedEmail });

    if (user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden access" });
    }

    next(); 
  } catch (err) {
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyAdmin;
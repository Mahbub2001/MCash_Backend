const User = require('../models/User');

const verifyAgent = async (req, res, next) => {
  if (!req.decoded) {
    return res.status(401).send({ message: "Unauthorized: Token is missing or invalid" });
  }

  const userId = req.decoded.userId; 

  try {
    const user = await User.findById(userId).select('role');

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.role !== "agent") {
      return res.status(403).send({ message: "Forbidden: You do not have agent privileges" });
    }

    next(); 
  } catch (err) {
    console.error("Error in verifyAgent middleware:", err); 
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyAgent;
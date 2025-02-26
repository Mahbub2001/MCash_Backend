const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  // Ensure req.decoded exists
  if (!req.decoded) {
    return res.status(401).send({ message: "Unauthorized: Token is missing or invalid" });
  }

  const userId = req.decoded.userId; 

  try {
    const user = await User.findById(userId).select('role');

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: You do not have admin privileges" });
    }

    next(); 
  } catch (err) {
    console.error("Error in verifyAdmin middleware:", err); 
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyAdmin;
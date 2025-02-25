const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const verifyJWT = require('../middleware/verifyJWT');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user', verifyJWT, authController.getDetails);

// router.get('/dashboard', verifyJWT, (req, res) => {
//   res.status(200).send({ valid: true, message: "Authorized" });
// });

module.exports = router;
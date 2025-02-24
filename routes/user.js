const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const userController = require('../controllers/user');
router.use(verifyJWT);

router.post('/send-money', userController.sendMoney);
router.post('/cash-out', userController.cashOut);
router.get('/balance', userController.getBalance);
router.get('/transactions', userController.getTransactionHistory);

module.exports = router;
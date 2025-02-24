const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyjwt');
const agentController = require('../controllers/agent');

router.use(verifyJWT);
router.post('/cash-in', agentController.cashIn);
router.post('/request-recharge', agentController.requestRecharge);
router.get('/transactions', agentController.getTransactionHistory);

module.exports = router;
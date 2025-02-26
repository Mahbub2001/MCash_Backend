const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyjwt');
const agentController = require('../controllers/agent');
const verifyAgent = require('../middleware/verifyagentjwt');

router.use(verifyJWT);
router.use(verifyAgent);
router.post('/cash-in', agentController.cashIn);
router.post('/request-recharge', agentController.requestRecharge);
router.get('/transactions', agentController.getTransactionHistory);
router.post('/withdrawal-request', agentController.requestWithDraw);

module.exports = router;
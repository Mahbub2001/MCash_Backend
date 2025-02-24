const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT');
const verifyAdmin = require('../middleware/verifyadminjwt');
const adminController = require('../controllers/admin');

router.use(verifyJWT);
router.use(verifyAdmin);

router.post('/approve-agent', adminController.approveAgent);
router.post('/block-user', adminController.blockUser);
router.post('/add-money', adminController.addMoneyToAgent);
router.get('/pending-agents', adminController.getPendingAgents);
router.get('/transactions', adminController.getAllTransactions);

module.exports = router;
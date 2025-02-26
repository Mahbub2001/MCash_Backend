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
router.post('/approve-withdraw', adminController.approveWithdrawalRequest);
router.post('/approve-money-request', adminController.approveMoneyRequest);
router.get('/pending-agents', adminController.getPendingAgents);
router.get('/transactions', adminController.getAllTransactions);
router.get('/agent-req', adminController.getPendingAgents);
router.get('/user-transactions/:userId', adminController.getAdminUserTransactions);
router.get('/users', adminController.getAllUsers);
router.get('/pending-money-request', adminController.getPendingAddMoneyRequests);
router.get('/pending-withdraw-request', adminController.getPendingWithdrawMoneyRequests);


module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getTransactions,
  setTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, setTransaction);
router.route('/summary').get(protect, getSummary);
router.route('/:id').delete(protect, deleteTransaction).put(protect, updateTransaction);

module.exports = router;

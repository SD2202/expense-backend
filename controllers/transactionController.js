const Transaction = require('../models/Transaction');

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

  res.status(200).json(transactions);
};

// @desc    Set transaction
// @route   POST /api/transactions
// @access  Private
const setTransaction = async (req, res) => {
  const { amount, type, category, description, date } = req.body;

  if (!amount || !type || !category || !description) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  const transaction = await Transaction.create({
    amount,
    type,
    category,
    description,
    date: date || new Date(),
    user: req.user.id,
  });

  res.status(201).json(transaction);
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(400).json({ message: 'Transaction not found' });
  }

  // Check for user
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  // Make sure the logged in user matches the transaction user
  if (transaction.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  // Restrict editing to current month only
  const now = new Date();
  const transactionDate = new Date(transaction.date);
  if (
    transactionDate.getMonth() !== now.getMonth() ||
    transactionDate.getFullYear() !== now.getFullYear()
  ) {
    return res.status(403).json({ message: 'Past transactions cannot be edited' });
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json(updatedTransaction);
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return res.status(400).json({ message: 'Transaction not found' });
  }

  // Check for user
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  // Make sure the logged in user matches the transaction user
  if (transaction.user.toString() !== req.user.id) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  // Restrict deleting to current month only
  const now = new Date();
  const transactionDate = new Date(transaction.date);
  if (
    transactionDate.getMonth() !== now.getMonth() ||
    transactionDate.getFullYear() !== now.getFullYear()
  ) {
    return res.status(403).json({ message: 'Past transactions cannot be deleted' });
  }

  await transaction.deleteOne();

  res.status(200).json({ id: req.params.id });
};

// @desc    Get summary
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user.id });

  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.income += transaction.amount;
      } else {
        acc.expense += transaction.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  summary.balance = summary.income - summary.expense;

  res.status(200).json(summary);
};

module.exports = {
  getTransactions,
  setTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};

const express = require('express');
const router = express.Router();
const {
  getAllTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple,
} = require('../controllers/templeController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/roleMiddleware');

// Public routes
router.get('/', getAllTemples);
router.get('/:id', getTempleById);

// Admin only routes
router.post('/', protect, admin, createTemple);
router.put('/:id', protect, admin, updateTemple);
router.delete('/:id', protect, admin, deleteTemple);

module.exports = router;

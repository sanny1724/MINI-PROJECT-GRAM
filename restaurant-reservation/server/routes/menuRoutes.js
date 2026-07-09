import express from 'express';
import {
  getMenuItems,
  getAdminMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public Routes
router.get('/', getMenuItems);

// Admin-Only Routes
router.get('/admin', protect, isAdmin, getAdminMenuItems);
router.post('/', protect, isAdmin, createMenuItem);
router.put('/:id', protect, isAdmin, updateMenuItem);
router.delete('/:id', protect, isAdmin, deleteMenuItem);

export default router;

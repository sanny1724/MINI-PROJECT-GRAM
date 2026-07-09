import express from 'express';
import { getTables, createTable, updateTable, deleteTable } from '../controllers/tableController.js';
import { tableValidationRules, validate } from '../middlewares/validation.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public/Private - Get list of tables
router.get('/', protect, getTables);

// Admin Only - Manage tables
router.post('/', protect, isAdmin, tableValidationRules, validate, createTable);
router.put('/:id', protect, isAdmin, tableValidationRules, validate, updateTable);
router.delete('/:id', protect, isAdmin, deleteTable);

export default router;

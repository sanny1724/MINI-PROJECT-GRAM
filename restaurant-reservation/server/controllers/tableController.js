import Table from '../models/Table.js';

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public / Private
export const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({
      success: true,
      count: tables.length,
      tables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
export const createTable = async (req, res, next) => {
  const { tableNumber, capacity, isActive } = req.body;

  try {
    // Check if table number already exists
    const tableExists = await Table.findOne({ tableNumber });
    if (tableExists) {
      return res.status(400).json({
        success: false,
        message: `Table number ${tableNumber} already exists`,
      });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Admin
export const updateTable = async (req, res, next) => {
  const { tableNumber, capacity, isActive } = req.body;

  try {
    let table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    // Check if updating to a tableNumber that is already taken by another table
    if (tableNumber && tableNumber !== table.tableNumber) {
      const numberTaken = await Table.findOne({ tableNumber, _id: { $ne: req.params.id } });
      if (numberTaken) {
        return res.status(400).json({
          success: false,
          message: `Table number ${tableNumber} is already in use by another table`,
        });
      }
      table.tableNumber = tableNumber;
    }

    if (capacity !== undefined) table.capacity = capacity;
    if (isActive !== undefined) table.isActive = isActive;

    await table.save();

    res.json({
      success: true,
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
export const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

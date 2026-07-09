import MenuItem from '../models/MenuItem.js';

// @desc    Get all menu items
// @route   GET /api/menu
// @access  Public
export const getMenuItems = async (req, res, next) => {
  try {
    const { category, vegetarian, glutenFree } = req.query;
    const query = { isAvailable: true };

    if (category) {
      query.category = category;
    }
    if (vegetarian === 'true') {
      query.isVegetarian = true;
    }
    if (glutenFree === 'true') {
      query.isGlutenFree = true;
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    res.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all menu items for admin (including unavailable)
// @route   GET /api/menu/admin
// @access  Private/Admin
export const getAdminMenuItems = async (req, res, next) => {
  try {
    const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private/Admin
export const createMenuItem = async (req, res, next) => {
  const { name, description, price, category, isVegetarian, isGlutenFree, isAvailable } = req.body;

  try {
    const itemExists = await MenuItem.findOne({ name });
    if (itemExists) {
      return res.status(400).json({
        success: false,
        message: `Dish name '${name}' already exists`,
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      category,
      isVegetarian: isVegetarian || false,
      isGlutenFree: isGlutenFree || false,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(201).json({
      success: true,
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private/Admin
export const updateMenuItem = async (req, res, next) => {
  const { name, description, price, category, isVegetarian, isGlutenFree, isAvailable } = req.body;

  try {
    let menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    // Check duplicate name
    if (name && name !== menuItem.name) {
      const nameTaken = await MenuItem.findOne({ name, _id: { $ne: req.params.id } });
      if (nameTaken) {
        return res.status(400).json({
          success: false,
          message: `Dish name '${name}' is already in use by another item`,
        });
      }
      menuItem.name = name;
    }

    if (description !== undefined) menuItem.description = description;
    if (price !== undefined) menuItem.price = price;
    if (category !== undefined) menuItem.category = category;
    if (isVegetarian !== undefined) menuItem.isVegetarian = isVegetarian;
    if (isGlutenFree !== undefined) menuItem.isGlutenFree = isGlutenFree;
    if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

    await menuItem.save();

    res.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private/Admin
export const deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

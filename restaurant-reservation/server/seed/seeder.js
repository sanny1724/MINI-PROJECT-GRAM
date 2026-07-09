import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';
import MenuItem from '../models/MenuItem.js';

// Load env variables
dotenv.config();

// Table definitions (15 tables with various capacities)
const tables = [
  { tableNumber: 1, capacity: 2, isActive: true },
  { tableNumber: 2, capacity: 2, isActive: true },
  { tableNumber: 3, capacity: 4, isActive: true },
  { tableNumber: 4, capacity: 4, isActive: true },
  { tableNumber: 5, capacity: 6, isActive: true },
  { tableNumber: 6, capacity: 6, isActive: true },
  { tableNumber: 7, capacity: 8, isActive: true },
  { tableNumber: 8, capacity: 8, isActive: true },
  { tableNumber: 9, capacity: 2, isActive: true },
  { tableNumber: 10, capacity: 2, isActive: true },
  { tableNumber: 11, capacity: 4, isActive: true },
  { tableNumber: 12, capacity: 4, isActive: true },
  { tableNumber: 13, capacity: 6, isActive: true },
  { tableNumber: 14, capacity: 6, isActive: true },
  { tableNumber: 15, capacity: 8, isActive: true },
];

// Menu Item definitions (12 signature items)
const menuItems = [
  // Starters
  {
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls filled with molten truffle pecorino, served with saffron aioli.',
    price: 14,
    category: 'starters',
    isVegetarian: true,
    isGlutenFree: false,
    isAvailable: true,
  },
  {
    name: 'Calabrian Chili Prawns',
    description: 'Sautéed wild prawns tossed with garlic, Calabrian chili paste, and lemon zest, served with charred sourdough.',
    price: 18,
    category: 'starters',
    isVegetarian: false,
    isGlutenFree: false,
    isAvailable: true,
  },
  {
    name: 'Burrata & Heirloom Tomato',
    description: 'Creamy pugliese burrata, heirloom cherry tomatoes, basil pesto infusion, and balsamic reduction glaze.',
    price: 16,
    category: 'starters',
    isVegetarian: true,
    isGlutenFree: true,
    isAvailable: true,
  },
  // Mains
  {
    name: 'Dry-Aged Ribeye Steak',
    description: '12oz grass-fed ribeye aged for 28 days, served with rosemary bone marrow jus and truffle fries.',
    price: 42,
    category: 'mains',
    isVegetarian: false,
    isGlutenFree: true,
    isAvailable: true,
  },
  {
    name: 'Pan-Seared Chilean Sea Bass',
    description: 'Chilean sea bass over ginger-lemongrass broth, sautéed baby bok choy, and crispy shiitake curls.',
    price: 38,
    category: 'mains',
    isVegetarian: false,
    isGlutenFree: true,
    isAvailable: true,
  },
  {
    name: 'Wild Mushroom Gnocchi',
    description: 'Handcrafted potato gnocchi sautéed with wild porcini, chanterelle mushrooms, and sage brown butter cream.',
    price: 26,
    category: 'mains',
    isVegetarian: true,
    isGlutenFree: false,
    isAvailable: true,
  },
  // Desserts
  {
    name: 'Decadent Chocolate Lava Cake',
    description: 'Molten dark chocolate cake served with Madagascar vanilla bean gelato and fresh raspberry reduction.',
    price: 12,
    category: 'desserts',
    isVegetarian: true,
    isGlutenFree: false,
    isAvailable: true,
  },
  {
    name: 'Deconstructed Meyer Lemon Tart',
    description: 'Meyer lemon curd, toasted Italian meringue, graham cracker soil, and candied lemon curls.',
    price: 11,
    category: 'desserts',
    isVegetarian: true,
    isGlutenFree: false,
    isAvailable: true,
  },
  {
    name: 'Tahitian Vanilla Panna Cotta',
    description: 'Silky panna cotta infused with vanilla beans, macerated strawberries, and honeycomb shards.',
    price: 10,
    category: 'desserts',
    isVegetarian: true, // Panna cotta gelatin can vary, let's keep it vegetarian-friendly (agar-agar based in luxury restaurants!)
    isGlutenFree: true,
    isAvailable: true,
  },
  // Beverages
  {
    name: 'Smoked Rosemary Old Fashioned',
    description: 'Bourbon whiskey, Angostura aromatic bitters, organic sugar cane syrup, smoked rosemary sprig infuser.',
    price: 16,
    category: 'beverages',
    isVegetarian: true,
    isGlutenFree: true,
    isAvailable: true,
  },
  {
    name: 'Cucumber Basil Gimlet',
    description: 'Hand-pressed english cucumbers, fresh sweet basil leaves, craft botanical gin, fresh lime juice.',
    price: 14,
    category: 'beverages',
    isVegetarian: true,
    isGlutenFree: true,
    isAvailable: true,
  },
  {
    name: 'Hibiscus Ginger Mocktail',
    description: 'Brewed organic hibiscus flower infusion, ginger beer, lime juice, and mint leaves garnish.',
    price: 9,
    category: 'beverages',
    isVegetarian: true,
    isGlutenFree: true,
    isAvailable: true,
  },
];

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();
    await MenuItem.deleteMany();
    console.log('Database cleared (Users, Tables, Reservations, MenuItems)...');

    // Create 1 Admin User
    await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin user seeded: admin@gmail.com / Admin@123');

    // Create a demo customer
    await User.create({
      name: 'John Customer',
      email: 'customer@gmail.com',
      password: 'Customer@123',
      role: 'customer',
    });
    console.log('Demo Customer seeded: customer@gmail.com / Customer@123');

    // Create 15 tables
    const seededTables = await Table.insertMany(tables);
    console.log(`${seededTables.length} tables seeded successfully.`);

    // Create 12 menu items
    const seededMenu = await MenuItem.insertMany(menuItems);
    console.log(`${seededMenu.length} food/beverage menu items seeded successfully.`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();

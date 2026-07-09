import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

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

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Table.deleteMany();
    await Reservation.deleteMany();
    console.log('Database cleared (Users, Tables, Reservations)...');

    // Create 1 Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Admin user seeded: admin@gmail.com / Admin@123');

    // Create a demo customer for developer convenience
    const demoCustomer = await User.create({
      name: 'John Customer',
      email: 'customer@gmail.com',
      password: 'Customer@123',
      role: 'customer',
    });
    console.log('Demo Customer seeded: customer@gmail.com / Customer@123');

    // Create 15 tables
    const seededTables = await Table.insertMany(tables);
    console.log(`${seededTables.length} tables seeded successfully.`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDB();

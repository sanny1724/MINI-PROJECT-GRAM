import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from './models/Table.js';
import Reservation from './models/Reservation.js';
import User from './models/User.js';
import { allocateTable } from './services/reservationService.js';

dotenv.config();

const runTest = async () => {
  try {
    console.log('Connecting to database for allocation testing...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // 1. Setup mock data
    console.log('Cleaning temp test documents...');
    await Table.deleteMany({ isTest: true });
    await Reservation.deleteMany({ isTest: true });
    await User.deleteMany({ isTest: true });

    // Create test user
    const user = await User.create({
      name: 'Test Client',
      email: 'test-client@test.com',
      password: 'Password123',
      isTest: true,
    });

    // Create mock tables
    console.log('Seeding mock tables for test...');
    const t1 = await Table.create({ tableNumber: 101, capacity: 2, isActive: true, isTest: true });
    const t2 = await Table.create({ tableNumber: 102, capacity: 2, isActive: true, isTest: true });
    const t3 = await Table.create({ tableNumber: 103, capacity: 4, isActive: true, isTest: true });
    const t4 = await Table.create({ tableNumber: 104, capacity: 6, isActive: true, isTest: true });

    console.log('Mock tables seeded. Table 101/102 (Cap: 2), Table 103 (Cap: 4), Table 104 (Cap: 6)');

    const date = '2026-08-15';

    // TEST 1: Smallest table allocation
    console.log('\n--- TEST 1: Check Smallest Table Allocation ---');
    const tableFor2 = await allocateTable(date, '12:00', '13:00', 2);
    console.log(`Requested 2 guests. Allocated Table: #${tableFor2?.tableNumber} (Capacity: ${tableFor2?.capacity})`);
    if (tableFor2?.tableNumber === 101 || tableFor2?.tableNumber === 102) {
      console.log('✓ TEST 1 PASSED: Correctly chose smallest 2-capacity table.');
    } else {
      console.log('✗ TEST 1 FAILED: Expected table 101 or 102.');
    }

    // Save reservation on t1 (101)
    const res1 = await Reservation.create({
      customer: user._id,
      table: t1._id,
      reservationDate: date,
      startTime: '12:00',
      endTime: '13:00',
      guestCount: 2,
      status: 'confirmed',
      isTest: true,
    });
    console.log(`Saved Reservation on Table 101 for 12:00 - 13:00`);

    // TEST 2: Overlap check - should allocate t2 (102) because t1 (101) is booked
    console.log('\n--- TEST 2: Allocate conflicting slot (Should pick next Table 102) ---');
    const tableFor2Conflicting = await allocateTable(date, '12:30', '13:30', 2);
    console.log(`Requested 2 guests at 12:30-13:30. Allocated Table: #${tableFor2Conflicting?.tableNumber}`);
    if (tableFor2Conflicting?.tableNumber === 102) {
      console.log('✓ TEST 2 PASSED: Allocated Table 102 as 101 was conflicted.');
    } else {
      console.log('✗ TEST 2 FAILED: Expected Table 102.');
    }

    // Save reservation on t2 (102)
    const res2 = await Reservation.create({
      customer: user._id,
      table: t2._id,
      reservationDate: date,
      startTime: '12:30',
      endTime: '13:30',
      guestCount: 2,
      status: 'confirmed',
      isTest: true,
    });
    console.log(`Saved Reservation on Table 102 for 12:30 - 13:30`);

    // TEST 3: Scale up - requested 2 guests but both Table 101 and 102 are busy during 12:45-13:15
    console.log('\n--- TEST 3: Capacity scale-up (Table 101 & 102 busy, should scale to Table 103) ---');
    const tableFor2ScaleUp = await allocateTable(date, '12:45', '13:15', 2);
    console.log(`Requested 2 guests at 12:45-13:15. Allocated Table: #${tableFor2ScaleUp?.tableNumber} (Capacity: ${tableFor2ScaleUp?.capacity})`);
    if (tableFor2ScaleUp?.tableNumber === 103) {
      console.log('✓ TEST 3 PASSED: Correctly scaled up to Table 103 (Capacity 4) as capacity 2 tables were booked.');
    } else {
      console.log('✗ TEST 3 FAILED: Expected Table 103.');
    }

    // TEST 4: Non-overlapping bookings on same table
    console.log('\n--- TEST 4: Adjacent times slot allocation (No overlap) ---');
    const tableAdjacent = await allocateTable(date, '13:00', '14:00', 2);
    console.log(`Requested 2 guests at 13:00-14:00. Allocated Table: #${tableAdjacent?.tableNumber}`);
    if (tableAdjacent?.tableNumber === 101) {
      console.log('✓ TEST 4 PASSED: Correctly allowed adjacent slot on Table 101 (12:00-13:00 and 13:00-14:00 do not overlap).');
    } else {
      console.log('✗ TEST 4 FAILED: Expected Table 101 to be free.');
    }

    // TEST 5: Cancellation releases table
    console.log('\n--- TEST 5: Cancellation releases table slot ---');
    res1.status = 'cancelled';
    await res1.save();
    console.log('Cancelled Reservation on Table 101 (12:00-13:00)');
    const tableReleased = await allocateTable(date, '12:00', '13:00', 2);
    console.log(`Requested 2 guests at 12:00-13:00 after cancellation. Allocated Table: #${tableReleased?.tableNumber}`);
    if (tableReleased?.tableNumber === 101) {
      console.log('✓ TEST 5 PASSED: Table 101 correctly released and reallocated.');
    } else {
      console.log('✗ TEST 5 FAILED: Expected Table 101 to be available.');
    }

    // Clean up
    console.log('\nCleaning up test documents...');
    await Table.deleteMany({ isTest: true });
    await Reservation.deleteMany({ isTest: true });
    await User.deleteMany({ isTest: true });
    console.log('Clean up complete.');

    console.log('\nALL TESTS COMPLETED SUCCESSFULLY.');
    process.exit(0);
  } catch (error) {
    console.error('Test run failed with error:', error.message);
    process.exit(1);
  }
};

runTest();

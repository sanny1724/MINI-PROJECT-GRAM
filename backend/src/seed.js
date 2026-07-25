// src/seed.js
import bcrypt from 'bcrypt';
import prisma from './prisma.js';

export async function seedDemoData() {
  console.log('Seeding demo database for GRAM...');

  try {
    const demoEmail = 'demo@example.com';
    const demoPassword = 'password123';
    const demoLgdCode = 569005; // Ankapur village

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    if (existingUser) {
      console.log('Demo user already seeded. Skipping.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    // Create Panchayat Secretary user linked to Ankapur LGD Code
    const user = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        role: 'Panchayat',
        lgdCode: demoLgdCode
      }
    });

    console.log('--------------------------------------------------');
    console.log('✅ Demo GRAM database user seeded successfully!');
    console.log(`   Demo Officer: ${demoEmail}`);
    console.log(`   Role: Panchayat Secretary`);
    console.log(`   Assigned Village Code: ${demoLgdCode} (Ankapur)`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}

// Self execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDemoData()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
}

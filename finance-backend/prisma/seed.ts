import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Main seeding function for generating default configuration and data.
 */
async function main() {
  const saltRounds = 10;
  
  const adminPassword = await bcrypt.hash('Admin@123', saltRounds);
  const analystPassword = await bcrypt.hash('Analyst@123', saltRounds);
  const viewerPassword = await bcrypt.hash('Viewer@123', saltRounds);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@finance.com',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`Created user: ${admin.name} (${admin.email})`);

  const analyst = await prisma.user.create({
    data: {
      name: 'Analyst User',
      email: 'analyst@finance.com',
      password: analystPassword,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });
  console.log(`Created user: ${analyst.name} (${analyst.email})`);

  const viewer = await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@finance.com',
      password: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });
  console.log(`Created user: ${viewer.name} (${viewer.email})`);

  const categories = ['Salary', 'Rent', 'Food', 'Transport', 'Freelance'];

  // Seed 10 Financial Records for the admin
  for (let i = 1; i <= 10; i++) {
    const category = categories[i % categories.length];
    const type = category === 'Salary' || category === 'Freelance' ? 'INCOME' : 'EXPENSE';
    
    // Spread dates across the last 3 months
    const date = new Date();
    date.setMonth(date.getMonth() - (i % 3));
    date.setDate(date.getDate() - (i * 2));

    const record = await prisma.financialRecord.create({
      data: {
        amount: Math.round(Math.random() * 1000 * 100) / 100 + 100, // random amount
        type: type,
        category: category,
        date: date,
        notes: `Sample generated note for record #${i}`,
        userId: admin.id,
      },
    });
    console.log(`Created record [${record.id}]: ${record.type} of $${record.amount} for category ${record.category}`);
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Database seeding finished.');
  });

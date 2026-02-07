#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaClient as PrismaClientType } from '@prisma/client';

const prisma = new PrismaClient();

interface AdminUser {
  email: string;
  password: string;
  name: string;
}

async function seedAdmin() {
  console.log('🔐 Starting admin user seeding...');

  // Admin user credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  if (!adminEmail || !adminPassword) {
    console.error('❌ Missing required environment variables:');
    console.error('   ADMIN_EMAIL');
    console.error('   ADMIN_PASSWORD');
    console.error('   ADMIN_NAME (optional)');
    process.exit(1);
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.account.findUnique({
      where: { email: adminEmail.toLowerCase() }
    });

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists, skipping creation');
      return;
    }

    // Hash the admin password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = await prisma.account.create({
      data: {
        email: adminEmail.toLowerCase(),
        passwordHash,
        name: adminName,
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true,
        emailVerified: 'VERIFIED',
      }
    });

    // Create profile for admin user
    await prisma.profile.create({
      data: {
        userId: adminUser.id,
        bio: 'System administrator with full access to QuickBid platform',
        isVerified: true,
      }
    });

    // Log admin creation
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_SEED',
        resource: 'SYSTEM',
        details: {
          email: adminEmail,
          name: adminName,
          role: 'ADMIN',
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Name: ${adminName}`);
    console.log(`   Role: ADMIN`);
    console.log(`   ID: ${adminUser.id}`);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log('🚀 QuickBid Admin User Seeding Script');
  console.log('=====================================');
  
  await seedAdmin();
  
  console.log('🎉 Admin seeding completed successfully!');
  console.log('=====================================');
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the seeding
main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(() => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });

/**
 * Script để migrate existing users - thêm role và isActive field
 * Run: node scripts/migrate-roles.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function migrateRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find users without role
    const usersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { isActive: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${usersWithoutRole.length} users to migrate`);

    if (usersWithoutRole.length === 0) {
      console.log('✅ All users already have role and isActive fields');
      process.exit(0);
    }

    // Update users
    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { isActive: { $exists: false } }
        ]
      },
      {
        $set: {
          role: 'PATIENT', // Default role
          isActive: true    // Default active
        }
      }
    );

    console.log(`\n✅ Migration completed!`);
    console.log(`   Modified: ${result.modifiedCount} users`);
    console.log(`   All users now have:`);
    console.log(`   - role: PATIENT (default)`);
    console.log(`   - isActive: true`);

    // Show summary
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Current role distribution:');
    roleStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateRoles();

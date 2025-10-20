/**
 * Script để tạo tài khoản SUPER_ADMIN đầu tiên
 * Run: node scripts/create-superadmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if SUPER_ADMIN already exists
    const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (existingSuperAdmin) {
      console.log('\n⚠️  SUPER_ADMIN already exists:');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      
      const confirm = await question('\nDo you want to create another SUPER_ADMIN? (yes/no): ');
      
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cancelled');
        process.exit(0);
      }
    }

    console.log('\n📝 Create SUPER_ADMIN Account');
    console.log('================================\n');

    // Get user input
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const fullName = await question('Full Name (optional): ');

    // Validation
    if (!username || !email || !password) {
      console.log('❌ Username, email, and password are required');
      process.exit(1);
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      console.log('❌ Username or email already exists');
      process.exit(1);
    }

    // Create SUPER_ADMIN
    const superAdmin = new User({
      username,
      email,
      password,
      fullName: fullName || '',
      role: 'SUPER_ADMIN',
      isActive: true
    });

    await superAdmin.save();

    console.log('\n✅ SUPER_ADMIN created successfully!');
    console.log('================================');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Role: SUPER_ADMIN`);
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createSuperAdmin();

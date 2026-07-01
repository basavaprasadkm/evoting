// Run: node backend/scripts/createAdmin.js
// Creates an admin account for testing

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Voter = require('./backend/models/Voter');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Voter.findOne({ email: 'admin@evoting.com' });
  if (existing) {
    console.log('Admin already exists:', existing.voterId);
    process.exit(0);
  }

  const admin = await Voter.create({
    voterId: 'VOTER-ADMIN001',
    name: 'System Administrator',
    email: 'admin@evoting.com',
    password: 'Admin@12345',
    dateOfBirth: new Date('1990-01-01'),
    constituency: 'Bangalore North',
    aadharNumber: '000000000001',
    role: 'admin',
    isFaceRegistered: true,
    isVerified: true,
    isActive: true
  });

  console.log('✅ Admin created!');
  console.log('   Email:    admin@evoting.com');
  console.log('   Password: Admin@12345');
  console.log('   Voter ID:', admin.voterId);
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

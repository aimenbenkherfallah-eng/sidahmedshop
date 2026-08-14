require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  const username = String(process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');

  if (!username || password.length < 12) {
    throw new Error('Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters in server/.env.');
  }

  await connectDB();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate(
    { username },
    { $set: { passwordHash, role: 'admin' } },
    { new: true, runValidators: true }
  );

  if (!user) throw new Error(`Admin user "${username}" was not found.`);
  console.log(`[Admin] Password updated for "${username}".`);
};

run()
  .catch((error) => {
    console.error(`[Admin] Password reset failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

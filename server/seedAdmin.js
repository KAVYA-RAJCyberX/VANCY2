require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

const seedAdmin = async () => {
  await connectDB();

  const adminEmail = 'chouhankavyaraj721@gmail.com';

  let admin = await User.findOne({ email: adminEmail });

  if (admin) {
    console.log('Admin user already exists. Updating role to super-admin just in case...');
    admin.role = 'super-admin';
    admin.isAdmin = true;
    await admin.save();
    console.log('Admin account ready.');
  } else {
    admin = await User.create({
      name: 'Vancy Super Admin',
      email: adminEmail,
      password: '123456789', // This will be hashed automatically by the User schema pre-save hook
      role: 'super-admin',
      isAdmin: true,
      twoFactorEnabled: false // Forces the QR code to appear on first login
    });
    console.log('Super Admin account created successfully!');
  }

  console.log(`\n--- ADMIN CREDENTIALS ---`);
  console.log(`URL: http://localhost:5173/admin/login`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: 123456789\n`);

  process.exit(0);
};

seedAdmin();

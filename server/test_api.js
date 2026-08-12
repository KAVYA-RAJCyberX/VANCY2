// LOCAL DEV TESTING ONLY — never committed secrets, reads from .env
require('dotenv').config();
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  throw new Error('Set JWT_SECRET in .env before running this script');
}

const token = jwt.sign({ role: 'super-admin', userId: '64a1b2c3d4e5f6a1b2c3d4e5' }, process.env.JWT_SECRET);

async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("Analytics:", data);

    const res2 = await fetch('http://localhost:5000/api/admin/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data2 = await res2.json();
    console.log("Coupons:", data2);
  } catch (err) {
    console.error(err);
  }
}
test();

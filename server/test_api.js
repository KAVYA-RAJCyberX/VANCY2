const jwt = require('jsonwebtoken');

const token = jwt.sign({ role: 'super-admin', userId: '64a1b2c3d4e5f6a1b2c3d4e5' }, 'vancy_secret_key');

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

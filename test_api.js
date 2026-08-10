const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ role: 'super-admin', userId: '64a1b2c3d4e5f6a1b2c3d4e5' }, 'vancy_secret_key');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Analytics:", res.data);
    
    const res2 = await axios.get('http://localhost:5000/api/admin/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Coupons:", res2.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();

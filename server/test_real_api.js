const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'chouhankavyaraj721@gmail.com',
      password: '123'
    });
    
    // In my previous fix, I skipped 2FA for local testing or handled it.
    // Wait, the login controller might require 2FA?
    console.log("Login Res:", loginRes.data);
    
    let token = loginRes.data.access_token;
    
    if (!token && loginRes.data.require2FA) {
      // Get the session token
      const sessionToken = loginRes.data.sessionToken;
      // Send dummy 2FA code (e.g. 123456)
      const verifyRes = await axios.post('http://localhost:5000/api/admin/auth/verify-2fa', {
        sessionToken,
        token: '123456' // Assuming bypass or real token
      });
      token = verifyRes.data.access_token;
    }

    if (!token) throw new Error("No token");

    console.log("Got token");

    const res = await axios.get('http://localhost:5000/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Analytics HTTP:", res.status);
    
    const res2 = await axios.get('http://localhost:5000/api/admin/coupons', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Coupons HTTP:", res2.status);
    
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();

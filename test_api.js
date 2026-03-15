const axios = require('axios');

async function test() {
  try {
    console.log("Registering or logging in testuser...");
    let user;
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name: "test", email: "test@test.com", password: "test" });
      user = res.data;
    } catch(err) {
      if(err.response && err.response.status === 400 && err.response.data.message === 'User already exists') {
         const res2 = await axios.post('http://localhost:5000/api/auth/login', { email: "test@test.com", password: "test" });
         user = res2.data;
      } else { throw err; }
    }
    console.log("User:", user.email, "Token:", user.token ? "present" : "missing");
    
    console.log("Adding transaction...");
    const res3 = await axios.post('http://localhost:5000/api/transactions', {
      amount: 100, type: 'income', category: 'Other', description: 'test test'
    }, { headers: { Authorization: `Bearer ${user.token}` }});
    console.log("Transaction added:", res3.data.amount);

    console.log("Getting summary...");
    const res4 = await axios.get('http://localhost:5000/api/transactions/summary', { headers: { Authorization: `Bearer ${user.token}` }});
    console.log("Summary:", res4.data);
    
  } catch (err) {
    console.error("Test Error:", err.response ? err.response.data : err.message);
  }
}
test();

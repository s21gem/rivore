import axios from 'axios';

async function test() {
  try {
    const res = await axios.options('http://localhost:3000/api/products');
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
}
test();

import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const form = new FormData();
    form.append('name', 'Test Product');
    form.append('category', 'Male');
    form.append('description', 'Test Description');
    form.append('stock', '10');
    form.append('lowStockThreshold', '5');
    
    const res = await axios.post('http://localhost:3000/api/products', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: 'Bearer fake-token' // It should return 401, not 405
      }
    });
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
}
test();

import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const form = new FormData();
    form.append('name', 'Test Product');
    
    // Create a product first
    const createRes = await axios.post('http://localhost:3000/api/products', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: 'Bearer fake-token'
      }
    });
    console.log('Create Success:', createRes.status);
  } catch (err: any) {
    console.log('Create Error:', err.response ? err.response.status : err.message);
  }
}
test();

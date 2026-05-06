import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const form = new FormData();
    form.append('name', 'Test Product');
    
    const res = await axios.put('http://localhost:3000/api/products/undefined', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: 'Bearer fake-token'
      }
    });
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
}
test();

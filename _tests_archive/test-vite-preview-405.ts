import axios from 'axios';
import { preview } from 'vite';

async function test() {
  try {
    const server = await preview({
      preview: { port: 3018 }
    });
    
    try {
      const res = await axios.post('http://localhost:3018/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    
    server.httpServer.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
}
test();

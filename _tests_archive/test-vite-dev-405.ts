import axios from 'axios';
import { createServer } from 'vite';

async function test() {
  try {
    const server = await createServer({
      server: { port: 3020 }
    });
    await server.listen();
    
    try {
      const res = await axios.post('http://localhost:3020/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    
    await server.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
  }
}
test();

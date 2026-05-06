import express from 'express';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';

async function test() {
  const app = express();
  
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3016, async () => {
    try {
      const res = await axios.post('http://localhost:3016/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
      if (err.response) {
        console.log('Response data:', err.response.data);
      }
    }
    process.exit(0);
  });
}
test();

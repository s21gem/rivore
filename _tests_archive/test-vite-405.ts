import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';

async function test() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3002, async () => {
    try {
      const res = await axios.post('http://localhost:3002/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

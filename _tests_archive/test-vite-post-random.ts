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

  app.listen(3012, async () => {
    try {
      const res = await axios.post('http://localhost:3012/some-random-url');
      console.log('Success:', res.status, res.data.substring(0, 50));
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

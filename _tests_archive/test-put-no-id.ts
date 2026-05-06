import express from 'express';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';

async function test() {
  const app = express();
  const router = express.Router();

  router.put('/:id', (req, res) => res.send('PUT'));

  app.use('/api/products', router);

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3009, async () => {
    try {
      const res = await axios.put('http://localhost:3009/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

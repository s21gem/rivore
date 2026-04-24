import express from 'express';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';

async function test() {
  const app = express();
  const router = express.Router();

  router.delete('/:id', (req, res) => res.send('DELETE'));

  app.use('/api/products', router);

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3015, async () => {
    try {
      const res = await axios.delete('http://localhost:3015/api/products/undefined');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

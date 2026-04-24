import express from 'express';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';

async function test() {
  const app = express();
  const router = express.Router();

  router.post('/', (req, res) => res.send('POST'));

  app.use('/api/products', router);

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3013, async () => {
    try {
      const res = await axios.options('http://localhost:3013/api/products');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

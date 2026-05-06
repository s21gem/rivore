import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import fs from 'fs';

async function test() {
  const app = express();
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  // Create a dummy static file
  fs.writeFileSync('public/dummy.txt', 'hello');

  app.listen(3003, async () => {
    try {
      const res = await axios.post('http://localhost:3003/dummy.txt');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

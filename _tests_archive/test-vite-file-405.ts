import express from 'express';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

async function test() {
  const app = express();
  
  // Create a file named "api"
  fs.writeFileSync('public/api', 'hello');

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  app.listen(3011, async () => {
    try {
      const res = await axios.post('http://localhost:3011/api');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

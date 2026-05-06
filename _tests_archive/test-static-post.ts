import express from 'express';
import axios from 'axios';
import fs from 'fs';

async function test() {
  const app = express();
  
  fs.writeFileSync('test-file.txt', 'hello');
  app.use(express.static('.'));

  app.listen(3017, async () => {
    try {
      const res = await axios.post('http://localhost:3017/test-file.txt');
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

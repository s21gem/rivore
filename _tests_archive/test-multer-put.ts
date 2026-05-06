import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';

async function test() {
  const app = express();
  const upload = multer();

  app.put('/api/products/:id', upload.single('image'), (req, res) => {
    res.json({ success: true });
  });

  app.listen(3019, async () => {
    try {
      const form = new FormData();
      form.append('name', 'Test');
      
      const res = await axios.put('http://localhost:3019/api/products/123', form, {
        headers: form.getHeaders()
      });
      console.log('Success:', res.status);
    } catch (err: any) {
      console.log('Error:', err.response ? err.response.status : err.message);
    }
    process.exit(0);
  });
}
test();

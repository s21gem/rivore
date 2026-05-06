import express from 'express';
import multer from 'multer';
import axios from 'axios';

const app = express();
const upload = multer();

app.post('/api', upload.single('image'), (req, res) => res.send('POST'));

app.listen(3006, async () => {
  try {
    const res = await axios.post('http://localhost:3006/api', { foo: 'bar' });
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
  process.exit(0);
});

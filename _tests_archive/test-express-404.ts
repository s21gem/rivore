import express from 'express';
import axios from 'axios';

const app = express();

app.get('*', (req, res) => {
  res.send('Hello');
});

app.listen(3001, async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/products');
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
  process.exit(0);
});

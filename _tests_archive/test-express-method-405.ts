import express from 'express';
import axios from 'axios';

const app = express();
const router = express.Router();

router.get('/', (req, res) => res.send('GET'));
router.post('/', (req, res) => res.send('POST'));

app.use('/api', router);

app.listen(3005, async () => {
  try {
    const res = await axios.put('http://localhost:3005/api');
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
  process.exit(0);
});

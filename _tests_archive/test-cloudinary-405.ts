import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('https://api.cloudinary.com/v1_1/undefined/image/upload', {
      file: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      upload_preset: 'test'
    });
    console.log('Success:', res.status);
  } catch (err: any) {
    console.log('Error:', err.response ? err.response.status : err.message);
  }
}
test();

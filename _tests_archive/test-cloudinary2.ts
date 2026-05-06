import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: '',
  api_key: '',
  api_secret: '',
});

async function test() {
  try {
    const dataURI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const result = await cloudinary.uploader.upload(dataURI, { folder: "rivore" });
    console.log('Success:', result.secure_url);
  } catch (error: any) {
    console.log('Error status:', error.http_code);
    console.log('Error message:', error.message);
  }
}
test();

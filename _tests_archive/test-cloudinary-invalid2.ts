import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'demo',
  api_key: 'fake',
  api_secret: 'fake',
});

async function test() {
  try {
    const dataURI = "invalid_data_uri";
    const result = await cloudinary.uploader.upload(dataURI, { folder: "rivore" });
    console.log('Success:', result.secure_url);
  } catch (error: any) {
    console.log('Error:', error);
  }
}
test();

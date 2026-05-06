import http from 'http';
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'rivore_secret_key');

const data = JSON.stringify({
  name: "Test Product",
  slug: "test-product",
  description: "Test description",
  category: "Male",
  stock: 10,
  lowStockThreshold: 5
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/products',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const products = JSON.parse(body).products;
    if (products && products.length > 0) {
      const id = products[0]._id;
      console.log("Updating product ID:", id);
      
      const updateOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/products/' + id,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      
      const updateReq = http.request(updateOptions, (updateRes) => {
        let updateBody = '';
        updateRes.on('data', (chunk) => updateBody += chunk);
        updateRes.on('end', () => {
          console.log("Update response:", updateRes.statusCode, updateBody);
        });
      });
      updateReq.write(data);
      updateReq.end();
    } else {
      console.log("No products found");
    }
  });
});

req.end();

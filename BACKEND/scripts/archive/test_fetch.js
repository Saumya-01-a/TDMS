const http = require('http');

const userId = 'U1769578441115';
const url = `http://localhost:3000/instructor/profile-full/${userId}`;

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
  });
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});

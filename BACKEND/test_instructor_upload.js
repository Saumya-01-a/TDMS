const fs = require('fs');
const path = require('path');

async function testUpload() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const url = 'http://localhost:3000/auth/register';

  // Dummy file content (Simulating a small PNG)
  const dummyFileName = 'test_doc.png';
  const dummyFileContent = 'fake-png-binary-data';
  
  // Construct multi-part body
  const payload = [
    `--${boundary}\r\nContent-Disposition: form-data; name="firstName"\r\n\r\nTest`,
    `--${boundary}\r\nContent-Disposition: form-data; name="lastName"\r\n\r\nInstructor`,
    `--${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\ntest_instructor_${Date.now()}@example.com`,
    `--${boundary}\r\nContent-Disposition: form-data; name="phone"\r\n\r\n0771234567`,
    `--${boundary}\r\nContent-Disposition: form-data; name="addressLine1"\r\n\r\n123 Road`,
    `--${boundary}\r\nContent-Disposition: form-data; name="city"\r\n\r\nColombo`,
    `--${boundary}\r\nContent-Disposition: form-data; name="nic"\r\n\r\n951234567V`,
    `--${boundary}\r\nContent-Disposition: form-data; name="position"\r\n\r\ninstructor`,
    `--${boundary}\r\nContent-Disposition: form-data; name="instructorRegNumber"\r\n\r\nINST-001`,
    `--${boundary}\r\nContent-Disposition: form-data; name="specialization"\r\n\r\nManual`,
    `--${boundary}\r\nContent-Disposition: form-data; name="password"\r\n\r\npassword123`,
    `--${boundary}\r\nContent-Disposition: form-data; name="verificationDoc"; filename="${dummyFileName}"\r\nContent-Type: image/png\r\n\r\n${dummyFileContent}`,
    `--${boundary}--`
  ].join('\r\n');

  try {
    console.log('🚀 Testing instructor document upload (PNG) via native fetch...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: payload
    });

    const data = await response.json();
    console.log('✅ Result Status:', response.status);
    console.log('✅ Response:', JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log('✨ Instructor registration with document upload was successful!');
    } else {
      console.log('❌ Registration failed: ', data.message);
    }
  } catch (error) {
    console.error('💥 Registration error:', error.message);
  }
}

testUpload();

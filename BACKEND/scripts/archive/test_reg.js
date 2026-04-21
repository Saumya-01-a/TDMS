async function testRegistrationWithFile() {
  console.log("--- Testing Registration Endpoint with Mock File (Node Fetch) ---");
  
  const form = new FormData();
  form.append('firstName', 'Test');
  form.append('lastName', 'User');
  form.append('email', `filetest${Date.now()}@example.com`);
  form.append('phone', '0112223334');
  form.append('addressLine1', '123 Test St');
  form.append('city', 'Colombo');
  form.append('nic', `FILE${Date.now()}V`);
  form.append('position', 'instructor');
  form.append('instructorRegNumber', 'REG12345');
  form.append('password', 'password123');

  // Add a mock file
  const mockFile = new Blob(['Mock file content'], { type: 'text/plain' });
  form.append('verificationDoc', mockFile, 'test_doc.txt');

  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: "POST",
      body: form
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log("✅ Success with file:", data);
    } else {
      console.log("❌ Failed with file!");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch Error:", error.message);
  }
}

testRegistrationWithFile();

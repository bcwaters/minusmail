#!/usr/bin/env node

// Test script to verify lowercase username handling
const { createClient } = require('redis');

async function testLowercaseHandling() {
  console.log('=== Testing Lowercase Username Handling ===');
  
  const client = createClient({ url: 'redis://localhost:6379' });
  
  try {
    await client.connect();
    console.log('Connected to Redis');
    
    // Test with mixed case usernames
    const testUsernames = ['Test', 'TEST', 'test', 'TeSt'];
    
    for (const username of testUsernames) {
      const normalizedUsername = username.toLowerCase();
      console.log(`\nTesting username: "${username}" -> "${normalizedUsername}"`);
      
      // Check if emails exist for the normalized username
      const emailKey = `emails:${normalizedUsername}`;
      const emailIds = await client.sMembers(emailKey);
      
      console.log(`  Email count for "${normalizedUsername}": ${emailIds.length}`);
      
      if (emailIds.length > 0) {
        console.log(`  Email IDs: ${emailIds.join(', ')}`);
        
        // Get the first email to verify it exists
        const firstEmailId = emailIds[0];
        const emailData = await client.get(firstEmailId);
        
        if (emailData) {
          const email = JSON.parse(emailData);
          console.log(`  First email subject: "${email.subject}"`);
        }
      }
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await client.quit();
  }
}

testLowercaseHandling(); 
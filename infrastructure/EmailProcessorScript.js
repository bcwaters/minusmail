#!/usr/bin/env node
const { simpleParser } = require('mailparser');
const { createClient } = require('redis');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Setup logging to file
const logFile = path.join(__dirname, 'email-processor.log');
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
};

log('=== Email Processor Started ===');

const client = createClient({ url: 'redis://localhost:6379' });
client.connect().catch(err => {
  log(`Redis connection error: ${err.message}`);
  process.exit(1);
});

let emailData = '';
process.stdin.on('data', chunk => { 
  emailData += chunk; 
  log(`Received chunk: ${chunk.length} bytes`);
});

process.stdin.on('end', async () => {
  log(`Total email data received: ${emailData.length} bytes`);
  log(`=== RAW EMAIL PAYLOAD ===`);
  log(emailData);
  log(`=== END RAW EMAIL PAYLOAD ===`);
  
  try {
    const parsed = await simpleParser(emailData);
    log(`Email parsed successfully`);
    
    // Extract username from the "to" field (e.g., "test@minusmail.com" -> "test")
    const toAddress = parsed.to?.value[0]?.address || '';
    const username = toAddress.split('@')[0];
    
    log(`To address: ${toAddress}, Username: ${username}`);
    
    if (!username) {
      log('ERROR: No valid recipient address found');
      await client.quit();
      process.exit(1);
    }
    
    const email = {
      from: parsed.from?.value[0]?.address || 'unknown',
      subject: parsed.subject || 'No Subject',
      htmlBody: parsed.html || '',
      textBody: parsed.text || '',
      received: parsed.date?.toISOString() || new Date().toISOString()
    };
    
    log(`Email details - From: ${email.from}, Subject: ${email.subject}`);
    
    // Generate UUID for the email
    const emailId = uuidv4();
    const emailKey = `emails:${username}`;
    const TTL_SECONDS = 900; // 15 minutes
    
    log(`Generated email ID: ${emailId}`);
    
    // Store the email using the same pattern as your RedisService
    await client.setEx(emailId, TTL_SECONDS, JSON.stringify(email));
    log(`Email stored in Redis with key: ${emailId}`);
    
    await client.sAdd(emailKey, emailId);
    log(`Email ID added to set: ${emailKey}`);
    
    await client.expire(emailKey, TTL_SECONDS);
    log(`TTL set for email set: ${emailKey}`);
    
    log(`SUCCESS: Email stored with ID: ${emailId} for username: ${username}`);
    await client.quit();
    process.exit(0);
  } catch (err) {
    log(`ERROR: ${err.message}`);
    log(`Stack trace: ${err.stack}`);
    await client.quit();
    process.exit(1);
  }
});
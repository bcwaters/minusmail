Temporary Email Infrastructure: Postfix to Microservice
Overview
This outlines the infrastructure for receiving emails via Postfix, piping them to a script, and emitting an event from a NestJS microservice to store emails in Redis for a web client.
Postfix Configuration

Purpose: Accept emails and pipe them to a script.
Setup:
Edit /etc/postfix/main.cf:virtual_alias_maps = hash:/etc/postfix/virtual


Create /etc/postfix/virtual:test@yourdomain.com | /path/to/scripts/email-processor.js


Build map and reload:postmap /etc/postfix/virtual
systemctl reload postfix




Behavior: Emails to test@yourdomain.com are piped to email-processor.js via STDIN, in-memory.

Email Processor Script

Purpose: Reads email from STDIN and sends to NestJS microservice.
Location: email-backend/scripts/email-processor.js.
Bare Bones Example:#!/usr/bin/env node
const { createClient } = require('redis');
const client = createClient({ url: 'redis://localhost:6379' });
client.connect();

let emailData = '';
process.stdin.on('data', (chunk) => { emailData += chunk; });
process.stdin.on('end', async () => {
  await client.publish('email-channel', JSON.stringify({ emailId: process.argv[2], rawEmail: emailData }));
  await client.quit();
  process.exit(0);
});


Permissions: chmod +x email-processor.js.

Microservice Event Emission

Purpose: NestJS microservice stores email in Redis and emits WebSocket event.
Setup:
Microservice subscribes to Redis channel (email-channel).
On message, parses email, stores in Redis (SETEX <uuid> 900 <json>, SADD emails:<username> <uuid>).
Emits WebSocket event (e.g., emails) to React client via API Gateway.


Example:
Microservice: Listens for Redis SUBSCRIBE email-channel, processes email.
API Gateway: Emits { event: 'emails', data: [{ from, subject, ... }] } to client.


